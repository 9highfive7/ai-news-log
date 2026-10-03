/**
 * 比較モードの審査役（TypeSafe AI の Jev）。
 * Jev は文章を書かず、採点（score）・選択（choice）・Yes/No の確率（noul）だけを返す判断専用モデル。
 * TYPESAFE_API_KEY が設定されているときだけ使う。
 */
import { choice, noul, score, TypeSafeClient } from '@typesafe-ai/sdk';
import type { FeedItem } from './feeds.ts';
import type { ProviderName } from './llm/index.ts';
import type { ArticleDraft } from './prompts.ts';

/** 概算費用の計算用単価（USD / 100万入力トークン。出力は無料）。正確な値は公式の料金ページで確認してください */
const INPUT_PRICE_PER_MTOK = 0.042;

/** 元記事として渡す本文の上限（文字数） */
const MAX_SOURCE_CHARS = 6000;

export const CRITERIA = [
  {
    key: 'accuracy',
    label: '正確さ',
    question: '生成記事の内容は、元記事の内容と食い違っていないか（数値・固有名詞・主語・時期などが正しいか）',
    levels: [
      '元記事と明らかに矛盾する誤りが複数ある',
      '重要な点に誤りがある',
      '細かい誤りや不正確な言い換えがある',
      'ほぼ正確だが、わずかに曖昧な点がある',
      '元記事の内容と完全に一致している',
    ],
  },
  {
    key: 'japanese',
    label: '日本語の自然さ',
    question: '生成記事の日本語は自然で読みやすいか（直訳調・不自然な言い回し・誤字がないか）',
    levels: ['意味が通らない箇所が多い', '不自然な言い回しが目立つ', 'ところどころ不自然', 'おおむね自然', '自然で読みやすい'],
  },
  {
    key: 'specificity',
    label: '情報の具体性',
    question: 'IT企業のエンジニアが読んで、仕様・数値・提供条件など具体的な事実がつかめる記事になっているか（一般論や感想で埋めていないか）',
    levels: ['具体的な情報がない', '一般論が多い', 'ある程度具体的', '具体的', '非常に具体的'],
  },
  {
    key: 'headline',
    label: '見出しの分かりやすさ',
    question: '生成記事の見出しは、誰が何をしたかが一目で分かるか',
    levels: ['内容が分からない', '分かりにくい', 'ある程度分かる', '分かりやすい', '非常に分かりやすい'],
  },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]['key'];

export interface ArticleScores {
  /** 観点ごとの点数（1〜5、期待値なので小数になることがある） */
  scores: Record<CriterionKey, number>;
  /** 元記事にない事実を含んでいる確率（0〜1、低いほどよい） */
  unsupported: number;
}

export interface JudgeResult {
  byProvider: Partial<Record<ProviderName, ArticleScores>>;
  /**
   * 総合で優れている確率。モデルの組み合わせごとに A/B の順番を入れ替えて2回判定し、
   * 各モデルが関わった1対1の勝ち確率を平均したもの（3モデル以上でも総当たりで判定する）
   */
  preference?: { win: Partial<Record<ProviderName, number>>; tie: number };
  error?: string;
}

export interface JudgeStats {
  calls: number;
  inputTokens: number;
}

export interface Judge {
  model: string;
  stats: JudgeStats;
  /** 審査を続けられないエラー（認証エラーなど）が起きたら以降は審査しない */
  disabledReason?: string;
  judge(item: FeedItem, body: string | null, drafts: Partial<Record<ProviderName, ArticleDraft>>): Promise<JudgeResult>;
}

export function estimateJudgeCostUsd(stats: JudgeStats): number {
  return (stats.inputTokens * INPUT_PRICE_PER_MTOK) / 1_000_000;
}

