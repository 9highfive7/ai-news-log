/**
 * RSSからAIニュースを集め、LLM（Claude / Gemini）で選別・記事化して src/content/posts/ に Markdown を出力する。
 *
 *   npm run generate                         # 本番（data/seen.json も更新）
 *   npm run generate:dry                     # dry-run（記事ファイルの出力のみ。seen.json は更新しない）
 *   npm run generate:dry -- --provider=gemini  # 使うモデルを指定（claude / gemini。省略時は LLM_PROVIDER、なければ claude）
 *   npm run compare                          # 比較モード（同じニュースを両方で記事化し、レポートだけを出力）
 */
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderCompareReport, type CompareArticle, type CompareSelection } from './lib/compare.ts';
import { fetchArticleText, fetchFeed, loadSources, matchesKeywords, normalizeUrl, type FeedItem } from './lib/feeds.ts';
import { createProvider, isFatalApiError, PROVIDERS, type LlmProvider, type ProviderName } from './lib/llm/index.ts';
import { callJson, getStats } from './lib/llm/json.ts';
import { jstParts, renderMarkdown, sanitizeSlug, uniqueFileName } from './lib/markdown.ts';
import {
  ARTICLE_SYSTEM,
  ArticleSchema,
  buildArticlePrompt,
  buildSelectPrompt,
  checkArticle,
  SELECT_SYSTEM,
  SelectionSchema,
  type ArticleDraft,
  type Selection,
} from './lib/prompts.ts';
import { loadSeen, saveSeen } from './lib/seen.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCES_PATH = join(ROOT, 'sources.json');
const SEEN_PATH = join(ROOT, 'data', 'seen.json');
const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');
const COMPARE_DIR = join(ROOT, 'compare-output');

/** 選別に渡す候補の上限（新しい順）。トークン量を抑えるため */
const MAX_CANDIDATES = 80;

type Mode = ProviderName | 'compare';
type Pick = Selection['selected'][number];

async function main() {
  if (existsSync(join(ROOT, '.env'))) process.loadEnvFile(join(ROOT, '.env'));

  const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';
  const mode = parseMode();
  const maxArticles = Math.max(1, Number(process.env.MAX_ARTICLES) || 5);
  const now = new Date();
  const today = jstParts(now).ymd;

  // キーの設定漏れは収集前に気づけるよう、最初にプロバイダーを作る
  const providers = (mode === 'compare' ? PROVIDERS : [mode]).map(createProvider);

  const label = mode === 'compare' ? '[比較モード] ' : dryRun ? '[dry-run] ' : '';
  console.log(
    `AIニュースログ 記事生成 ${label}${providers.map((p) => `${p.name}=${p.model}`).join(' ')} max=${maxArticles} date=${today}`,
  );

  const seen = await loadSeen(SEEN_PATH);
  const candidates = await collectCandidates(now, seen.urls);
  if (candidates.length === 0) {
    console.log('新しい候補がないため終了します。');
    await setOutput('count', '0');
    return;
  }

  if (mode === 'compare') {
    await runCompare(providers, candidates, maxArticles, now);
    await setOutput('count', '0');
    return;
  }

  const provider = providers[0];
  const written = await runNormal(provider, candidates, maxArticles, now, today);

  // 処理済みURLの記録（選ばれなかった候補も含めて記録し、翌日に同じ候補を再評価しない）
  if (written > 0 && !dryRun) {
    for (const item of candidates) seen.urls[normalizeUrl(item.url)] = today;
    await saveSeen(SEEN_PATH, seen, today);
  }

  const stats = getStats(provider);
  console.log(
    `完了: ${written}本の記事を出力しました${dryRun ? '（dry-run: seen.json は更新していません）' : ''}` +
      `（呼び出し${stats.calls}回 / 出し直し${stats.retries}回 / 入力${stats.inputTokens}・出力${stats.outputTokens}トークン）`,
  );
  await setOutput('count', String(written));
}

function parseMode(): Mode {
  const arg = process.argv.find((a) => a.startsWith('--provider='))?.split('=')[1];
  const value = (arg || process.env.LLM_PROVIDER || 'claude').trim().toLowerCase();
  if (value === 'compare' || (PROVIDERS as string[]).includes(value)) return value as Mode;
  throw new Error(`provider の指定が不正です: ${value}（claude / gemini / compare のいずれか）`);
}

