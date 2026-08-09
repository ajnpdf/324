'use client';

/**
 * AJN OCR Input Layer
 * Handles unified ingestion of image data from all browser sources.
 */

export async function loadFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = () => reject(new Error("Unsupported image format"));
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function loadFromClipboard(): Promise<File> {
  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      const imageType = item.types.find(t => t.startsWith('image/'));
      if (imageType) {
        const blob = await item.getType(imageType);
        return new File([blob], "clipboard_capture.png", { type: imageType });
      }
    }
    throw new Error("No image data found in clipboard.");
  } catch {
    throw new Error("Clipboard access denied or empty.");
  }
}

export async function loadFromURL(url: string): Promise<HTMLImageElement> {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();
  const file = new File([blob], "url_ingest.jpg", { type: blob.type });
  return loadFromFile(file);
}

/**
 * Accepts File | Blob | URL | ImageBitmap | HTMLVideoElement | HTMLCanvasElement → unified canvas.
 */
export async function normalizeToCanvas(src: any): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  
  if (src instanceof HTMLVideoElement) {
    canvas.width = src.videoWidth;
    canvas.height = src.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(src, 0, 0);
    return canvas;
  }

  if (src instanceof HTMLImageElement) {
    canvas.width = src.width;
    canvas.height = src.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(src, 0, 0);
    return canvas;
  }

  return canvas;
}
