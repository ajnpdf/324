'use client';

import { createWorker, Worker } from 'tesseract.js';

/**
 * AJN OCR Engine Controller
 * Manages Tesseract.js worker lifecycle and surgical recognition.
 */

export interface OCRResult {
  text: string;
  confidence: number;
  words: any[];
  hocr: string;
  data: any;
}

class AJNOCREngine {
  private worker: Worker | null = null;
  private currentLang: string = "";

  async getWorker(lang = "eng"): Promise<Worker> {
    if (this.worker && this.currentLang === lang) return this.worker;
    if (this.worker) await this.worker.terminate();

    const worker = await createWorker(lang, 1, {
      logger: m => console.log(`[AJN OCR] ${m.status}: ${Math.round(m.progress * 100)}%`),
    });

    this.worker = worker;
    this.currentLang = lang;
    return worker;
  }

  async recognize(image: string | HTMLCanvasElement, options: any = {}): Promise<OCRResult> {
    const worker = await this.getWorker(options.lang || "eng");
    
    await worker.setParameters({
      tessedit_pageseg_mode: options.psm || '3' as any,
      preserve_interword_spaces: '1',
      ...options.params
    });

    const result: any = await worker.recognize(image);
    const data = result.data;
    
    return {
      text: data.text,
      confidence: data.confidence,
      words: data.words,
      hocr: data.hocr || "",
      data
    };
  }

  async detectOSD(image: any) {
    const worker = await this.getWorker("osd");
    return await worker.detect(image);
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.currentLang = "";
    }
  }
}

export const ocrEngine = new AJNOCREngine();
