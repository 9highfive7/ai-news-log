/**
 * RSSからAIニュースを集め、LLM（Claude / Gemini）で選別・記事化して src/content/posts/ に Markdown を出力する。
 *
 *   npm run generate                         # 本番（data/seen.json も更新）
 *   npm run generate:dry                     # dry-run（記事ファイルの出力のみ。seen.json は更新しない）
 *   npm run generate:dry -- --provider=gemini  # 使うモデルを指定（claude / gemini / openai。省略時は LLM_PROVIDER、なければ claude）
 *   TARGET_URL=<記事URL> npm run generate     # 指定した1本だけを記事化（選別なし。処理済み・期間外でも対象）
 *   SINCE=2026-09-25 npm run generate         # さかのぼり収集: 指定日以降のニュースを公開日ごとに選別・記事化（既存記事の前日まで）
 *   npm run compare                          # 比較モード（同じニュースを全モデルで記事化し、レポートだけを出力）
 */
import { appendFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { renderCompareReport, type CompareArticle, type CompareSelection } from './lib/compare.ts';
import { createJudge } from './lib/judge.ts';
import { fetchArticleText, fetchFeed, loadSources, matchesKeywords, normalizeUrl, type FeedItem } from './lib/feeds.ts';
import { createProvider, hasApiKey, isFatalApiError, PROVIDERS, type LlmProvider, type ProviderName } from './lib/llm/index.ts';
import { callJson, getStats } from './lib/llm/json.ts';
import { jstParts, renderMarkdown, sanitizeSlug, uniqueFileName } from './lib/markdown.ts';
import {
  ARTICLE_SYSTEM,
  ArticleSchema,
  buildArticlePrompt,
  buildDuplicatePrompt,
  buildSelectPrompt,
  checkArticle,
  DuplicateSchema,
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
  const providers = (mode === 'compare' ? compareProviders() : [mode]).map(createProvider);

  const label = mode === 'compare' ? '[比較モード] ' : dryRun ? '[dry-run] ' : '';
  console.log(
    `AIニュースログ 記事生成 ${label}${providers.map((p) => `${p.name}=${p.model}`).join(' ')} max=${maxArticles} date=${today}`,
  );

  const seen = await loadSeen(SEEN_PATH);

  // 指定した1本だけを記事化する（選別で漏れた重要ニュースの手動追加用）
  const targetUrl = process.env.TARGET_URL?.trim();
  if (targetUrl) {
    if (mode === 'compare') throw new Error('TARGET_URL は比較モードでは使えません');
    const written = await runTarget(providers[0], targetUrl, now, today);
    if (!dryRun) {
      seen.urls[normalizeUrl(targetUrl)] = today;
      await saveSeen(SEEN_PATH, seen, today);
    }
    console.log(`完了: ${written}本の記事を出力しました`);
    await setOutput('count', String(written));
    return;
  }

  // 過去にさかのぼって収集する（初回公開時の記事数を増やす用）
  const since = process.env.SINCE?.trim();
  if (since) {
    if (mode === 'compare') throw new Error('SINCE は比較モードでは使えません');
    const written = await runBackfill(providers[0], since, maxArticles, seen, dryRun, today);
    const stats = getStats(providers[0]);
    console.log(
      `完了: ${written}本の記事を出力しました${dryRun ? '（dry-run: seen.json は更新していません）' : ''}` +
        `（呼び出し${stats.calls}回 / 出し直し${stats.retries}回 / 入力${stats.inputTokens}・出力${stats.outputTokens}トークン）`,
    );
    await setOutput('count', String(written));
    return;
  }

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
  const { written, failed } = await runNormal(provider, candidates, maxArticles, now, today);

  // 処理済みURLの記録（選ばれなかった候補も含めて記録し、翌日に同じ候補を再評価しない）。
  // ただし選ばれたのに記事化に失敗したニュース（と同じ話題の記事）は記録せず、次回の候補に残す
  if (written > 0 && !dryRun) {
    const retry = new Set(failed.map((item) => normalizeUrl(item.url)));
    for (const item of candidates) {
      const key = normalizeUrl(item.url);
      if (!retry.has(key)) seen.urls[key] = today;
    }
    await saveSeen(SEEN_PATH, seen, today);
    if (retry.size) console.log(`記事化に失敗した ${failed.length} 件は処理済みにせず、次回の候補に残します`);
  }

  const stats = getStats(provider);
  console.log(
    `完了: ${written}本の記事を出力しました${dryRun ? '（dry-run: seen.json は更新していません）' : ''}` +
      `（呼び出し${stats.calls}回 / 出し直し${stats.retries}回 / 入力${stats.inputTokens}・出力${stats.outputTokens}トークン）`,
  );
  await setOutput('count', String(written));
}

/** 比較モードで使うモデル: API キーが設定されているもの全部（2つ以上必要） */
function compareProviders(): ProviderName[] {
  const names = PROVIDERS.filter(hasApiKey);
  const skipped = PROVIDERS.filter((n) => !hasApiKey(n));
  if (skipped.length) console.log(`比較から除外（API キー未設定）: ${skipped.join(', ')}`);
  if (names.length < 2) throw new Error('比較モードには2つ以上のモデルの API キーが必要です');
  return names;
}

function parseMode(): Mode {
  const arg = process.argv.find((a) => a.startsWith('--provider='))?.split('=')[1];
  const value = (arg || process.env.LLM_PROVIDER || 'claude').trim().toLowerCase();
  if (value === 'compare' || (PROVIDERS as string[]).includes(value)) return value as Mode;
  throw new Error(`provider の指定が不正です: ${value}（claude / gemini / openai / compare のいずれか）`);
}

/**
 * RSSを集めて、期間・キーワード・処理済みで絞った候補を返す（1つのフィードが失敗しても全体は止めない）。
 * from を指定すると maxAgeHours の代わりにその時刻以降を対象にし、件数の上限もかけない（さかのぼり収集用）
 */
async function collectCandidates(now: Date, seenUrls: Record<string, string>, from?: Date): Promise<FeedItem[]> {
  const config = await loadSources(SOURCES_PATH);
  const results = await Promise.all(config.sources.map(fetchFeed));
  const cutoff = from ? from.getTime() : now.getTime() - config.maxAgeHours * 60 * 60 * 1000;

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
    .slice(0, from ? undefined : MAX_CANDIDATES);
  console.log(`フィード ${results.filter((r) => r.ok).length}/${results.length} 件取得成功、候補 ${candidates.length} 件`);
  return candidates;
}

async function selectNews(provider: LlmProvider, candidates: FeedItem[], maxArticles: number, published: string[] = []): Promise<Pick[]> {
  const selection = await callJson(provider, {
    label: '選別',
    system: SELECT_SYSTEM,
    prompt: buildSelectPrompt(candidates, maxArticles, published),
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
  let picks = selection.selected.slice(0, maxArticles);
  console.log(`[${provider.name}] 選別結果: ${picks.length}本`);
  for (const p of picks) console.log(`  - [${candidates[p.id].sourceName}] ${candidates[p.id].title}（${p.reason}）`);
  if (published.length && picks.length) picks = await dropPublished(provider, picks, candidates, published);
  return picks;
}

/**
 * 選別の指示だけでは掲載済みの話題を選んでしまうことがあるので、選んだ候補だけを
 * 掲載済みの見出しと突き合わせて、同じ出来事のものを外す（確認に失敗したらそのまま使う）
 */
async function dropPublished(provider: LlmProvider, picks: Pick[], candidates: FeedItem[], published: string[]): Promise<Pick[]> {
  const ids = new Set(picks.map((p) => p.id));
  try {
    const result = await callJson(provider, {
      label: '重複確認',
      system: SELECT_SYSTEM,
      prompt: buildDuplicatePrompt(picks.map((p) => ({ id: p.id, item: candidates[p.id] })), published),
      schema: DuplicateSchema,
      maxTokens: 1000,
      extraCheck: (r) => {
        const bad = r.duplicates.find((d) => !ids.has(d.id));
        return bad ? `候補にない id ${bad.id} が含まれています。` : null;
      },
    });
    const dup = new Map(result.duplicates.map((d) => [d.id, d.published]));
    for (const [id, title] of dup) console.log(`  × 掲載済みと同じ話題のため除外: ${candidates[id].title}（掲載済み: ${title}）`);
    return picks.filter((p) => !dup.has(p.id));
  } catch (err) {
    if (isFatalApiError(err)) throw err;
    console.warn(`  重複確認に失敗したため、選別結果をそのまま使います: ${errorMessage(err)}`);
    return picks;
  }
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

/**
 * 通常モード: 1つのモデルで選別・記事化して src/content/posts/ に書き出す。
 * 書き出した本数と、記事化に失敗したニュース（同じ話題の記事を含む）を返す
 */
async function runNormal(
  provider: LlmProvider,
  candidates: FeedItem[],
  maxArticles: number,
  now: Date,
  today: string,
): Promise<{ written: number; failed: FeedItem[] }> {
  // 直近1週間に掲載した記事と同じ話題は選ばない（別の媒体が後から報じたものなど）
  const weekAgo = addDays(today, -7);
  const published = (await existingPosts()).filter((p) => p.ymd >= weekAgo).map((p) => p.title);
  const picks = await selectNews(provider, candidates, maxArticles, published);
  await mkdir(POSTS_DIR, { recursive: true });
  const usedNames = new Set<string>();
  let written = 0;
  const failed: FeedItem[] = [];
  for (const pick of picks) {
    const item = candidates[pick.id];
    const related = relatedItems(pick, candidates);
    try {
      const draft = await writeArticle(provider, item, related, await fetchBody(item));
      const fileName = uniqueFileName(POSTS_DIR, today, sanitizeSlug(draft.slug), usedNames);
      await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, now));
      written++;
      console.log(`  → src/content/posts/${fileName}`);
    } catch (err) {
      // 1本失敗しても残りは続ける（認証エラーなどは全体の失敗として扱う）
      if (isFatalApiError(err)) throw err;
      console.error(`  ✗ 記事化に失敗したためスキップ: ${errorMessage(err)}`);
      failed.push(item, ...related);
    }
  }
  if (picks.length > 0 && written === 0) throw new Error('選別した記事をすべて記事化できませんでした');
  return { written, failed };
}

/** 指定した URL の記事を、RSS から探して1本だけ記事化する（処理済み・期間外でも対象） */
async function runTarget(provider: LlmProvider, targetUrl: string, now: Date, today: string): Promise<number> {
  const config = await loadSources(SOURCES_PATH);
  const results = await Promise.all(config.sources.map(fetchFeed));
  const key = normalizeUrl(targetUrl);
  const item = results.flatMap((r) => r.items).find((i) => normalizeUrl(i.url) === key);
  if (!item) throw new Error(`TARGET_URL の記事が取得元のRSSに見つかりません: ${targetUrl}`);
  console.log(`指定記事: [${item.sourceName}] ${item.title}`);
  await mkdir(POSTS_DIR, { recursive: true });
  const draft = await writeArticle(provider, item, [], await fetchBody(item));
  const fileName = uniqueFileName(POSTS_DIR, today, sanitizeSlug(draft.slug), new Set());
  await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, now));
  console.log(`  → src/content/posts/${fileName}`);
  return 1;
}

