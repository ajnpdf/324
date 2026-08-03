
export interface ImageMetadata {
  format: string;
  width: number;
  height: number;
  size: string;
  dpi: number;
  colorMode: 'RGB' | 'CMYK' | 'Grayscale';
  cameraInfo?: {
    model: string;
    iso: string;
    aperture: string;
    shutter: string;
  };
}

export interface ImageSettings {
  // Resize
  width: number;
  height: number;
  lockAspectRatio: boolean;
  unit: 'px' | '%' | 'in' | 'cm';
  // Compression
  compressMode: 'lossy' | 'lossless';
  quality: number;
  // Crop
  cropRatio: string;
  // Enhance
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
  exposure: number;
  // Transform
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  // Watermark
  watermarkType: 'text' | 'image';
  watermarkText: string;
  watermarkPosition: string;
  watermarkOpacity: number;
  // Background
  removeBg: boolean;
  replaceBgColor: string;
  // Export
  outputFormat: 'JPG' | 'PNG' | 'WebP' | 'AVIF' | 'TIFF' | 'BMP';
  outputDpi: number;
  stripMetadata: boolean;
  // Upscale
  upscaleFactor: 1 | 2 | 4;
}

export interface ImageFile {
  id: string;
  name: string;
  url: string;
  metadata: ImageMetadata;
}
