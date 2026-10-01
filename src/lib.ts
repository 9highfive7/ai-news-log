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
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime() || b.id.localeCompare(a.id));
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
export function groupByDate(posts: Post[]): { key: string; heading: string; posts: Post[] }[] {
  const groups: { key: string; heading: string; posts: Post[] }[] = [];
  for (const post of posts) {
    const key = dateKey(post.data.date);
    let group = groups.at(-1);
    if (!group || group.key !== key) {
      group = { key, heading: formatDateHeading(post.data.date), posts: [] };
      groups.push(group);
    }
    group.posts.push(post);
  }
  return groups;
}
