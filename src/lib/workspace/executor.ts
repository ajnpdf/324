import { degrees, PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { WorkspaceProgress, WorkspaceStep } from './types';

export type WorkspaceExecutionResult = {
  blob: Blob;
  bytes: Uint8Array;
  filename: string;
  pageCount: number;
};

function assertNotAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Workspace processing cancelled.', 'AbortError');
}

function safeOutputName(inputName: string): string {
  const stem = inputName.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9._ -]+/g, '_').trim().slice(0, 120) || 'document';
  return `${stem}-ajn-workspace.pdf`;
}

async function loadPdf(file: File): Promise<PDFDocument> {
  const buffer = await file.arrayBuffer();
  try {
    return await PDFDocument.load(buffer, { ignoreEncryption: false, updateMetadata: false });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (/encrypted|password/i.test(message)) throw new Error(`${file.name}: password-protected PDFs must be unlocked before using the local workspace.`);
    throw new Error(`${file.name}: AJN PDF could not open this PDF. The file may be damaged or unsupported.`);
  }
}

async function mergeFiles(files: File[], signal?: AbortSignal): Promise<PDFDocument> {
  const output = await PDFDocument.create();
  for (const file of files) {
    assertNotAborted(signal);
    const source = await loadPdf(file);
    const copied = await output.copyPages(source, source.getPageIndices());
    for (const page of copied) {
      assertNotAborted(signal);
      output.addPage(page);
    }
  }
  if (!output.getPageCount()) throw new Error('The selected PDFs did not contain any pages.');
  return output;
}

async function applyRotate(document: PDFDocument, angle: 90 | 180 | 270, signal?: AbortSignal) {
  for (const page of document.getPages()) {
    assertNotAborted(signal);
    const current = page.getRotation().angle || 0;
    page.setRotation(degrees((current + angle) % 360));
  }
}

async function applyWatermark(document: PDFDocument, step: Extract<WorkspaceStep, { type: 'watermark' }>, signal?: AbortSignal) {
  const text = step.text.trim();
  if (!text) throw new Error('Watermark text cannot be empty.');
  const font = await document.embedFont(StandardFonts.HelveticaBold);
  const fontSize = Math.max(8, Math.min(96, Number(step.fontSize) || 36));
  const opacity = Math.max(0.05, Math.min(0.9, Number(step.opacity) || 0.2));
  const rotation = Math.max(-180, Math.min(180, Number(step.rotation) || 0));
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  for (const page of document.getPages()) {
    assertNotAborted(signal);
    const { width, height } = page.getSize();
    page.drawText(text, {
      x: Math.max(12, width / 2 - textWidth / 2),
      y: Math.max(12, height / 2 - fontSize / 2),
      size: fontSize,
      font,
      color: rgb(0.35, 0.35, 0.4),
      opacity,
      rotate: degrees(rotation),
    });
  }
}

async function applyPageNumbers(document: PDFDocument, step: Extract<WorkspaceStep, { type: 'page-numbers' }>, signal?: AbortSignal) {
  const font = await document.embedFont(StandardFonts.Helvetica);
  const fontSize = Math.max(7, Math.min(36, Number(step.fontSize) || 10));
  const startAt = Math.max(0, Math.min(1000000, Math.trunc(Number(step.startAt) || 1)));
  const pages = document.getPages();

  pages.forEach((page, index) => {
    assertNotAborted(signal);
    const label = String(startAt + index);
    const widthOfLabel = font.widthOfTextAtSize(label, fontSize);
    const { width, height } = page.getSize();
    let x = width / 2 - widthOfLabel / 2;
    let y = 20;
    if (step.position === 'bottom-right') x = width - widthOfLabel - 24;
    if (step.position === 'top-right') {
      x = width - widthOfLabel - 24;
      y = height - fontSize - 20;
    }
    page.drawText(label, { x: Math.max(12, x), y: Math.max(12, y), size: fontSize, font, color: rgb(0.2, 0.2, 0.24) });
  });
}

export async function executeWorkspaceWorkflow(
  files: File[],
  steps: WorkspaceStep[],
  options: { signal?: AbortSignal; onProgress?: (progress: WorkspaceProgress) => void } = {},
): Promise<WorkspaceExecutionResult> {
  if (!files.length) throw new Error('Choose at least one PDF before running the workspace.');
  const active = steps.filter(step => step.enabled);
  if (!active.length) throw new Error('Add at least one enabled workspace step.');
  if (files.length > 1 && active[0]?.type !== 'merge') throw new Error('When using multiple PDFs, Merge PDFs must be the first enabled workflow step.');
  if (active.filter(step => step.type === 'merge').length > 1) throw new Error('A workspace workflow can contain only one Merge PDFs step.');
  if (active.some((step, index) => step.type === 'merge' && index !== 0)) throw new Error('Merge PDFs must be the first enabled workflow step.');

  const total = active.length + 2;
  options.onProgress?.({ phase: 'loading', current: 0, total, message: 'Reading PDF data locally…' });
  assertNotAborted(options.signal);

  let document: PDFDocument;
  let cursor = 1;
  if (active[0]?.type === 'merge') {
    document = await mergeFiles(files, options.signal);
    options.onProgress?.({ phase: 'processing', current: cursor++, total, message: `Merged ${files.length} PDF${files.length === 1 ? '' : 's'} locally.` });
  } else {
    document = await loadPdf(files[0]);
  }

  for (const step of active) {
    assertNotAborted(options.signal);
    if (step.type === 'merge') continue;
    if (step.type === 'rotate') await applyRotate(document, step.angle, options.signal);
    if (step.type === 'watermark') await applyWatermark(document, step, options.signal);
    if (step.type === 'page-numbers') await applyPageNumbers(document, step, options.signal);
    options.onProgress?.({ phase: 'processing', current: cursor++, total, message: `${step.type === 'rotate' ? 'Rotation' : step.type === 'watermark' ? 'Watermark' : 'Page numbers'} applied locally.` });
  }

  assertNotAborted(options.signal);
  options.onProgress?.({ phase: 'saving', current: total - 1, total, message: 'Writing and validating the final PDF…' });
  const expectedPageCount = document.getPageCount();
  const bytes = await document.save({ useObjectStreams: true, addDefaultPage: false, updateFieldAppearances: false });
  assertNotAborted(options.signal);
  let validated: PDFDocument;
  try {
    validated = await PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false });
  } catch {
    throw new Error('AJN PDF generated output that could not be reopened safely. No download was offered.');
  }
  if (validated.getPageCount() !== expectedPageCount) throw new Error('AJN PDF output validation detected an unexpected page-count change. No download was offered.');
  const blobBuffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(blobBuffer).set(bytes);
  const blob = new Blob([blobBuffer], { type: 'application/pdf' });
  options.onProgress?.({ phase: 'done', current: total, total, message: 'PDF validated and ready.' });
  return { blob, bytes, filename: safeOutputName(files[0].name), pageCount: expectedPageCount };
}
