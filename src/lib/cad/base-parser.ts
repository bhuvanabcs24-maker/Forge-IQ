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

import { ForgeIQCachedCadParser } from './parsers/forgeiq-cad-parser';

export function getCadParser(providerName?: string): CadParserProvider {
  return new ForgeIQCachedCadParser();
}
