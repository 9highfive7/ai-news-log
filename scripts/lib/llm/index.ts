import { createClaudeProvider } from './claude.ts';
import { createGeminiProvider } from './gemini.ts';
import { createOpenAIProvider } from './openai.ts';
import type { LlmProvider, ProviderName } from './types.ts';

export const PROVIDERS: ProviderName[] = ['claude', 'gemini', 'openai'];

const API_KEY_ENV: Record<ProviderName, string> = {
  claude: 'ANTHROPIC_API_KEY',
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
};

const FACTORIES: Record<ProviderName, () => LlmProvider> = {
  claude: createClaudeProvider,
  gemini: createGeminiProvider,
  openai: createOpenAIProvider,
};

/** API キーが設定されているか */
export function hasApiKey(name: ProviderName): boolean {
  return Boolean(process.env[API_KEY_ENV[name]]?.trim());
}

export function createProvider(name: ProviderName): LlmProvider {
  const keyEnv = API_KEY_ENV[name];
  if (!hasApiKey(name)) {
    throw new Error(`${keyEnv} が設定されていません（${name} を使うには .env か環境変数で設定してください）`);
  }
  return FACTORIES[name]();
}

/**
 * 概算費用の計算用単価（USD / 100万トークン、入力・出力）。
 * 料金は変わることがあるので、正確な値は各社の公式料金ページで確認してください。
 * 載っていないモデルは費用を表示しません。
 */
const PRICES: Record<string, [number, number]> = {
  'claude-haiku-4-5': [1, 5],
  'gemini-3.5-flash-lite': [0.3, 2.5],
  'gpt-6-luna': [0.1, 0.5],
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

/** 利用上限（レート制限）のエラー。SDK の自動リトライでも回復しなかったもの */
export function isRateLimitError(err: unknown): boolean {
  const status = (err as { status?: number } | null)?.status;
  return status === 429 || /RESOURCE_EXHAUSTED|"code":\s*429/.test(err instanceof Error ? err.message : String(err));
}

export type { LlmProvider, ProviderName } from './types.ts';
