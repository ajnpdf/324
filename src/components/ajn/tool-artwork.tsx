import type { ComponentType } from 'react';
import {
  ArchiveRestore,
  ArrowDown,
  Brush,
  Captions,
  Crop,
  Diff,
  FileDigit,
  FileImage,
  FileText,
  Files,
  FolderOpen,
  ImageIcon,
  Info,
  KeyRound,
  Layers3,
  LayoutGrid,
  Maximize,
  Maximize2,
  PenTool,
  RefreshCcw,
  Repeat2,
  RotateCcw,
  RotateCw,
  Scan,
  ScanText,
  Scissors,
  ShieldCheck,
  Shrink,
  Smile,
  Stamp,
  Trash2,
  Type,
  Wand2,
  Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolArtworkProps {
  toolId: string;
  toolName: string;
  className?: string;
  priority?: boolean;
}

type SimpleIcon = ComponentType<{ className?: string; strokeWidth?: number }>;

type Tone = 'violet' | 'blue' | 'emerald' | 'orange' | 'rose' | 'cyan';

const toneClasses: Record<Tone, { shell: string; icon: string; badge: string; arrow: string }> = {
  violet: {
    shell: 'border-violet-100 bg-violet-50/80',
    icon: 'text-violet-600',
    badge: 'border-violet-100 bg-white text-violet-700',
    arrow: 'text-violet-400',
  },
  blue: {
    shell: 'border-blue-100 bg-blue-50/80',
    icon: 'text-blue-600',
    badge: 'border-blue-100 bg-white text-blue-700',
    arrow: 'text-blue-400',
  },
  emerald: {
    shell: 'border-emerald-100 bg-emerald-50/80',
    icon: 'text-emerald-600',
    badge: 'border-emerald-100 bg-white text-emerald-700',
    arrow: 'text-emerald-400',
  },
  orange: {
    shell: 'border-orange-100 bg-orange-50/80',
    icon: 'text-orange-600',
    badge: 'border-orange-100 bg-white text-orange-700',
    arrow: 'text-orange-400',
  },
  rose: {
    shell: 'border-rose-100 bg-rose-50/80',
    icon: 'text-rose-600',
    badge: 'border-rose-100 bg-white text-rose-700',
    arrow: 'text-rose-400',
  },
  cyan: {
    shell: 'border-cyan-100 bg-cyan-50/80',
    icon: 'text-cyan-600',
    badge: 'border-cyan-100 bg-white text-cyan-700',
    arrow: 'text-cyan-400',
  },
};

const specialIcons: Record<string, SimpleIcon> = {
  'merge-pdf': Files,
  'split-pdf': Scissors,
  'compress-pdf': Shrink,
  'rotate-pdf': RotateCw,
  'delete-pdf-pages': Trash2,
  'organize-pdf': LayoutGrid,
  'crop-pdf': Crop,
  'watermark-pdf': Stamp,
  'page-number': FileDigit,
  'flatten-pdf': Layers3,
  'protect-pdf': ShieldCheck,
  'unlock-pdf': KeyRound,
  'repair-pdf': Wrench,
  'compare-pdf': Diff,
  'add-text': Type,
  'add-image-to-pdf': FileImage,
  'extract-images': ImageIcon,
  'image-reducer': ArrowDown,
  'image-resizer': Maximize2,
  'crop-image': Maximize,
  'rotate-image': RotateCcw,
  'watermark-image': Brush,
  'flip-image': Repeat2,
  'convert-image': RefreshCcw,
  'meme-generator': Smile,
  'photo-editor': Wand2,
  'ocr-advanced': ScanText,
  'ocr-scanner': Scan,
  'pdf-metadata': Info,
  'pdf-text': FileText,
  'pdf-zip-extract': ArchiveRestore,
  'sign-pdf': PenTool,
  'subtitle-generator': Captions,
  'zip-extractor': FolderOpen,
};

const formatLabels: Record<string, string> = {
  pdf: 'PDF',
  word: 'WORD',
  doc: 'DOC',
  docx: 'DOCX',
  txt: 'TXT',
  text: 'TXT',
  rtf: 'RTF',
  odt: 'ODT',
  ods: 'ODS',
  odp: 'ODP',
  image: 'IMG',
  jpg: 'JPG',
  jpeg: 'JPEG',
  png: 'PNG',
  webp: 'WEBP',
  tiff: 'TIFF',
  bmp: 'BMP',
  gif: 'GIF',
  svg: 'SVG',
  heic: 'HEIC',
  html: 'HTML',
  url: 'URL',
  markdown: 'MD',
  xml: 'XML',
  json: 'JSON',
  csv: 'CSV',
  excel: 'EXCEL',
  xls: 'XLS',
  xlsx: 'XLSX',
  powerpoint: 'SLIDES',
  ppt: 'PPT',
  pptx: 'PPTX',
  epub: 'EPUB',
  mobi: 'MOBI',
  azw3: 'AZW3',
  eml: 'EML',
  msg: 'MSG',
  zip: 'ZIP',
  'searchable-pdf': 'OCR PDF',
  'scanned-pdf': 'SCAN',
  'camera-scan': 'CAM',
  receipt: 'RCT',
  'document-scanner': 'SCAN',
  'handwriting-image': 'WRITE',
};

function toneFor(toolId: string): Tone {
  const tones: Tone[] = ['violet', 'blue', 'emerald', 'orange', 'rose', 'cyan'];
  let hash = 0;
  for (const char of toolId) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return tones[hash % tones.length];
}

function labelFor(part: string): string {
  return formatLabels[part] ?? part.replaceAll('-', ' ').slice(0, 5).toUpperCase();
}

function getConversion(toolId: string): { from: string; to: string } | null {
  if (toolId === 'pdf-pages-to-zip') return { from: 'PDF', to: 'ZIP' };
  if (!toolId.includes('-to-')) return null;
  const [rawFrom, rawTo] = toolId.split('-to-', 2);
  return { from: labelFor(rawFrom), to: labelFor(rawTo) };
}

function ConversionGlyph({ from, to, tone }: { from: string; to: string; tone: Tone }) {
  const colors = toneClasses[tone];
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-0.5" aria-hidden="true">
      <span className={cn('ajn-format-tile', colors.badge)}>{from}</span>
      <ArrowDown className={cn('h-2.5 w-2.5 shrink-0', colors.arrow)} strokeWidth={2.25} />
      <span className={cn('ajn-format-tile', colors.badge)}>{to}</span>
    </span>
  );
}

/**
 * AJN PDF R7 simple icon system.
 * Every public tool receives either a dedicated action glyph or a source→target
 * format pair. It replaces the 107 raster card artworks with lightweight vector UI.
 */
export function ToolArtwork({ toolId, toolName, className }: ToolArtworkProps) {
  const tone = toneFor(toolId);
  const colors = toneClasses[tone];
  const conversion = getConversion(toolId);
  const Icon = specialIcons[toolId] ?? FileImage;

  return (
    <span
      className={cn('ajn-tool-artwork ajn-simple-tool-icon flex shrink-0 items-center justify-center', colors.shell, className)}
      title={toolName}
      aria-hidden="true"
      data-tool-icon={toolId}
    >
      {conversion ? (
        <ConversionGlyph from={conversion.from} to={conversion.to} tone={tone} />
      ) : (
        <Icon className={cn('h-[46%] w-[46%]', colors.icon)} strokeWidth={1.9} />
      )}
    </span>
  );
}
