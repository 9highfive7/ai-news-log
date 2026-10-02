import type { z } from 'zod';
import { emptyStats, type ChatMessage, type LlmProvider, type ProviderStats } from './types.ts';

const MAX_ATTEMPTS = 3;

export class JsonOutputError extends Error {}

/** 応答テキストから JSON 部分を取り出す（```json フェンスや前後の説明文があっても拾う） */
export function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end <= start) throw new JsonOutputError('JSONオブジェクトが見つかりません');
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch (err) {
    throw new JsonOutputError(`JSONとして読めません: ${(err as Error).message}`);
  }
}

const statsByProvider = new Map<LlmProvider, ProviderStats>();

/** プロバイダーごとの呼び出し回数・トークン数などの集計 */
export function getStats(provider: LlmProvider): ProviderStats {
  let stats = statsByProvider.get(provider);
  if (!stats) statsByProvider.set(provider, (stats = emptyStats()));
  return stats;
}

/**
 * LLM に JSON で答えさせ、スキーマ検証まで行う。
 * JSON が壊れている・スキーマに合わない・extraCheck が問題を返した場合は、
 * 理由を伝えて最大 MAX_ATTEMPTS 回まで出し直させる。
 */
export async function callJson<S extends z.ZodType>(
  provider: LlmProvider,
  opts: {
    system: string;
    prompt: string;
    schema: S;
    maxTokens: number;
    /** 追加の検証。問題があればその説明を返す */
    extraCheck?: (value: z.infer<S>) => string | null;
    label: string;
  },
): Promise<z.infer<S>> {
  const stats = getStats(provider);
  const label = `${provider.name}:${opts.label}`;
  const messages: ChatMessage[] = [{ role: 'user', text: opts.prompt }];
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const started = Date.now();
    const result = await provider.chat(opts.system, messages, opts.maxTokens);
    stats.calls++;
    stats.inputTokens += result.inputTokens;
    stats.outputTokens += result.outputTokens;
    stats.elapsedMs += Date.now() - started;

    let problem: string;
    if (result.truncated) {
      problem = '出力が長すぎて途中で切れました。もっと短くしてください。';
    } else {
      try {
        const parsed = opts.schema.safeParse(extractJson(result.text));
        if (parsed.success) {
          const extra = opts.extraCheck?.(parsed.data) ?? null;
          if (!extra) return parsed.data;
          problem = extra;
        } else {
          problem = `スキーマに合いません: ${parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`).join(' / ')}`;
        }
      } catch (err) {
        if (!(err instanceof JsonOutputError)) throw err;
        problem = err.message;
      }
    }

    lastError = problem;
    if (attempt === MAX_ATTEMPTS) break;
    stats.retries++;
    console.warn(`  [${label}] 出力が不正のため再試行します (${attempt}/${MAX_ATTEMPTS}): ${problem}`);
    messages.push(
      { role: 'assistant', text: result.text || '(空の応答)' },
      { role: 'user', text: `前回の出力には問題がありました: ${problem}\n指定の形式に従い、JSONオブジェクトだけをもう一度出力してください。` },
    );
  }
  stats.failures++;
  throw new JsonOutputError(`[${label}] ${MAX_ATTEMPTS}回試しても正しいJSONが得られませんでした: ${lastError}`);
}
