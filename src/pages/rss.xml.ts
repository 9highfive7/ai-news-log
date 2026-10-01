import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getPosts, url } from '../lib';

export async function GET(context: APIContext) {
  const posts = (await getPosts()).slice(0, 50);
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: new URL(url('/'), context.site).toString(),
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: url(`posts/${post.id}/`),
      categories: post.data.tags,
      description: post.body?.match(/## 要約\s+([\s\S]*?)\n##/)?.[1]?.trim() ?? '',
    })),
    customData: '<language>ja</language>',
  });
}
