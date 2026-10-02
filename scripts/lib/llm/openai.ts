import OpenAI from 'openai';
import type { ChatMessage, ChatResult, LlmProvider } from './types.ts';

export const DEFAULT_OPENAI_MODEL = 'gpt-6-luna';

export function createOpenAIProvider(): LlmProvider {
  const model = process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;
  // 推論の深さ。要約・分類が中心なので既定は low（費用と時間を抑える）
  const effort = (process.env.OPENAI_REASONING_EFFORT?.trim() || 'low') as OpenAI.ReasoningEffort;
  // 429 / 5xx / 接続エラーは SDK が自動でリトライする
  const client = new OpenAI({ maxRetries: 3 });
  return {
    name: 'openai',
    model,
    async chat(system: string, messages: ChatMessage[], maxTokens: number): Promise<ChatResult> {
      const response = await client.responses.create({
        model,
        instructions: system,
        input: messages.map((m) => ({ role: m.role, content: m.text })),
        // 推論トークンも出力上限に含まれるので、その分の余裕を足す
        max_output_tokens: maxTokens + 4000,
        reasoning: { effort },
        text: { format: { type: 'json_object' } },
      });
      return {
        text: response.output_text,
        truncated: response.incomplete_details?.reason === 'max_output_tokens',
        inputTokens: response.usage?.input_tokens ?? 0,
        // output_tokens は推論トークンを含む（課金対象）
        outputTokens: response.usage?.output_tokens ?? 0,
      };
    },
  };
}
