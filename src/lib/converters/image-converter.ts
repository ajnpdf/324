'use client';

import { PDFDocument, degrees, PageSizes } from 'pdf-lib';
import { ProgressCallback, ConversionResult } from './pdf-converter';

/**
 * AJN Professional Image to PDF Engine
 * Optimized for local-first creation with high-quality page mapping.
 * Features: Aspect-ratio preservation, High-Fidelity Normalization, and Centered Rotations.
 */
export class ImageConverter {
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
   * Normalizes an image to high-quality standard JPEG bytes using a browser canvas.
   * Ensures binary integrity and compatibility with the PDF specification.
   */
  private async normalizeToJpg(file: File): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Pixel buffer capture failed."));
          const reader = new FileReader();
          reader.onload = () => {
            if (reader.result instanceof ArrayBuffer) {
              resolve(new Uint8Array(reader.result));
            } else {
              reject(new Error("Buffer mapping error."));
            }
          };
          reader.readAsArrayBuffer(blob);
        }, 'image/jpeg', 0.95);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Could not load source file."));
      };
      img.src = url;
    });
  }

  async toMasterPDF(files: File[], settings: any = {}): Promise<ConversionResult> {
    this.updateProgress(5, "Calibrating document workspace...");
    const pdfDoc = await PDFDocument.create();
    
    const sizeMap: Record<string, [number, number]> = {
      'A4': [595.28, 841.89],
      'letter': [612, 792],
    };

    const margin = parseInt(settings.margin || '20');
    const rotations = settings.rotations || files.map(() => 0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progBase = 10 + Math.round((i / files.length) * 85);
      this.updateProgress(progBase, `Rasterizing segment ${i + 1} of ${files.length}...`);

      const bytes = await this.normalizeToJpg(file);
      const image = await pdfDoc.embedJpg(bytes);
      
      const rotation = (rotations[i] || 0) % 360;
      const isLandscapeRotation = rotation === 90 || rotation === 270;

      // Calculate effective image dimensions after rotation for bounding box calculation
      const visualW = isLandscapeRotation ? image.height : image.width;
      const visualH = isLandscapeRotation ? image.width : image.height;

      let pWidth: number;
      let pHeight: number;

      if (settings.pageSize === 'auto') {
        pWidth = visualW + (margin * 2);
        pHeight = visualH + (margin * 2);
      } else {
        const baseSize = sizeMap[settings.pageSize] || sizeMap['A4'];
        pWidth = baseSize[0];
        pHeight = baseSize[1];
        if (settings.orientation === 'landscape') {
          [pWidth, pHeight] = [pHeight, pWidth];
        }
      }

      const page = pdfDoc.addPage([pWidth, pHeight]);
      const { width: pgW, height: pgH } = page.getSize();
      
      const availW = pgW - (margin * 2);
      const availH = pgH - (margin * 2);
      
      // Preserve aspect ratio while fitting the rotated bounding box to available bounds
      const scale = Math.min(availW / visualW, availH / visualH);
      const dW = image.width * scale;
      const dH = image.height * scale;

      // Centering logic for rotated images in PDF-lib (origin is bottom-left)
      const rad = (rotation * Math.PI) / 180;
      const centerX = pgW / 2;
      const centerY = pgH / 2;

      // Calculate bottom-left coordinate to keep image centered during rotation
      // When rotating around (x, y), we need to offset based on the transformation
      const drawX = centerX - (Math.cos(rad) * dW / 2) + (Math.sin(rad) * dH / 2);
      const drawY = centerY - (Math.sin(rad) * dW / 2) - (Math.cos(rad) * dH / 2);

      page.drawImage(image, {
        x: drawX,
        y: drawY,
        width: dW,
        height: dH,
        rotate: degrees(rotation)
      });
    }

    this.updateProgress(98, "Synchronizing binary streams...");
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false
    });

    return { 
      blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" }), 
      fileName: `${settings.outputName || 'AJN_Collection'}.pdf`, 
      mimeType: "application/pdf" 
    };
  }

  async convertTo(targetFormat: string, settings: any = {}): Promise<ConversionResult> {
    const target = targetFormat.toUpperCase();
    if (target === 'PDF') {
      return this.toMasterPDF([this.file], settings);
    }
    throw new Error(`Format ${target} not supported in current unit.`);
  }
}
