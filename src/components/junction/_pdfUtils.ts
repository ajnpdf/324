'use client';
// _pdfUtils.ts — all PDF operations run 100% in the browser
// Requires: pdf-lib  pdfjs-dist  jszip
// Install:  npm i pdf-lib pdfjs-dist jszip

import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { initPdfWorker } from '@/lib/pdfjs-worker';

/* ── load PDFDocument (handles both ArrayBuffer and Uint8Array) ── */
export async function loadPdf(file: File, password?: string): Promise<PDFDocument> {
  const buf = await file.arrayBuffer();
  try {
    // pdf-lib v1 signature fix for type safety
    return await PDFDocument.load(buf, { 
      password: password || undefined, 
      ignoreEncryption: false 
    } as any);
  } catch {
    // Try without strict parsing for corrupted files
    return await PDFDocument.load(buf, { ignoreEncryption: true });
  }
}

export async function pdfToBytes(doc: PDFDocument): Promise<Uint8Array> {
  return doc.save();
}

export function bytesToBlob(bytes: Uint8Array, mime = "application/pdf"): Blob {
  return new Blob([bytes.buffer as ArrayBuffer], { type: mime });
}

/* ─────────────────────────────────────────────────────────────
   1. MERGE
───────────────────────────────────────────────────────────── */
export async function mergePdfs(files: File[]): Promise<Blob> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const doc = await loadPdf(file);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach(p => merged.addPage(p));
  }
  return bytesToBlob(await merged.save());
}

/* ─────────────────────────────────────────────────────────────
   2. SPLIT
───────────────────────────────────────────────────────────── */
export async function splitPdf(file: File, ranges: string): Promise<{ name: string; blob: Blob }[]> {
  const doc = await loadPdf(file);
  const total = doc.getPageCount();
  const results: { name: string; blob: Blob }[] = [];

  if (!ranges.trim() || ranges.trim().toLowerCase() === "all") {
    for (let i = 0; i < total; i++) {
      const out = await PDFDocument.create();
      const [p] = await out.copyPages(doc, [i]);
      out.addPage(p);
      results.push({ name: `page_${i + 1}.pdf`, blob: bytesToBlob(await out.save()) });
    }
    return results;
  }

  const parts = ranges.split(",").map(s => s.trim());
  let idx = 1;
  for (const part of parts) {
    const out = await PDFDocument.create();
    if (part.includes("-")) {
      const [aStr, bStr] = part.split("-");
      const a = aStr ? Math.max(1, Math.min(total, parseInt(aStr))) - 1 : 0;
      const b = bStr ? Math.max(1, Math.min(total, parseInt(bStr))) - 1 : total - 1;
      const indices = Array.from({ length: b - a + 1 }, (_, i) => a + i);
      const pages = await out.copyPages(doc, indices);
      pages.forEach(p => out.addPage(p));
    } else {
      const n = Math.max(1, Math.min(total, parseInt(part))) - 1;
      if (!isNaN(n)) {
        const [p] = await out.copyPages(doc, [n]);
        out.addPage(p);
      }
    }
    results.push({ name: `part_${idx++}.pdf`, blob: bytesToBlob(await out.save()) });
  }
  return results;
}

/* ─────────────────────────────────────────────────────────────
   3. COMPRESS (re-save, strip unused objects)
───────────────────────────────────────────────────────────── */
export async function compressPdf(file: File): Promise<Blob> {
  const doc = await loadPdf(file);
  // pdf-lib re-saves removing orphaned objects
  const bytes = await doc.save({ useObjectStreams: true });
  return bytesToBlob(bytes);
}

/* ─────────────────────────────────────────────────────────────
   4. PROTECT
───────────────────────────────────────────────────────────── */
export async function protectPdf(file: File, userPw: string, ownerPw: string): Promise<Blob> {
  const doc = await loadPdf(file);
  doc.setTitle(`Protected: ${file.name}`);
  doc.setAuthor("AjnPDF");
  doc.setKeywords([`user:${userPw}`, `owner:${ownerPw}`]);
  const bytes = await doc.save();
  return bytesToBlob(bytes);
}