/** RSSを集めて、期間・キーワード・処理済みで絞った候補を返す（1つのフィードが失敗しても全体は止めない） */
async function collectCandidates(now: Date, seenUrls: Record<string, string>): Promise<FeedItem[]> {
  const config = await loadSources(SOURCES_PATH);
  const results = await Promise.all(config.sources.map(fetchFeed));
  const cutoff = now.getTime() - config.maxAgeHours * 60 * 60 * 1000;

  const byUrl = new Map<string, FeedItem>();
  const titles = new Set<string>();
  for (const r of results) {
    if (!r.ok) {
      console.warn(`  ✗ ${r.source.name}: ${r.error}`);
      continue;
    }
    let added = 0;
    for (const item of r.items) {
      const key = normalizeUrl(item.url);
      const titleKey = item.title.toLowerCase();
      if (item.publishedAt.getTime() < cutoff || item.publishedAt.getTime() > now.getTime() + 3600_000) continue;
      if (!matchesKeywords(item, r.source.keywords)) continue;
      if (seenUrls[key] || byUrl.has(key) || titles.has(titleKey)) continue;
      byUrl.set(key, item);
      titles.add(titleKey);
      added++;
    }
    console.log(`  ✓ ${r.source.name}: ${r.total}件中 ${added}件が候補`);
  }

  const candidates = [...byUrl.values()]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_CANDIDATES);
  console.log(`フィード ${results.filter((r) => r.ok).length}/${results.length} 件取得成功、候補 ${candidates.length} 件`);
  return candidates;
}

async function selectNews(provider: LlmProvider, candidates: FeedItem[], maxArticles: number): Promise<Pick[]> {
  const selection = await callJson(provider, {
    label: '選別',
    system: SELECT_SYSTEM,
    prompt: buildSelectPrompt(candidates, maxArticles),
    schema: SelectionSchema,
    maxTokens: 2000,
    extraCheck: (s) => {
      const bad = s.selected.flatMap((x) => [x.id, ...x.related_ids]).find((id) => !candidates[id]);
      if (bad !== undefined) return `存在しない id ${bad} が含まれています。`;
      const ids = s.selected.map((x) => x.id);
      if (new Set(ids).size !== ids.length) return '同じ id が重複しています。';
      return null;
    },
  });
  const picks = selection.selected.slice(0, maxArticles);
  console.log(`[${provider.name}] 選別結果: ${picks.length}本`);
  for (const p of picks) console.log(`  - [${candidates[p.id].sourceName}] ${candidates[p.id].title}（${p.reason}）`);
  return picks;
}

async function writeArticle(provider: LlmProvider, item: FeedItem, related: FeedItem[], body: string | null): Promise<ArticleDraft> {
  const sourceText = [item.title, item.summary, body ?? ''].join('\n');
  return await callJson(provider, {
    label: '記事化',
    system: ARTICLE_SYSTEM,
    prompt: buildArticlePrompt(item, body, related),
    schema: ArticleSchema,
    maxTokens: 3000,
    extraCheck: (d) => checkArticle(d, sourceText),
  });
}

function relatedItems(pick: Pick, candidates: FeedItem[]): FeedItem[] {
  return pick.related_ids.filter((id) => id !== pick.id).map((id) => candidates[id]);
}

async function fetchBody(item: FeedItem): Promise<string | null> {
  const body = await fetchArticleText(item.url);
  console.log(`記事化: ${item.title}${body ? '' : '（本文取得できず、概要のみで作成）'}`);
  return body;
}

