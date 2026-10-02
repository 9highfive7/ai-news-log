import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TAG_NAMES } from './consts';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.enum(TAG_NAMES)).default([]),
    source_name: z.string(),
    source_url: z.url(),
    /** 一覧用の短い要約（全角60〜80字）。古い記事にはない */
    lead: z.string().optional(),
  }),
});

export const collections = { posts };
