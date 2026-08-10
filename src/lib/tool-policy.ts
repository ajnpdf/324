import { CONVERSION_TOOLS } from './conversion-tools';
export type ToolMaturity = 'stable' | 'limited' | 'backend' | 'hidden';
export type ProcessingMode = 'browser' | 'temporary-server';

export interface ToolPolicy {
  maturity: ToolMaturity;
  processingMode: ProcessingMode;
  maxFiles: number;
  maxFileSizeMb: number;
  publicByDefault: boolean;
  limitation?: string;
}

const stableBrowserIds = new Set([
  'merge-pdf', 'split-pdf', 'rotate-pdf', 'delete-pdf-pages', 'organize-pdf',
  'crop-pdf', 'watermark-pdf', 'page-number', 'flatten-pdf', 'compare-pdf',
  'add-text', 'add-image-to-pdf', 'pdf-metadata', 'jpg-pdf', 'png-to-pdf',
  'pdf-jpg', 'image-reducer', 'image-resizer', 'crop-image', 'rotate-image',
  'watermark-image', 'flip-image', 'convert-image', 'meme-generator',
  'photo-editor', 'pdf-text', 'xml-pdf', 'json-pdf', 'txt-pdf',
  'pdf-zip-extract', 'zip-extractor', 'subtitle-generator', 'sign-pdf',
]);

const limitedBrowser: Record<string, string> = {
  'compress-pdf': 'Strong compression rasterizes pages and can reduce text searchability, links, and accessibility.',
  'extract-images': 'Unusual inline, masked, or vector images may not be extracted.',
  'heic-pdf': 'HEIC support depends on browser decoding and the bundled converter.',
  'word-pdf': 'Best for DOCX files with simple layouts; complex Word formatting can change.',
  'pdf-word': 'Creates editable text but does not preserve every original layout element.',
  'excel-pdf': 'Complex charts, formulas, and print areas may render differently.',
  'pdf-excel': 'Uses text positioning and is not advanced table recognition.',
  'ppt-pdf': 'Creates a readable PDF but does not guarantee pixel-perfect slide rendering.',
  'ppt-word': 'Extracts slide text and notes; it does not reproduce slide design.',
  'html-pdf': 'Supports basic HTML content; complex external CSS and scripts are not guaranteed.',
  'pdf-epub': 'Creates a basic text-focused eBook and may not preserve advanced layout.',
  'ocr-advanced': 'OCR accuracy depends on scan quality and language selection.',
  'ocr-scanner': 'OCR accuracy depends on image quality; review extracted text before use.',
};

const legacyAliasIds = new Set([
  'word-pdf', 'pdf-word', 'excel-pdf', 'pdf-excel', 'ppt-pdf', 'jpg-pdf',
  'pdf-jpg', 'heic-pdf', 'html-pdf', 'xml-pdf', 'json-pdf', 'txt-pdf',
]);

const conversionBackendIds = new Set(CONVERSION_TOOLS.map((tool) => tool.id));
const backendIds = new Set(['protect-pdf', 'unlock-pdf', 'repair-pdf', ...conversionBackendIds]);

const hiddenIds = new Set([
  'pdf-ppt', 'ocr-searchable', 'pdf-a', 'pdf-ua', 'smart-read', 'psd-pdf',
  'upscale-image', 'remove-bg', 'blur-face',
]);

export function getToolPolicy(id: string): ToolPolicy {
  if (legacyAliasIds.has(id)) {
    return {
      maturity: 'hidden', processingMode: 'browser', maxFiles: 1, maxFileSizeMb: 75,
      publicByDefault: false, limitation: 'Legacy route redirected to the canonical conversion tool.',
    };
  }
  if (stableBrowserIds.has(id)) {
    return {
      maturity: 'stable', processingMode: 'browser', maxFiles: id === 'merge-pdf' || id === 'jpg-pdf' || id === 'png-to-pdf' ? 30 : 1,
      maxFileSizeMb: 50, publicByDefault: true,
    };
  }
  if (id in limitedBrowser) {
    const visibleLimited = new Set(['compress-pdf', 'extract-images', 'heic-pdf', 'ocr-advanced', 'ocr-scanner']);
    return {
      maturity: 'limited', processingMode: 'browser', maxFiles: 1, maxFileSizeMb: 40,
      publicByDefault: visibleLimited.has(id), limitation: limitedBrowser[id],
    };
  }
  if (backendIds.has(id)) {
    const multiFileConversionIds = new Set([
      'image-to-searchable-pdf', 'camera-scan-to-pdf', 'receipt-to-pdf', 'document-scanner-to-pdf',
      'image-to-pdf', 'jpg-to-pdf', 'jpeg-to-pdf', 'webp-to-pdf', 'tiff-to-pdf', 'bmp-to-pdf',
      'gif-to-pdf', 'svg-to-pdf', 'heic-to-pdf',
    ]);
    return {
      maturity: 'backend', processingMode: 'temporary-server',
      maxFiles: multiFileConversionIds.has(id) ? 30 : 1,
      // Cloud Run production uses a 30 MB request ceiling so the multipart body
      // stays below the platform HTTP/1 request limit with encoding overhead.
      maxFileSizeMb: 30,
      publicByDefault: true,
      limitation: conversionBackendIds.has(id)
        ? 'Processed by the AJN PDF conversion service. Uploaded files are used only for the requested conversion and removed after the response.'
        : 'Requires the AJN PDF secure processing service. Files are removed after the response.',
    };
  }
  return {
    maturity: 'hidden', processingMode: 'browser', maxFiles: 1, maxFileSizeMb: 25,
    publicByDefault: false, limitation: hiddenIds.has(id) ? 'Hidden until its output and claims pass production validation.' : 'Not included in the Phase 1 public tool set.',
  };
}

export function isToolPublic(id: string): boolean {
  return getToolPolicy(id).publicByDefault;
}

export const PHASE1_BACKEND_TOOL_IDS = backendIds;
