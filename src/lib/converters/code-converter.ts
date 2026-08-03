'use client';

import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';
import { ProgressCallback, ConversionResult } from './pdf-converter';

/**
 * AJN Professional Code & Data Conversion Engine - Hardened v10.5
 * Specialized for local-first high-fidelity DOM rasterization.
 */
export class CodeConverter {
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
    const text = settings.htmlContent || (await this.file?.text()) || "";
    const baseName = settings.outputName || this.file?.name?.split('.')[0] || 'Web_Capture';
    const target = targetFormat.toUpperCase();
    const ext = this.file ? this.file.name.split('.').pop()?.toLowerCase() : 'html';

    this.updateProgress(10, `Initializing Professional Code Engine...`);

    if (ext === 'html' || settings.htmlContent) {
      if (target === 'PDF') return this.htmlToPdf(text, baseName, settings);
      if (target === 'JPG' || target === 'JPEG' || target === 'PNG') return this.htmlToImage(text, baseName, target, settings);
    }

    if (ext === 'md' || ext === 'markdown') {
      const html = await marked.parse(text);
      if (target === 'PDF') return this.htmlToPdf(html, baseName, settings);
    }

    throw new Error(`Format transformation ${ext?.toUpperCase()} -> ${target} not supported.`);
  }

  private async renderDOMToCanvas(html: string, options: any = {}): Promise<HTMLCanvasElement> {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '0';
    iframe.style.width = options.width || '1280px';
    iframe.style.height = '1px';
    document.body.appendChild(iframe);

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) throw new Error("Render buffer failure");

      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 2.5rem; background: white; font-family: sans-serif; overflow: visible; }
              img { max-width: 100%; height: auto; display: block; }
              * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; }
              table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 9pt; }
              th, td { border: 1px solid #e2e8f0; padding: 0.75rem; text-align: left; }
            </style>
          </head>
          <body>${html}</body>
        </html>
      `);
      doc.close();

      this.updateProgress(30, "Hydrating asset layers...");
      
      if ((document as any).fonts) {
        await (document as any).fonts.ready;
      }

      const images = Array.from(doc.querySelectorAll('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(res => { 
          img.onload = res; 
          img.onerror = res; 
          setTimeout(res, 10000); 
        });
      }));

      await new Promise(r => setTimeout(r, 500));

      this.updateProgress(60, "Rasterizing document segments...");
      
      const finalScale = options.scale || 2;

      const canvas = await html2canvas(doc.body, {
        scale: finalScale,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 15000,
        foreignObjectRendering: true
      });

      return canvas;
    } finally {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }
  }

  private async htmlToImage(html: string, baseName: string, target: string, settings: any): Promise<ConversionResult> {
    const canvas = await this.renderDOMToCanvas(html, { 
      transparent: target === 'PNG',
      scale: settings.scale || 2
    });

    const mimeType = target === 'PNG' ? 'image/png' : target === 'WEBP' ? 'image/webp' : 'image/jpeg';
    const ext = target === 'PNG' ? 'png' : 'jpg';

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return reject(new Error("Rasterization failed"));
        this.updateProgress(100, "Success");
        const buffer = await blob.arrayBuffer();
        resolve({ blob: new Blob([buffer], { type: mimeType }), fileName: `${baseName}.${ext}`, mimeType });
      }, mimeType, 0.95);
    });
  }

  private async htmlToPdf(html: string, baseName: string, settings: any): Promise<ConversionResult> {
    const isLandscape = settings.orientation === 'landscape';
    const canvas = await this.renderDOMToCanvas(html, {
      width: isLandscape ? '1123px' : '794px',
      scale: 2
    });

    this.updateProgress(85, "Slicing surgical segments...");
    const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'pt', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    const pxPerFullPage = (canvasWidth / pdfWidth) * pdfHeight;
    let yOffset = 0;
    let first = true;

    while (yOffset < canvasHeight) {
      if (!first) pdf.addPage();
      const pageH = Math.min(pxPerFullPage, canvasHeight - yOffset);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvasWidth;
      pageCanvas.height = pageH;
      const ctx = pageCanvas.getContext('2d')!;
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, pageH);
      
      ctx.drawImage(canvas, 0, yOffset, canvasWidth, pageH, 0, 0, canvasWidth, pageH);
      pdf.addImage(pageCanvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, pdfWidth, (pageH / canvasWidth) * pdfWidth);
      yOffset += pxPerFullPage;
      first = false;
    }

    this.updateProgress(100, "Finalized.");
    const pdfOutput = pdf.output('arraybuffer');
    return { 
      blob: new Blob([pdfOutput], { type: 'application/pdf' }), 
      fileName: `${baseName}.pdf`, 
      mimeType: 'application/pdf' 
    };
  }
}
