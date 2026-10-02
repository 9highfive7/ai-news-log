/**
 * 既存記事の見直しレポートを作る（記事・サイト・seen.json は変更しない）。
 *
 *   npm run review                                   # 既存記事のある全期間
 *   SINCE=2026-09-25 UNTIL=2026-10-01 npm run review  # 期間を指定
 *
 * 日ごとに「既存の記事」と「その日に公開された候補（新しく追加した取得元を含む）」を合わせて、
 * 今の選定基準で最大5本を選び直し、次を出す:
 *   - 既存記事の新しい順位（rank）。選ばれなかった既存記事は「優先度が低い」
 *   - 既存記事より優先度が高いのに載っていない候補（追加候補）
 *   - 「セキュリティ」タグを付けるべき既存記事
 * 結果は review-output/review.md（人が読む用）と review.json（反映用）に出力する。
 */
import { appendFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeUrl, type FeedItem } from './lib/feeds.ts';
import { createProvider, PROVIDERS, type ProviderName } from './lib/llm/index.ts';
import { callJson, getStats } from './lib/llm/json.ts';
import { jstParts } from './lib/markdown.ts';
import { addDays, collectCandidates, errorMessage, existingPosts, MAX_CANDIDATES, ROOT, selectNews, type ExistingPost } from './lib/pipeline.ts';
import { buildSecurityTagPrompt, SELECT_SYSTEM, SecurityTagSchema } from './lib/prompts.ts';

const OUT_DIR = join(ROOT, 'review-output');
const MAX_ARTICLES = 5;

interface DayReview {
  ymd: string;
  candidates: number;
  /** 選び直しで選ばれた既存記事（新しい順位つき） */
  kept: { file: string; title: string; rank: number }[];
  /** 選ばれなかった既存記事 */
  low: { file: string; title: string }[];
  /** 載っていないが選ばれた候補 */
  additions: { rank: number; title: string; url: string; sourceName: string; publishedAt: string; reason: string }[];
}

async function main() {
  if (existsSync(join(ROOT, '.env'))) process.loadEnvFile(join(ROOT, '.env'));
  const name = (process.env.LLM_PROVIDER || 'claude').trim().toLowerCase() as ProviderName;
  if (!PROVIDERS.includes(name)) throw new Error(`LLM_PROVIDER が不正です: ${name}`);
  const provider = createProvider(name);

  const posts = await existingPosts();
  if (posts.length === 0) throw new Error('既存の記事がありません');
  const days = [...new Set(posts.map((p) => p.ymd))].sort();
  const since = process.env.SINCE?.trim() || days[0];
  const until = process.env.UNTIL?.trim() || days.at(-1)!;
  console.log(`見直し: ${since} 〜 ${until}（${provider.name}=${provider.model}）`);

  // 処理済みかどうかは無視して、期間内に公開された候補をすべて集める
  const existingUrls = new Set(posts.map((p) => normalizeUrl(p.sourceUrl)));
  const candidates = (await collectCandidates(new Date(), {}, new Date(`${since}T00:00:00+09:00`))).filter(
    (c) => !existingUrls.has(normalizeUrl(c.url)),
  );
  const byDay = new Map<string, FeedItem[]>();
  for (const c of candidates) {
    const ymd = jstParts(c.publishedAt).ymd;
    byDay.set(ymd, [...(byDay.get(ymd) ?? []), c]);
  }

  const reviews: DayReview[] = [];
  const addedTitles: string[] = [];
  for (let ymd = since; ymd <= until; ymd = addDays(ymd, 1)) {
    const dayPosts = posts.filter((p) => p.ymd === ymd);
    const dayCandidates = (byDay.get(ymd) ?? []).slice(0, MAX_CANDIDATES - dayPosts.length);
    if (dayPosts.length === 0 && dayCandidates.length === 0) continue;
    console.log(`\n== ${ymd}: 既存 ${dayPosts.length} 本 / 新しい候補 ${dayCandidates.length} 件`);

    // 既存記事も候補の1つとして並べる（モデルにはどれが既存かは伝えない）
    const items: FeedItem[] = [
      ...dayPosts.map((p) => ({
        sourceName: p.sourceName,
        title: p.title,
        url: p.sourceUrl,
        publishedAt: new Date(`${ymd}T12:00:00+09:00`),
        summary: p.lead,
      })),
      ...dayCandidates,
    ];
    // 他の日に載っている記事・この見直しで追加候補にした記事と同じ話題は選ばない
    const published = [...posts.filter((p) => p.ymd !== ymd).map((p) => p.title), ...addedTitles];
    const picks = await selectNews(provider, items, MAX_ARTICLES, published);

    const review: DayReview = { ymd, candidates: dayCandidates.length, kept: [], low: [], additions: [] };
    const keptIdx = new Set<number>();
    picks.forEach((pick, i) => {
      const rank = i + 1;
      // 同じ出来事として既存記事とまとめられた場合は、既存記事を残す扱いにする
      const existingIdx = [pick.id, ...pick.related_ids].find((id) => id < dayPosts.length && !keptIdx.has(id));
      if (existingIdx !== undefined) {
        keptIdx.add(existingIdx);
        review.kept.push({ file: dayPosts[existingIdx].file, title: dayPosts[existingIdx].title, rank });
      } else if (pick.id >= dayPosts.length) {
        const c = items[pick.id];
        review.additions.push({ rank, title: c.title, url: c.url, sourceName: c.sourceName, publishedAt: c.publishedAt.toISOString(), reason: pick.reason });
        addedTitles.push(c.title);
      }
    });
    dayPosts.forEach((p, i) => {
      if (!keptIdx.has(i)) review.low.push({ file: p.file, title: p.title });
    });
    reviews.push(review);
  }

  const security = await reviewSecurityTags(provider, posts);

  const report = renderReport(since, until, reviews, security, posts.length);
  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(join(OUT_DIR, 'review.md'), report);
  await writeFile(join(OUT_DIR, 'review.json'), JSON.stringify({ since, until, days: reviews, security }, null, 2) + '\n');
  console.log('\n' + report);
  console.log('\n----- review.json -----');
  console.log(JSON.stringify({ since, until, days: reviews, security }));
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, report);
  const stats = getStats(provider);
  console.log(`\n呼び出し${stats.calls}回 / 入力${stats.inputTokens}・出力${stats.outputTokens}トークン`);
}