/** TYPESAFE_API_KEY がなければ null（審査なしで比較する） */
export function createJudge(): Judge | null {
  if (!process.env.TYPESAFE_API_KEY?.trim()) return null;
  const client = new TypeSafeClient({ timeout: 30_000 });
  const model = process.env.TYPESAFE_DEFAULT_MODEL?.trim() || 'jev-latest';
  const stats: JudgeStats = { calls: 0, inputTokens: 0 };

  const source = (item: FeedItem, body: string | null) => ({
    媒体: item.sourceName,
    タイトル: item.title,
    本文: (body ?? item.summary).slice(0, MAX_SOURCE_CHARS),
  });

  async function ask<Q extends Parameters<typeof client.systemOne>[0]['questions']>(state: Record<string, unknown>, questions: Q) {
    const res = await client.systemOne({ state: state as never, questions, model });
    stats.calls++;
    stats.inputTokens += res.usage.input_tokens;
    return res.answers;
  }

  async function scoreArticle(item: FeedItem, body: string | null, draft: ArticleDraft): Promise<ArticleScores> {
    const questions = {
      ...Object.fromEntries(CRITERIA.map((c) => [c.key, score(c.question, c.levels)])),
      unsupported: noul('生成記事に、元記事に書かれていない事実（推測と明示していないもの）が含まれているか'),
    };
    const answers = (await ask({ 元記事: source(item, body), 生成記事: articleText(draft) }, questions)) as Record<
      string,
      { score?: number; noul?: number }
    >;
    // Jev の採点は 0 始まりなので、表示用に 1〜5 にする
    const scores = Object.fromEntries(CRITERIA.map((c) => [c.key, (answers[c.key].score ?? 0) + 1])) as Record<CriterionKey, number>;
    return { scores, unsupported: answers.unsupported.noul ?? 0 };
  }

  /** A/B の順番を入れ替えて2回判定し、モデルごとの勝ち確率を平均する（先に出た方を好む偏りを打ち消すため） */
  async function compare(item: FeedItem, body: string | null, a: [ProviderName, ArticleDraft], b: [ProviderName, ArticleDraft]) {
    const win: Partial<Record<ProviderName, number>> = { [a[0]]: 0, [b[0]]: 0 };
    let tie = 0;
    for (const [first, second] of [[a, b], [b, a]] as const) {
      const answers = await ask(
        { 元記事: source(item, body), 記事A: articleText(first[1]), 記事B: articleText(second[1]) },
        {
          better: choice('社内向けのAIニュース記事として、どちらが優れているか。元記事に対する正確さを最も重視し、次に分かりやすさと情報の具体性で判断する', {
            A: '記事Aの方が優れている',
            B: '記事Bの方が優れている',
            tie: '同程度',
          }),
        },
      );
      const p = answers.better.probabilities;
      win[first[0]]! += p.A / 2;
      win[second[0]]! += p.B / 2;
      tie += p.tie / 2;
    }
    return { win, tie };
  }

  /** 総当たりで1対1の判定を行い、モデルごとに勝ち確率を平均する */
  async function compareAll(item: FeedItem, body: string | null, entries: [ProviderName, ArticleDraft][]) {
    const wins = new Map<ProviderName, number[]>();
    const ties: number[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const { win, tie } = await compare(item, body, entries[i], entries[j]);
        for (const [name, p] of Object.entries(win) as [ProviderName, number][]) wins.set(name, [...(wins.get(name) ?? []), p]);
        ties.push(tie);
      }
    }
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    return {
      win: Object.fromEntries([...wins].map(([name, ps]) => [name, mean(ps)])) as Partial<Record<ProviderName, number>>,
      tie: mean(ties),
    };
  }

  const judge: Judge = {
    model,
    stats,
    async judge(item, body, drafts) {
      const result: JudgeResult = { byProvider: {} };
      if (judge.disabledReason) return { ...result, error: judge.disabledReason };
      try {
        const entries = Object.entries(drafts) as [ProviderName, ArticleDraft][];
        for (const [name, draft] of entries) result.byProvider[name] = await scoreArticle(item, body, draft);
        if (entries.length >= 2) result.preference = await compareAll(item, body, entries);
      } catch (err) {
        const status = (err as { status?: number }).status;
        const message = err instanceof Error ? err.message : String(err);
        if (status === 401 || status === 403 || status === 404) judge.disabledReason = `Jev の審査を中止しました: ${message}`;
        result.error = message;
        console.error(`  ✗ Jev の審査に失敗: ${message}`);
      }
      return result;
    },
  };
  return judge;
}

/** 審査に渡す記事のテキスト（モデル名は含めない） */
function articleText(draft: ArticleDraft): string {
  return [
    `見出し: ${draft.headline}`,
    `要約: ${draft.summary}`,
    `ポイント:\n${draft.points.map((p) => `- ${p}`).join('\n')}`,
  ].join('\n');
}
