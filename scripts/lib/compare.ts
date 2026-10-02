import type { FeedItem } from './feeds.ts';
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
}

const DISPLAY_NAME: Record<ProviderName, string> = { claude: 'Claude', gemini: 'Gemini' };

const label = (p: LlmProvider) => `${DISPLAY_NAME[p.name]}（${p.model}）`;
const cell = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' ');

/** 比較レポート（Markdown）。GitHub Actions の Summary にもそのまま表示できる形式 */
export function renderCompareReport(opts: {
  now: Date;
  candidates: FeedItem[];
  selections: CompareSelection[];
  articles: CompareArticle[];
  providers: LlmProvider[];
}): string {
  const { now, candidates, selections, articles, providers } = opts;
  const out: string[] = [];
  const { ymd, iso } = jstParts(now);

  out.push(`# モデル比較レポート（${ymd} ${iso.slice(11, 16)} JST）`, '');
  out.push(
    `候補 ${candidates.length} 件から、それぞれのモデルが選別し、両方が選んだニュースを優先して ${articles.length} 本を両方のモデルで記事化しました。`,
    'プロンプト・元記事の本文などの材料は両モデルで共通です。このレポートは比較用で、サイトには公開されません。',
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
