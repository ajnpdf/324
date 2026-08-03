'use client';

import { ConversionResult, ProgressCallback } from './pdf-converter';
import { compressPDF, CompressionLevel } from '../pdf-compress';
import JSZip from 'jszip';

/**
 * AJN Advanced Optimization Suite
 * Hardened for 2026 industrial binary standards.
 * Resolved chunk-loading error by switching to static JSZip import.
 */
export class SpecializedConverter {
  private files: File[];
  private onProgress?: ProgressCallback;

  constructor(files: File[], onProgress?: ProgressCallback) {
    this.files = files;
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  async convertTo(targetFormat: string, settings: any = {}): Promise<ConversionResult> {
    const target = targetFormat.toUpperCase();
    const file = this.files[0];
    if (!file) throw new Error("No source binary detected.");
    
    const baseName = file.name.split('.')[0];
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (target === 'COMPRESS') {
      if (ext === 'pdf') {
        const level = settings.level || 'ebook';
        const result = await compressPDF(file, {
          level: level as CompressionLevel,
          onProgress: (step, pct) => this.updateProgress(pct, step)
        });
        return {
          blob: new Blob([result.data.buffer as ArrayBuffer], { type: 'application/pdf' }),
          fileName: (settings.outputName || `${baseName}_Optimized`).replace(/\.pdf$/i, "") + ".pdf",
          mimeType: 'application/pdf'
        };
      }
      
      if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return this.compressImage(file, baseName, settings);
      if (ext === 'docx') return this.compressDocx(file, baseName, settings);
      
      return this.genericBufferSync(file, baseName);
    }
    
    throw new Error(`Optimization feature ${target} not calibrated.`);
  }

  private async compressImage(file: File, baseName: string, settings: any): Promise<ConversionResult> {
    this.updateProgress(20, "Loading pixel buffer...");
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject("Canvas failure.");
        const scale = settings.level === 'screen' ? 0.5 : settings.level === 'ebook' ? 0.7 : 0.9;
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        this.updateProgress(50, "Rendering pixels...");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const quality = settings.level === 'screen' ? 0.5 : settings.level === 'ebook' ? 0.72 : 0.85;
        canvas.toBlob(async (blob) => {
          if (!blob) return reject("Blob failure.");
          const buffer = await blob.arrayBuffer();
          resolve({ blob: new Blob([buffer], { type: 'image/jpeg' }), fileName: `${baseName}_Optimized.jpg`, mimeType: 'image/jpeg' });
        }, 'image/jpeg', quality);
      };
      img.src = url;
    });
  }

  private async compressDocx(file: File, baseName: string, _settings: any): Promise<ConversionResult> {
    this.updateProgress(20, "Unpacking OOXML container...");
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    this.updateProgress(60, "Repackaging with max-level deflation...");
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
    const buffer = await blob.arrayBuffer();
    return { blob: new Blob([buffer], { type: file.type }), fileName: `${baseName}_Optimized.docx`, mimeType: file.type };
  }

  private async genericBufferSync(file: File, baseName: string): Promise<ConversionResult> {
    this.updateProgress(50, "Synchronizing binary buffer...");
    const buf = await file.arrayBuffer();
    return { blob: new Blob([buf], { type: file.type }), fileName: `${baseName}_Optimized.${file.name.split('.').pop()}`, mimeType: file.type };
  }
}
