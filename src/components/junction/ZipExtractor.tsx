"use client";

import React, { useState, useRef } from "react";
import JSZip from 'jszip';
import { 
  FileArchive, 
  CheckCircle2, 
  Download, 
  Loader2, 
  Activity,
  X,
  FileText,
  RefreshCcw,
  Zap,
  ShieldCheck,
  Upload,
  Plus,
  ArrowRight,
  FolderOpen,
  FileIcon,
  ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes } from './_shared';

interface ArchiveItem {
  name: string;
  size: string;
  blob: Blob;
  type: string;
}

/**
 * AJN Professional ZIP Extractor - Production v5.0
 * Features: Multi-file Extraction, Local Decompression, and Recursive Ingestion.
 */
export default function ZipExtractor() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [phase, setPhase] = useState<'upload' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processArchive(f);
  };

  const processArchive = async (f: File) => {
    setFile(f);
    setPhase('processing');
    setProgress(0);
    setStatus("Unpacking archive container...");

    try {
      const zip = await JSZip.loadAsync(await f.arrayBuffer());
      const entries = Object.keys(zip.files).filter(name => !zip.files[name].dir);
      const total = entries.length;
      
      const newItems: ArchiveItem[] = [];
      for (let i = 0; i < total; i++) {
        const name = entries[i];
        const entry = zip.files[name];
        const blob = await entry.async("blob");
        
        newItems.push({
          name,
          blob,
          size: fmtBytes(blob.size),
          type: name.split('.').pop()?.toUpperCase() || "UNK"
        });
        
        setProgress(Math.round(((i + 1) / total) * 100));
        setStatus(`Deflating ${name}...`);
      }

      setItems(newItems);
      setPhase('done');
    } catch (err) {
      setPhase('upload');
      toast({ title: "Extraction failed", description: "Corrupted archive or invalid signature.", variant: "destructive" });
    }
  };

  const getIcon = (type: string) => {
    if (['JPG', 'PNG', 'WEBP', 'GIF'].includes(type)) return <ImageIcon className="w-5 h-5 text-blue-500" />;
    if (type === 'PDF') return <FileText className="w-5 h-5 text-red-500" />;
    return <FileIcon className="w-5 h-5 text-slate-400" />;
  };

  const reset = () => { setFile(null); setItems([]); setPhase('upload'); setProgress(0); };

  return (
    <ToolWorkspace title="ZIP Extractor" description="PROFESSIONAL LOCAL DECOMPRESSION" icon="📦" badge="ARCHIVE UNIT" accent="#7C3AED">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if(f) processArchive(f); }}
                className={cn(
                  "group relative h-[340px] w-full rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-primary bg-primary/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" accept=".zip,.rar,.7z" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <FileArchive className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop Archive to Extract</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Stays Private on Your Device</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{status}</span><span className="text-xl font-black text-primary tracking-tighter">{progress}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10 pb-32">
              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10">
                       <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Extraction Ready</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{items.length} Files correctly deflated</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={reset} className="h-12 px-8 rounded-xl font-black text-[10px] uppercase gap-2 border-black/5 bg-white hover:bg-black/5 shadow-sm">
                       <RefreshCcw className="w-4 h-4" /> New Archive
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <Card className="bg-white/40 backdrop-blur-xl border-black/5 rounded-[2.5rem] shadow-2xl overflow-hidden border-2 min-h-[400px]">
                    <div className="p-5 border-b border-black/5 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Archive Manifest</span>
                      </div>
                    </div>
                    <ScrollArea className="h-[500px]">
                      <div className="divide-y divide-black/5">
                        {items.map((item, i) => (
                          <div key={i} className="p-5 flex items-center justify-between group hover:bg-white/40 transition-all">
                            <div className="flex items-center gap-5 overflow-hidden">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                                {getIcon(item.type)}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-sm font-black truncate text-slate-950 uppercase tracking-tighter">{item.name}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.size} • {item.type}</p>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => dl(item.blob, item.name)} className="h-9 w-9 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl transition-all">
                               <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </Card>
                </div>
                <aside className="lg:col-span-4 space-y-6">
                   <Card className="bg-white/60 border-black/5 rounded-[2.5rem] p-8 space-y-6 shadow-xl border-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Sovereign Buffer</Label>
                      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-3 text-center">
                        <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="text-[11px] font-bold text-slate-900 uppercase leading-relaxed">Decompression is performed locally in your browser memory. No data leaves this node.</p>
                      </div>
                   </Card>
                </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolWorkspace>
  );
}