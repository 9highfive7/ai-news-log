import { getCollection, type CollectionEntry } from 'astro:content';
import { TIME_ZONE } from './consts';

export type Post = CollectionEntry<'posts'>;

/** base（/ai-news-log）を付けたサイト内URL */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

export function postUrl(post: Post): string {
  return url(`posts/${post.id}/`);
}

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  // 日付（日本時間）の新しい順。同じ日の中は選別の順位（rank）順で、rank のない記事はその後ろに時刻の新しい順
  const rank = (p: Post) => p.data.rank ?? Number.MAX_SAFE_INTEGER;
  return posts.sort(
    (a, b) =>
      dateKey(b.data.date).localeCompare(dateKey(a.data.date)) ||
      rank(a) - rank(b) ||
      b.data.date.getTime() - a.data.date.getTime() ||
      b.id.localeCompare(a.id),
  );
}

/** 日本時間の YYYY-MM-DD */
export function dateKey(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

/** 2026年10月1日（水） */
export function formatDateHeading(date: Date): string {
  const d = new Intl.DateTimeFormat('ja-JP', { timeZone: TIME_ZONE, year: 'numeric', month: 'long', day: 'numeric' }).format(date);
  const w = new Intl.DateTimeFormat('ja-JP', { timeZone: TIME_ZONE, weekday: 'short' }).format(date);
  return `${d}（${w}）`;
}

/** 記事を日付（日本時間）ごとにまとめる。順序は posts の並びを保つ */
export function groupByDate(posts: Post[]): { key: string; heading: string; label: string; posts: Post[] }[] {
  const groups: { key: string; heading: string; label: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const key = dateKey(post.data.date);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, heading: formatDateHeading(post.data.date), label: formatDayLabel(post.data.date), posts: [] };
      groups.push(group);
    }
    group.posts.push(post);
  }
  return groups;
}

/** 一覧表示用のタイトル。先頭の「M/D 」を外し、社名・製品名が先頭に来るようにする（記事データは変えない） */
export function listTitle(post: Post): string {
  return post.data.title.replace(/^\d{1,2}\/\d{1,2}\s+/, '');
}

/** 一覧用の短い要約。lead があればそれを、なければ本文の「要約」をそのまま使う（行数は CSS で制限する） */
export function listSummary(post: Post): string {
  if (post.data.lead) return post.data.lead;
  // 段落の区切り（改行）は日本語なので空白を入れずにつなぐ
  return post.body?.match(/## 要約\s+([\s\S]*?)\n##/)?.[1]?.replace(/\s*\n\s*/g, '').replace(/\s+/g, ' ').trim() ?? '';
}

/** 日付見出し用の短い表記: 10月2日（金） */
export function formatDayLabel(date: Date): string {
  return formatDateHeading(date).replace(/^\d+年/, '');
}

/** 本文の「ポイント」の箇条書き（トップの最新記事で付箋に表示する） */
export function listPoints(post: Post): string[] {
  const section = post.body?.match(/## ポイント\s+([\s\S]*?)(?:\n##|$)/)?.[1] ?? '';
  return section
    .split('\n')
    .map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1]?.trim())
    .filter((s): s is string => Boolean(s));
}

/** その日を含む週の月曜日（日本時間の YYYY-MM-DD）。週は月曜〜日曜 */
export function weekKey(date: Date): string {
  const d = new Date(`${dateKey(date)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}

/** 9/28（月）〜10/4（日） */
export function formatWeekRange(key: string): string {
  const start = new Date(`${key}T00:00:00Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const md = (d: Date) => `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
  return `${md(start)}（月）〜${md(end)}（日）`;
}

export function weekUrl(key: string): string {
  return url(`weeks/${key}/`);
}

/** 記事を週ごとにまとめる（新しい週から） */
export function groupByWeek(posts: Post[]): { key: string; posts: Post[] }[] {
  const groups: { key: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const key = weekKey(post.data.date);
    let group = groups.find((g) => g.key === key);
    if (!group) groups.push((group = { key, posts: [] }));
    group.posts.push(post);
  }
  return groups.sort((a, b) => b.key.localeCompare(a.key));
}
