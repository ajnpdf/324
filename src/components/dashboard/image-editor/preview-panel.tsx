
"use client";

import { ImageFile, ImageSettings } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layers, Maximize2, Wand2, Download, Save, Split, Eye, Move, History } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  image: ImageFile;
  settings: ImageSettings;
  viewMode: 'after' | 'before' | 'split';
  setViewMode: (v: 'after' | 'before' | 'split') => void;
}

export function PreviewPanel({ image, settings, viewMode, setViewMode }: Props) {
  return (
    <main className="flex-[2] h-full bg-[#1a1f2e] flex flex-col min-w-0 overflow-hidden relative">
      {/* View Toolbar */}
      <div className="h-14 border-b border-white/5 bg-background/20 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList className="bg-black/20 border border-white/10 p-1 h-9">
              <TabsTrigger value="after" className="text-[9px] font-black uppercase tracking-widest h-7 gap-2">
                <Eye className="w-3 h-3" /> AFTER
              </TabsTrigger>
              <TabsTrigger value="before" className="text-[9px] font-black uppercase tracking-widest h-7 gap-2">
                <History className="w-3 h-3" /> BEFORE
              </TabsTrigger>
              <TabsTrigger value="split" className="text-[9px] font-black uppercase tracking-widest h-7 gap-2">
                <Split className="w-3 h-3" /> SPLIT VIEW
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-3 h-3" /> OUTPUT: {settings.outputFormat} @ {settings.outputDpi} DPI
          </div>
          <Button size="icon" variant="ghost" className="h-9 w-9 bg-white/5 rounded-lg">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] overflow-hidden flex items-center justify-center p-12">
        <div className="relative w-full h-full max-w-4xl shadow-2xl rounded-sm overflow-hidden bg-card/40 border border-white/5">
          
          {/* Output Preview */}
          <div className="relative w-full h-full">
             <Image 
                src={image.url} 
                alt="Preview" 
                fill 
                className={cn(
                  "object-contain transition-all duration-300",
                  viewMode === 'before' && "grayscale opacity-60"
                )} 
                style={{
                  filter: `
                    brightness(${1 + settings.brightness / 100}) 
                    contrast(${1 + settings.contrast / 100}) 
                    saturate(${1 + settings.saturation / 100})
                  `,
                  transform: `rotate(${settings.rotation}deg) scaleX(${settings.flipH ? -1 : 1}) scaleY(${settings.flipV ? -1 : 1})`
                }}
             />

             {/* Split View Line Placeholder */}
             {viewMode === 'split' && (
               <div className="absolute inset-y-0 left-1/2 w-0.5 bg-primary/50 backdrop-blur-sm z-10 cursor-col-resize flex items-center justify-center">
                  <div className="h-10 w-6 bg-primary rounded-full flex items-center justify-center shadow-xl">
                    <Move className="w-3 h-3 text-white" />
                  </div>
               </div>
             )}

             {/* Watermark Placeholder */}
             {settings.watermarkText && (
               <div className={cn(
                 "absolute p-8 pointer-events-none select-none",
                 settings.watermarkPosition === 'bottom-right' && "bottom-0 right-0",
                 settings.watermarkPosition === 'top-right' && "top-0 right-0",
                 settings.watermarkPosition === 'center' && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
               )} style={{ opacity: settings.watermarkOpacity / 100 }}>
                  <p className="text-4xl font-black text-white/20 border-2 border-white/5 px-4 py-2 rotate-[-12deg] tracking-tighter uppercase whitespace-nowrap">
                    {settings.watermarkText}
                  </p>
               </div>
             )}
          </div>
        </div>
        
        {/* Floating Quick Action */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="bg-background/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 flex items-center gap-2 shadow-2xl">
            <div className="px-4 py-2 space-y-0.5">
               <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Live Output Size</p>
               <p className="text-sm font-black text-emerald-500">420 KB <span className="text-[10px] opacity-70 ml-1">(-68%)</span></p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <Button className="h-10 bg-primary hover:bg-primary/90 text-xs font-black px-6 gap-2">
              <Download className="w-4 h-4" /> DOWNLOAD NOW
            </Button>
          </div>
        </div>
      </div>

      {/* AI Upscale Info Bubble */}
      {settings.upscaleFactor > 1 && (
        <div className="absolute top-20 right-8 animate-in slide-in-from-right-4">
          <Badge className="bg-primary/20 text-primary border-primary/20 p-3 h-auto flex flex-col items-start gap-1 backdrop-blur-xl">
             <div className="flex items-center gap-2">
               <Wand2 className="w-3.5 h-3.5" />
               <span className="text-[10px] font-black uppercase">AI Upscale Active ({settings.upscaleFactor}x)</span>
             </div>
             <p className="text-[9px] opacity-70">Target: {settings.width * settings.upscaleFactor} × {settings.height * settings.upscaleFactor} px</p>
          </Badge>
        </div>
      )}
    </main>
  );
}
