'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ProgressCallback, ConversionResult } from './pdf-converter';

let ffmpegInstance: FFmpeg | null = null;

/**
 * AJN Professional Audio Conversion Engine
 * Powered by FFmpeg.wasm for local, industrial-grade processing
 */
export class AudioConverter {
  private file: File;
  private onProgress?: ProgressCallback;

  constructor(file: File, onProgress?: ProgressCallback) {
    this.file = file;
    this.onProgress = onProgress;
  }

  private async getFFmpeg() {
    if (ffmpegInstance) return ffmpegInstance;

    const ffmpeg = new FFmpeg();
    
    ffmpeg.on('progress', ({ progress }) => {
      this.onProgress?.(Math.round(progress * 100), `Optimizing audio stream... ${Math.round(progress * 100)}%`);
    });

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    ffmpegInstance = ffmpeg;
    return ffmpeg;
  }

  async convertTo(targetFormat: string, settings: any = {}): Promise<ConversionResult> {
    const ffmpeg = await this.getFFmpeg();
    const baseName = this.file.name.split('.')[0];
    const target = targetFormat.toUpperCase();
    const inputName = `input_${this.file.name}`;
    const outputName = `output.${target.toLowerCase()}`;

    this.onProgress?.(5, "Loading audio buffer into session memory...");
    await ffmpeg.writeFile(inputName, await fetchFile(this.file));

    let args: string[] = ['-i', inputName];
    let mimeType = 'audio/mpeg';

    switch (target) {
      case 'WAV':
        args.push('-acodec', 'pcm_s16le', '-ar', settings.sampleRate || '44100', '-ac', '2', outputName);
        mimeType = 'audio/wav';
        break;
      case 'MP3':
        args.push('-acodec', 'libmp3lame', '-ab', settings.bitrate || '192k', '-ar', '44100', outputName);
        mimeType = 'audio/mpeg';
        break;
      case 'AAC':
        args.push('-acodec', 'aac', '-ab', settings.bitrate || '192k', outputName);
        mimeType = 'audio/aac';
        break;
      case 'OGG':
        args.push('-acodec', 'libvorbis', '-qscale:a', '5', outputName);
        mimeType = 'audio/ogg';
        break;
      case 'FLAC':
        args.push('-acodec', 'flac', '-compression_level', '8', outputName);
        mimeType = 'audio/flac';
        break;
      default:
        args.push('-acodec', 'libmp3lame', '-ab', '192k', outputName);
        mimeType = 'audio/mpeg';
    }

    this.onProgress?.(30, `Executing Professional Transcode: ${target}...`);
    await ffmpeg.exec(args);

    const data = await ffmpeg.readFile(outputName);
    this.onProgress?.(100, "Processing complete.");

    return {
      blob: new Blob([data instanceof Uint8Array ? data.buffer as ArrayBuffer : data], { type: mimeType }),
      fileName: `${baseName}.${target.toLowerCase()}`,
      mimeType
    };
  }
}
