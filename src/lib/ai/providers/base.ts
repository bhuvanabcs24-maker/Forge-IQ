import { ExtractedOrderData } from '@/types/ai-order-intake';

export interface ProcessDocumentResult {
  rawOcrText: string;
  extractedData: ExtractedOrderData;
  processingTimeMs: number;
  providerName: string;
  modelUsed: string;
}

export interface AiProviderOptions {
  apiKey?: string;
  samplePresetId?: string;
}

export interface AiProvider {
  name: string;
  processDocument(
    file: { name: string; type: string; size: number; buffer?: ArrayBuffer },
    options?: AiProviderOptions
  ): Promise<ProcessDocumentResult>;
}

export type SupportedAiProvider = 'mock' | 'gemini' | 'openai' | 'claude' | 'ollama';

import { MockAiProvider } from './mock-provider';
import { GeminiAiProvider } from './gemini';
import { OpenAiProvider } from './openai';

export function getAiProvider(providerName?: string): AiProvider {
  const selected = (providerName || process.env.NEXT_PUBLIC_AI_PROVIDER || 'mock').toLowerCase();

  switch (selected) {
    case 'gemini':
      return new GeminiAiProvider();
    case 'openai':
      return new OpenAiProvider();
    case 'mock':
    default:
      return new MockAiProvider();
  }
}
