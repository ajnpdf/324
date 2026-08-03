'use client';

import { PDFDocument } from 'pdf-lib';
import { WordConverter } from './converters/word-converter';
import { ExcelConverter } from './converters/excel-converter';
import { PPTConverter } from './converters/ppt-converter';
import { PDFConverter } from './converters/pdf-converter';
import { CodeConverter } from './converters/code-converter';
import { compressPDF as baseCompress } from './pdf-compress/pdf-compress';
import { initPdfWorker } from './pdfjs-worker';

if (typeof window !== 'undefined') {
  initPdfWorker();
}

/**
 * AJN Master Logic Core - Hardened for SharedArrayBuffer
 * Provides unified entry points for all browser-native processing.
 */

export async function wordToPDF(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new WordConverter(file, (pct, msg) => onProgress({ stage: "Converting Word", detail: msg, pct }));
  const res = await converter.convertTo('PDF', options);
  return res.blob;
}

export async function excelToPDF(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new ExcelConverter(file, (pct, msg) => onProgress({ stage: "Converting Excel", detail: msg, pct }));
  const res = await converter.convertTo('PDF', options);
  return res.blob;
}

export async function pptToPDF(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new PPTConverter(file, (pct, msg) => onProgress({ stage: "Converting PowerPoint", detail: msg, pct }));
  const res = await converter.convertTo('PDF', options);
  return res.blob;
}

export async function htmlToPDF(htmlContent: string, outputName: string, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new CodeConverter(new File([], outputName), (pct, msg) => onProgress({ stage: "Rendering HTML", detail: msg, pct }));
  const res = await converter.convertTo('PDF', { ...options, htmlContent, outputName });
  return res.blob;
}

export async function advancedCompressPDF(file: File, level: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const res = await baseCompress(file, {
    level: level || 'recommended',
    onProgress: (detail, pct) => onProgress({ stage: "Compressing", detail, pct })
  });
  // Explicitly cast to ArrayBuffer for compatibility with SharedArrayBuffer context
  const buffer = res.data.buffer as ArrayBuffer;
  return new Blob([buffer.slice(0)], { type: 'application/pdf' });
}

export async function pdfMetadata(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  onProgress({ stage: "Preparing", detail: "Loading document data...", pct: 10 });
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer.slice(0) as ArrayBuffer, { ignoreEncryption: true });
  
  if (options.title) pdfDoc.setTitle(options.title);
  if (options.author) pdfDoc.setAuthor(options.author);
  if (options.subject) pdfDoc.setSubject(options.subject);
  if (options.keywords) pdfDoc.setKeywords(options.keywords.split(',').map((s: string) => s.trim()));
  
  onProgress({ stage: "Saving", detail: "Finalizing binary stream...", pct: 90 });
  const bytes = await pdfDoc.save();
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function jpgToPDF(files: File[], options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const pdfDoc = await PDFDocument.create();
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buf = await f.arrayBuffer();
    const img = await pdfDoc.embedJpg(new Uint8Array(buf.slice(0) as ArrayBuffer));
    const page = pdfDoc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    onProgress({ 
      stage: "Encoding", 
      detail: `Stitching segment ${i + 1}`, 
      pct: Math.round(((i + 1) / files.length) * 100) 
    });
  }
  const bytes = await pdfDoc.save(); 
  return new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}

export async function pdfToWord(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new PDFConverter(file, (pct, msg) => onProgress({ stage: "Reading Text", detail: msg, pct }));
  const res = await converter.convertTo('DOCX', options);
  return res.blob;
}

export async function pdfToExcel(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new PDFConverter(file, (pct, msg) => onProgress({ stage: "Reading Data", detail: msg, pct }));
  const res = await converter.convertTo('XLSX', options);
  return res.blob;
}

export async function pdfToPPT(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new PDFConverter(file, (pct, msg) => onProgress({ stage: "Creating Slides", detail: msg, pct }));
  const res = await converter.convertTo('PPTX', options);
  return res.blob;
}

export async function pdfToJPG(file: File, options: any, onProgress: (p: { stage: string; detail: string; pct: number }) => void) {
  const converter = new PDFConverter(file, (pct, msg) => onProgress({ stage: "Rasterizing PDF", detail: msg, pct }));
  const res = await converter.convertTo('JPG', options);
  return res.blob;
}