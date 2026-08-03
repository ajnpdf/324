'use client';

import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import pptxgen from 'pptxgenjs';
import { ProgressCallback, ConversionResult } from './pdf-converter';

export class ODTConverter {
  private file: File;
  private onProgress?: ProgressCallback;

  constructor(file: File, onProgress?: ProgressCallback) {
    this.file = file;
    this.onProgress = onProgress;
  }

  async convertTo(targetFormat: string): Promise<ConversionResult> {
    const buffer = await this.file.arrayBuffer();
    const baseName = this.file.name.split('.')[0];
    const target = targetFormat.toUpperCase();
    const ext = this.file.name.split('.').pop()?.toLowerCase();

    if (ext === 'ods') {
      const wb = XLSX.read(buffer, { type: 'array' });
      const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      return { blob: new Blob([out.buffer as ArrayBuffer]), fileName: `${baseName}.xlsx`, mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
    }

    if (ext === 'odp') {
      const pres = new pptxgen();
      pres.addSlide().addText("Converted from ODP", { x: 1, y: 1 });
      const blob = await pres.write({ outputType: 'blob' }) as Blob;
      return { blob: blob, fileName: `${baseName}.pptx`, mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
    }

    const zip = await JSZip.loadAsync(buffer);
    const content = await zip.file("content.xml")?.async("text");
    if (!content) throw new Error("Invalid ODT.");

    if (target === 'PDF') {
      const container = document.createElement('div');
      container.style.padding = '40px'; container.innerHTML = content;
      document.body.appendChild(container);
      const canvas = await html2canvas(container);
      document.body.removeChild(container);
      const pdf = new jsPDF();
      pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, 210, (canvas.height * 210) / canvas.width);
      return { blob: pdf.output('blob'), fileName: `${baseName}.pdf`, mimeType: 'application/pdf' };
    }

    const docxZip = new JSZip();
    docxZip.file('word/document.xml', `<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Modernized from ODT</w:t></w:r></w:p></w:body></w:document>`);
    return { blob: await docxZip.generateAsync({ type: 'blob' }), fileName: `${baseName}.docx`, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
  }
}
