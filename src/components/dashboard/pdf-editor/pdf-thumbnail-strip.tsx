"use client";

import { PDFPage } from './types';
import { cn } from '@/lib/utils';
import { RotateCw, Trash2, Plus, GripVertical, Download, ExternalLink, Activity, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRef } from 'react';

interface Props {
  pages: PDFPage[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  onRotate: (idx: number) => void;
  onAdd: (files: File[]) => void;
  onReorder: (from: number, to: number) => void;
}

/**
 * AJN Advanced Thumbnail Explorer
 * Universal Page Management Layer
 */
export function PDFThumbnailStrip({ pages, activeIdx, onSelect, onRotate, onAdd, onReorder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-[240px] h-full border-r border-black/5 bg-white/40 backdrop-blur-xl flex flex-col shrink-0 z-[90] shadow-sm">
      <div className="p-5 border-b border-black/5 flex items-center justify-between bg-white/20">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">Pages</h3>
          </div>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{pages.length} Pages Active</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => fileInputRef.current?.click()}
          className="h-9 w-9 rounded-xl border-primary/20 text-primary bg-primary/5 hover:bg-primary hover:text-white transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
        </Button>
        <input 
          type="file" 
          multiple 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={(e) => e.target.files && onAdd(Array.from(e.target.files))} 
        />
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-10">
          {pages.map((page, idx) => (
            <div 
              key={page.id} 
              className="space-y-4 group relative"
              onClick={() => onSelect(idx)}
            >
              <div className="absolute -left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab p-1">
                <GripVertical className="w-4 h-4 text-slate-300" />
              </div>

              <div className={cn(
                "aspect-[1/1.414] bg-white rounded-2xl border-4 transition-all duration-500 cursor-pointer relative overflow-hidden shadow-xl",
                activeIdx === idx 
                  ? "border-primary ring-8 ring-primary/5 scale-[1.02]" 
                  : "border-transparent grayscale-[0.4] opacity-60 hover:border-black/5 hover:grayscale-0 hover:opacity-100"
              )}>
                {page.previewUrl ? (
                  <img 
                    src={page.previewUrl} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                    style={{ transform: `rotate(${page.rotation}deg)` }}
                    alt="" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-slate-200 animate-pulse" />
                  </div>
                )}

                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur text-[9px] font-black text-white rounded-lg border border-white/10 shadow-2xl">
                  {idx + 1}
                </div>

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={(e) => { e.stopPropagation(); onRotate(idx); }}
                    className="h-8 w-8 bg-white/20 backdrop-blur border-none text-white hover:bg-primary"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/20 backdrop-blur border-none text-white hover:bg-red-500">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", activeIdx === idx ? "bg-primary animate-pulse" : "bg-slate-200")} />
                <p className={cn(
                  "text-[9px] font-black transition-colors uppercase tracking-[0.3em]",
                  activeIdx === idx ? "text-primary" : "text-slate-400"
                )}>
                  Page {idx + 1}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-5 border-t border-black/5 bg-white/20 space-y-3">
        <Button variant="outline" className="w-full h-11 border-black/5 bg-white text-[9px] font-black uppercase tracking-[0.2em] gap-3 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm">
          <Download className="w-4 h-4" /> Bulk Export
        </Button>
        <p className="text-[8px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed px-4">
          Append additional files via the plus unit above.
        </p>
      </div>
    </aside>
  );
}
