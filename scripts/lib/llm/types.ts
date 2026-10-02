export type ProviderName = 'claude' | 'gemini' | 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface ChatResult {
  text: string;
  /** 出力上限に達して途中で切れた */
  truncated: boolean;
  inputTokens: number;
  /** 思考（thinking）トークンなど課金対象の出力も含む */
  outputTokens: number;
}

export interface LlmProvider {
  name: ProviderName;
  model: string;
  chat(system: string, messages: ChatMessage[], maxTokens: number): Promise<ChatResult>;
}

/** 比較・ログ用の集計 */
export interface ProviderStats {
  calls: number;
  /** JSON不正などで出し直させた回数 */
  retries: number;
  /** 最大回数まで試しても失敗した回数 */
  failures: number;
  inputTokens: number;
  outputTokens: number;
  elapsedMs: number;
}

export function emptyStats(): ProviderStats {
  return { calls: 0, retries: 0, failures: 0, inputTokens: 0, outputTokens: 0, elapsedMs: 0 };
}
