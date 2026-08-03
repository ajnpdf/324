
"use client";

import { ImageFile } from './types';
import { Info, Maximize2, Camera, MapPin, Replace } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function OriginalPanel({ image }: { image: ImageFile }) {
  return (
    <aside className="w-[380px] h-full border-r border-white/5 bg-background/20 backdrop-blur-xl flex flex-col shrink-0 overflow-y-auto scrollbar-hide">
      <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-background/60 backdrop-blur-md z-10">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Original Source</h3>
        <Badge variant="outline" className="text-[9px] border-primary/20 text-primary">MASTER FILE</Badge>
      </div>

      <div className="p-6 space-y-8">
        {/* Image Display */}
        <div className="aspect-[3/2] bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group">
          <Image 
            src={image.url} 
            alt="Original" 
            fill 
            className="object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/40 backdrop-blur border-white/10 rounded-lg">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 bg-black/40 backdrop-blur border-white/10 rounded-lg text-[10px] font-bold">
                VIEW FULL-RES
              </Button>
            </div>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Format</p>
            <p className="text-xs font-bold">{image.metadata.format}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Dimensions</p>
            <p className="text-xs font-bold">{image.metadata.width} × {image.metadata.height} px</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Size</p>
            <p className="text-xs font-bold">{image.metadata.size}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Color Mode</p>
            <p className="text-xs font-bold">{image.metadata.colorMode}</p>
          </div>
        </div>

        {/* EXIF Data */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="exif" className="border-white/5 px-0">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">EXIF Analysis</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-4">
              <div className="grid gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Camera</span>
                  <span className="text-xs font-bold">{image.metadata.cameraInfo?.model}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">ISO</span>
                  <span className="text-xs font-bold">{image.metadata.cameraInfo?.iso}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Aperture</span>
                  <span className="text-xs font-bold">{image.metadata.cameraInfo?.aperture}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Shutter</span>
                  <span className="text-xs font-bold">{image.metadata.cameraInfo?.shutter}</span>
                </div>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">GPS DATA EMBEDDED</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 text-[9px] font-black text-primary hover:bg-primary/20">STRIP GPS</Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <Button variant="outline" className="w-full h-11 border-white/10 bg-white/5 hover:bg-white/10 gap-2 font-black text-[10px] tracking-widest">
          <Replace className="w-4 h-4" /> REPLACE SOURCE IMAGE
        </Button>
      </div>
    </aside>
  );
}
