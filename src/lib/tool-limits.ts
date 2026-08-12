import { getToolPolicy } from './tool-policy';

export type ExecutionMode = 'local' | 'server';

export type ToolLimitProfile = {
  executionMode: ExecutionMode;
  maxFiles: number;
  maxFileSizeMb: number;
  maxTotalSizeMb?: number;
  maxPdfPages?: number;
  maxImageMegapixels?: number;
  maxOutputMb?: number;
  processingTimeoutSeconds?: number;
};

// These values mirror the current AJN PDF 3.1.0 backend defaults.
// The live /ready response can override the file, total-upload and timeout values in the UI.
export const SERVER_LIMIT_DEFAULTS = {
  maxFileSizeMb: 75,
  maxTotalSizeMb: 150,
  maxPdfPages: 300,
  maxImageMegapixels: 80,
  maxOutputMb: 500,
  processingTimeoutSeconds: 300,
} as const;

export const OCR_LANGUAGE_CODES = ['eng', 'hin', 'tel', 'tam', 'kan', 'mal'] as const;
export const OCR_LANGUAGE_LABELS: Record<(typeof OCR_LANGUAGE_CODES)[number], string> = {
  eng: 'English',
  hin: 'Hindi',
  tel: 'Telugu',
  tam: 'Tamil',
  kan: 'Kannada',
  mal: 'Malayalam',
};

function hasPdfInput(id: string): boolean {
  return id.startsWith('pdf-') || id.startsWith('pdf-to-') || id.startsWith('scanned-pdf-') || id.endsWith('-pdf') || id.includes('pdf-pages');
}

function hasImageInput(id: string): boolean {
  return /image|jpg|jpeg|png|webp|tiff|bmp|gif|svg|heic|avif|camera|receipt|scanner|handwriting/.test(id);
}

export function getToolLimitProfile(id: string): ToolLimitProfile {
  const policy = getToolPolicy(id);
  if (policy.processingMode === 'temporary-server') {
    return {
      executionMode: 'server',
      maxFiles: policy.maxFiles,
      maxFileSizeMb: policy.maxFileSizeMb,
      maxTotalSizeMb: SERVER_LIMIT_DEFAULTS.maxTotalSizeMb,
      maxPdfPages: hasPdfInput(id) ? SERVER_LIMIT_DEFAULTS.maxPdfPages : undefined,
      maxImageMegapixels: hasImageInput(id) ? SERVER_LIMIT_DEFAULTS.maxImageMegapixels : undefined,
      maxOutputMb: SERVER_LIMIT_DEFAULTS.maxOutputMb,
      processingTimeoutSeconds: SERVER_LIMIT_DEFAULTS.processingTimeoutSeconds,
    };
  }

  return {
    executionMode: 'local',
    maxFiles: policy.maxFiles,
    maxFileSizeMb: policy.maxFileSizeMb,
  };
}
