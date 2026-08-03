'use client';

/**
 * AJN OCR Bounding Box Renderer (Module 7)
 * High-fidelity spatial visualization layer.
 */

export interface BBoxOptions {
  showWords?: boolean;
  showLines?: boolean;
  showBlocks?: boolean;
  confidenceThreshold?: number;
}

export function drawBoundingBoxes(
  canvas: HTMLCanvasElement, 
  result: any, 
  options: BBoxOptions = { showWords: true, confidenceThreshold: 40 }
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Confidence-based color mapping (Surgical Standard)
  const getColor = (conf: number) => {
    if (conf >= 80) return "rgba(34, 197, 94, 0.6)";   // Emerald-500 (Good)
    if (conf >= 50) return "rgba(234, 179, 8, 0.6)";    // Yellow-500 (Medium)
    return "rgba(239, 68, 68, 0.6)";                   // Red-500 (Low)
  };

  if (options.showBlocks && result.blocks) {
    result.blocks.forEach((b: any) => {
      ctx.strokeStyle = "rgba(59, 130, 246, 0.8)"; // Blue-500 for Blocks
      ctx.lineWidth = 2;
      const { x0, y0, x1, y1 } = b.bbox;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    });
  }

  if (options.showLines && result.lines) {
    result.lines.forEach((l: any) => {
      ctx.strokeStyle = "rgba(168, 85, 247, 0.8)"; // Purple-500 for Lines
      ctx.lineWidth = 1.5;
      const { x0, y0, x1, y1 } = l.bbox;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    });
  }

  if (options.showWords && result.words) {
    result.words.forEach((w: any) => {
      if (w.confidence < (options.confidenceThreshold || 0)) return;
      
      ctx.strokeStyle = getColor(w.confidence);
      ctx.lineWidth = 1;
      const { x0, y0, x1, y1 } = w.bbox;
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      
      // Subtle confidence dot
      ctx.fillStyle = getColor(w.confidence);
      ctx.beginPath();
      ctx.arc(x0, y0, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
