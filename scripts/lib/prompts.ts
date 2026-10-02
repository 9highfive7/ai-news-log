import { z } from 'zod';
import { TAG_NAMES } from '../../src/consts.ts';
import type { FeedItem } from './feeds.ts';

// ---------- 選別 ----------

export const SELECT_SYSTEM = `あなたはIT企業の社内向けにAIニュースを選ぶ編集者です。
読者はシステムエンジニア（SE）です。候補記事の一覧から、SEの業務にとって重要度の高いニュースを選びます。
読者がいちばん知りたいのは、業務で使っている Claude・ChatGPT・Gemini の変化です。

選定基準（上ほど重視）:
1. Claude（Anthropic）・ChatGPT（OpenAI）・Gemini（Google）の新モデル・新機能・提供条件や価格の変更・API や開発ツール（Claude Code、Codex、SDK など）の重要な更新。公式発表があれば公式を優先する
2. AIに関するセキュリティ（AIを狙った攻撃や悪用、脆弱性、情報漏えい、プロンプトインジェクション、安全対策）
3. その他の主要AI企業の新モデル・新製品・大型機能追加
4. 規制・政策・訴訟など、企業のAI活用に影響する動き
5. 国内企業・官公庁の注目すべきAI動向
6. 実務に役立つツールや注目の研究成果
宣伝色の強い記事、ハウツー記事、意見記事、イベント告知、導入事例の紹介、同じ内容の焼き直しは優先度を下げてください。
資金調達・企業の評価額・株価・決算・人事など経営やビジネス寄りの話題、ゲームや家電など一般消費者向けの話題も、SEの業務に直接関わらない限り優先度を下げてください。
GitHub のリリース（SDK やツールのバージョン更新）は、新機能・新モデル対応・破壊的変更など大きな更新だけを選び、バグ修正や小さな改善だけのリリースは選ばないでください。

出力はJSONオブジェクトのみ。前後に説明文やコードフェンスを付けないこと。`;

export const SelectionSchema = z.object({
  selected: z
    .array(
      z.object({
        id: z.number().int(),
        related_ids: z.array(z.number().int()).default([]),
        reason: z.string(),
      }),
    )
    .max(10),
});
export type Selection = z.infer<typeof SelectionSchema>;

/** published: すでにサイトに載せた記事の見出し。同じ出来事を選ばないように渡す */
export function buildSelectPrompt(items: FeedItem[], maxArticles: number, published: string[] = []): string {
  const list = items.map((item, i) => ({
    id: i,
    source: item.sourceName,
    title: item.title,
    published: item.publishedAt.toISOString(),
    summary: item.summary.slice(0, 280),
  }));
  return `以下は直近に公開されたAI関連ニュースの候補です。

<candidates>
${JSON.stringify(list, null, 1)}
</candidates>

重要度の高い順に最大${maxArticles}本選んでください。
- 同じ出来事を扱う記事が複数ある場合は1本にまとめ、最も情報が充実していそうな記事（公式発表があれば公式）を id に、残りを related_ids に入れてください。
- related_ids に入れるのは「同じ出来事」を報じた記事だけです。同じ企業やテーマでも、別の発表・別の事件はまとめないでください。
- 選んだ記事同士で話題が重複しないようにしてください。
- 重要なものが少なければ${maxArticles}本未満で構いません。
${published.length ? `- 次の見出しの記事はすでに掲載済みです。これらと同じ出来事を扱う候補は選ばないでください。\n<published>\n${published.map((t) => `- ${t}`).join('\n')}\n</published>\n` : ''}
出力形式:
{"selected": [{"id": 3, "related_ids": [7], "reason": "選んだ理由（短く）"}]}`;
}

// ---------- 掲載済み記事との重複確認 ----------

export const DuplicateSchema = z.object({
  duplicates: z.array(z.object({ id: z.number().int(), published: z.string() })).default([]),
});

