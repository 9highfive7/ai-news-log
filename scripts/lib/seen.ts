import { readFile, writeFile } from 'node:fs/promises';

/** URL（正規化済み）→ 処理した日（YYYY-MM-DD） */
export interface SeenData {
  urls: Record<string, string>;
}

/** これより古い記録は削除する（36時間の取得対象から十分外れているため） */
const RETENTION_DAYS = 60;

export async function loadSeen(path: string): Promise<SeenData> {
  try {
    const data = JSON.parse(await readFile(path, 'utf8')) as Partial<SeenData>;
    return { urls: data.urls ?? {} };
  } catch {
    return { urls: {} };
  }
}

export async function saveSeen(path: string, seen: SeenData, today: string): Promise<void> {
  const cutoff = new Date(`${today}T00:00:00Z`);
  cutoff.setUTCDate(cutoff.getUTCDate() - RETENTION_DAYS);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const urls = Object.fromEntries(
    Object.entries(seen.urls)
      .filter(([, date]) => date >= cutoffStr)
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  await writeFile(path, JSON.stringify({ urls }, null, 2) + '\n');
}