/**
 * さかのぼり収集: since（YYYY-MM-DD、日本時間）以降に公開されたニュースを公開日ごとに分け、
 * 日ごとに最大 maxArticles 本を選別・記事化する。記事の日付はニュースの公開日にする。
 * 対象は「既存記事のいちばん古い日の前日」まで（それ以降は通常の毎日の収集に任せる）。
 * すでに載せた記事と同じ出来事は選ばないよう、既存の見出しを選別に渡す。
 */
async function runBackfill(
  provider: LlmProvider,
  since: string,
  maxArticles: number,
  seen: Awaited<ReturnType<typeof loadSeen>>,
  dryRun: boolean,
  today: string,
): Promise<number> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) throw new Error(`SINCE は YYYY-MM-DD の形式で指定してください: ${since}`);
  const existing = await existingPosts();
  const oldest = existing.map((p) => p.ymd).sort()[0];
  const until = oldest ? addDays(oldest, -1) : addDays(today, -1);
  if (since > until) {
    console.log(`さかのぼる期間がありません（${since} 〜 ${until}）`);
    return 0;
  }
  console.log(`さかのぼり収集: ${since} 〜 ${until}（日本時間の公開日ごとに最大${maxArticles}本）`);

  const candidates = await collectCandidates(new Date(), seen.urls, new Date(`${since}T00:00:00+09:00`));
  const byDay = new Map<string, FeedItem[]>();
  for (const item of candidates) {
    const ymd = jstParts(item.publishedAt).ymd;
    if (ymd > until) continue;
    byDay.set(ymd, [...(byDay.get(ymd) ?? []), item]);
  }

  const published = existing.map((p) => p.title);
  await mkdir(POSTS_DIR, { recursive: true });
  const usedNames = new Set<string>();
  let written = 0;
  for (let ymd = since; ymd <= until; ymd = addDays(ymd, 1)) {
    const dayItems = (byDay.get(ymd) ?? []).slice(0, MAX_CANDIDATES);
    console.log(`\n== ${ymd}: 候補 ${dayItems.length} 件`);
    if (dayItems.length === 0) continue;
    // 記事の日時はその日の正午（日本時間）にする。見出しの「M/D」もこの日付になる
    const dayNow = new Date(`${ymd}T12:00:00+09:00`);
    const picks = await selectNews(provider, dayItems, maxArticles, published);
    const failed = new Set<string>();
    for (const pick of picks) {
      const item = dayItems[pick.id];
      const related = relatedItems(pick, dayItems);
      try {
        const draft = await writeArticle(provider, item, related, await fetchBody(item));
        const fileName = uniqueFileName(POSTS_DIR, ymd, sanitizeSlug(draft.slug), usedNames);
        await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, dayNow));
        published.push(draft.headline);
        written++;
        console.log(`  → src/content/posts/${fileName}`);
      } catch (err) {
        if (isFatalApiError(err)) throw err;
        console.error(`  ✗ 記事化に失敗したためスキップ: ${errorMessage(err)}`);
        for (const i of [item, ...related]) failed.add(normalizeUrl(i.url));
      }
    }
    // その日の候補は処理済みにする（記事化に失敗したものは除く）
    for (const item of dayItems) {
      const key = normalizeUrl(item.url);
      if (!failed.has(key)) seen.urls[key] = today;
    }
  }
  if (written > 0 && !dryRun) await saveSeen(SEEN_PATH, seen, today);
  return written;
}

