"use client";

import { useState, useEffect } from 'react';
import { OriginalPanel } from './original-panel';
import { ControlsPanel } from './controls-panel';
import { PreviewPanel } from './preview-panel';
import { ImageFile, ImageSettings, ImageMetadata } from './types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Download, Share2, History } from 'lucide-react';
import Link from 'next/link';

const MOCK_IMAGE: ImageFile = {
  id: 'img-1',
  name: 'Product_Shoot_Hero.jpg',
  url: 'https://picsum.photos/seed/img1/1200/800',
  metadata: {
    format: 'JPEG',
    width: 1920,
    height: 1080,
    size: '4.2 MB',
    dpi: 300,
    colorMode: 'RGB',
    cameraInfo: {
      model: 'Sony A7R IV',
      iso: '100',
      aperture: 'f/2.8',
      shutter: '1/200s'
    }
  }
};

export function ImageEditor({ initialFileId }: { initialFileId: string | null }) {
  const [image, setImage] = useState<ImageFile>(MOCK_IMAGE);
  const [settings, setSettings] = useState<ImageSettings>({
    width: 1920,
    height: 1080,
    lockAspectRatio: true,
    unit: 'px',
    compressMode: 'lossy',
    quality: 85,
    cropRatio: 'Free',
    brightness: 0,
    contrast: 0,
    saturation: 0,
    sharpness: 0,
    exposure: 0,
    rotation: 0,
    flipH: false,
    flipV: false,
    watermarkType: 'text',
    watermarkText: 'AJN Workspace',
    watermarkPosition: 'bottom-right',
    watermarkOpacity: 50,
    removeBg: false,
    replaceBgColor: 'transparent',
    outputFormat: 'WebP',
    outputDpi: 300,
    stripMetadata: false,
    upscaleFactor: 1,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'after' | 'before' | 'split'>('after');

  const handleReset = () => {
    setSettings({
      ...settings,
      brightness: 0,
      contrast: 0,
      saturation: 0,
      sharpness: 0,
      exposure: 0,
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/5">
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Button>
          </Link>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">{image.name}</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">AJN Intelligent Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-xs font-bold">
            <History className="w-3.5 h-3.5" /> HISTORY
          </Button>
          <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-xs font-bold">
            <Share2 className="w-3.5 h-3.5" /> SHARE
          </Button>
          <Button className="h-9 gap-2 bg-primary hover:bg-primary/90 text-xs font-black shadow-lg shadow-primary/20 px-6">
            <Save className="w-3.5 h-3.5" /> SAVE WORKSPACE
          </Button>
          <Button className="h-9 gap-2 bg-emerald-500 hover:bg-emerald-600 text-xs font-black shadow-lg shadow-emerald-500/20 px-6">
            <Download className="w-3.5 h-3.5" /> DOWNLOAD
          </Button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel - Original */}
        <OriginalPanel image={image} />

        {/* Center Panel - Controls */}
        <ControlsPanel 
          settings={settings} 
          setSettings={setSettings} 
          onReset={handleReset}
        />

        {/* Right Panel - Preview */}
        <PreviewPanel 
          image={image} 
          settings={settings}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
    </div>
  );
}
