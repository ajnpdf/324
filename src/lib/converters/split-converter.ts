
'use client';

import { PDFDocument } from 'pdf-lib';
import { ConversionResult, ProgressCallback } from './pdf-converter';

/**
 * AJN Master Split Engine
 * Surgical binary extraction for document decomposition.
 * Strictly outputs .pdf containing ONLY selected pages.
 */
export class SplitConverter {
  private file: File;
  private onProgress?: ProgressCallback;

  constructor(file: File, onProgress?: ProgressCallback) {
    this.file = file;
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  /**
   * Extracts selected pages into a single new PDF document.
   * @param options Object containing pageIndices array from the UI visionary
   */
  async split(options: any = {}): Promise<ConversionResult> {
    const { pageIndices = [] } = options;
    const baseName = this.file.name.split('.')[0];

    this.updateProgress(10, "Inhaling source binary structure...");
    const buf = await this.file.arrayBuffer();
    
    let sourceDoc;
    try {
      sourceDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    } catch (err: any) {
      throw new Error(`Integrity check failed: ${err.message}`);
    }

    const totalPages = sourceDoc.getPageCount();
    
    // Use visionary selection or default to all
    const targetIndices = pageIndices.length > 0 ? pageIndices : Array.from({ length: totalPages }, (_, i) => i);

    this.updateProgress(30, `Isolating ${targetIndices.length} neural segments...`);

    const newDoc = await PDFDocument.create();
    
    this.updateProgress(50, "Executing surgical binary transfer...");
    const copiedPages = await newDoc.copyPages(sourceDoc, targetIndices);
    
    copiedPages.forEach((page, idx) => {
      newDoc.addPage(page);
      if (idx % 5 === 0) {
        this.updateProgress(50 + Math.round((idx / copiedPages.length) * 40), `Stitching page ${idx + 1}...`);
      }
    });

    this.updateProgress(95, "Synchronizing binary buffer and finalizing trailer...");
    
    const pdfBytes = await newDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    this.updateProgress(100, "Mastery execution successful.");

    return {
      blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
      fileName: `${baseName}_Extracted_${Date.now()}.pdf`,
      mimeType: 'application/pdf'
    };
  }
}
