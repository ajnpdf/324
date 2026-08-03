"use client";

import { useState, useRef } from 'react';
import { Upload, X, FileIcon, ShieldCheck, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Props {
  onFiles: (files: File[]) => void;
  accept?: string;
}

/**
 * AJN DropZone - Optimized Modern UI
 * Professional language refactor.
 */
export function DropZone({ onFiles, accept = "*/*" }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setPreviews(prev => [...prev, ...files]);
    onFiles(files);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPreviews(prev => [...prev, ...files]);
    onFiles(files);
  };

  const removeFile = (idx: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <section className="space-y-6 font-sans">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative min-h-[220px] rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center transition-all duration-700 cursor-pointer group overflow-hidden shadow-2xl",
          isDragging 
            ? "border-primary bg-primary/[0.04] scale-[0.99] shadow-primary/30" 
            : "border-black/5 bg-white/40 hover:border-primary/40 hover:bg-white/60"
        )}
      >
        <input 
          id="dropzone-input" 
          type="file" 
          multiple 
          accept={accept} 
          ref={inputRef} 
          className="hidden" 
          onChange={handleSelect} 
        />
        
        {/* CORNER BRACKETS */}
        {[0, 1, 2, 3].map(i => (
          <motion.div 
            key={i}
            animate={{ opacity: isDragging ? 1 : 0.3 }}
            className="absolute w-8 h-8 border-primary border-solid border-0"
            style={{
              ...(i === 0 && { top: 24, left: 24, borderTopWidth: 3, borderLeftWidth: 3 }),
              ...(i === 1 && { top: 24, right: 24, borderTopWidth: 3, borderRightWidth: 3 }),
              ...(i === 2 && { bottom: 24, left: 24, borderBottomWidth: 3, borderLeftWidth: 3 }),
              ...(i === 3 && { bottom: 24, right: 24, borderBottomWidth: 3, borderRightWidth: 3 }),
            }}
          />
        ))}

        <motion.div 
          animate={{ scale: isDragging ? 1.1 : 1, rotate: isDragging ? 6 : 0 }}
          className={cn(
            "w-16 h-16 bg-white text-black rounded-[1.5rem] flex items-center justify-center shadow-xl transition-all duration-700 relative z-10 border-2 border-black/5",
            isDragging ? "bg-primary text-white border-primary/20" : "group-hover:scale-110 group-hover:-rotate-6"
          )}
        >
          <Upload className="w-7 h-7" />
        </motion.div>
        
        <div className="mt-6 space-y-2 text-center relative z-10 px-8">
          <h3 className="text-xl font-black tracking-tighter text-slate-950 uppercase leading-none">Drop assets for processing</h3>
          <p className="text-[10px] font-black text-slate-950/40 uppercase tracking-[0.4em]">Secure local processing buffer</p>
        </div>

        <div className="absolute bottom-6 flex items-center gap-4 opacity-20 group-hover:opacity-40 transition-opacity">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Local Pipeline</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-slate-950" />
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">In-Session Sync</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {previews.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {previews.map((file, i) => (
              <motion.div 
                key={i}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-white/60 backdrop-blur-2xl border border-black/5 rounded-[1.5rem] flex items-center justify-between group hover:border-primary/40 transition-all shadow-lg"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0 border border-primary/10">
                    <FileIcon className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden space-y-0.5">
                    <p className="text-xs font-black truncate pr-4 text-slate-950 uppercase tracking-tighter">{file.name}</p>
                    <p className="text-[9px] font-black text-slate-950/40 uppercase tracking-widest">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }} 
                  className="h-8 w-8 flex items-center justify-center text-slate-950/20 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
