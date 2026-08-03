
'use client';

import { PDFDocument } from 'pdf-lib';
import { ProgressCallback, ConversionResult } from './pdf-converter';

/**
 * AJN Professional Scanner Engine
 * Implements high-fidelity image processing: Adaptive Contrast, Grayscale, and Page Scaling.
 */
export class ScannerConverter {
  private files: File[];
  private onProgress?: ProgressCallback;

  constructor(files: File | File[], onProgress?: ProgressCallback) {
    this.files = Array.isArray(files) ? files : [files];
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  async process(settings: any = {}): Promise<ConversionResult> {
    this.updateProgress(5, "Initializing Professional Scanner Core...");
    const pdfDoc = await PDFDocument.create();

    const PAGE_SIZES: Record<string, [number, number]> = {
      'A4': [595.28, 841.89],
      'letter': [612, 792]
    };

    for (let i = 0; i < this.files.length; i++) {
      const file = this.files[i];
      const progBase = 10 + Math.round((i / this.files.length) * 80);
      this.updateProgress(progBase, `Normalizing Capture ${i + 1} of ${this.files.length}...`);
      
      // 1. Image Enhancement Logic via Canvas API
      const enhancedDataUrl = await this.enhanceImage(file, settings);
      const imgBytes = await fetch(enhancedDataUrl).then(r => r.arrayBuffer());
      
      this.updateProgress(progBase + 5, "Embedding binary stream...");
      let pdfImage;
      try {
        pdfImage = file.type.includes('png') ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
        
        let pW: number, pH: number;
        if (settings.pageSize === 'auto') {
          pW = pdfImage.width;
          pH = pdfImage.height;
        } else {
          [pW, pH] = PAGE_SIZES[settings.pageSize] || PAGE_SIZES['A4'];
        }

        const page = pdfDoc.addPage([pW, pH]);
        const { width, height } = page.getSize();
        
        // Fitting logic
        const scale = Math.min(width / pdfImage.width, height / pdfImage.height);
        const dW = pdfImage.width * scale;
        const dH = pdfImage.height * scale;
        
        page.drawImage(pdfImage, {
          x: (width - dW) / 2,
          y: (height - dH) / 2,
          width: dW,
          height: dH
        });
      } catch (err) {
        console.warn(`[Scanner Engine] Embedding segment ${i} failed:`, err);
      }
    }

    this.updateProgress(95, "Synchronizing Master PDF Buffer...");
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    
    return { 
      blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), 
      fileName: `${settings.outputName || 'Scanned_Archive'}.pdf`, 
      mimeType: 'application/pdf' 
    };
  }

  private async enhanceImage(file: File, settings: any): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;

        // Industrial Filters
        let filters = "";
        if (settings.enhance) {
          filters += "contrast(1.4) brightness(1.05) saturate(1.1) ";
        }
        if (settings.grayscale) {
          filters += "grayscale(100%) ";
        }
        
        ctx.filter = filters.trim() || 'none';
        ctx.drawImage(img, 0, 0);
        
        resolve(canvas.toDataURL('image/jpeg', (settings.quality || 90) / 100));
      };
      img.src = url;
    });
  }
}
