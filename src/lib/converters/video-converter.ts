'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { ProgressCallback, ConversionResult } from './pdf-converter';

let ffmpegInstance: FFmpeg | null = null;

/**
 * AJN Professional Video Conversion Engine
 * Powered by FFmpeg.wasm for local, industrial-grade processing
 */
export class VideoConverter {
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
      this.onProgress?.(Math.round(progress * 100), `Encoding frames... ${Math.round(progress * 100)}%`);
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

    this.onProgress?.(5, "Loading video buffer into session memory...");
    await ffmpeg.writeFile(inputName, await fetchFile(this.file));

    let args: string[] = ['-i', inputName];
    let mimeType = 'video/mp4';

    switch (target) {
      case 'AVI':
        args.push('-c:v', 'libx264', '-c:a', 'mp3', outputName);
        mimeType = 'video/x-msvideo';
        break;
      case 'MOV':
        args.push('-c:v', 'copy', '-c:a', 'copy', outputName);
        mimeType = 'video/quicktime';
        break;
      case 'MKV':
        args.push('-c:v', 'copy', '-c:a', 'copy', outputName);
        mimeType = 'video/x-matroska';
        break;
      case 'WEBM':
        args.push('-c:v', 'libvpx-vp9', '-crf', '30', '-b:v', '0', '-c:a', 'libopus', outputName);
        mimeType = 'video/webm';
        break;
      case 'MP4':
        args.push('-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', outputName);
        mimeType = 'video/mp4';
        break;
      case 'GIF':
        this.onProgress?.(20, "Analyzing color palette...");
        await ffmpeg.exec(['-i', inputName, '-ss', '00:00:00', '-t', '10', '-vf', 'fps=10,scale=480:-1:flags=lanczos,palettegen', 'palette.png']);
        args = ['-i', inputName, '-i', 'palette.png', '-ss', '00:00:00', '-t', '10', '-filter_complex', 'fps=10,scale=480:-1:flags=lanczos[x];[x][1:v]paletteuse', '-loop', '0', outputName];
        mimeType = 'image/gif';
        break;
      case 'MP3':
        args.push('-vn', '-acodec', 'libmp3lame', '-ab', '192k', '-ar', '44100', outputName);
        mimeType = 'audio/mpeg';
        break;
      case 'WAV':
        args.push('-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', outputName);
        mimeType = 'audio/wav';
        break;
      case 'AAC':
        args.push('-vn', '-acodec', 'aac', '-ab', '192k', outputName);
        mimeType = 'audio/aac';
        break;
      default:
        args.push('-c:v', 'libx264', '-c:a', 'aac', outputName);
        mimeType = 'video/mp4';
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
