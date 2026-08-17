'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { PlatformLoader } from '../platform-loader';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { CONVERSION_TOOLS } from '../../lib/conversion-tools';
import ServerConversionTool from './ServerConversionTool';
import MergePdf from './MergePdf';
import { notFound } from 'next/navigation';

/**
 * AJN Universal Tool Connector - Production v41.3
 * Maps public tool IDs to production workspaces.
 */
const SERVER_CONVERSION_IDS = new Set(CONVERSION_TOOLS.map((tool) => tool.id));

const TOOL_COMPONENTS: Record<string, any> = {
  // --- CORE PDF SUITE ---
  'split-pdf': dynamic(() => import('./SplitPdf'), { ssr: false }),
  'compress-pdf': dynamic(() => import('./CompressPdf'), { ssr: false }),
  'rotate-pdf': dynamic(() => import('./RotatePdf'), { ssr: false }),
  'delete-pdf-pages': dynamic(() => import('./DeletePages'), { ssr: false }),
  'organize-pdf': dynamic(() => import('./OrganizePdf'), { ssr: false }),
  'crop-pdf': dynamic(() => import('./CropPdf'), { ssr: false }),
  'watermark-pdf': dynamic(() => import('./WatermarkPdf'), { ssr: false }),
  'page-number': dynamic(() => import('./AddNumbers'), { ssr: false }),
  'flatten-pdf': dynamic(() => import('./FlattenPdf'), { ssr: false }),
  'protect-pdf': dynamic(() => import('./ProtectPdf'), { ssr: false }),
  'unlock-pdf': dynamic(() => import('./UnlockPdf'), { ssr: false }),
  'repair-pdf': dynamic(() => import('./RepairPdf'), { ssr: false }),
  'compare-pdf': dynamic(() => import('./ComparePdf'), { ssr: false }),
  'add-text': dynamic(() => import('./AddText'), { ssr: false }),
  'add-image-to-pdf': dynamic(() => import('./AddImageToPdf'), { ssr: false }),
  
  // --- OFFICE SUITE ---
  'word-pdf': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'excel-pdf': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'ppt-pdf': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'pdf-word': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'pdf-excel': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'pdf-ppt': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'ppt-word': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  
  // --- MEDIA & DESIGN ---
  'jpg-pdf': dynamic(() => import('./JpgToPdf'), { ssr: false }),
  'png-to-pdf': dynamic(() => import('./PngToPdf'), { ssr: false }),
  'pdf-jpg': dynamic(() => import('./PdfToJpg'), { ssr: false }),
  'extract-images': dynamic(() => import('./ExtractImages'), { ssr: false }),
  'heic-pdf': dynamic(() => import('./HeicToPdf'), { ssr: false }),
  'psd-pdf': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'photo-editor': dynamic(() => import('./PhotoEditor'), { ssr: false }),
  'remove-bg': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'crop-image': dynamic(() => import('./CropImage'), { ssr: false }),
  'upscale-image': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'rotate-image': dynamic(() => import('./RotateImage'), { ssr: false }),
  'watermark-image': dynamic(() => import('./WatermarkImage'), { ssr: false }),
  'flip-image': dynamic(() => import('./FlipImage'), { ssr: false }),
  'convert-image': dynamic(() => import('./ConvertImage'), { ssr: false }),
  'blur-face': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'meme-generator': dynamic(() => import('./MemeMaker'), { ssr: false }),
  'image-reducer': dynamic(() => import('./ReduceImage'), { ssr: false }),
  'image-resizer': dynamic(() => import('./ResizeImage'), { ssr: false }),
  
  // --- INTELLIGENCE & OCR ---
  'ocr-advanced': dynamic(() => import('./OcrAdvanced'), { ssr: false }),
  'ocr-scanner': dynamic(() => import('./OcrScanner'), { ssr: false }),
  'ocr-searchable': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'sign-pdf': dynamic(() => import('./SignPdf'), { ssr: false }),
  'smart-read': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'pdf-text': dynamic(() => import('./SmartRead'), { ssr: false }),
  
  // --- TECHNICAL & ARCHIVAL ---
  'html-pdf': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'xml-pdf': dynamic(() => import('./XmlToPdf'), { ssr: false }),
  'json-pdf': dynamic(() => import('./JsonToPdf'), { ssr: false }),
  'txt-pdf': dynamic(() => import('./TxtToPdf'), { ssr: false }),
  'pdf-epub': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'pdf-a': dynamic(() => import('./UnavailableTool'), { ssr: false }),
  'pdf-zip-extract': dynamic(() => import('./PdfToZip'), { ssr: false }),
  'zip-extractor': dynamic(() => import('./ZipExtractor'), { ssr: false }),
  'pdf-metadata': dynamic(() => import('./PdfMetadata'), { ssr: false }),

  // --- SRT TOOLS ---
  'subtitle-generator': dynamic(() => import('./SubtitleGenerator'), { ssr: false }),
};

interface ToolWorkspaceClientProps {
  id: string;
}

export function ToolWorkspaceClient({ id }: ToolWorkspaceClientProps) {
  const toolData = BUILD_PUBLIC_TOOLS.find(t => t.id === id);
  const ToolComponent = id === 'merge-pdf' ? MergePdf : TOOL_COMPONENTS[id];

  if (!toolData) {
    notFound();
  }

  if (SERVER_CONVERSION_IDS.has(id)) {
    return (
      <Suspense fallback={<PlatformLoader message="Preparing conversion workspace..." />}>
        <div className="h-full flex flex-col"><ServerConversionTool toolId={id} /></div>
      </Suspense>
    );
  }

  if (!ToolComponent) {
    notFound();
  }

  return (
    <Suspense fallback={<PlatformLoader message="Preparing tool workspace..." />}>
      <div className="h-full flex flex-col">
        <ToolComponent />
      </div>
    </Suspense>
  );
}