/** 「セキュリティ」タグを付けるべき既存記事を判定する */
async function reviewSecurityTags(provider: ReturnType<typeof createProvider>, posts: ExistingPost[]) {
  const list = posts.map((p, id) => ({ id, title: p.title, lead: p.lead, tags: p.tags }));
  try {
    const result = await callJson(provider, {
      label: 'タグ見直し',
      system: SELECT_SYSTEM,
      prompt: buildSecurityTagPrompt(list),
      schema: SecurityTagSchema,
      maxTokens: 1500,
      extraCheck: (r) => {
        const bad = r.security.find((s) => !posts[s.id]);
        return bad ? `存在しない id ${bad.id} が含まれています。` : null;
      },
    });
    return result.security
      .filter((s) => !posts[s.id].tags.includes('セキュリティ'))
      .map((s) => ({ file: posts[s.id].file, title: posts[s.id].title, tags: posts[s.id].tags, reason: s.reason }));
  } catch (err) {
    console.warn(`タグの見直しに失敗しました: ${errorMessage(err)}`);
    return [];
  }
}

function renderReport(
  since: string,
  until: string,
  reviews: DayReview[],
  security: Awaited<ReturnType<typeof reviewSecurityTags>>,
  total: number,
): string {
  const cell = (s: string) => s.replace(/\|/g, '\\|');
  const out: string[] = [`# 既存記事の見直しレポート（${since} 〜 ${until}）`, ''];
  const adds = reviews.reduce((n, r) => n + r.additions.length, 0);
  const lows = reviews.reduce((n, r) => n + r.low.length, 0);
  out.push(`既存 ${total} 本を、今の選定基準（Claude・ChatGPT・Gemini の公式の更新 → AIのセキュリティ → その他）で日ごとに選び直しました。`);
  out.push(`追加候補 ${adds} 本 ／ 優先度が低い既存記事 ${lows} 本 ／ セキュリティタグの追加 ${security.length} 本。このレポートでは記事は変更していません。`, '');
  for (const r of reviews) {
    out.push(`## ${r.ymd}（新しい候補 ${r.candidates} 件）`, '');
    out.push('| 順位 | 区分 | 見出し | 出典 |', '| ---: | --- | --- | --- |');
    const rows: { rank: number; line: string }[] = [
      ...r.kept.map((k) => ({ rank: k.rank, line: `| ${k.rank} | 掲載中 | ${cell(k.title)} | ${k.file} |` })),
      ...r.additions.map((a) => ({ rank: a.rank, line: `| ${a.rank} | **追加候補** | [${cell(a.title)}](<${a.url}>)<br>理由: ${cell(a.reason)} | ${cell(a.sourceName)} |` })),
      ...r.low.map((l) => ({ rank: 99, line: `| - | 優先度が低い | ${cell(l.title)} | ${l.file} |` })),
    ];
    out.push(...rows.sort((a, b) => a.rank - b.rank).map((x) => x.line), '');
  }
  out.push('## 「セキュリティ」タグを付ける候補', '');
  if (security.length === 0) out.push('なし', '');
  else {
    out.push('| 見出し | 今のタグ | 理由 |', '| --- | --- | --- |');
    for (const s of security) out.push(`| ${cell(s.title)} | ${s.tags.join('、')} | ${cell(s.reason)} |`);
    out.push('');
  }
  return out.join('\n');
}

main().catch((err) => {
  console.error(errorMessage(err));
  process.exitCode = 1;
});
