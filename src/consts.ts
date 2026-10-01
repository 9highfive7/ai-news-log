export const SITE_TITLE = 'AIニュースログ';
export const SITE_DESCRIPTION = 'AI関連ニュースを毎日自動で収集し、日本語の短い記事にまとめて蓄積するログです。';

/** 記事に付けられるタグ（固定リスト）と、URL用のスラッグ */
export const TAGS = [
  { name: 'OpenAI', slug: 'openai' },
  { name: 'Google', slug: 'google' },
  { name: 'Anthropic', slug: 'anthropic' },
  { name: 'Microsoft', slug: 'microsoft' },
  { name: 'Meta', slug: 'meta' },
  { name: '国内', slug: 'japan' },
  { name: '規制・政策', slug: 'policy' },
  { name: '研究', slug: 'research' },
  { name: 'ツール', slug: 'tools' },
  { name: 'その他', slug: 'other' },
] as const;

export type TagName = (typeof TAGS)[number]['name'];

export const TAG_NAMES = TAGS.map((t) => t.name) as [TagName, ...TagName[]];

export function tagSlug(name: string): string {
  return TAGS.find((t) => t.name === name)?.slug ?? 'other';
}

/** 日付の表示・グルーピングは日本時間で行う */
export const TIME_ZONE = 'Asia/Tokyo';
