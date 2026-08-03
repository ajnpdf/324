'use client';

import { PDFDocument } from 'pdf-lib';
import { ConversionResult, ProgressCallback } from './pdf-converter';

/**
 * AJN Master Merge Engine
 * High-fidelity binary synchronization for multi-file ingestion.
 */
export class MergeConverter {
  private files: File[];
  private onProgress?: ProgressCallback;

  constructor(files: File[], onProgress?: ProgressCallback) {
    this.files = files;
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  async merge(): Promise<ConversionResult> {
    this.updateProgress(5, "Initializing Master Document Buffer...");
    
    const masterDoc = await PDFDocument.create();
    const totalFiles = this.files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = this.files[i];
      const progBase = 10 + Math.round((i / totalFiles) * 80);
      this.updateProgress(progBase, `Ingesting binary stream ${i + 1}/${totalFiles}: ${file.name}...`);
      
      try {
        const fileBytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileBytes, { ignoreEncryption: true });
        const copiedPages = await masterDoc.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => masterDoc.addPage(page));
      } catch (err: any) {
        this.updateProgress(progBase, `Warning: Skipping corrupted segment in ${file.name}`);
      }
    }

    this.updateProgress(92, "Synchronizing binary streams and finalizing trailer...");
    const pdfBytes = await masterDoc.save({ useObjectStreams: true, addDefaultPage: false });
    this.updateProgress(100, "Mastery execution successful.");

    return {
      blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
      fileName: `Merged_Master_${Date.now()}.pdf`,
      mimeType: 'application/pdf'
    };
  }
}