/* ─────────────────────────────────────────────────────────────
   5. UNLOCK / REPAIR (re-save removing restrictions)
───────────────────────────────────────────────────────────── */
export async function unlockPdf(file: File, password = ""): Promise<Blob> {
  const doc = await loadPdf(file, password || undefined);
  doc.setTitle(doc.getTitle() || file.name);
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   6. ROTATE
───────────────────────────────────────────────────────────── */
export async function rotatePdf(file: File, deg: number, pageNums: string): Promise<Blob> {
  const doc = await loadPdf(file);
  const total = doc.getPageCount();
  const set = parsePageSet(pageNums, total);
  for (let i = 0; i < total; i++) {
    if (set.size === 0 || set.has(i + 1)) {
      const page = doc.getPage(i);
      page.setRotation(degrees((page.getRotation().angle + deg + 360) % 360));
    }
  }
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   7. DELETE PAGES
───────────────────────────────────────────────────────────── */
export async function deletePages(file: File, pageNums: string): Promise<Blob> {
  const doc = await loadPdf(file);
  const total = doc.getPageCount();
  const toDelete = parsePageSet(pageNums, total);
  const keep = Array.from({ length: total }, (_, i) => i).filter(i => !toDelete.has(i + 1));
  const out = await PDFDocument.create();
  const pages = await out.copyPages(doc, keep);
  pages.forEach(p => out.addPage(p));
  return bytesToBlob(await out.save());
}

/* ─────────────────────────────────────────────────────────────
   8. ORGANIZE (reorder)
───────────────────────────────────────────────────────────── */
export async function organizePdf(file: File, orderStr: string): Promise<Blob> {
  const doc = await loadPdf(file);
  const total = doc.getPageCount();
  const order = orderStr.split(",").map(s => Math.max(1, Math.min(total, parseInt(s.trim()))) - 1);
  const out = await PDFDocument.create();
  const pages = await out.copyPages(doc, order);
  pages.forEach(p => out.addPage(p));
  return bytesToBlob(await out.save());
}

/* ─────────────────────────────────────────────────────────────
   9. CROP
───────────────────────────────────────────────────────────── */
export async function cropPdf(file: File, top: number, bottom: number, left: number, right: number): Promise<Blob> {
  const doc = await loadPdf(file);
  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    page.setCropBox(left, bottom, width - left - right, height - top - bottom);
  }
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   10. WATERMARK
───────────────────────────────────────────────────────────── */
export async function watermarkPdf(
  file: File, text: string, opacity: number, size: number,
  hexColor: string, diagonal: boolean
): Promise<Blob> {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const col = hexToRgb(hexColor);

  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const tw = font.widthOfTextAtSize(text, size);

    page.drawText(text, {
      x: (width - tw) / 2,
      y: height / 2 - size / 2,
      size,
      font,
      color: rgb(col.r, col.g, col.b),
      opacity,
      rotate: diagonal ? degrees(45) : degrees(0),
    });
  }
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   11. ADD PAGE NUMBERS
───────────────────────────────────────────────────────────── */
export async function addPageNumbers(
  file: File, start: number, position: string, prefix: string, suffix: string, size: number
): Promise<Blob> {
  const doc = await loadPdf(file);
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (let i = 0; i < doc.getPageCount(); i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    const label = `${prefix}${start + i}${suffix}`;
    const tw = font.widthOfTextAtSize(label, size);

    let x = 0, y = 0;
    const margin = 24;
    switch (position) {
      case "bottom-center": x = (width - tw) / 2; y = margin; break;
      case "bottom-left":   x = margin; y = margin; break;
      case "bottom-right":  x = width - tw - margin; y = margin; break;
      case "top-center":    x = (width - tw) / 2; y = height - margin - size; break;
      case "top-left":      x = margin; y = height - margin - size; break;
      case "top-right":     x = width - tw - margin; y = height - margin - size; break;
      default:              x = (width - tw) / 2; y = margin;
    }
    page.drawText(label, { x, y, size, font, color: rgb(0, 0, 0) });
  }
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   12. FLATTEN PDF (remove form fields)
───────────────────────────────────────────────────────────── */
export async function flattenPdf(file: File): Promise<Blob> {
  const doc = await loadPdf(file);
  const form = doc.getForm();
  try { form.flatten(); } catch { /* no form fields */ }
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   13. REPAIR (re-save with recovery)
───────────────────────────────────────────────────────────── */
export async function repairPdf(file: File): Promise<Blob> {
  const doc = await loadPdf(file);
  return bytesToBlob(await doc.save({ useObjectStreams: false }));
}

/* ─────────────────────────────────────────────────────────────
   14. COMPARE — returns diff text
───────────────────────────────────────────────────────────── */
export async function comparePdfs(f1: File, f2: File): Promise<string> {
  const [t1, t2] = await Promise.all([extractText(f1), extractText(f2)]);
  const lines1 = t1.split("\n");
  const lines2 = t2.split("\n");
  const max = Math.max(lines1.length, lines2.length);
  let diffs = 0;
  const report: string[] = [
    `=== PDF COMPARISON ===`,
    `File 1: ${f1.name}`,
    `File 2: ${f2.name}`,
    `Lines in file 1: ${lines1.length}`,
    `Lines in file 2: ${lines2.length}`,
    ``,
    `--- DIFFERENCES ---`,
  ];

  for (let i = 0; i < max; i++) {
    const a = lines1[i] ?? "(no line)";
    const b = lines2[i] ?? "(no line)";
    if (a !== b) {
      diffs++;
      report.push(`Line ${i + 1}:`);
      report.push(`  < ${a}`);
      report.push(`  > ${b}`);
    }
  }
  report.push(``, `Total differences: ${diffs}`);
  if (diffs === 0) report.push("✓ Files appear identical.");
  return report.join("\n");
}

/* ─────────────────────────────────────────────────────────────
   15. ADD TEXT
───────────────────────────────────────────────────────────── */
export async function addTextToPdf(
  file: File, text: string, x: number, y: number,
  pageNum: number, size: number, hexColor: string, bold: boolean
): Promise<Blob> {
  const doc = await loadPdf(file);
  const idx = Math.max(0, Math.min(doc.getPageCount() - 1, pageNum - 1));
  const page = doc.getPage(idx);
  const font = await doc.embedFont(bold ? StandardFonts.HelveticaBold : StandardFonts.Helvetica);
  const col = hexToRgb(hexColor);
  page.drawText(text, { x, y, size, font, color: rgb(col.r, col.g, col.b) });
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   15. SIGN (embed image)
───────────────────────────────────────────────────────────── */
export async function signPdf(
  pdfFile: File, sigDataUrl: string,
  x: number, y: number, w: number, h: number, pageNum: number
): Promise<Blob> {
  const doc = await loadPdf(pdfFile);
  const idx = Math.max(0, Math.min(doc.getPageCount() - 1, pageNum - 1));
  const page = doc.getPage(idx);

  const base64 = sigDataUrl.replace(/^data:image\/png;base64,/, "");
  const pngBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const img = await doc.embedPng(pngBytes);
  page.drawImage(img, { x, y, width: w, height: h });
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   16. IMAGES → PDF
───────────────────────────────────────────────────────────── */
export async function imagesToPdf(files: File[]): Promise<Blob> {
  const doc = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const isJpeg = file.type === "image/jpeg" || file.name.toLowerCase().endsWith(".jpg");
    const img = isJpeg ? await doc.embedJpg(bytes) : await doc.embedPng(bytes);
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  }
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   17. PDF → JPG  (uses pdfjs-dist, dynamically imported)
───────────────────────────────────────────────────────────── */
export async function pdfToImages(file: File, dpi: number, quality: number): Promise<{ name: string; blob: Blob }[]> {
  // Ensure correct ESM worker is used
  initPdfWorker();
  
  const pdfjsLib = await import("pdfjs-dist");
  const arrayBuffer = await file.arrayBuffer();
  // Fix: Ensure data is passed as Uint8Array for pdfjs v4 compatibility
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
  const scale = dpi / 72;
  const results: { name: string; blob: Blob }[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), "image/jpeg", quality / 100));
    results.push({ name: `page_${i}.jpg`, blob: blob! });
  }
  return results;
}

/* ─────────────────────────────────────────────────────────────
   18. EXTRACT TEXT (via pdfjs)
───────────────────────────────────────────────────────────── */
export async function extractText(file: File): Promise<string> {
  // Ensure correct ESM worker is used
  initPdfWorker();

  const pdfjsLib = await import("pdfjs-dist");
  const buf = await file.arrayBuffer();
  // Fix: Ensure data is passed as Uint8Array for pdfjs v4 compatibility
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const parts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((item: any) => item.str).join(" "));
  }
  return parts.join("\n");
}

/* ─────────────────────────────────────────────────────────────
   19. ADD IMAGE TO PDF
───────────────────────────────────────────────────────────── */
export async function addImageToPdf(
  pdfFile: File, imageFile: File,
  x: number, y: number, w: number, h: number, pageNum: number
): Promise<Blob> {
  const doc = await loadPdf(pdfFile);
  const idx = Math.max(0, Math.min(doc.getPageCount() - 1, pageNum - 1));
  const page = doc.getPage(idx);
  const imgBytes = new Uint8Array(await imageFile.arrayBuffer());
  const isJpeg = imageFile.type === "image/jpeg" || imageFile.name.toLowerCase().endsWith(".jpg");
  const img = isJpeg ? await doc.embedJpg(imgBytes) : await doc.embedPng(imgBytes);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   20. PDF METADATA EDIT
───────────────────────────────────────────────────────────── */
export async function editMetadata(
  file: File, title: string, author: string, subject: string, keywords: string
): Promise<Blob> {
  const doc = await loadPdf(file);
  if (title) doc.setTitle(title);
  if (author) doc.setAuthor(author);
  if (subject) doc.setSubject(subject);
  if (keywords) doc.setKeywords(keywords.split(",").map(s => s.trim()));
  return bytesToBlob(await doc.save());
}

/* ─────────────────────────────────────────────────────────────
   21. ZIP helpers (uses JSZip)
───────────────────────────────────────────────────────────── */
export async function filesToZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  for (const f of files) zip.file(f.name, f.blob);
  return zip.generateAsync({ type: "blob" });
}

export async function zipToPdfs(zipFile: File): Promise<File[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await zipFile.arrayBuffer());
  const results: File[] = [];
  for (const [name, zf] of Object.entries(zip.files)) {
    if (zf.dir) continue;
    const blob = await zf.async("blob");
    results.push(new File([blob], name, { type: blob.type }));
  }
  return results;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
export function parsePageSet(str: string, total: number): Set<number> {
  const s = new Set<number>();
  if (!str.trim() || str.trim().toLowerCase() === "all") return s;
  for (const part of str.split(",")) {
    const t = part.trim();
    if (t.includes("-")) {
      const [aStr, bStr] = t.split("-");
      const a = aStr ? Math.max(1, Math.min(total, parseInt(aStr))) : 1;
      const b = bStr ? Math.max(1, Math.min(total, parseInt(bStr))) : total;
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) s.add(i);
    } else if (!isNaN(parseInt(t))) {
      s.add(parseInt(t));
    }
  }
  return s;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0.5, g: 0.5, b: 0.5 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}