/** 選別で選んだ候補のうち、掲載済みの記事と同じ出来事を扱うものを答えさせる */
export function buildDuplicatePrompt(picked: { id: number; item: FeedItem }[], published: string[]): string {
  const list = picked.map(({ id, item }) => ({ id, source: item.sourceName, title: item.title, summary: item.summary.slice(0, 200) }));
  return `次の「候補」のうち、「掲載済み」の記事と同じ出来事を扱うものを答えてください。

<candidates>
${JSON.stringify(list, null, 1)}
</candidates>

<published>
${published.map((t) => `- ${t}`).join('\n')}
</published>

- 同じ発表・同じ製品の公開・同じ事件を、別の媒体や公式ブログが伝えているものは「同じ出来事」です（例: 掲載済み「Google、新AIモデルGemini 4 Argon発表」と候補「Gemini 4 Argon: our next era of frontier intelligence」）。
- 同じ企業・同じサービスでも、別の発表や別の機能追加なら同じ出来事ではありません。
- 同じ製品の別のバージョンのリリース（例: v2.1.283 と v2.1.284）は、内容が同じでない限り別の出来事です。
- 該当がなければ空の配列にしてください。

出力形式:
{"duplicates": [{"id": 3, "published": "同じ出来事の掲載済み見出し"}]}`;
}

// ---------- 記事化 ----------

export const ARTICLE_SYSTEM = `あなたはAIニュースを日本語の短い記事にまとめるライターです。社内共有用のブログに載せます。

守ること:
- 必ず日本語で書く。元記事が英語でも日本語で書く。
- 元記事の文章をそのまま使わず、必ず自分の言葉で要約する。原文の直訳・長い引用はしない（固有名詞・製品名・数値はそのまま使ってよい）。
- 元記事に書かれていない事実を足さない。推測は「〜とみられる」などと明示する。
- 特定の企業名を読者の所属先として扱ったり、「当社」「弊社」「自社案件」など社内事情に触れる表現は一切使わない。
- 業務への影響は、一般的なIT企業のシステムエンジニア（SE）の目線で書く。
- 出力はJSONオブジェクトのみ。前後に説明文やコードフェンスを付けないこと。`;

export const HEADLINE_MIN = 18;
export const HEADLINE_MAX = 32;

/** 一覧用の短い要約（lead）の字数。指示は全角60〜80字、検証は多少の幅を持たせる */
export const LEAD_MIN = 50;
export const LEAD_MAX = 90;

export const ArticleSchema = z.object({
  headline: z.string().min(1),
  slug: z.string().min(1),
  tags: z.array(z.enum(TAG_NAMES)).min(1).max(3),
  lead: z.string().min(1),
  summary: z.string().min(1),
  points: z.array(z.string().min(1)).min(2).max(5),
  impact: z.string().min(1),
});
export type ArticleDraft = z.infer<typeof ArticleSchema>;

export function buildArticlePrompt(item: FeedItem, body: string | null, related: FeedItem[]): string {
  const relatedText = related.length
    ? `\n<related_articles>\n${related.map((r) => `- ${r.sourceName}: ${r.title} — ${r.summary.slice(0, 200)}`).join('\n')}\n</related_articles>\n（同じ話題の別記事です。補足情報として参考にしてください）\n`
    : '';
  return `次のニュースを記事にしてください。

<source>
媒体: ${item.sourceName}
タイトル: ${item.title}
URL: ${item.url}
公開日時: ${item.publishedAt.toISOString()}
概要: ${item.summary}
</source>
${body ? `\n<source_text>\n${body}\n</source_text>\n` : '\n（本文は取得できなかったので、タイトルと概要の範囲で書いてください。わからないことは書かないこと）\n'}${relatedText}
各フィールドの指示:
- headline: 記事の見出し。25字前後を目安に20〜30字（英数字・記号も1文字として数える。20字未満・30字超は不合格）。日付は付けない。
  「誰が・何をした」だけを書き、補足・数値・副題・理由は入れない（それらは summary に書く）。元記事のタイトルをなぞらず、短く言い換える。
  良い例: "OpenAIがChatGPTに新しい音声機能を追加"（25字） / "カリフォルニア州がAIのみの解雇判断を禁止"（21字） / "DeepSeekがHuawei向けAI開発ツールを公開"（27字）
- slug: URL用の英語スラッグ。小文字英数字とハイフンのみ、3〜6単語（例: "openai-chatgpt-voice-update"）。
- tags: 次の中から1〜3個選ぶ: ${TAG_NAMES.join(', ')}。該当する企業タグがあれば必ず入れる。日本国内の話題なら「国内」。攻撃・悪用・脆弱性・情報漏えい・安全対策の話題なら「セキュリティ」。どれにも当てはまらなければ「その他」。
- lead: 一覧ページに表示する短い要約。全角60〜80字の1〜2文で、文として完結させる（「…」で終わらせない）。見出しの言い換えではなく、何が起きたか・何が新しいかが伝わるようにする。
- summary: 要約。3〜5文。4文以上になる場合は、内容の切れ目で2〜3段落に分け、段落の間は空行（\n\n）にする。
- points: 押さえておきたいポイント。3つ程度の短い文。
- impact: 業務への影響。一般的なIT企業のシステムエンジニア（SE）の目線で2〜3文。

出力形式:
{"headline": "...", "slug": "...", "tags": ["..."], "lead": "...", "summary": "...", "points": ["...", "...", "..."], "impact": "..."}`;
}

