/**
 * RSSからAIニュースを集め、LLM（Claude / Gemini）で選別・記事化して src/content/posts/ に Markdown を出力する。
 *
 *   npm run generate                         # 本番（data/seen.json も更新）
 *   npm run generate:dry                     # dry-run（記事ファイルの出力のみ。seen.json は更新しない）
 *   npm run generate:dry -- --provider=gemini  # 使うモデルを指定（claude / gemini / openai。省略時は LLM_PROVIDER、なければ claude）
 *   TARGET_URL=<記事URL> npm run generate     # 指定した1本だけを記事化（選別なし。処理済み・期間外でも対象）
 *   PLAN_FILE=data/plans/xxx.json npm run generate  # 計画ファイルに書いたニュースを、指定した日付・順位で記事化（見直しの反映用）
 *   SINCE=2026-09-25 npm run generate         # さかのぼり収集: 指定日以降のニュースを公開日ごとに選別・記事化（既存記事の前日まで）
 *   npm run compare                          # 比較モード（同じニュースを全モデルで記事化し、レポートだけを出力）
 */
import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { renderCompareReport, type CompareArticle, type CompareSelection } from './lib/compare.ts';
import { createJudge } from './lib/judge.ts';
import { fetchArticleText, fetchFeed, loadSources, normalizeUrl, type FeedItem } from './lib/feeds.ts';
import { createProvider, hasApiKey, isFatalApiError, isRateLimitError, PROVIDERS, type LlmProvider, type ProviderName } from './lib/llm/index.ts';
import { callJson, getStats } from './lib/llm/json.ts';
import { jstParts, renderArticleBody, renderMarkdown, sanitizeSlug, uniqueFileName } from './lib/markdown.ts';
import {
  addDays,
  collectCandidates,
  errorMessage,
  existingPosts,
  MAX_CANDIDATES,
  POSTS_DIR,
  relatedItems,
  ROOT,
  SEEN_PATH,
  selectNews,
  SOURCES_PATH,
  type Pick,
} from './lib/pipeline.ts';
import { ARTICLE_SYSTEM, ArticleSchema, buildArticlePrompt, checkArticle, type ArticleDraft } from './lib/prompts.ts';
import { loadSeen, saveSeen } from './lib/seen.ts';

const COMPARE_DIR = join(ROOT, 'compare-output');

