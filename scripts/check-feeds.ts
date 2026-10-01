/**
 * sources.json の各フィードが取得できるかを確認する。
 *
 *   npm run check-feeds              # sources.json を確認
 *   npm run check-feeds -- <URL>...  # 追加候補のURLを確認
 *
 * 1件でも取得できないフィードがあれば終了コード 1。
 */
import { join, resolve } from 'node:path';
import { fetchFeed, loadSources, type Source } from './lib/feeds.ts';

const ROOT = resolve(import.meta.dirname, '..');

async function main() {
  const args = process.argv.slice(2).filter((a) => /^https?:\/\//.test(a));
  const config = await loadSources(join(ROOT, 'sources.json'));
  const sources: Source[] = args.length ? args.map((url) => ({ name: url, url })) : config.sources;
  const cutoff = Date.now() - config.maxAgeHours * 3600_000;

  const results = await Promise.all(sources.map(fetchFeed));
  let failed = 0;
  for (const r of results) {
    if (!r.ok || r.total === 0) {
      failed++;
      console.log(`NG  ${r.source.name}  ${r.source.url}  (${r.error ?? '記事が0件'})`);
      continue;
    }
    const latest = r.items.reduce((a, b) => (a.publishedAt > b.publishedAt ? a : b));
    const recent = r.items.filter((i) => i.publishedAt.getTime() >= cutoff).length;
    console.log(
      `OK  ${r.source.name}  ${r.total}件 / 直近${config.maxAgeHours}h: ${recent}件 / 最新: ${latest.publishedAt.toISOString()}  ${r.source.url}`,
    );
  }
  console.log(`\n${results.length - failed}/${results.length} 件取得できました`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
