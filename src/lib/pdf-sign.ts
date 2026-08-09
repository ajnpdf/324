'use client';

import { PDFDocument } from 'pdf-lib';

/**
 * AJN SIGNATURE ENGINE — 2026 Industrial Edition
 * Complete classes and logic for professional PDF signing.
 * Hardened for multi-page coordinate synchronization.
 */

export type SignMode = 'pen' | 'pencil' | 'marker';

export class SignatureDrawingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private isDrawing: boolean = false;
  private lastX: number = 0;
  private lastY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    this.setMode('pen');
  }

  setMode(mode: SignMode) {
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = '#000000';
    
    switch (mode) {
      case 'pen':
        this.ctx.lineWidth = 2.5;
        this.ctx.globalAlpha = 1.0;
        break;
      case 'pencil':
        this.ctx.lineWidth = 1.0;
        this.ctx.globalAlpha = 0.6;
        break;
      case 'marker':
        this.ctx.lineWidth = 12;
        this.ctx.globalAlpha = 0.4;
        break;
    }
  }

  private getPos(e: MouseEvent | Touch) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  startDraw(e: MouseEvent | Touch) {
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  continueDraw(e: MouseEvent | Touch) {
    if (!this.isDrawing) return;
    const pos = this.getPos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.lastX = pos.x;
    this.lastY = pos.y;
  }

  endDraw() { this.isDrawing = false; }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  exportPNG() {
    return this.canvas.toDataURL('image/png');
  }
}

export async function embedSignature(pdfFile: File, sigDataUrl: string, options: any) {
  const bytes = await pdfFile.arrayBuffer();
  const pdf = await PDFDocument.load(bytes.slice(0) as ArrayBuffer, { ignoreEncryption: true });
  
  const idx = Math.max(0, Math.min(pdf.getPageCount() - 1, (options.page || 1) - 1));
  const page = pdf.getPage(idx);
  const imgBytes = await fetch(sigDataUrl).then(r => r.arrayBuffer());
  const img = await pdf.embedPng(imgBytes);

  page.drawImage(img, {
    x: options.x || 100,
    y: options.y || 100,
    width: options.width || 150,
    height: options.height || 75
  });

  const final = await pdf.save();
  return new Blob([final.buffer as ArrayBuffer], { type: 'application/pdf' });
}
