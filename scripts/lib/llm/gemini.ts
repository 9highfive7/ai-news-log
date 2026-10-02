import { FinishReason, GoogleGenAI } from '@google/genai';
import type { ChatMessage, ChatResult, LlmProvider } from './types.ts';

export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';

export function createGeminiProvider(): LlmProvider {
  const model = process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
  // 429 / 5xx などは SDK が自動でリトライする
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { retryOptions: { attempts: 4 } },
  });
  return {
    name: 'gemini',
    model,
    async chat(system: string, messages: ChatMessage[], maxTokens: number): Promise<ChatResult> {
      const response = await client.models.generateContent({
        model,
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] })),
        config: {
          systemInstruction: system,
          maxOutputTokens: maxTokens,
          responseMimeType: 'application/json',
        },
      });
      const usage = response.usageMetadata;
      return {
        text: response.text ?? '',
        truncated: response.candidates?.[0]?.finishReason === FinishReason.MAX_TOKENS,
        inputTokens: usage?.promptTokenCount ?? 0,
        outputTokens: (usage?.candidatesTokenCount ?? 0) + (usage?.thoughtsTokenCount ?? 0),
      };
    },
  };
}
