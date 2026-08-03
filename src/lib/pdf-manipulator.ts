'use client';

import { PDFDocument, degrees, rgb, StandardFonts, PDFImage } from 'pdf-lib';
import { ConversionResult, ProgressCallback } from './converters/pdf-converter';

/**
 * AJN Master PDF Manipulator - Production v6.0
 * High-fidelity binary engine for surgical document transformation.
 * Hardened: Robust handling for multi-file vs single-file ingestion.
 */
export class PDFManipulator {
  private files: File[];
  private onProgress?: ProgressCallback;

  constructor(files: File | File[], onProgress?: ProgressCallback) {
    this.files = Array.isArray(files) ? files : (files ? [files] : []);
    this.onProgress = onProgress;
  }

  private updateProgress(percent: number, message: string) {
    this.onProgress?.(percent, message);
  }

  async runOperation(toolId: string, options: any = {}): Promise<ConversionResult> {
    const baseName = options.outputName || (this.files[0]?.name?.split('.')[0] || "Processed_Document");
    
    this.updateProgress(5, "Initializing binary buffer...");
    
    // Hardened Multi-Buffer Ingestion
    const fileBuffers = await Promise.all(this.files.map(f => f.arrayBuffer()));
    const sourceDocs = await Promise.all(fileBuffers.map(buf => 
      PDFDocument.load(buf.slice(0), { ignoreEncryption: true })
    ));

    let masterDoc: PDFDocument = await PDFDocument.create();
    const standardFont = await masterDoc.embedFont(StandardFonts.Helvetica);

    // --- UNIFIED ASSEMBLY OPERATIONS (MERGE, ORGANIZE, SPLIT, DELETE) ---
    if (['merge-pdf', 'organize-pdf', 'split-pdf', 'delete-pdf-pages'].includes(toolId)) {
      this.updateProgress(20, "Analyzing surgical segment map...");
      
      let pageMap = options.pageMap || [];
      if (pageMap.length === 0) {
        if (options.indices && Array.isArray(options.indices)) {
          pageMap = options.indices.map((idx: number) => ({ sourceIdx: 0, pageIdx: idx }));
        } else {
          sourceDocs.forEach((doc, sIdx) => {
            doc.getPageIndices().forEach(pIdx => pageMap.push({ sourceIdx: sIdx, pageIdx: pIdx }));
          });
        }
      }

      const totalSteps = pageMap.length;
      if (totalSteps === 0) throw new Error("No segments identified for assembly.");

      for (let i = 0; i < totalSteps; i++) {
        const instruction = pageMap[i];
        const srcDoc = sourceDocs[instruction.sourceIdx];
        
        if (srcDoc && instruction.pageIdx < srcDoc.getPageCount()) {
          const [copiedPage] = await masterDoc.copyPages(srcDoc, [instruction.pageIdx]);
          
          if (instruction.rotation) {
            const current = copiedPage.getRotation().angle;
            copiedPage.setRotation(degrees((current + instruction.rotation) % 360));
          }
          
          masterDoc.addPage(copiedPage);
        }

        if (i % 5 === 0) {
          this.updateProgress(20 + Math.round((i / totalSteps) * 70), `Stitching segment ${i + 1} of ${totalSteps}...`);
        }
      }
    }

    // --- OPERATION: ROTATE (IN-PLACE) ---
    else if (toolId === 'rotate-pdf' && sourceDocs[0]) {
      this.updateProgress(30, "Correcting orientation layers...");
      const pdfPages = sourceDocs[0].getPages();
      const rotationMap = options.rotationMap || pdfPages.map(() => options.angle || 90);
      
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(sourceDocs[0], sourceDocs[0].getPageIndices());
      
      copied.forEach((p, i) => {
        const deg = rotationMap[i] || 0;
        p.setRotation(degrees((p.getRotation().angle + deg) % 360));
        newDoc.addPage(p);
      });
      masterDoc = newDoc;
    }

    // --- OPERATION: PAGE NUMBERING ---
    else if (toolId === 'page-number' && sourceDocs[0]) {
      this.updateProgress(30, "Applying indexing stamps...");
      const newDoc = await PDFDocument.create();
      const copied = await newDoc.copyPages(sourceDocs[0], sourceDocs[0].getPageIndices());
      
      const { starting_number = 1, text = '{n}' } = options;

      copied.forEach((page, i) => {
        const { width } = page.getSize();
        const label = text.replace('{n}', (i + starting_number).toString()).replace('{p}', copied.length.toString());
        page.drawText(label, {
          x: width / 2 - 20,
          y: 30,
          size: 12,
          font: standardFont,
          color: rgb(0, 0, 0),
          opacity: 0.6
        });
        newDoc.addPage(page);
      });
      masterDoc = newDoc;
    }

    this.updateProgress(95, "Synchronizing binary and finalizing trailer...");
    const pdfBytes = await masterDoc.save({ useObjectStreams: true, addDefaultPage: false });
    
    return { 
      blob: new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' }), 
      fileName: `${baseName}.pdf`, 
      mimeType: 'application/pdf' 
    };
  }
}