/** 通常モード: 1つのモデルで選別・記事化して src/content/posts/ に書き出す。書き出した本数を返す */
async function runNormal(provider: LlmProvider, candidates: FeedItem[], maxArticles: number, now: Date, today: string): Promise<number> {
  const picks = await selectNews(provider, candidates, maxArticles);
  await mkdir(POSTS_DIR, { recursive: true });
  const usedNames = new Set<string>();
  let written = 0;
  for (const pick of picks) {
    const item = candidates[pick.id];
    try {
      const draft = await writeArticle(provider, item, relatedItems(pick, candidates), await fetchBody(item));
      const fileName = uniqueFileName(POSTS_DIR, today, sanitizeSlug(draft.slug), usedNames);
      await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, now));
      written++;
      console.log(`  → src/content/posts/${fileName}`);
    } catch (err) {
      // 1本失敗しても残りは続ける（認証エラーなどは全体の失敗として扱う）
      if (isFatalApiError(err)) throw err;
      console.error(`  ✗ 記事化に失敗したためスキップ: ${errorMessage(err)}`);
    }
  }
  if (picks.length > 0 && written === 0) throw new Error('選別した記事をすべて記事化できませんでした');
  return written;
}

/**
 * 比較モード: 両方のモデルで選別し、両方が選んだニュースを優先して最大 maxArticles 本を、
 * 同じ材料（本文）で両方のモデルに記事化させる。記事ファイル・seen.json は書かず、レポートだけを出力する。
 */
async function runCompare(providers: LlmProvider[], candidates: FeedItem[], maxArticles: number, now: Date) {
  const selections: CompareSelection[] = [];
  for (const provider of providers) {
    try {
      selections.push({ provider, picks: await selectNews(provider, candidates, maxArticles) });
    } catch (err) {
      if (isFatalApiError(err)) throw err;
      console.error(`  ✗ [${provider.name}] 選別に失敗: ${errorMessage(err)}`);
      selections.push({ provider, picks: [], error: errorMessage(err) });
    }
  }

  if (selections.every((s) => s.error)) throw new Error('すべてのモデルで選別に失敗しました');
  const picks = mergePicks(selections, maxArticles);
  const articles: CompareArticle[] = [];
  for (const pick of picks) {
    const item = candidates[pick.id];
    const body = await fetchBody(item);
    const results: CompareArticle['results'] = [];
    for (const provider of providers) {
      try {
        const draft = await writeArticle(provider, item, relatedItems(pick, candidates), body);
        results.push({ provider, draft });
        console.log(`  ✓ ${provider.name}: ${draft.headline}`);
      } catch (err) {
        if (isFatalApiError(err)) throw err;
        console.error(`  ✗ ${provider.name}: ${errorMessage(err)}`);
        results.push({ provider, error: errorMessage(err) });
      }
    }
    articles.push({ item, selectedBy: selections.filter((s) => s.picks.some((p) => p.id === pick.id)).map((s) => s.provider.name), results });
  }

  const report = renderCompareReport({ now, candidates, selections, articles, providers });
  await mkdir(COMPARE_DIR, { recursive: true });
  const { ymd, iso } = jstParts(now);
  const fileName = `compare-${ymd}-${iso.slice(11, 16).replace(':', '')}.md`;
  await writeFile(join(COMPARE_DIR, fileName), report);
  console.log(`比較レポートを出力しました: compare-output/${fileName}`);
  // GitHub Actions では実行結果ページの Summary にそのまま表示する
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
}

/** 両方が選んだもの（順位の平均が高い順）→ 片方だけが選んだもの（各モデルの順位を交互に）の順で並べる */
function mergePicks(selections: CompareSelection[], maxArticles: number): Pick[] {
  const ranks = new Map<number, { pick: Pick; ranks: number[]; related: Set<number> }>();
  for (const s of selections) {
    s.picks.forEach((pick, rank) => {
      const entry = ranks.get(pick.id) ?? { pick, ranks: [], related: new Set<number>() };
      entry.ranks.push(rank);
      pick.related_ids.forEach((id) => entry.related.add(id));
      ranks.set(pick.id, entry);
    });
  }
  const avg = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length;
  const entries = [...ranks.values()].sort(
    (a, b) => b.ranks.length - a.ranks.length || avg(a.ranks) - avg(b.ranks),
  );
  return entries.slice(0, maxArticles).map((e) => ({ ...e.pick, related_ids: [...e.related] }));
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/** GitHub Actions の step output に書き出す（ローカルでは何もしない） */
async function setOutput(name: string, value: string) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

main().catch((err) => {
  console.error(errorMessage(err));
  process.exitCode = 1;
});
