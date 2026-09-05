import { CadParsingResult, CadFileType } from '@/types/cad';

export interface CadParserOptions {
  fileName: string;
  fileType: CadFileType;
  fileSizeBytes: number;
}

export interface CadParserProvider {
  name: string;
  supportedFormats: CadFileType[];
  parseDrawing(options: CadParserOptions): Promise<CadParsingResult>;
}

import { MockCadParser } from './parsers/mock-cad-parser';

export function getCadParser(providerName?: string): CadParserProvider {
  const selected = (providerName || process.env.NEXT_PUBLIC_CAD_PARSER || 'mock').toLowerCase();

  switch (selected) {
    case 'mock':
    default:
      return new MockCadParser();
  }
}
