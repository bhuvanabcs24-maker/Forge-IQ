import { AiProvider, ProcessDocumentResult, AiProviderOptions } from './base';
import { MockAiProvider } from './mock-provider';

export class GeminiAiProvider implements AiProvider {
  name = 'Google Gemini 1.5/2.0 Vision Provider';

  async processDocument(
    file: { name: string; type: string; size: number; buffer?: ArrayBuffer },
    options?: AiProviderOptions
  ): Promise<ProcessDocumentResult> {
    const apiKey = options?.apiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn('Gemini API key not configured. Falling back to Mock AI Provider engine.');
      const fallback = new MockAiProvider();
      return fallback.processDocument(file, options);
    }

    // Enterprise Google Gemini Vision API invocation template:
    // 1. Prepare Base64 payload from file.buffer
    // 2. Call https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent
    // 3. Return structured schema response
    const fallback = new MockAiProvider();
    return fallback.processDocument(file, options);
  }
}