/** 既存の記事の日付（ファイル名の YYYY-MM-DD）と見出し（先頭の「M/D 」を除く） */
async function existingPosts(): Promise<{ ymd: string; title: string }[]> {
  if (!existsSync(POSTS_DIR)) return [];
  const files = (await readdir(POSTS_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f));
  return Promise.all(
    files.map(async (f) => {
      const text = await readFile(join(POSTS_DIR, f), 'utf8');
      const title = text.match(/^title:\s*"?(.*?)"?\s*$/m)?.[1] ?? '';
      return { ymd: f.slice(0, 10), title: title.replace(/^\d{1,2}\/\d{1,2}\s+/, '') };
    }),
  );
}

/** YYYY-MM-DD に日数を足す */
function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * 比較モード: 各モデルで選別し、多くのモデルが選んだニュースを優先して最大 maxArticles 本を、
 * 同じ材料（本文）で全モデルに記事化させる。記事ファイル・seen.json は書かず、レポートだけを出力する。
 */
async function runCompare(providers: LlmProvider[], candidates: FeedItem[], maxArticles: number, now: Date) {
  // TYPESAFE_API_KEY があれば Jev に審査させる（なければ審査なしで比較する）
  const judge = createJudge();
  console.log(judge ? `審査: Jev（${judge.model}）` : '審査: なし（TYPESAFE_API_KEY が未設定）');

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
    const drafts = Object.fromEntries(results.filter((r) => r.draft).map((r) => [r.provider.name, r.draft!]));
    const judged = judge && Object.keys(drafts).length > 0 ? await judge.judge(item, body, drafts) : undefined;
    articles.push({
      item,
      selectedBy: selections.filter((s) => s.picks.some((p) => p.id === pick.id)).map((s) => s.provider.name),
      results,
      judge: judged,
    });
  }

  const report = renderCompareReport({ now, candidates, selections, articles, providers, judge });
  await mkdir(COMPARE_DIR, { recursive: true });
  const { ymd, iso } = jstParts(now);
  const fileName = `compare-${ymd}-${iso.slice(11, 16).replace(':', '')}.md`;
  await writeFile(join(COMPARE_DIR, fileName), report);
  console.log(`比較レポートを出力しました: compare-output/${fileName}`);
  // GitHub Actions では実行結果ページの Summary にそのまま表示する
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
}

/** 選んだモデルが多いもの → 順位の平均が高いもの（各モデルの順位を交互に）の順で並べる */
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
