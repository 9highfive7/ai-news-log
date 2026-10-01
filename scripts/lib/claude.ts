import Anthropic from '@anthropic-ai/sdk';
import type { z } from 'zod';

export const DEFAULT_MODEL = 'claude-haiku-4-5';
export const MODEL = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_MODEL;

const MAX_ATTEMPTS = 3;

let client: Anthropic | undefined;
function getClient(): Anthropic {
  // 429 / 5xx / 接続エラーは SDK が自動でリトライする
  client ??= new Anthropic({ maxRetries: 3 });
  return client;
}

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

/**
 * Claude に JSON で答えさせ、スキーマ検証まで行う。
 * JSON が壊れている・スキーマに合わない・extraCheck が問題を返した場合は、
 * 理由を伝えて最大 MAX_ATTEMPTS 回まで出し直させる。
 */
export async function callJson<S extends z.ZodType>(opts: {
  system: string;
  prompt: string;
  schema: S;
  maxTokens: number;
  /** 追加の検証。問題があればその説明を返す */
  extraCheck?: (value: z.infer<S>) => string | null;
  label: string;
}): Promise<z.infer<S>> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: opts.prompt }];
  let lastError = '';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens,
      system: opts.system,
      messages,
    });
    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    let problem: string;
    if (response.stop_reason === 'max_tokens') {
      problem = '出力が長すぎて途中で切れました。もっと短くしてください。';
    } else {
      try {
        const parsed = opts.schema.safeParse(extractJson(text));
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
    console.warn(`  [${opts.label}] 出力が不正のため再試行します (${attempt}/${MAX_ATTEMPTS}): ${problem}`);
    messages.push(
      { role: 'assistant', content: text || '(空の応答)' },
      { role: 'user', content: `前回の出力には問題がありました: ${problem}\n指定の形式に従い、JSONオブジェクトだけをもう一度出力してください。` },
    );
  }
  throw new JsonOutputError(`[${opts.label}] ${MAX_ATTEMPTS}回試しても正しいJSONが得られませんでした: ${lastError}`);
}
