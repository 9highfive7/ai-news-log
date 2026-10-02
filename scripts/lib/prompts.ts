import { z } from 'zod';
import { TAG_NAMES } from '../../src/consts.ts';
import type { FeedItem } from './feeds.ts';

// ---------- 選別 ----------

export const SELECT_SYSTEM = `あなたはIT企業の社内向けにAIニュースを選ぶ編集者です。
候補記事の一覧から、ビジネスパーソン（エンジニア・PM・企画職）にとって重要度の高いニュースを選びます。

選定基準（上ほど重視）:
1. 主要AI企業の新モデル・新製品・大型機能追加、価格や提供条件の変更
2. 規制・政策・訴訟など、企業のAI活用に影響する動き
3. 国内企業・官公庁の注目すべきAI動向
4. 実務に役立つツールや注目の研究成果
宣伝色の強い記事、ハウツー記事、意見記事、イベント告知、同じ内容の焼き直しは優先度を下げてください。

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

export function buildSelectPrompt(items: FeedItem[], maxArticles: number): string {
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

出力形式:
{"selected": [{"id": 3, "related_ids": [7], "reason": "選んだ理由（短く）"}]}`;
}

// ---------- 記事化 ----------

export const ARTICLE_SYSTEM = `あなたはAIニュースを日本語の短い記事にまとめるライターです。社内共有用のブログに載せます。

守ること:
- 必ず日本語で書く。元記事が英語でも日本語で書く。
- 元記事の文章をそのまま使わず、必ず自分の言葉で要約する。原文の直訳・長い引用はしない（固有名詞・製品名・数値はそのまま使ってよい）。
- 元記事に書かれていない事実を足さない。推測は「〜とみられる」などと明示する。
- 特定の企業名を読者の所属先として扱ったり、「当社」「弊社」「自社案件」など社内事情に触れる表現は一切使わない。
- 業務への影響は、一般的なIT企業のエンジニア・PM目線で書く。
- 出力はJSONオブジェクトのみ。前後に説明文やコードフェンスを付けないこと。`;

export const HEADLINE_MIN = 18;
export const HEADLINE_MAX = 32;

export const ArticleSchema = z.object({
  headline: z.string().min(1),
  slug: z.string().min(1),
  tags: z.array(z.enum(TAG_NAMES)).min(1).max(3),
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
- headline: 記事の見出し。20〜30字（英数字・記号も1文字として数える。30字を超えると不合格）。日付は付けない。
  「誰が・何をした」だけを書き、補足・数値・副題・理由は入れない（それらは summary に書く）。元記事のタイトルをなぞらず、短く言い換える。
  良い例: "OpenAIがChatGPTに新しい音声機能を追加"（25字） / "カリフォルニア州がAIのみの解雇判断を禁止"（21字） / "DeepSeekがHuawei向けAI開発ツールを公開"（27字）
- slug: URL用の英語スラッグ。小文字英数字とハイフンのみ、3〜6単語（例: "openai-chatgpt-voice-update"）。
- tags: 次の中から1〜3個選ぶ: ${TAG_NAMES.join(', ')}。該当する企業タグがあれば必ず入れる。日本国内の話題なら「国内」。どれにも当てはまらなければ「その他」。
- summary: 要約。3〜5文。
- points: 押さえておきたいポイント。3つ程度の短い文。
- impact: 業務への影響。一般的なIT企業のエンジニア・PM目線で2〜3文。

出力形式:
{"headline": "...", "slug": "...", "tags": ["..."], "summary": "...", "points": ["...", "...", "..."], "impact": "..."}`;
}

/** 社内事情に触れる語。記事に含まれていたら出し直させる */
const INTERNAL_WORDS = ['当社', '弊社', '我が社', 'わが社', '自社案件', '社内案件'];

/** 元の文章を長くそのまま使っていないかを見る長さ（文字数） */
const COPY_WINDOW = 30;

export function checkArticle(draft: ArticleDraft, sourceText: string): string | null {
  const len = [...draft.headline].length;
  if (len < HEADLINE_MIN || len > HEADLINE_MAX) {
    return len > HEADLINE_MAX
      ? `headline「${draft.headline}」は${len}字で長すぎます。あと${len - 30}字以上削って20〜30字にしてください。補足・数値・副題を外し「誰が・何をした」だけにしてください。`
      : `headline「${draft.headline}」は${len}字で短すぎます。20〜30字にしてください。`;
  }
  const all = [draft.headline, draft.summary, ...draft.points, draft.impact].join('\n');
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
