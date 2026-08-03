'use client';

import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ProgressCallback, ConversionResult } from './pdf-converter';

export class ExcelConverter {
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
    const arrayBuffer = await this.file.arrayBuffer();
    const baseName = this.file.name.split('.')[0];
    const target = targetFormat.toUpperCase();
    const buffer = arrayBuffer.slice(0);

    if (target !== 'PDF') {
      this.updateProgress(10, "Processing binary stream...");
      try {
        const wb = XLSX.read(buffer, { type: 'array' });
        const out = XLSX.write(wb, { bookType: target.toLowerCase() as any, type: 'array' });
        return { 
          blob: new Blob([out]), 
          fileName: `${baseName}.${target.toLowerCase()}`, 
          mimeType: 'application/octet-stream' 
        };
      } catch (err: any) {
        throw new Error("The Excel engine was unable to parse this file.");
      }
    }

    return this.toMasterPDF(buffer, baseName, settings);
  }

  private async toMasterPDF(buffer: ArrayBuffer, baseName: string, settings: any): Promise<ConversionResult> {
    this.updateProgress(5, "Initializing Grid Engine...");

    let wb;
    try {
      this.updateProgress(10, "Analyzing spreadsheet structure...");
      wb = XLSX.read(buffer, { 
        type: 'array',
        cellStyles: true,
        cellNF: true,
        cellDates: true
      });
    } catch (err: any) {
      throw new Error("Unable to map Excel data.");
    }

    const sheetNames = wb.SheetNames;
    const totalSheets = sheetNames.length;
    const orientation = settings.orientation === 'landscape' ? 'l' : 'p';
    const pageSize = settings.pageSize?.toLowerCase() || 'a4';
    const pdf = new jsPDF(orientation, 'pt', pageSize);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const marginMap: Record<string, number> = { 'none': 0, 'narrow': 20, 'normal': 40, 'wide': 60 };
    const margin = marginMap[settings.margin] ?? 40;

    for (let i = 0; i < totalSheets; i++) {
      const sheetName = sheetNames[i];
      const progBase = 20 + Math.round((i / totalSheets) * 70);
      this.updateProgress(progBase, `Analyzing Sheet: ${sheetName}...`);

      const ws = wb.Sheets[sheetName];
      const html = XLSX.utils.sheet_to_html(ws, { editable: false });
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '0';
      container.style.background = 'white';
      container.style.padding = `${margin}px`;
      container.style.width = 'fit-content';
      container.style.minWidth = '1000px'; 

      container.innerHTML = `
        <style>
          table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 9pt; color: black !important; }
          th { background: #f1f5f9; padding: 8px 12px; border: 1px solid black; text-align: left; font-weight: 700; }
          td { border: 1px solid black; padding: 6px 10px; text-align: left; white-space: nowrap; }
          tr:nth-child(even) { background-color: #f8fafc; }
        </style>
        <div style="font-weight:900;font-size:14pt;margin-bottom:24px;">${sheetName}</div>
        ${html}
      `;
      document.body.appendChild(container);

      const table = container.querySelector('table');
      const tableWidth = table ? table.offsetWidth : 1000;
      let finalScale = (settings.scale || 100) / 100;
      if (settings.fitToWidth) {
        const availableWidth = pdfWidth - (margin * 2);
        const autoScale = availableWidth / (tableWidth + (margin * 2));
        finalScale = Math.min(autoScale, 1.0); 
      }

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      document.body.removeChild(container);

      if (i > 0) pdf.addPage(pageSize, orientation);
      const imgWidth = (canvas.width / 2) * finalScale;
      const imgHeight = (canvas.height / 2) * finalScale;
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, imgWidth, imgHeight);
    }

    const pdfData = pdf.output('arraybuffer');
    return {
      blob: new Blob([pdfData], { type: 'application/pdf' }),
      fileName: `${baseName}.pdf`,
      mimeType: 'application/pdf'
    };
  }
}
