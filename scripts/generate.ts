/**
 * RSSからAIニュースを集め、Claudeで選別・記事化して src/content/posts/ に Markdown を出力する。
 *
 *   npm run generate        # 本番（data/seen.json も更新）
 *   npm run generate:dry    # dry-run（記事ファイルの出力のみ。seen.json は更新しない）
 */
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { callJson, MODEL } from './lib/claude.ts';
import { fetchArticleText, fetchFeed, loadSources, matchesKeywords, normalizeUrl, type FeedItem } from './lib/feeds.ts';
import { jstParts, renderMarkdown, sanitizeSlug, uniqueFileName } from './lib/markdown.ts';
import {
  ARTICLE_SYSTEM,
  ArticleSchema,
  buildArticlePrompt,
  buildSelectPrompt,
  checkArticle,
  SELECT_SYSTEM,
  SelectionSchema,
} from './lib/prompts.ts';
import { loadSeen, saveSeen } from './lib/seen.ts';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCES_PATH = join(ROOT, 'sources.json');
const SEEN_PATH = join(ROOT, 'data', 'seen.json');
const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');

/** 選別に渡す候補の上限（新しい順）。トークン量を抑えるため */
const MAX_CANDIDATES = 80;

async function main() {
  if (existsSync(join(ROOT, '.env'))) process.loadEnvFile(join(ROOT, '.env'));

  const dryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1';
  const maxArticles = Math.max(1, Number(process.env.MAX_ARTICLES) || 5);
  const now = new Date();
  const today = jstParts(now).ymd;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY が設定されていません（.env か環境変数で設定してください）');
  }

  console.log(`AIニュースログ 記事生成 ${dryRun ? '[dry-run] ' : ''}model=${MODEL} max=${maxArticles} date=${today}`);

  // 1. 収集（1つ失敗しても全体は止めない）
  const config = await loadSources(SOURCES_PATH);
  const results = await Promise.all(config.sources.map(fetchFeed));
  const cutoff = now.getTime() - config.maxAgeHours * 60 * 60 * 1000;
  const seen = await loadSeen(SEEN_PATH);

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
      if (seen.urls[key] || byUrl.has(key) || titles.has(titleKey)) continue;
      byUrl.set(key, item);
      titles.add(titleKey);
      added++;
    }
    console.log(`  ✓ ${r.source.name}: ${r.total}件中 ${added}件が候補`);
  }

  const candidates = [...byUrl.values()]
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    .slice(0, MAX_CANDIDATES);
  const okCount = results.filter((r) => r.ok).length;
  console.log(`フィード ${okCount}/${results.length} 件取得成功、候補 ${candidates.length} 件`);

  if (candidates.length === 0) {
    console.log('新しい候補がないため終了します。');
    await setOutput('count', '0');
    return;
  }

  // 2. 選別
  const selection = await callJson({
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
  console.log(`選別結果: ${picks.length}本`);
  for (const p of picks) console.log(`  - [${candidates[p.id].sourceName}] ${candidates[p.id].title}（${p.reason}）`);

  // 3. 記事化
  await mkdir(POSTS_DIR, { recursive: true });
  const usedNames = new Set<string>();
  const written: string[] = [];
  for (const pick of picks) {
    const item = candidates[pick.id];
    const related = pick.related_ids.filter((id) => id !== pick.id).map((id) => candidates[id]);
    try {
      const body = await fetchArticleText(item.url);
      console.log(`記事化: ${item.title}${body ? '' : '（本文取得できず、概要のみで作成）'}`);
      const sourceText = [item.title, item.summary, body ?? ''].join('\n');
      const draft = await callJson({
        label: '記事化',
        system: ARTICLE_SYSTEM,
        prompt: buildArticlePrompt(item, body, related),
        schema: ArticleSchema,
        maxTokens: 3000,
        extraCheck: (d) => checkArticle(d, sourceText),
      });
      const fileName = uniqueFileName(POSTS_DIR, today, sanitizeSlug(draft.slug), usedNames);
      await writeFile(join(POSTS_DIR, fileName), renderMarkdown(draft, item, now));
      written.push(fileName);
      console.log(`  → src/content/posts/${fileName}`);
    } catch (err) {
      // 1本失敗しても残りは続ける（認証エラーなどは全体の失敗として扱う）
      if (isFatalApiError(err)) throw err;
      console.error(`  ✗ 記事化に失敗したためスキップ: ${err instanceof Error ? err.message : err}`);
    }
  }

  // 4. 処理済みURLの記録（選ばれなかった候補も含めて記録し、翌日に同じ候補を再評価しない）
  if (written.length > 0 && !dryRun) {
    for (const item of candidates) seen.urls[normalizeUrl(item.url)] = today;
    await saveSeen(SEEN_PATH, seen, today);
  }

  console.log(`完了: ${written.length}本の記事を出力しました${dryRun ? '（dry-run: seen.json は更新していません）' : ''}`);
  await setOutput('count', String(written.length));

  if (picks.length > 0 && written.length === 0) {
    throw new Error('選別した記事をすべて記事化できませんでした');
  }
}

function isFatalApiError(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return status === 401 || status === 403 || status === 404;
}

/** GitHub Actions の step output に書き出す（ローカルでは何もしない） */
async function setOutput(name: string, value: string) {
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}

main().catch(async (err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
