'use client';

import * as pdfjsLib from 'pdfjs-dist';
import pptxgen from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { initPdfWorker } from '../pdfjs-worker';

export interface ConversionResult {
  blob: Blob;
  fileName: string;
  mimeType: string;
}

export type ProgressCallback = (percent: number, message: string) => void;

export class PDFConverter {
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
    initPdfWorker();
    const arrayBuffer = await this.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0)) }).promise;
    const baseName = this.file.name.split('.')[0];
    const target = targetFormat.toUpperCase();

    this.updateProgress(10, `Analyzing document segments...`);

    switch (target) {
      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'WEBP':
        return this.toImages(pdf, baseName, target, settings);
      case 'PPTX':
        return this.toPPTX(pdf, baseName);
      case 'DOCX':
        return this.toDocx(pdf, baseName);
      case 'XLSX':
        return this.toXlsx(pdf, baseName);
      case 'TXT':
        return this.toText(pdf, baseName);
      default:
        throw new Error(`Format transformation ${target} not supported.`);
    }
  }

  private async toDocx(pdf: any, baseName: string): Promise<ConversionResult> {
    const sections = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const lines = textContent.items.map((it: any) => it.str).join(' ');
      sections.push({ children: [new Paragraph({ children: [new TextRun(lines)] })] });
    }
    const doc = new Document({ sections });
    const blob = await Packer.toBlob(doc);
    const buffer = await blob.arrayBuffer();
    return {
      blob: new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
      fileName: `${baseName}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  }

  private async toXlsx(pdf: any, baseName: string): Promise<ConversionResult> {
    const wb = XLSX.utils.book_new();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const rows = textContent.items.map((it: any) => [it.str]);
      const ws = XLSX.utils.aoa_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `Page ${i}`);
    }
    const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return {
      blob: new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      fileName: `${baseName}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  }

  private async toPPTX(pdf: any, baseName: string): Promise<ConversionResult> {
    const pptx = new pptxgen();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "white"; ctx.fillRect(0,0,canvas.width,canvas.height);
      await page.render({ canvasContext: ctx, viewport }).promise;
      pptx.addSlide().addImage({ data: canvas.toDataURL("image/jpeg"), x: 0, y: 0, w: '100%', h: '100%' });
    }
    const blob = await pptx.write({ outputType: 'blob' }) as Blob;
    const buffer = await blob.arrayBuffer();
    return { 
      blob: new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' }), 
      fileName: `${baseName}.pptx`, 
      mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    };
  }

  private async toImages(pdf: any, baseName: string, format: string, settings: any): Promise<ConversionResult> {
    const scale = (settings.quality || 300) / 72;
    const mimeType = format === 'PNG' ? 'image/png' : 'image/jpeg';
    if (pdf.numPages === 1) {
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), mimeType));
      const buffer = await blob.arrayBuffer();
      return { blob: new Blob([buffer], { type: mimeType }), fileName: `${baseName}.${format.toLowerCase()}`, mimeType };
    }
    const zip = new JSZip();
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
      const blob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), mimeType));
      zip.file(`${baseName}_${i}.${format.toLowerCase()}`, blob);
    }
    const finalBlob = await zip.generateAsync({ type: 'blob' });
    const finalBuffer = await finalBlob.arrayBuffer();
    return { blob: new Blob([finalBuffer], { type: 'application/zip' }), fileName: `${baseName}.zip`, mimeType: 'application/zip' };
  }

  private async toText(pdf: any, baseName: string): Promise<ConversionResult> {
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += (content.items as any[]).map((it: any) => it.str).join(' ') + '\n';
    }
    return { blob: new Blob([text], { type: 'text/plain' }), fileName: `${baseName}.txt`, mimeType: 'text/plain' };
  }
}
