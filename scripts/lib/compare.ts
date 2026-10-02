import type { FeedItem } from './feeds.ts';
import { CRITERIA, estimateJudgeCostUsd, type Judge, type JudgeResult } from './judge.ts';
import { estimateCostUsd, type LlmProvider, type ProviderName } from './llm/index.ts';
import { getStats } from './llm/json.ts';
import { articleTitle, jstParts, renderArticleBody } from './markdown.ts';
import type { ArticleDraft, Selection } from './prompts.ts';

export interface CompareSelection {
  provider: LlmProvider;
  picks: Selection['selected'];
  error?: string;
}

export interface CompareArticle {
  item: FeedItem;
  /** このニュースを選別で選んだモデル */
  selectedBy: ProviderName[];
  results: { provider: LlmProvider; draft?: ArticleDraft; error?: string }[];
  /** Jev による審査結果（審査なしの場合は undefined） */
  judge?: JudgeResult;
}

const DISPLAY_NAME: Record<ProviderName, string> = { claude: 'Claude', gemini: 'Gemini', openai: 'GPT' };

const label = (p: LlmProvider) => `${DISPLAY_NAME[p.name]}（${p.model}）`;
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** 比較レポート（Markdown）。GitHub Actions の Summary にもそのまま表示できる形式 */
export function renderCompareReport(opts: {
  now: Date;
  candidates: FeedItem[];
  selections: CompareSelection[];
  articles: CompareArticle[];
  providers: LlmProvider[];
  judge: Judge | null;
}): string {
  const { now, candidates, selections, articles, providers, judge } = opts;
  const out: string[] = [];
  const { ymd, iso } = jstParts(now);

  out.push(`# モデル比較レポート（${ymd} ${iso.slice(11, 16)} JST）`, '');
  out.push(
    `候補 ${candidates.length} 件から、それぞれのモデルが選別し、多くのモデルが選んだニュースを優先して ${articles.length} 本を全モデルで記事化しました。`,
    'プロンプト・元記事の本文などの材料は全モデルで共通です。このレポートは比較用で、サイトには公開されません。',
    '',
  );

  // 集計
  out.push('## 集計', '');
  out.push(`| 項目 | ${providers.map(label).join(' | ')} |`);
  out.push(`| --- | ${providers.map(() => '---:').join(' | ')} |`);
  const row = (name: string, f: (p: LlmProvider) => string) => out.push(`| ${name} | ${providers.map(f).join(' | ')} |`);
  const ok = (p: LlmProvider) => articles.filter((a) => a.results.some((r) => r.provider === p && r.draft)).length;
  row('記事化できた本数', (p) => `${ok(p)} / ${articles.length}`);
  row('API呼び出し回数', (p) => String(getStats(p).calls));
  row('形式エラー等での出し直し', (p) => String(getStats(p).retries));
  row('出し直しても失敗', (p) => String(getStats(p).failures));
  row('入力トークン', (p) => getStats(p).inputTokens.toLocaleString('en-US'));
  row('出力トークン（思考分を含む）', (p) => getStats(p).outputTokens.toLocaleString('en-US'));
  row('今回の概算費用', (p) => {
    const s = getStats(p);
    const cost = estimateCostUsd(p.model, s.inputTokens, s.outputTokens);
    return cost === null ? '（単価未登録）' : `$${cost.toFixed(4)}`;
  });
  row('応答時間の合計', (p) => `${(getStats(p).elapsedMs / 1000).toFixed(1)}秒`);
  out.push('', '※ 費用は scripts/lib/llm/index.ts に登録した単価による概算です。', '');

  if (judge) out.push(...renderJudgeSummary(judge, articles, providers));

  // 選別
  out.push('## 選別結果（重要度順）', '');
  out.push(`| 順位 | ${providers.map(label).join(' | ')} |`);
  out.push(`| --- | ${providers.map(() => '---').join(' | ')} |`);
  const maxRows = Math.max(0, ...selections.map((s) => s.picks.length));
  for (let i = 0; i < maxRows; i++) {
    const cells = providers.map((p) => {
      const pick = selections.find((s) => s.provider === p)?.picks[i];
      if (!pick) return '';
      const c = candidates[pick.id];
      const related = pick.related_ids.length ? `（同じ話題 ${pick.related_ids.length}件をまとめた）` : '';
      return cell(`**${c.title}**（${c.sourceName}）${related}<br>理由: ${pick.reason}`);
    });
    out.push(`| ${i + 1} | ${cells.join(' | ')} |`);
  }
  for (const s of selections.filter((s) => s.error)) out.push('', `> ${label(s.provider)} の選別は失敗しました: ${s.error}`);
  out.push('');

  // 記事
  out.push('## 記事の比較', '');
  articles.forEach((a, i) => {
    const by = a.selectedBy.map((n) => DISPLAY_NAME[n]).join('・') || 'なし';
    out.push(`### ${i + 1}. ${a.item.title}`, '');
    out.push(`出典: [${a.item.sourceName}](<${a.item.url}>) ／ 選別で選んだモデル: ${by}`, '');
    if (a.judge) out.push(...renderJudgeArticle(a.judge, providers));
    for (const r of a.results) {
      out.push(`#### ${label(r.provider)}`, '');
      if (!r.draft) {
        out.push(`> 記事化に失敗しました: ${r.error}`, '');
        continue;
      }
      const headlineLength = [...r.draft.headline].length;
      out.push(`**${articleTitle(r.draft, now)}**（見出し${headlineLength}字）`, '');
      out.push(`タグ: ${r.draft.tags.join(', ')}`, '');
      out.push(renderArticleBody(r.draft, a.item, 5));
    }
    out.push('---', '');
  });

  return out.join('\n');
}

