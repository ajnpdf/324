'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { initPdfWorker } from '@/lib/pdfjs-worker';

type ViewMode = 'sidebyside' | 'overlay';

interface RenderedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
}

interface DiffRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'added' | 'removed';
}

// ─────────────────────────────────────────
// Render PDF Page
// ─────────────────────────────────────────
async function renderPage(
  pdf: PDFDocumentProxy,
  pageNum: number,
  scale = 1.3
): Promise<RenderedPage | null> {
  if (pageNum > pdf.numPages) return null;

  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport: viewport }).promise;

  return { canvas, width: canvas.width, height: canvas.height };
}

// ─────────────────────────────────────────
// Compute Diff (Row Based)
// ─────────────────────────────────────────
function computeDiff(a: RenderedPage, b: RenderedPage) {
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);

  const dataA = a.canvas.getContext('2d')!.getImageData(0, 0, w, h).data;
  const dataB = b.canvas.getContext('2d')!.getImageData(0, 0, w, h).data;

  const regions: DiffRegion[] = [];

  const BLOCK = 18;

  for (let y = 0; y < h; y += BLOCK) {
    let diff = 0;

    for (let x = 0; x < w; x++) {
      for (let dy = 0; dy < BLOCK && y + dy < h; dy++) {
        const i = ((y + dy) * w + x) * 4;

        const dr = Math.abs(dataA[i] - dataB[i]);
        const dg = Math.abs(dataA[i + 1] - dataB[i + 1]);
        const db = Math.abs(dataA[i + 2] - dataB[i + 2]);

        if (dr + dg + db > 30) diff++;
      }
    }

    if (diff > w * BLOCK * 0.02) {
      regions.push({ x: 0, y, w, h: BLOCK, type: 'added' });
    }
  }

  return regions;
}

// ─────────────────────────────────────────
// Draw Highlight
// ─────────────────────────────────────────
function drawOverlay(
  container: HTMLDivElement,
  width: number,
  height: number,
  regions: DiffRegion[]
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  canvas.style.position = 'absolute';

  const ctx = canvas.getContext('2d')!;

  regions.forEach((r) => {
    ctx.fillStyle = 'rgba(29,158,117,0.2)';
    ctx.fillRect(r.x, r.y, r.w, r.h);
  });

  container.appendChild(canvas);
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────
const PDFCompare = () => {
  const [pdfA, setPdfA] = useState<PDFDocumentProxy | null>(null);
  const [pdfB, setPdfB] = useState<PDFDocumentProxy | null>(null);
  const [mode, setMode] = useState<ViewMode>('sidebyside');
  const [loading, setLoading] = useState(false);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initPdfWorker();
  }, []);

  // ───────────────────────────────────────
  // Load PDF
  // ───────────────────────────────────────
  const loadPDF = async (file: File, type: 'A' | 'B') => {
    const data = await file.arrayBuffer();
    // Fix: Ensure data is passed as Uint8Array for pdfjs v4 compatibility
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(data) }).promise;

    type === 'A' ? setPdfA(pdf) : setPdfB(pdf);
  };

  // ───────────────────────────────────────
  // Render
  // ───────────────────────────────────────
  const render = useCallback(async () => {
    if (!pdfA || !pdfB) return;

    setLoading(true);

    const max = Math.max(pdfA.numPages, pdfB.numPages);

    if (mode === 'sidebyside') {
      leftRef.current!.innerHTML = '';
      rightRef.current!.innerHTML = '';
    } else {
      overlayRef.current!.innerHTML = '';
    }

    for (let i = 1; i <= max; i++) {
      const [a, b] = await Promise.all([
        renderPage(pdfA, i),
        renderPage(pdfB, i),
      ]);

      if (mode === 'sidebyside') {
        const wrapA = document.createElement('div');
        const wrapB = document.createElement('div');

        wrapA.style.position = 'relative';
        wrapB.style.position = 'relative';

        if (a) {
          wrapA.appendChild(a.canvas);
        }

        if (b) {
          wrapB.appendChild(b.canvas);
        }

        if (a && b) {
          const regions = computeDiff(a, b);
          drawOverlay(wrapB, b.width, b.height, regions);
        }

        leftRef.current!.appendChild(wrapA);
        rightRef.current!.appendChild(wrapB);
      }

      if (mode === 'overlay' && a && b) {
        const wrap = document.createElement('div');

        wrap.style.position = 'relative';

        a.canvas.style.position = 'absolute';
        b.canvas.style.position = 'absolute';
        b.canvas.style.opacity = '0.5';

        wrap.appendChild(a.canvas);
        wrap.appendChild(b.canvas);

        overlayRef.current!.appendChild(wrap);
      }
    }

    setLoading(false);
  }, [pdfA, pdfB, mode]);

  useEffect(() => {
    render();
  }, [render]);

  // ───────────────────────────────────────
  // UI
  // ───────────────────────────────────────
  if (!pdfA || !pdfB) {
    return (
      <div style={{ display: 'flex', gap: 20 }}>
        <input type="file" onChange={(e) => e.target.files && loadPDF(e.target.files[0], 'A')} />
        <input type="file" onChange={(e) => e.target.files && loadPDF(e.target.files[0], 'B')} />
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => setMode('sidebyside')}>Side</button>
      <button onClick={() => setMode('overlay')}>Overlay</button>

      {loading && <p>Rendering...</p>}

      {mode === 'sidebyside' && (
        <div style={{ display: 'flex' }}>
          <div ref={leftRef} style={{ flex: 1 }} />
          <div ref={rightRef} style={{ flex: 1 }} />
        </div>
      )}

      {mode === 'overlay' && (
        <div ref={overlayRef} />
      )}
    </div>
  );
};

export default PDFCompare;
