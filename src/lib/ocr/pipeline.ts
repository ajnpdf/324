'use client';

/**
 * AJN OCR Preprocessing Pipeline
 * Mathematical image manipulation for maximum neural recognition accuracy.
 */

export interface PreprocessConfig {
  grayscale: boolean;
  threshold: boolean;
  thresholdValue: number;
  autoThreshold: boolean;
  sharpen: boolean;
  contrast: number; // -100 to 100
  brightness: number; // -100 to 100
  denoise: boolean;
  upscale: boolean;
  deskew: boolean;
}

export const DEFAULT_CONFIG: PreprocessConfig = {
  grayscale: true,
  threshold: true,
  thresholdValue: 128,
  autoThreshold: true,
  sharpen: true,
  contrast: 20,
  brightness: 0,
  denoise: true,
  upscale: true,
  deskew: true
};

export async function applyPipeline(canvas: HTMLCanvasElement, config: PreprocessConfig): Promise<HTMLCanvasElement> {
  let workCanvas = canvas;

  // 1. UPSCALE (Industrial 300 DPI target)
  if (config.upscale && workCanvas.width < 2000) {
    workCanvas = upscale(workCanvas, 2);
  }

  // 2. DESKEW (Mathematical Alignment)
  if (config.deskew) {
    workCanvas = deskew(workCanvas);
  }

  const ctx = workCanvas.getContext('2d', { willReadFrequently: true })!;
  let imageData = ctx.getImageData(0, 0, workCanvas.width, workCanvas.height);

  // 3. GRAYSCALE
  if (config.grayscale) {
    imageData = toGrayscale(imageData);
  }

  // 4. DENOISE (Median Filter)
  if (config.denoise) {
    imageData = medianFilter(imageData);
  }

  // 5. CONTRAST & BRIGHTNESS
  if (config.contrast !== 0 || config.brightness !== 0) {
    imageData = applyAdjustments(imageData, config.contrast, config.brightness);
  }

  // 6. THRESHOLD (Otsu's Method)
  if (config.threshold) {
    const t = config.autoThreshold ? computeOtsuThreshold(imageData) : config.thresholdValue;
    imageData = applyThreshold(imageData, t);
  }

  ctx.putImageData(imageData, 0, 0);

  // 7. SHARPEN
  if (config.sharpen) {
    sharpen(workCanvas);
  }

  return workCanvas;
}

function toGrayscale(imgData: ImageData): ImageData {
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = data[i + 1] = data[i + 2] = avg;
  }
  return imgData;
}

function computeOtsuThreshold(imgData: ImageData): number {
  const data = imgData.data;
  const hist = new Array(256).fill(0);
  for (let i = 0; i < data.length; i += 4) hist[Math.round(data[i])]++;

  const total = data.length / 4;
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (wB === 0) continue;
    wF = total - wB;
    if (wF === 0) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }
  return threshold;
}

function applyThreshold(imgData: ImageData, t: number): ImageData {
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const val = data[i] > t ? 255 : 0;
    data[i] = data[i + 1] = data[i + 2] = val;
  }
  return imgData;
}

function applyAdjustments(imgData: ImageData, contrast: number, brightness: number): ImageData {
  const data = imgData.data;
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  for (let i = 0; i < data.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      const val = factor * (data[i + j] + brightness - 128) + 128;
      data[i + j] = Math.min(255, Math.max(0, val));
    }
  }
  return imgData;
}

function medianFilter(imgData: ImageData): ImageData {
  const data = imgData.data;
  const width = imgData.width;
  const height = imgData.height;
  const output = new Uint8ClampedArray(data.length);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const neighbors = [];
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          neighbors.push(data[((y + ky) * width + (x + kx)) * 4]);
        }
      }
      neighbors.sort((a, b) => a - b);
      const median = neighbors[4];
      output[idx] = output[idx + 1] = output[idx + 2] = median;
      output[idx + 3] = data[idx + 3];
    }
  }
  data.set(output);
  return imgData;
}

function deskew(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const binary = new Uint8Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    binary[i / 4] = lum < 128 ? 1 : 0;
  }

  let maxVariance = -1;
  let bestAngle = 0;

  for (let angle = -5; angle <= 5; angle += 0.5) {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    
    const histogram = new Float32Array(height);
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        if (binary[y * width + x]) {
          const rotY = Math.round(-x * sin + y * cos);
          if (rotY >= 0 && rotY < height) histogram[rotY]++;
        }
      }
    }

    let sum = 0, sumSq = 0;
    for (let i = 0; i < height; i++) {
      sum += histogram[i];
      sumSq += histogram[i] * histogram[i];
    }
    const variance = (sumSq - (sum * sum) / height) / height;

    if (variance > maxVariance) {
      maxVariance = variance;
      bestAngle = angle;
    }
  }

  if (Math.abs(bestAngle) < 0.1) return canvas;

  const resCanvas = document.createElement('canvas');
  resCanvas.width = width; resCanvas.height = height;
  const resCtx = resCanvas.getContext('2d')!;
  resCtx.translate(width / 2, height / 2);
  resCtx.rotate((-bestAngle * Math.PI) / 180);
  resCtx.drawImage(canvas, -width / 2, -height / 2);
  return resCanvas;
}

function upscale(canvas: HTMLCanvasElement, factor: number): HTMLCanvasElement {
  const newCanvas = document.createElement('canvas');
  newCanvas.width = canvas.width * factor;
  newCanvas.height = canvas.height * factor;
  const ctx = newCanvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, newCanvas.width, newCanvas.height);
  return newCanvas;
}

function sharpen(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  const w = canvas.width;
  const h = canvas.height;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const s = src.data;
  const d = dst.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        let res = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            res += s[((y + ky) * w + (x + kx)) * 4 + c] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        d[idx + c] = Math.min(255, Math.max(0, res));
      }
      d[idx + 3] = 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
}
