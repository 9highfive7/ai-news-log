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

export function articleTitle(draft: ArticleDraft, now: Date): string {
  const { month, day } = jstParts(now);
  return `${month}/${day} ${draft.headline.trim()}`;
}

/** 要約が長い場合（段落分けされていない150字超）は、文の区切りで2〜3段落に分ける */
export function toParagraphs(text: string): string {
  const trimmed = text.trim();
  if (/\n\s*\n/.test(trimmed)) return trimmed.replace(/\n\s*\n+/g, '\n\n');
  if ([...trimmed].length <= 150) return trimmed;
  const sentences = trimmed.match(/[^。！？]+[。！？」』）]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [trimmed];
  if (sentences.length < 3) return trimmed;
  const groups = sentences.length >= 6 ? 3 : 2;
  const size = Math.ceil(sentences.length / groups);
  const paragraphs: string[] = [];
  for (let i = 0; i < sentences.length; i += size) paragraphs.push(sentences.slice(i, i + size).join(''));
  return paragraphs.join('\n\n');
}

/** 本文（ポイント／要約／業務への影響／元記事）。headingLevel で見出しの深さを変えられる */
export function renderArticleBody(draft: ArticleDraft, item: FeedItem, headingLevel = 2): string {
  const h = '#'.repeat(headingLevel);
  const linkTitle = item.title.replace(/[[\]]/g, '');
  return [
    `${h} ポイント`,
    '',
    ...draft.points.map((p) => `- ${p.trim()}`),
    '',
    `${h} 要約`,
    '',
    toParagraphs(draft.summary),
    '',
    `${h} 業務への影響`,
    '',
    draft.impact.trim(),
    '',
    `${h} 元記事`,
    '',
    `- [${linkTitle}](<${item.url}>)（${item.sourceName}）`,
    '',
  ].join('\n');
}

/** rank: その日の選別での順位（1が最重要）。同じ日の記事の並び順に使う */
export function renderMarkdown(draft: ArticleDraft, item: FeedItem, now: Date, rank?: number): string {
  const frontmatter = [
    '---',
    `title: ${yamlString(articleTitle(draft, now))}`,
    `date: ${jstParts(now).iso}`,
    `tags: [${draft.tags.map(yamlString).join(', ')}]`,
    `lead: ${yamlString(draft.lead.trim())}`,
    `source_name: ${yamlString(item.sourceName)}`,
    `source_url: ${yamlString(item.url)}`,
    ...(rank ? [`rank: ${rank}`] : []),
    '---',
  ].join('\n');
  return `${frontmatter}\n\n${renderArticleBody(draft, item)}`;
}
