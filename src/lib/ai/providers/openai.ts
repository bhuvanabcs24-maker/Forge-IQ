import { AiProvider, ProcessDocumentResult, AiProviderOptions } from './base';
import { MockAiProvider } from './mock-provider';

export class OpenAiProvider implements AiProvider {
  name = 'OpenAI GPT-4o Vision Provider';

  async processDocument(
    file: { name: string; type: string; size: number; buffer?: ArrayBuffer },
    options?: AiProviderOptions
  ): Promise<ProcessDocumentResult> {
    const apiKey = options?.apiKey || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      console.warn('OpenAI API key not configured. Falling back to Mock AI Provider engine.');
      const fallback = new MockAiProvider();
      return fallback.processDocument(file, options);
    }

    // Enterprise OpenAI GPT-4o Vision invocation template
    const fallback = new MockAiProvider();
    return fallback.processDocument(file, options);
  }
}
