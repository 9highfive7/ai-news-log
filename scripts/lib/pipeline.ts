/**
 * 記事生成（generate.ts）と見直し（review.ts）で共通の処理: RSSの収集、選別、掲載済みとの重複確認、既存記事の読み込み
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fetchFeed, loadSources, matchesKeywords, normalizeUrl, type FeedItem } from './feeds.ts';
import { isFatalApiError, type LlmProvider } from './llm/index.ts';
import { callJson } from './llm/json.ts';
import { buildDuplicatePrompt, buildSelectPrompt, DuplicateSchema, SELECT_SYSTEM, SelectionSchema, type Selection } from './prompts.ts';

export const ROOT = resolve(import.meta.dirname, '..', '..');
export const SOURCES_PATH = join(ROOT, 'sources.json');
export const SEEN_PATH = join(ROOT, 'data', 'seen.json');
export const POSTS_DIR = join(ROOT, 'src', 'content', 'posts');

/** 選別に渡す候補の上限（新しい順）。トークン量を抑えるため */
export const MAX_CANDIDATES = 80;

export type Pick = Selection['selected'][number];

/**
 * RSSを集めて、期間・キーワード・処理済みで絞った候補を返す（1つのフィードが失敗しても全体は止めない）。
 * from を指定すると maxAgeHours の代わりにその時刻以降を対象にし、件数の上限もかけない（さかのぼり収集用）
 */
export async function collectCandidates(now: Date, seenUrls: Record<string, string>, from?: Date): Promise<FeedItem[]> {
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

export async function selectNews(provider: LlmProvider, candidates: FeedItem[], maxArticles: number, published: string[] = []): Promise<Pick[]> {
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
export async function dropPublished(provider: LlmProvider, picks: Pick[], candidates: FeedItem[], published: string[]): Promise<Pick[]> {
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

export function relatedItems(pick: Pick, candidates: FeedItem[]): FeedItem[] {
  return pick.related_ids.filter((id) => id !== pick.id).map((id) => candidates[id]);
}

export interface ExistingPost {
  /** ファイル名（拡張子つき） */
  file: string;
  /** ファイル名の日付（YYYY-MM-DD） */
  ymd: string;
  /** 見出し（先頭の「M/D 」を除く） */
  title: string;
  lead: string;
  tags: string[];
  sourceName: string;
  sourceUrl: string;
  rank?: number;
}

/** 既存の記事の一覧（フロントマターから必要な項目だけ読む） */
export async function existingPosts(): Promise<ExistingPost[]> {
  if (!existsSync(POSTS_DIR)) return [];
  const files = (await readdir(POSTS_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}-.+\.md$/.test(f)).sort();
  return Promise.all(
    files.map(async (file) => {
      const text = await readFile(join(POSTS_DIR, file), 'utf8');
      const field = (name: string) => text.match(new RegExp(`^${name}:\\s*(.*)$`, 'm'))?.[1]?.trim() ?? '';
      const str = (name: string) => {
        const raw = field(name);
        try {
          return raw.startsWith('"') ? (JSON.parse(raw) as string) : raw;
        } catch {
          return raw.replace(/^"|"$/g, '');
        }
      };
      let tags: string[] = [];
      try {
        tags = JSON.parse(field('tags') || '[]') as string[];
      } catch {}
      const rank = Number(field('rank'));
      return {
        file,
        ymd: file.slice(0, 10),
        title: str('title').replace(/^\d{1,2}\/\d{1,2}\s+/, ''),
        lead: str('lead'),
        tags,
        sourceName: str('source_name'),
        sourceUrl: str('source_url'),
        rank: Number.isInteger(rank) && rank > 0 ? rank : undefined,
      };
    }),
  );
}

/** YYYY-MM-DD に日数を足す */
export function addDays(ymd: string, days: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
