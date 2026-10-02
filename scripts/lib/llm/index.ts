import { createClaudeProvider } from './claude.ts';
import { createGeminiProvider } from './gemini.ts';
import type { LlmProvider, ProviderName } from './types.ts';

export const PROVIDERS: ProviderName[] = ['claude', 'gemini'];

const API_KEY_ENV: Record<ProviderName, string> = {
  claude: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

export function createProvider(name: ProviderName): LlmProvider {
  const keyEnv = API_KEY_ENV[name];
  if (!process.env[keyEnv]) {
    throw new Error(`${keyEnv} が設定されていません（${name} を使うには .env か環境変数で設定してください）`);
  }
  return name === 'claude' ? createClaudeProvider() : createGeminiProvider();
}

/**
 * 概算費用の計算用単価（USD / 100万トークン、入力・出力）。
 * 料金は変わることがあるので、正確な値は各社の公式料金ページで確認してください。
 * 載っていないモデルは費用を表示しません。
 */
const PRICES: Record<string, [number, number]> = {
  'claude-haiku-4-5': [1, 5],
  'gemini-3.5-flash-lite': [0.3, 2.5],
};

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number | null {
  const price = PRICES[model];
  if (!price) return null;
  return (inputTokens * price[0] + outputTokens * price[1]) / 1_000_000;
}

/** 認証エラーやモデル名の誤りなど、リトライしても直らないエラーか */
export function isFatalApiError(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return status === 400 || status === 401 || status === 403 || status === 404;
}

export type { LlmProvider, ProviderName } from './types.ts';