/** 社内事情に触れる語。記事に含まれていたら出し直させる */
const INTERNAL_WORDS = ['当社', '弊社', '我が社', 'わが社', '自社案件', '社内案件'];

/** 元の文章を長くそのまま使っていないかを見る長さ（文字数） */
const COPY_WINDOW = 30;

export function checkArticle(draft: ArticleDraft, sourceText: string): string | null {
  const len = [...draft.headline].length;
  if (len < HEADLINE_MIN || len > HEADLINE_MAX) {
    // 削りすぎ・足しすぎで行ったり来たりしないよう、目標の字数（25字前後）と増減の目安を具体的に伝える
    return len > HEADLINE_MAX
      ? `headline「${draft.headline}」は${len}字で長すぎます。${len - 25}字ほど削って25字前後（20〜30字）にしてください。補足・数値・副題を外し「誰が・何をした」だけにしてください。削りすぎて20字未満にもしないでください。`
      : `headline「${draft.headline}」は${len}字で短すぎます。${25 - len}字ほど足して25字前後（20〜30字）にしてください。主語（企業名など）と、何をしたか（発表・公開・提供開始など）が両方わかる形にしてください。`;
  }
  const leadLen = [...draft.lead.trim()].length;
  if (leadLen < LEAD_MIN || leadLen > LEAD_MAX) {
    return `lead「${draft.lead}」は${leadLen}字です。全角60〜80字（目安70字）の、文として完結した1〜2文にしてください。`;
  }
  if (/[…\.]{1,3}$|[、,]$/.test(draft.lead.trim())) {
    return `lead「${draft.lead}」が途中で終わっています。文として完結させ、「。」で終えてください。`;
  }
  const all = [draft.headline, draft.lead, draft.summary, ...draft.points, draft.impact].join('\n');
  const internal = INTERNAL_WORDS.find((w) => all.includes(w));
  if (internal) return `「${internal}」のような社内事情に触れる表現は使わないでください。`;
  const copied = findCopiedSpan(all, sourceText);
  if (copied) return `元記事の文章をそのまま使っている部分があります（「${copied}」）。自分の言葉で書き直してください。`;
  return null;
}

/** 生成文の中に、元テキストと COPY_WINDOW 文字以上一致する箇所があれば返す */
export function findCopiedSpan(generated: string, source: string): string | null {
  if (!source) return null;
  const norm = (s: string) => s.replace(/\s+/g, '');
  const src = norm(source);
  const gen = [...norm(generated)];
  for (let i = 0; i + COPY_WINDOW <= gen.length; i++) {
    const span = gen.slice(i, i + COPY_WINDOW).join('');
    if (src.includes(span)) return span;
  }
  return null;
}

// ---------- 既存記事の見直し（セキュリティタグ） ----------

export const SecurityTagSchema = z.object({
  security: z.array(z.object({ id: z.number().int(), reason: z.string() })).default([]),
});

/** 既存の記事のうち「セキュリティ」タグを付けるべきものを答えさせる */
export function buildSecurityTagPrompt(posts: { id: number; title: string; lead: string; tags: string[] }[]): string {
  return `次の記事のうち、「セキュリティ」タグを付けるべきものを答えてください。

<posts>
${JSON.stringify(posts, null, 1)}
</posts>

- 「セキュリティ」に当たるのは、AIを狙った攻撃や悪用、脆弱性、情報漏えい、不正アクセス、プロンプトインジェクション、AIの安全対策・防御、セキュリティ製品・サービスの話題です。
- AIの倫理や社会的な影響、雇用、規制だけの話題は含めません。
- すでに「セキュリティ」タグが付いている記事は答えなくて構いません。

出力形式:
{"security": [{"id": 3, "reason": "理由（短く）"}]}`;
}
