import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TIME_ZONE } from '../../src/consts.ts';
import type { FeedItem } from './feeds.ts';
import type { ArticleDraft } from './prompts.ts';

/** 日本時間の日付要素 */
export function jstParts(date: Date): { ymd: string; month: number; day: number; iso: string } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const ymd = `${parts.year}-${parts.month}-${parts.day}`;
  return {
    ymd,
    month: Number(parts.month),
    day: Number(parts.day),
    iso: `${ymd}T${parts.hour}:${parts.minute}:${parts.second}+09:00`,
  };
}

export function sanitizeSlug(raw: string): string {
  const slug = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .split('-')
    .slice(0, 8)
    .join('-')
    .slice(0, 60)
    .replace(/-+$/, '');
  return slug || 'news';
}

/** 既存ファイルや今回すでに使った名前と重ならないファイル名を決める */
export function uniqueFileName(dir: string, ymd: string, slug: string, used: Set<string>): string {
  let name = `${ymd}-${slug}.md`;
  for (let n = 2; existsSync(join(dir, name)) || used.has(name); n++) {
    name = `${ymd}-${slug}-${n}.md`;
  }
  used.add(name);
  return name;
}

const yamlString = (s: string) => JSON.stringify(s);

export function renderMarkdown(draft: ArticleDraft, item: FeedItem, now: Date): string {
  const { month, day, iso } = jstParts(now);
  const title = `${month}/${day} ${draft.headline.trim()}`;
  const frontmatter = [
    '---',
    `title: ${yamlString(title)}`,
    `date: ${iso}`,
    `tags: [${draft.tags.map(yamlString).join(', ')}]`,
    `source_name: ${yamlString(item.sourceName)}`,
    `source_url: ${yamlString(item.url)}`,
    '---',
  ].join('\n');

  const linkTitle = item.title.replace(/[[\]]/g, '');
  const body = [
    '## 要約',
    '',
    draft.summary.trim(),
    '',
    '## ポイント',
    '',
    ...draft.points.map((p) => `- ${p.trim()}`),
    '',
    '## 業務への影響',
    '',
    draft.impact.trim(),
    '',
    '## 元記事',
    '',
    `- [${linkTitle}](<${item.url}>)（${item.sourceName}）`,
    '',
  ].join('\n');

  return `${frontmatter}\n\n${body}`;
}
