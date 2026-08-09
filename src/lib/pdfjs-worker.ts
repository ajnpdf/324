'use client';

import * as pdfjsLib from 'pdfjs-dist';

/**
 * Centralized PDF.js Worker Configuration
 * Standardized for local processing using modern ESM format.
 */
export function initPdfWorker() {
  if (typeof window !== 'undefined') {
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      const version = '4.10.38';
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
    }
  }
}
