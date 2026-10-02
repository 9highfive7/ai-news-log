import { readFile } from 'node:fs/promises';
import Parser from 'rss-parser';

export interface Source {
  name: string;
  url: string;
  /** false にすると取得対象から外れる（省略時 true） */
  enabled?: boolean;
  /** AI専門ではないフィード用。タイトルか概要にどれかを含む記事だけを候補にする */
  keywords?: string[];
  /**
   * 取得形式。省略時は RSS/Atom。
   * anthropic-news: RSS のない anthropic.com/news の一覧ページから記事リンク・日付・見出しを読み取る
   */
  format?: 'rss' | 'anthropic-news';
  /** 見出しの先頭に付ける語（GitHub のリリースのように見出しがバージョン番号だけのフィード用） */
  titlePrefix?: string;
}

export interface SourcesConfig {
  maxAgeHours: number;
  sources: Source[];
}

export interface FeedItem {
  sourceName: string;
  title: string;
  url: string;
  publishedAt: Date;
  summary: string;
}

export interface FeedResult {
  source: Source;
  ok: boolean;
  items: FeedItem[];
  /** 期間で絞る前の件数 */
  total: number;
  error?: string;
}

export const USER_AGENT = 'Mozilla/5.0 (compatible; ai-news-log/1.0; +https://github.com/9highfive7/ai-news-log)';
const TIMEOUT_MS = 20_000;

const parser = new Parser();

export async function loadSources(path: string): Promise<SourcesConfig> {
  const config = JSON.parse(await readFile(path, 'utf8')) as SourcesConfig;
  config.maxAgeHours ??= 36;
  config.sources = config.sources.filter((s) => s.enabled !== false);
  return config;
}

export async function fetchText(url: string, accept: string): Promise<string> {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: accept },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.text();
}

/** 1つのフィードを取得する。失敗しても例外は投げず ok:false を返す */
export async function fetchFeed(source: Source): Promise<FeedResult> {
  try {
    if (source.format === 'anthropic-news') {
      const items = parseAnthropicNews(await fetchText(source.url, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'), source);
      // ページの作りが変わって読み取れなくなったときに気づけるよう、0件は失敗として扱う
      if (items.length === 0) throw new Error('一覧ページから記事を読み取れませんでした（ページの構成が変わった可能性があります）');
      return { source, ok: true, items, total: items.length };
    }
    const xml = await fetchText(source.url, 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8');
    const feed = await parser.parseString(xml);
    const items: FeedItem[] = [];
    for (const entry of feed.items ?? []) {
      const url = entry.link?.trim();
      const title = entry.title?.trim();
      const dateStr = entry.isoDate ?? entry.pubDate;
      if (!url || !title || !dateStr) continue;
      const publishedAt = new Date(dateStr);
      if (Number.isNaN(publishedAt.getTime())) continue;
      const summary = stripHtml(entry.contentSnippet ?? entry.summary ?? entry.content ?? '').slice(0, 600);
      const plainTitle = stripHtml(title);
      items.push({ sourceName: source.name, title: source.titlePrefix ? `${source.titlePrefix} ${plainTitle}` : plainTitle, url, publishedAt, summary });
    }
    return { source, ok: true, items, total: items.length };
  } catch (err) {
    return { source, ok: false, items: [], total: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

const MONTHS: Record<string, number> = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/**
 * anthropic.com/news の一覧ページから記事を読み取る。
 * 各記事は <a href="/news/..."> の中に <time>（例: Oct 2, 2026）と見出しを持つ。
 * 時刻は分からないので、その日の 12:00 UTC（日本時間 21:00）とする
 */
export function parseAnthropicNews(html: string, source: Source): FeedItem[] {
  const items: FeedItem[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/<a\b[^>]*href="((?:https:\/\/www\.anthropic\.com)?\/news\/[a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = new URL(m[1], 'https://www.anthropic.com').toString();
    if (seen.has(url)) continue;
    const inner = m[2];
    const date = inner.match(/<time\b[^>]*>\s*([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),\s*(\d{4})\s*<\/time>/);
    if (!date) continue;
    const month = MONTHS[date[1].toLowerCase()];
    if (month === undefined) continue;
    const publishedAt = new Date(Date.UTC(Number(date[3]), month, Number(date[2]), 12));
    // 見出しは class に title を含む要素。なければ日付・分類以外でいちばん長いテキスト
    const titleHtml = inner.match(/<(span|h[1-6]|p|div)\b[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/\1>/i)?.[2];
    const texts = inner.replace(/<time\b[\s\S]*?<\/time>/gi, '|').split(/<[^>]+>/).map((t) => stripHtml(t)).filter(Boolean);
    const title = titleHtml ? stripHtml(titleHtml) : texts.sort((a, b) => b.length - a.length)[0];
    if (!title) continue;
    const category = inner.match(/<span\b[^>]*class="[^"]*subject[^"]*"[^>]*>([\s\S]*?)<\/span>/i)?.[1];
    seen.add(url);
    items.push({ sourceName: source.name, title, url, publishedAt, summary: category ? `Anthropic公式（${stripHtml(category)}）` : '' });
  }
  return items;
}

export function matchesKeywords(item: FeedItem, keywords?: string[]): boolean {
  if (!keywords || keywords.length === 0) return true;
  const text = `${item.title} ${item.summary}`;
  return keywords.some((k) => {
    // 英字のキーワードは単語境界で判定し、"MAIL" などへの誤マッチを防ぐ。
    // 大文字だけの略語（AI, LLM）は大文字小文字を区別し、それ以外（model など）は区別しない
    if (/^[A-Za-z0-9 ]+$/.test(k)) {
      const flags = k === k.toUpperCase() ? '' : 'i';
      return new RegExp(`(^|[^A-Za-z])${k}([^A-Za-z]|$)`, flags).test(text);
    }
    return text.includes(k);
  });
}

/** 比較用にURLを正規化する（utm系パラメータとフラグメントを除去） */
export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    for (const key of [...u.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|ref$|source$)/.test(key)) u.searchParams.delete(key);
    }
    u.hostname = u.hostname.toLowerCase();
    return u.toString().replace(/\/$/, '');
  } catch {
    return url.trim();
  }
}

export function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/**
 * 元記事のHTMLから本文らしきテキストを取り出す（要約の材料にするだけで、出力には使わない）。
 * 取得に失敗した場合は null。
 */
export async function fetchArticleText(url: string, maxChars = 6000): Promise<string | null> {
  try {
    let html = await fetchText(url, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8');
    html = html.replace(/<(script|style|noscript|svg|nav|header|footer|aside|form|figure)\b[\s\S]*?<\/\1>/gi, ' ');
    const article = html.match(/<article\b[\s\S]*?<\/article>/i)?.[0] ?? html;
    const paragraphs = [...article.matchAll(/<(p|h2|h3|li)\b[^>]*>([\s\S]*?)<\/\1>/gi)]
      .map((m) => stripHtml(m[2]))
      .filter((t) => t.length >= 20);
    const text = paragraphs.join('\n');
    if (text.length < 200) return null;
    return text.slice(0, maxChars);
  } catch {
    return null;
  }
}
