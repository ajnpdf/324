'use client';

import { configuredPdfBackendCandidates, DEFAULT_PDF_BACKEND_URL } from './backend-service-url';

export interface OcrWordBox {
  text: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  block: number;
  paragraph: number;
  line: number;
  word: number;
}

export interface OcrLineBox {
  text: string;
  average_confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  block: number;
  paragraph: number;
  line: number;
}

export interface OcrLayoutPage {
  page: number;
  width: number;
  height: number;
  language: string;
  average_confidence: number;
  orientation: {
    orientation_degrees: number;
    rotate_degrees: number;
    orientation_confidence: number;
    script: string;
    script_confidence: number;
  };
  text: string;
  lines: OcrLineBox[];
  words: OcrWordBox[];
}

export interface OcrLayoutResult {
  version: string;
  engine: string;
  language: string;
  page_count: number;
  word_count: number;
  character_count: number;
  average_confidence: number;
  pages: OcrLayoutPage[];
}

function serviceCandidates(): string[] {
  const configured = configuredPdfBackendCandidates(process.env.NODE_ENV === 'production');
  return configured.length ? configured : [DEFAULT_PDF_BACKEND_URL];
}

export async function analyzeOcrLayout(args: {
  file: File;
  language: string;
  dpi: number;
  pages?: string;
  minWordConfidence?: number;
  psm?: number;
  autoRotate?: boolean;
  deskew?: boolean;
  denoise?: boolean;
  contrast?: number;
}): Promise<OcrLayoutResult> {
  const form = new FormData();
  form.set('file', args.file);
  form.set('options_json', JSON.stringify({
    language: args.language,
    dpi: args.dpi,
    pages: args.pages || 'all',
    min_word_confidence: args.minWordConfidence ?? 0,
    psm: args.psm ?? 3,
    auto_rotate: args.autoRotate ?? true,
    deskew: args.deskew ?? true,
    denoise: args.denoise ?? true,
    contrast: args.contrast ?? 1.35,
  }));

  let lastError: Error | null = null;
  for (const base of serviceCandidates()) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 310_000);
    try {
      const response = await fetch(`${base}/api/ocr/analyze`, { method: 'POST', body: form, signal: controller.signal });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        if (response.status >= 500) {
          lastError = new Error(payload.error || payload.detail || `OCR service failed (${response.status}).`);
          continue;
        }
        throw new Error(payload.error || payload.detail || `OCR analysis failed (${response.status}).`);
      }
      const result = await response.json() as OcrLayoutResult;
      if (!result || !Array.isArray(result.pages) || result.page_count < 1) throw new Error('OCR analysis returned invalid layout data.');
      return result;
    } catch (cause) {
      if (cause instanceof DOMException && cause.name === 'AbortError') lastError = new Error('OCR analysis took too long. Try fewer pages or a lower DPI.');
      else if (cause instanceof Error) lastError = cause;
      else lastError = new Error('OCR analysis could not be completed.');
    } finally {
      window.clearTimeout(timeout);
    }
  }
  throw lastError || new Error('AJN PDF OCR service is temporarily unavailable.');
}

export function ocrLayoutBlob(result: OcrLayoutResult): Blob {
  return new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
}
