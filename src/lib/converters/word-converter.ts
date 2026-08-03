'use client';

import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';
import { ProgressCallback, ConversionResult } from './pdf-converter';

/**
 * AJN Professional Word Conversion Engine - Hardened v14.0
 * Implements strict A4 Rasterization Protocol (794px width).
 * Features: 1-inch margins, pure black text, and multi-page slicing with white-fill safety.
 */
export class WordConverter {
  private file: File;
  private onProgress?: ProgressCallback;

  // Surgical A4 Standard CSS (Enforces 1-inch margins and pure black text)
  private getSurgicalCSS(imageScale: number = 100) {
    return `
      #word-render-root { 
        width: 794px; 
        margin: 0; 
        padding: 96px; /* Strict 1-inch professional margin */
        background: #ffffff; 
        font-family: 'Times New Roman', serif; 
        line-height: 1.6; 
        color: #000000 !important; 
        box-sizing: border-box;
        overflow: visible;
        word-wrap: break-word;
        text-align: left;
      }
      #word-render-root * { 
        color: #000000 !important; 
        border-color: #000000 !important;
        -webkit-print-color-adjust: exact !important; 
      }
      h1, h2, h3, h4 { font-weight: bold; margin-top: 1.2em; margin-bottom: 0.6em; text-transform: none; line-height: 1.2; }
      h1 { font-size: 24pt; border-bottom: 1pt solid #000000; padding-bottom: 4pt; }
      h2 { font-size: 18pt; }
      h3 { font-size: 14pt; }
      p { margin-bottom: 1.0em; font-size: 11pt; }
      table { border-collapse: collapse; width: 100%; margin: 18pt 0; border: 1.5pt solid #000000; }
      th, td { border: 1pt solid #000000; padding: 8pt; text-align: left; font-size: 10pt; }
      th { background: #f2f2f2; font-weight: bold; }
      img { 
        max-width: ${imageScale}%; 
        height: auto; 
        display: block; 
        margin: 18pt auto; 
        transition: width 0.3s ease;
      }
      ul, ol { margin-bottom: 1.2em; padding-left: 48pt; }
      li { margin-bottom: 0.5em; }
    `;
  }

  constructor(file: File, onProgress?: ProgressCallback) {
    this.file = file;
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  async convertTo(targetFormat: string, settings: any = {}): Promise<ConversionResult> {
    const arrayBuffer = await this.file.arrayBuffer();
    const baseName = this.file.name.split('.')[0];
    const target = targetFormat.toUpperCase();

    if (target === 'PDF') {
      return this.toMasterPDF(arrayBuffer, baseName, settings);
    }

    throw new Error(`Target ${target} not supported.`);
  }

  private async toMasterPDF(buffer: ArrayBuffer, baseName: string, settings: any): Promise<ConversionResult> {
    this.updateProgress(10, "Auditing document binary...");
    
    try {
      await JSZip.loadAsync(buffer);
    } catch (e) {
      throw new Error("Invalid .docx file. Integrity check failed.");
    }

    this.updateProgress(30, "Analyzing layout segments...");
    const { value: html } = await mammoth.convertToHtml({ arrayBuffer: buffer });
    
    return new Promise((resolve, reject) => {
      const container = document.createElement('div');
      container.id = 'word-render-wrapper';
      // Use fixed width to match A4 96dpi exactly
      container.style.cssText = 'position:fixed;top:-9999px;left:0;width:794px;background:white;z-index:-1;';
      container.innerHTML = `<style>${this.getSurgicalCSS(settings.imageScale || 100)}</style><div id="word-render-root">${html}</div>`;
      document.body.appendChild(container);

      // Wait for fonts and images to settle
      setTimeout(async () => {
        try {
          this.updateProgress(60, "Rasterizing high-fidelity segments...");
          
          const canvas = await html2canvas(container, { 
            scale: 2, // 2x resolution for industrial print quality
            useCORS: true,
            backgroundColor: '#ffffff',
            logging: false,
            width: 794,
            windowWidth: 794
          });
          
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
          
          this.updateProgress(85, "Synthesizing A4 pages...");
          const pdf = new jsPDF('p', 'pt', 'a4');
          const pdfW = pdf.internal.pageSize.getWidth();
          const pdfH = pdf.internal.pageSize.getHeight();
          
          // Calculate pixels per page based on A4 aspect ratio
          const pxPerPage = (canvas.width / pdfW) * pdfH;
          
          let yOffset = 0;
          let firstPage = true;

          while (yOffset < canvas.height) {
            if (!firstPage) pdf.addPage();
            
            const sliceH = Math.min(pxPerPage, canvas.height - yOffset);
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = sliceH;
            const ctx = sliceCanvas.getContext('2d')!;
            
            // CRITICAL FIX: Explicitly fill with white to avoid black screen bug during JPEG compression
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            
            // Draw segment from master canvas
            ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
            
            const imgBlob = await new Promise<Blob | null>(res => sliceCanvas.toBlob(res, 'image/jpeg', 0.95));
            if (!imgBlob) throw new Error("Slice capture failed.");
            
            const imgBuffer = await imgBlob.arrayBuffer();
            pdf.addImage(new Uint8Array(imgBuffer), 'JPEG', 0, 0, pdfW, (sliceH / canvas.width) * pdfW, undefined, 'FAST');
            
            yOffset += pxPerPage;
            firstPage = false;
          }

          this.updateProgress(100, "Success");
          const finalPdfBlob = pdf.output('blob');
          resolve({ 
            blob: new Blob([await finalPdfBlob.arrayBuffer()], { type: 'application/pdf' }), 
            fileName: `${baseName}.pdf`, 
            mimeType: 'application/pdf' 
          });
        } catch (e) {
          if (document.body.contains(container)) document.body.removeChild(container);
          reject(e);
        }
      }, 1000);
    });
  }
}
