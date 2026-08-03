// _imageUtils.ts — all image processing runs 100% in the browser via Canvas API

/* ─────────────────────────────────────────────────────────────
   CORE HELPERS
───────────────────────────────────────────────────────────── */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = reject;
    img.src = url;
  });
}

export function canvasToBlob(canvas: HTMLCanvasElement | OffscreenCanvas, format: string, quality: number): Promise<Blob> {
  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({
      type: format === "png" ? "image/png" : "image/jpeg",
      quality: quality / 100
    });
  }
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob ? resolve(blob) : reject(new Error("Canvas to blob failed")),
      format === "png" ? "image/png" : "image/jpeg",
      quality / 100,
    );
  });
}

export function getExt(file: File, forceFormat?: string): string {
  if (forceFormat) return forceFormat;
  const n = file.name.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".gif")) return "gif";
  if (n.endsWith(".webp")) return "webp";
  return "jpeg";
}

function clamp(v: number): number { return Math.max(0, Math.min(255, Math.round(v))); }

/* ─────────────────────────────────────────────────────────────
   1. COMPRESS / REDUCE
───────────────────────────────────────────────────────────── */
export async function compressImage(file: File, quality: number, format: string): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas, format, quality);
}

/* ─────────────────────────────────────────────────────────────
   2. RESIZE
───────────────────────────────────────────────────────────── */
export async function resizeImage(
  file: File, targetW: number, targetH: number, maintainAspect: boolean
): Promise<Blob> {
  const img = await loadImage(file);
  let w = targetW || img.naturalWidth;
  let h = targetH || img.naturalHeight;

  if (maintainAspect) {
    const ar = img.naturalWidth / img.naturalHeight;
    if (targetW && targetH) {
      if (w / h > ar) w = Math.round(h * ar);
      else h = Math.round(w / ar);
    } else if (targetW) {
      h = Math.round(w / ar);
    } else if (targetH) {
      w = Math.round(h * ar);
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   3. CROP
───────────────────────────────────────────────────────────── */
export async function cropImage(file: File, x: number, y: number, w: number, h: number): Promise<Blob> {
  const img = await loadImage(file);
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const sx = Math.max(0, Math.min(x, iw - 1));
  const sy = Math.max(0, Math.min(y, ih - 1));
  const sw = Math.max(1, Math.min(w, iw - sx));
  const sh = Math.max(1, Math.min(h, ih - sy));

  const canvas = document.createElement("canvas");
  canvas.width = sw; canvas.height = sh;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   4. ROTATE
───────────────────────────────────────────────────────────── */
export async function rotateImage(file: File, angleDeg: number): Promise<Blob> {
  const img = await loadImage(file);
  const rad = (angleDeg * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
  const w = Math.round(img.naturalWidth * cos + img.naturalHeight * sin);
  const h = Math.round(img.naturalWidth * sin + img.naturalHeight * cos);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.translate(w / 2, h / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   5. WATERMARK IMAGE
───────────────────────────────────────────────────────────── */
export async function watermarkImage(
  file: File, text: string, opacity: number, fontSize: number, color: string, position: string
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const fs = fontSize || Math.max(24, Math.round(img.naturalWidth / 12));
  ctx.font = `bold ${fs}px Arial, sans-serif`;
  ctx.globalAlpha = opacity;
  const tw = ctx.measureText(text).width;
  const margin = 20;

  let x = 0, y = 0;
  switch (position) {
    case "top-left":     x = margin; y = fs + margin; break;
    case "top-center":   x = (img.naturalWidth - tw) / 2; y = fs + margin; break;
    case "top-right":    x = img.naturalWidth - tw - margin; y = fs + margin; break;
    case "center":       x = (img.naturalWidth - tw) / 2; y = (img.naturalHeight + fs) / 2; break;
    case "bottom-left":  x = margin; y = img.naturalHeight - margin; break;
    case "bottom-right": x = img.naturalWidth - tw - margin; y = img.naturalHeight - margin; break;
    default:             x = (img.naturalWidth - tw) / 2; y = img.naturalHeight - margin;
  }

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 4; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   6. ENHANCE (upscale + sharpen)
───────────────────────────────────────────────────────────── */
export async function enhanceImage(file: File, scale: number): Promise<Blob> {
  const img = await loadImage(file);
  const w = img.naturalWidth * scale, h = img.naturalHeight * scale;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);

  // Sharpen via convolution
  const imageData = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(imageData.data);
  const dst = imageData.data;
  const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * w + (x + kx)) * 4 + c;
            sum += src[idx] * kernel[(ky + 1) * 3 + (kx + 1)];
          }
        }
        dst[(y * w + x) * 4 + c] = Math.max(0, Math.min(255, sum));
      }
    }
  }
  ctx.putImageData(imageData, 0, 0);
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   7. REMOVE BACKGROUND (corner-color based)
───────────────────────────────────────────────────────────── */
export async function removeBackground(file: File, threshold: number): Promise<Blob> {
  const img = await loadImage(file);
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  // Sample background from 4 corners
  const corners = [[0,0],[w-1,0],[0,h-1],[w-1,h-1]].map(([cx,cy]) => {
    const i = (cy * w + cx) * 4;
    return [px[i], px[i+1], px[i+2]];
  });
  const bgR = corners.reduce((s,c) => s + c[0], 0) / 4;
  const bgG = corners.reduce((s,c) => s + c[1], 0) / 4;
  const bgB = corners.reduce((s,c) => s + c[2], 0) / 4;

  for (let i = 0; i < px.length; i += 4) {
    const dr = px[i] - bgR, dg = px[i+1] - bgG, db = px[i+2] - bgB;
    const dist = Math.sqrt(dr*dr + dg*dg + db*db);
    if (dist < threshold) px[i+3] = 0; // transparent
  }
  ctx.putImageData(data, 0, 0);
  return canvasToBlob(canvas, "png", 100);
}

/* ─────────────────────────────────────────────────────────────
   8. BLUR REGION
───────────────────────────────────────────────────────────── */
export async function blurRegion(
  file: File, x: number, y: number, w: number, h: number, radius: number
): Promise<Blob> {
  const img = await loadImage(file);
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = iw; canvas.height = ih;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const sx = Math.max(0, x), sy = Math.max(0, y);
  const sw = Math.min(w, iw - sx), sh = Math.min(h, ih - sy);

  // Pixelate as a simple "blur" (works everywhere without CSS filter quirks)
  const px = Math.max(4, radius);
  const region = ctx.getImageData(sx, sy, sw, sh);
  const rd = region.data;

  for (let by = 0; by < sh; by += px) {
    for (let bx = 0; bx < sw; bx += px) {
      const idx = (by * sw + bx) * 4;
      const r = rd[idx], g = rd[idx+1], b = rd[idx+2];
      for (let py2 = 0; py2 < px && by + py2 < sh; py2++) {
        for (let px2 = 0; px2 < px && bx + px2 < sw; px2++) {
          const ii = ((by + py2) * sw + (bx + px2)) * 4;
          rd[ii] = r; rd[ii+1] = g; rd[ii+2] = b;
        }
      }
    }
  }
  ctx.putImageData(region, sx, sy);
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   9. PHOTO EDITOR (brightness, contrast, filter)
───────────────────────────────────────────────────────────── */
export async function editPhoto(
  file: File, settings: any
): Promise<Blob> {
  const img = await loadImage(file);
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;

  const { brightness = 1, contrast = 1, filter = 'none' } = settings;

  for (let i = 0; i < px.length; i += 4) {
    let r = px[i], g = px[i+1], b = px[i+2];

    // Brightness
    r = r * brightness; g = g * brightness; b = b * brightness;

    // Contrast
    r = (r - 128) * contrast + 128;
    g = (g - 128) * contrast + 128;
    b = (b - 128) * contrast + 128;

    // Filter
    if (filter === "grayscale") {
      const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
      r = g = b = gray;
    } else if (filter === "sepia") {
      const nr = clamp(r*0.393 + g*0.769 + b*0.189);
      const ng = clamp(r*0.349 + g*0.686 + b*0.168);
      const nb = clamp(r*0.272 + g*0.534 + b*0.131);
      r = nr; g = ng; b = nb;
    } else if (filter === "invert") {
      r = 255 - r; g = 255 - g; b = 255 - b;
    }

    px[i] = clamp(r); px[i+1] = clamp(g); px[i+2] = clamp(b);
  }
  ctx.putImageData(data, 0, 0);
  return canvasToBlob(canvas, getExt(file), 93);
}

/* ─────────────────────────────────────────────────────────────
   10. MEME MAKER
───────────────────────────────────────────────────────────── */
export async function makeMeme(file: File, top: string, bottom: string, fontSize: number): Promise<Blob> {
  const img = await loadImage(file);
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0);

  const fs = fontSize > 0 ? fontSize : Math.max(24, Math.round(w / 10));
  const drawMemeText = (text: string, yPos: number) => {
    ctx.font = `900 ${fs}px Impact, "Arial Narrow", Arial, sans-serif`;
    ctx.textAlign = "center";
    const outW = Math.max(3, Math.round(fs / 12));
    ctx.lineWidth = outW * 2;
    ctx.strokeStyle = "#000";
    ctx.strokeText(text, w / 2, yPos);
    ctx.fillStyle = "#fff";
    ctx.fillText(text, w / 2, yPos);
  };

  if (top) drawMemeText(top.toUpperCase(), fs + 10);
  if (bottom) drawMemeText(bottom.toUpperCase(), h - 14);

  return canvasToBlob(canvas, getExt(file), 93);
}

/* ─────────────────────────────────────────────────────────────
   11. FLIP IMAGE
───────────────────────────────────────────────────────────── */
export async function flipImage(file: File, horizontal: boolean, vertical: boolean): Promise<Blob> {
  const img = await loadImage(file);
  const w = img.naturalWidth, h = img.naturalHeight;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.translate(horizontal ? w : 0, vertical ? h : 0);
  ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas, getExt(file), 92);
}

/* ─────────────────────────────────────────────────────────────
   12. CONVERT FORMAT
───────────────────────────────────────────────────────────── */
export async function convertImageFormat(file: File, toFormat: string, quality: number): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  if (toFormat !== "png") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(img, 0, 0);
  return canvasToBlob(canvas, toFormat, quality);
}
