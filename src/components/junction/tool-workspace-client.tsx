'use client';

import React, { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { PlatformLoader } from '../platform-loader';
import { ALL_TOOLS } from '../../lib/tools-data';
import { notFound } from 'next/navigation';

/**
 * AJN Tool Connector - Complete 56-Unit Map
 * Universal node for professional local document engineering.
 */
const TOOL_COMPONENTS: Record<string, any> = {
  'merge-pdf-online': dynamic(() => import('./MergePdf'), { ssr: false }),
  'split-pdf-online': dynamic(() => import('./SplitPdf'), { ssr: false }),
  'compress-pdf-online': dynamic(() => import('./CompressPdf'), { ssr: false }),
  'rotate-pdf-online': dynamic(() => import('./RotatePdf'), { ssr: false }),
  'remove-pdf-pages-online': dynamic(() => import('./DeletePages'), { ssr: false }),
  'organize-pdf-online': dynamic(() => import('./OrganizePdf'), { ssr: false }),
  'crop-pdf-online': dynamic(() => import('./CropPdf'), { ssr: false }),
  'watermark-pdf-online': dynamic(() => import('./WatermarkPdf'), { ssr: false }),
  'add-page-numbers-online': dynamic(() => import('./AddNumbers'), { ssr: false }),
  'flatten-pdf-online': dynamic(() => import('./FlattenPdf'), { ssr: false }),
  'repair-pdf-online': dynamic(() => import('./RepairPdf'), { ssr: false }),
  'compare-pdf-online': dynamic(() => import('./ComparePdf'), { ssr: false }),
  'add-text-to-pdf-online': dynamic(() => import('./AddText'), { ssr: false }),
  'add-image-to-pdf-online': dynamic(() => import('./AddImageToPdf'), { ssr: false }),
  'word-to-pdf-online': dynamic(() => import('./WordToPdf'), { ssr: false }),
  'excel-to-pdf-online': dynamic(() => import('./ExcelToPdf'), { ssr: false }),
  'ppt-to-pdf-online': dynamic(() => import('./PptToPdf'), { ssr: false }),
  'pdf-to-word-online': dynamic(() => import('./PdfToWord'), { ssr: false }),
  'pdf-to-excel-online': dynamic(() => import('./PdfToExcel'), { ssr: false }),
  'pdf-to-ppt-online': dynamic(() => import('./PdfToPpt'), { ssr: false }),
  'ppt-to-word-online': dynamic(() => import('./PptToWord'), { ssr: false }),
  'jpg-to-pdf-online': dynamic(() => import('./JpgToPdf'), { ssr: false }),
  'png-to-pdf-online': dynamic(() => import('./PngToPdf'), { ssr: false }),
  'pdf-to-jpg-online': dynamic(() => import('./PdfToJpg'), { ssr: false }),
  'extract-images-from-pdf-online': dynamic(() => import('./ExtractImages'), { ssr: false }),
  'heic-to-pdf-online': dynamic(() => import('./HeicToPdf'), { ssr: false }),
  'psd-to-pdf-online': dynamic(() => import('./PsdToPdf'), { ssr: false }),
  'online-photo-editor': dynamic(() => import('./PhotoEditor'), { ssr: false }),
  'remove-background-online': dynamic(() => import('./RemoveBackground'), { ssr: false }),
  'crop-image-online': dynamic(() => import('./CropImage'), { ssr: false }),
  'enlarge-image-online': dynamic(() => import('./EnhanceImage'), { ssr: false }),
  'rotate-image-online': dynamic(() => import('./RotateImage'), { ssr: false }),
  'watermark-image-online': dynamic(() => import('./WatermarkImage'), { ssr: false }),
  'flip-image-online': dynamic(() => import('./FlipImage'), { ssr: false }),
  'convert-image-online': dynamic(() => import('./ConvertImage'), { ssr: false }),
  'blur-face-online': dynamic(() => import('./BlurFace'), { ssr: false }),
  'meme-maker-online': dynamic(() => import('./MemeMaker'), { ssr: false }),
  'reduce-image-size-online': dynamic(() => import('./ReduceImage'), { ssr: false }),
  'resize-image-online': dynamic(() => import('./ResizeImage'), { ssr: false }),
  'ocr-pdf-online': dynamic(() => import('./OcrAdvanced'), { ssr: false }),
  'ocr-scanner-online': dynamic(() => import('./OcrScanner'), { ssr: false }),
  'make-pdf-searchable-online': dynamic(() => import('./OcrSearchable'), { ssr: false }),
  'sign-pdf-online': dynamic(() => import('./SignPdf'), { ssr: false }),
  'pdf-to-text-online': dynamic(() => import('./SmartRead'), { ssr: false }),
  'smart-read-pdf-online': dynamic(() => import('./SmartRead'), { ssr: false }),
  'html-to-pdf-online': dynamic(() => import('./HtmlToPdf'), { ssr: false }),
  'html-to-image-online': dynamic(() => import('./HtmlToImage'), { ssr: false }),
  'xml-to-pdf-online': dynamic(() => import('./XmlToPdf'), { ssr: false }),
  'json-to-pdf-online': dynamic(() => import('./JsonToPdf'), { ssr: false }),
  'txt-to-pdf-online': dynamic(() => import('./TxtToPdf'), { ssr: false }),
  'pdf-to-epub-online': dynamic(() => import('./PdfToEbook'), { ssr: false }),
  'pdf-to-pdfa-online': dynamic(() => import('./PdfToArchive'), { ssr: false }),
  'pdf-to-pdfua-online': dynamic(() => import('./PdfToAccessible'), { ssr: false }),
  'pdf-to-zip-online': dynamic(() => import('./PdfToZip'), { ssr: false }),
  'zip-extractor-online': dynamic(() => import('./ZipExtractor'), { ssr: false }),
  'pdf-metadata-online': dynamic(() => import('./PdfMetadata'), { ssr: false }),
  'subtitle-generator-online': dynamic(() => import('./SubtitleGenerator'), { ssr: false }),
  'unlock-pdf-online': dynamic(() => import('./UnlockPdf'), { ssr: false }),
  'protect-pdf-online': dynamic(() => import('./ProtectPdf'), { ssr: false }),
  'zip-to-pdf-online': dynamic(() => import('./ZipToPdf'), { ssr: false }),
};

interface ToolWorkspaceClientProps {
  id: string;
}

export function ToolWorkspaceClient({ id }: ToolWorkspaceClientProps) {
  const toolData = ALL_TOOLS.find(t => t.id === id);
  const ToolComponent = TOOL_COMPONENTS[id];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!toolData || !ToolComponent) {
    notFound();
  }

  if (!mounted) return <PlatformLoader message="Initializing tool..." />;

  return (
    <Suspense fallback={<PlatformLoader message="Loading workspace..." />}>
      <div className="h-full flex flex-col min-h-screen">
        <ToolComponent />
      </div>
    </Suspense>
  );
}