const pct = (p: number) => `${Math.round(p * 100)}%`;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);
const fmt = (n: number) => (Number.isNaN(n) ? '-' : n.toFixed(2));

/** Jev による審査の全体集計 */
function renderJudgeSummary(judge: Judge, articles: CompareArticle[], providers: LlmProvider[]): string[] {
  const out: string[] = ['## Jev による審査', ''];
  out.push(
    `TypeSafe AI の判断モデル Jev（${judge.model}）に、元記事と生成記事を渡して採点させました。`,
    'モデル名は伏せています。総合の勝ち確率は、モデルの組み合わせごと（総当たり）に記事A・Bの順番を入れ替えて2回ずつ判定し、各モデルの1対1の勝ち確率を平均したものです。',
    'Jev は理由を出さないため、気になる判定は下の記事を読んで確認してください。',
    '',
  );
  const judged = articles.filter((a) => a.judge && !a.judge.error);
  out.push(`| 項目 | ${providers.map(label).join(' | ')} |`);
  out.push(`| --- | ${providers.map(() => '---:').join(' | ')} |`);
  for (const c of CRITERIA) {
    const cells = providers.map((p) => fmt(avg(judged.flatMap((a) => a.judge!.byProvider[p.name]?.scores[c.key] ?? []))));
    out.push(`| ${c.label}（1〜5、平均） | ${cells.join(' | ')} |`);
  }
  const unsupported = providers.map((p) => {
    const v = avg(judged.flatMap((a) => a.judge!.byProvider[p.name]?.unsupported ?? []));
    return Number.isNaN(v) ? '-' : pct(v);
  });
  out.push(`| 元記事にない内容を含む確率（平均、低いほどよい） | ${unsupported.join(' | ')} |`);
  const pairs = judged.filter((a) => a.judge!.preference);
  const winRate = providers.map((p) => {
    const v = avg(pairs.map((a) => a.judge!.preference!.win[p.name] ?? 0));
    return Number.isNaN(v) ? '-' : pct(v);
  });
  out.push(`| 総合で優れている確率（平均） | ${winRate.join(' | ')} |`);
  const wins = providers.map((p) => {
    const n = pairs.filter((a) => {
      const w = a.judge!.preference!.win;
      return providers.every((q) => q === p || (w[p.name] ?? 0) > (w[q.name] ?? 0)) && (w[p.name] ?? 0) > a.judge!.preference!.tie;
    }).length;
    return `${n} / ${pairs.length}`;
  });
  out.push(`| 勝ったニュースの数 | ${wins.join(' | ')} |`);
  const tie = avg(pairs.map((a) => a.judge!.preference!.tie));
  out.push('');
  if (!Number.isNaN(tie)) out.push(`「同程度」と判定された確率の平均: ${pct(tie)}`, '');
  const cost = estimateJudgeCostUsd(judge.stats);
  out.push(`審査の呼び出し ${judge.stats.calls} 回 ／ 入力 ${judge.stats.inputTokens.toLocaleString('en-US')} トークン ／ 概算 $${cost.toFixed(4)}`, '');
  const failed = articles.filter((a) => a.judge?.error);
  if (judge.disabledReason) out.push(`> ${judge.disabledReason}`, '');
  else if (failed.length) out.push(`> ${failed.length} 本のニュースで審査に失敗しました（上の集計には含めていません）。`, '');
  return out;
}

/** ニュースごとの審査結果 */
function renderJudgeArticle(result: JudgeResult, providers: LlmProvider[]): string[] {
  if (result.error) return [`> Jev の審査に失敗しました: ${result.error}`, ''];
  const out: string[] = [`| Jev の評価 | ${providers.map((p) => DISPLAY_NAME[p.name]).join(' | ')} |`];
  out.push(`| --- | ${providers.map(() => '---:').join(' | ')} |`);
  for (const c of CRITERIA) {
    out.push(`| ${c.label} | ${providers.map((p) => fmt(result.byProvider[p.name]?.scores[c.key] ?? NaN)).join(' | ')} |`);
  }
  out.push(
    `| 元記事にない内容を含む確率 | ${providers.map((p) => (result.byProvider[p.name] ? pct(result.byProvider[p.name]!.unsupported) : '-')).join(' | ')} |`,
  );
  if (result.preference) {
    out.push(`| 総合で優れている確率 | ${providers.map((p) => pct(result.preference!.win[p.name] ?? 0)).join(' | ')} |`);
    out.push('', `（同程度: ${pct(result.preference.tie)}）`);
  }
  out.push('');
  return out;
}
