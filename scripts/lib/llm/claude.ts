import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage, ChatResult, LlmProvider } from './types.ts';

export const DEFAULT_CLAUDE_MODEL = 'claude-haiku-4-5';

export function createClaudeProvider(): LlmProvider {
  const model = process.env.ANTHROPIC_MODEL?.trim() || DEFAULT_CLAUDE_MODEL;
  // 429 / 5xx / 接続エラーは SDK が自動でリトライする
  const client = new Anthropic({ maxRetries: 3 });
  return {
    name: 'claude',
    model,
    async chat(system: string, messages: ChatMessage[], maxTokens: number): Promise<ChatResult> {
      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.text })),
      });
      return {
        text: response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join(''),
        truncated: response.stop_reason === 'max_tokens',
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      };
    },
  };
}
