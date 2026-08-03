'use client';

import { ConversionResult, ProgressCallback } from './pdf-converter';

/**
 * AJN Professional Image Mastery Engine
 * Handles high-fidelity transcoding for JPG, PNG, WEBP and SVG formats locally.
 * Optimized for SVG-to-Pixel rasterization and local buffer safety.
 */
export class ImageMasteryConverter {
  private file: File;
  private onProgress?: ProgressCallback;

  constructor(file: File, onProgress?: ProgressCallback) {
    this.file = file;
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  async convertTo(targetFormat: string, settings: any = {}): Promise<ConversionResult> {
    const target = targetFormat.toUpperCase();
    const baseName = this.file.name.split('.')[0];
    const mimeType = target === 'PNG' ? 'image/png' : target === 'WEBP' ? 'image/webp' : 'image/jpeg';
    const ext = target.toLowerCase();

    this.updateProgress(10, `Initializing professional pixel engine...`);

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(this.file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        this.updateProgress(40, "Mapping pixel buffer...");

        const canvas = document.createElement('canvas');
        
        // Handle SVG scaling if dimensions are missing
        const width = img.width || 1000;
        const height = img.height || 1000;
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;

        // Fill background for JPEG targets
        if (target === 'JPG' || target === 'JPEG') {
          ctx.fillStyle = settings.backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, width, height);
        this.updateProgress(80, "Executing format creation...");

        const quality = (settings.quality || 92) / 100;
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Processing failed."));
          
          this.updateProgress(100, "successfully processed");
          resolve({
            blob,
            fileName: `${baseName}.${ext}`,
            mimeType
          });
        }, mimeType, quality);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("could not load source file."));
      };

      img.src = url;
    });
  }
}