type Mode = ProviderName | 'compare';

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

  // 計画ファイルに書いたニュースを記事化する（既存記事の見直しで決めた追加・書き直しの反映用）
  const planFile = process.env.PLAN_FILE?.trim();
  if (planFile) {
    if (mode === 'compare') throw new Error('PLAN_FILE は比較モードでは使えません');
    const urls = await runPlan(providers[0], join(ROOT, planFile));
    if (!dryRun && urls.length) {
      for (const url of urls) seen.urls[normalizeUrl(url)] = today;
      await saveSeen(SEEN_PATH, seen, today);
    }
    console.log(`完了: ${urls.length}本の記事を出力しました`);
    await setOutput('count', String(urls.length));
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
  for (const [index, pick] of picks.entries()) {
    const item = candidates[pick.id];
    const related = relatedItems(pick, candidates);
    try {
      const draft = await writeArticle(provider, item, related, await fetchBody(item));
      const fileName = uniqueFileName(POSTS_DIR, today, sanitizeSlug(draft.slug), usedNames);
      // rank: その日の選別での順位。同じ日の記事はこの順に並ぶ
      await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, now, index + 1));
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

interface PlanEntry {
  /** 記事化するニュースのURL（url か title のどちらかで指定。replace のときは省略すると既存記事の source_url を使う） */
  url?: string;
  /** 見出しに含まれる文字列で探す（source と組み合わせる） */
  title?: string;
  /** 取得元の名前（sources.json の name） */
  source?: string;
  /** 記事の日付（YYYY-MM-DD、日本時間）。replace のときは省略すると既存記事の日付を使う */
  date?: string;
  /** その日の中での順位 */
  rank?: number;
  /** この語を見出しか概要に含む他の記事を「同じ話題の別記事」として材料に加える（元記事の本文が取れない場合の補足用） */
  relatedKeyword?: string;
  /** 既存の記事ファイルを書き直す場合のファイル名 */
  replace?: string;
  /**
   * replace と組み合わせる。フロントマター（見出し・lead・タグ・順位など）はそのまま残し、本文（ポイント・要約）だけを作り直す。
   * 元記事の本文を取得できなかった場合は、既存の記事をそのまま残す
   */
  bodyOnly?: boolean;
}

/** 計画ファイルの記事化で利用上限にかかったときの待ち時間と試行回数 */
const RATE_LIMIT_WAIT_MS = 60_000;
const RATE_LIMIT_ATTEMPTS = 3;

/** 既存の記事ファイルから、残すフロントマターと元記事の情報を読む（RSS から消えた記事を書き直すため） */
async function readPostFile(fileName: string): Promise<{ frontmatter: string; ymd: string; item: FeedItem }> {
  const text = await readFile(join(POSTS_DIR, fileName), 'utf8');
  const frontmatter = text.match(/^---\n[\s\S]*?\n---\n/)?.[0];
  if (!frontmatter) throw new Error(`フロントマターが読めません: ${fileName}`);
  const str = (name: string) => {
    const raw = frontmatter.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
    return raw.startsWith('"') ? (JSON.parse(raw) as string) : raw;
  };
  const url = str('source_url');
  const date = str('date');
  // 元記事の見出しは本文末尾のリンク（- [見出し](<URL>)（媒体名））から取る
  const linkTitle = text.match(/^- \[(.*)\]\(<[^>]*>\)/m)?.[1] ?? str('title');
  return {
    frontmatter: frontmatter.trimEnd(),
    ymd: date.slice(0, 10),
    item: { sourceName: str('source_name'), title: linkTitle, url, publishedAt: new Date(date), summary: '' },
  };
}

/**
 * 計画ファイル（{"entries": PlanEntry[]}）のニュースを、指定した日付・順位で記事化する。
 * RSS に残っている記事が対象（処理済み・期間外でも対象）。既存記事の書き直し（replace）は、RSS から消えていても
 * 記事ファイルの source_url から本文を取りにいく。記事化したニュースのURLを返す
 */
async function runPlan(provider: LlmProvider, path: string): Promise<string[]> {
  const plan = JSON.parse(await readFile(path, 'utf8')) as { entries: PlanEntry[] };
  const config = await loadSources(SOURCES_PATH);
  const items = (await Promise.all(config.sources.map(fetchFeed))).flatMap((r) => r.items);
  await mkdir(POSTS_DIR, { recursive: true });
  const usedNames = new Set<string>();
  const done: string[] = [];
  for (const entry of plan.entries) {
    const existing = entry.replace ? await readPostFile(entry.replace) : undefined;
    const url = entry.url ?? (entry.title ? undefined : existing?.item.url);
    const date = entry.date ?? existing?.ymd;
    const found = items.find((i) =>
      url
        ? normalizeUrl(i.url) === normalizeUrl(url)
        : !!entry.title && i.title.includes(entry.title) && (!entry.source || i.sourceName === entry.source),
    );
    // RSS から消えた記事でも、書き直しなら既存記事に書いてある元記事URLから本文を取りにいく
    const item = found ?? (existing && url && normalizeUrl(existing.item.url) === normalizeUrl(url) ? existing.item : undefined);
    if (!item || !date) {
      console.error(`  ✗ 取得元のRSSに見つかりません: ${url ?? entry.title}`);
      continue;
    }
    const keyword = entry.relatedKeyword?.toLowerCase();
    const related = keyword
      ? items
          .filter((i) => i.url !== item.url && `${i.title} ${i.summary}`.toLowerCase().includes(keyword))
          .slice(0, 6)
      : [];
    console.log(
      `記事化: [${item.sourceName}] ${item.title}（${date}・${entry.rank ?? '-'}位${related.length ? `・関連 ${related.length} 件` : ''}` +
        `${entry.bodyOnly ? '・本文のみ' : ''}${found ? '' : '・RSSになし'}）`,
    );
    const body = await fetchBody(item);
    if (entry.bodyOnly && existing && !body) {
      console.error('  ✗ 元記事の本文を取得できないため、既存の記事をそのまま残します');
      continue;
    }
    // 本数が多いと無料枠などの利用上限（1分あたりの回数）にかかるので、そのときは待ってやり直す
    for (let attempt = 1; ; attempt++) {
      try {
        const draft = await writeArticle(provider, item, related, body);
        if (entry.bodyOnly && existing) {
          await writeFile(join(POSTS_DIR, entry.replace!), `${existing.frontmatter}\n\n${renderArticleBody(draft, existing.item)}`);
        } else {
          const fileName = entry.replace ?? uniqueFileName(POSTS_DIR, date, sanitizeSlug(draft.slug), usedNames);
          await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, new Date(`${date}T12:00:00+09:00`), entry.rank));
        }
        done.push(item.url);
        console.log(`  → src/content/posts/${entry.replace ?? '(新規)'}`);
      } catch (err) {
        if (isFatalApiError(err)) throw err;
        if (isRateLimitError(err) && attempt < RATE_LIMIT_ATTEMPTS) {
          console.warn(`  利用上限にかかったため ${RATE_LIMIT_WAIT_MS / 1000} 秒待ってやり直します (${attempt}/${RATE_LIMIT_ATTEMPTS})`);
          await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
          continue;
        }
        console.error(`  ✗ 記事化に失敗しました: ${errorMessage(err).slice(0, 300)}`);
      }
      break;
    }
  }
  if (plan.entries.length > 0 && done.length === 0) throw new Error('計画ファイルの記事を1本も記事化できませんでした');
  return done;
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
    for (const [index, pick] of picks.entries()) {
      const item = dayItems[pick.id];
      const related = relatedItems(pick, dayItems);
      try {
        const draft = await writeArticle(provider, item, related, await fetchBody(item));
        const fileName = uniqueFileName(POSTS_DIR, ymd, sanitizeSlug(draft.slug), usedNames);
        await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, dayNow, index + 1));
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


/** GitHub Actions の step output に書き出す（ローカルでは何もしない） */
async function setOutput(name: string, value: string) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

main().catch((err) => {
  console.error(errorMessage(err));
  process.exitCode = 1;
});
