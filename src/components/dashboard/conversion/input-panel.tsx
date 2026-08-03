"use client";

import { 
  X, 
  FileIcon, 
  Trash2, 
  Activity, 
  ShieldCheck, 
  Zap,
  Loader2,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from '@/lib/pdfjs-worker';

interface Props {
  files: File[];
  onRemove: (idx: number) => void;
  onClear: () => void;
  onStart: () => void;
}

/**
 * AJN Input Buffer Panel
 * Professional language refactor.
 * Updated: Real-time thumbnail generation for images and PDFs.
 */
export function InputPanel({ files, onRemove, onClear, onStart }: Props) {
  const [previews, setPreviews] = useState<Record<number, string>>({});

  useEffect(() => {
    const generatePreviews = async () => {
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (previews[i]) continue;

        let url = "";
        if (f.type.startsWith('image/')) {
          url = URL.createObjectURL(f);
        } else if (f.type === 'application/pdf') {
          try {
            initPdfWorker();
            const buffer = await f.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.2 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            url = canvas.toDataURL('image/jpeg', 0.6);
            pdf.destroy();
          } catch (err) {
            console.warn("[AJN] Mini PDF preview failed.");
          }
        }
        
        if (url) {
          setPreviews(prev => ({ ...prev, [i]: url }));
        }
      }
    };

    generatePreviews();
    
    return () => {
      // Note: Object URLs for images are cleaned up here
      Object.values(previews).forEach(u => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
    };
  }, [files]);

  if (files.length === 0) return null;

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const sizeMb = (totalSize / (1024 * 1024)).toFixed(2);

  return (
    <section className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/10">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Input Buffer</h3>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{files.length} Assets Loaded</p>
          </div>
        </div>
        <button 
          onClick={onClear}
          className="text-[10px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest px-4 h-8"
        >
          Clear All
        </button>
      </div>

      <Card className="bg-white/40 backdrop-blur-3xl border-black/5 rounded-[2.5rem] shadow-xl overflow-hidden border-2">
        <CardContent className="p-0">
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-black/5">
              <AnimatePresence mode="popLayout">
                {files.map((file, i) => (
                  <motion.div 
                    key={`${file.name}-${i}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-5 flex items-center justify-between group hover:bg-white/40 transition-all"
                  >
                    <div className="flex items-center gap-5 overflow-hidden">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 group-hover:scale-110 transition-transform overflow-hidden">
                        {previews[i] ? (
                          <img src={previews[i]} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <FileIcon className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="overflow-hidden space-y-0.5">
                        <p className="text-sm font-black truncate text-slate-950 uppercase tracking-tighter">
                          {file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-200" />
                          <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[8px] font-black h-4.5 px-1.5 uppercase">
                            Ready
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onRemove(i)}
                      className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="p-8 bg-white/20 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Aggregate Size</p>
                <p className="text-xl font-black text-slate-900 tabular-nums leading-none">{sizeMb} <span className="text-xs">MB</span></p>
              </div>
              <div className="h-10 w-px bg-black/5" />
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest leading-tight">
                  Local Session <br /> Integrity Verified
                </span>
              </div>
            </div>

            <Button 
              onClick={onStart}
              className="w-full md:w-auto h-14 bg-primary text-white hover:bg-primary/90 font-black text-xs uppercase tracking-widest px-12 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-3 border-2 border-white/20"
            >
              Start Conversion <Zap className="w-4 h-4 fill-current" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
