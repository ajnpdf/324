"use client";

import React, { useState, useRef, useCallback } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, degrees } from 'pdf-lib';
import { 
  LayoutGrid, 
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
  Trash2,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Settings2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes } from './_shared';
import { initPdfWorker } from "@/lib/pdfjs-worker";

interface PageItem {
  id: string;
  file: File;
  sourceFileName: string;
  originalPageIndex: number;
  rotation: number;
  preview: string;
}

export default function OrganizePdf() {
  const { toast } = useToast();
  const [items, setItems] = useState<PageItem[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [perfStats, setPerfStats] = useState({ time: "0.0s", quality: "High Fidelity" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    try {
      initPdfWorker();
      const buffer = await file.arrayBuffer();
      // Fix: Use Uint8Array for PDF.js v4
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const newPages: PageItem[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.4 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        
        newPages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          sourceFileName: file.name,
          originalPageIndex: i - 1,
          rotation: 0,
          preview: canvas.toDataURL('image/jpeg', 0.7)
        });
      }

      setItems(prev => [...prev, ...newPages]);
      setPhase('configure');
      if (!outputName) setOutputName("Organized_Archive_" + new Date().toISOString().slice(0, 10));
    } catch (err) {
      toast({ title: "Import Error", description: "Failed to parse PDF segments.", variant: "destructive" });
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.filter(f => f.type === 'application/pdf').forEach(processFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const moveItem = (idx: number, dir: 'left' | 'right') => {
    const newItems = [...items];
    const targetIdx = dir === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newItems.length) return;
    [newItems[idx], newItems[targetIdx]] = [newItems[targetIdx], newItems[idx]];
    setItems(newItems);
  };

  const rotateItem = (id: string) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id));
  };

  const executeAssembly = async () => {
    if (items.length === 0) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Synthesizing binary map...");
    const start = Date.now();

    try {
      const uniqueFilesMap = new Map<string, File>();
      items.forEach(item => uniqueFilesMap.set(item.sourceFileName, item.file));
      const sourceFiles = Array.from(uniqueFilesMap.values());

      const pageMap = items.map(item => ({
        sourceIdx: sourceFiles.findIndex(f => f === item.file),
        pageIdx: item.originalPageIndex,
        rotation: item.rotation
      }));

      const res = await engine.runTool('organize-pdf', sourceFiles, { pageMap, outputName }, (p: any) => {
        setProgress(p.pct);
      });

      if (res.success && res.blob) {
        setResultBlob(res.blob);
        setPerfStats({ time: `${((Date.now() - start) / 1000).toFixed(2)}s`, quality: "Safe Buffer" });
        setPhase('done');
      }
    } catch (err) {
      setPhase('configure');
      toast({ title: "Assembly Error", variant: "destructive" });
    }
  };

  const reset = () => { setItems([]); setPhase('upload'); setResultBlob(null); setOutputName(""); };

  return (
    <ToolWorkspace title="Organize PDF" description="REARRANGE, ADD, DELETE, AND ROTATE SEGMENTS" icon="📋" badge="ASSEMBLY UNIT" accent="#7C3AED">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e as any); }}
                className={cn(
                  "group relative h-[340px] w-full rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-primary bg-primary/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" multiple accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFiles} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <LayoutGrid className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop PDF to Load</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Multi-File Ingestion Enabled</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <LayoutGrid className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Active Workspace</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{items.length} Pages Loaded</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-9 border-black/10 bg-white font-black text-[9px] uppercase tracking-widest rounded-xl px-4 gap-2">
                    <Plus className="w-3.5 h-3.5" /> Add more
                  </Button>
                  <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Flush All</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Document Assembly</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[600px]">
                    <ScrollArea className="h-[600px] p-8">
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-8">
                        <AnimatePresence>
                          {items.map((page, idx) => (
                            <motion.div 
                              key={page.id} 
                              layout 
                              initial={{ opacity: 0, scale: 0.9 }} 
                              animate={{ opacity: 1, scale: 1 }} 
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="space-y-3"
                            >
                              <div className="aspect-[1/1.414] bg-slate-50 rounded-2xl border-2 border-black/5 overflow-hidden relative group shadow-sm transition-all hover:border-primary/40">
                                <img 
                                  src={page.preview} 
                                  className="w-full h-full object-cover transition-transform" 
                                  style={{ transform: `rotate(${page.rotation}deg)` }} 
                                  alt="" 
                                />
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-xl">P{idx + 1}</div>
                                
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <Button size="icon" variant="secondary" onClick={() => rotateItem(page.id)} className="h-8 w-8 bg-white/20 backdrop-blur border-none text-white hover:bg-primary"><RotateCw className="w-4 h-4" /></Button>
                                  <Button size="icon" variant="secondary" onClick={() => deleteItem(page.id)} className="h-8 w-8 bg-white/20 backdrop-blur border-none text-white hover:bg-red-500"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              </div>
                              
                              <div className="flex gap-1.5 justify-center">
                                <button onClick={() => moveItem(idx, 'left')} disabled={idx === 0} className="h-7 w-7 rounded-lg bg-black/5 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary disabled:opacity-10 transition-all"><ArrowLeft className="w-3.5 h-3.5" /></button>
                                <button onClick={() => moveItem(idx, 'right')} disabled={idx === items.length - 1} className="h-7 w-7 rounded-lg bg-black/5 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary disabled:opacity-10 transition-all"><ArrowRight className="w-3.5 h-3.5" /></button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Configuration</Label>
                    </div>
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-6 space-y-6 shadow-xl">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Final_Assembly" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-center gap-2 text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Safe local buffer active</span>
                  </div>

                  <Button onClick={executeAssembly} disabled={items.length === 0} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Finalize Assembly
                  </Button>
                </aside>
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

          {phase === 'done' && resultBlob && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Document correctly re-engineered</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl mx-auto text-left">
                <div className="p-6 bg-slate-900/5 rounded-3xl border border-black/5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Processing time</p>
                  <p className="text-2xl font-black text-slate-950">{perfStats.time}</p>
                </div>
                <div className="p-6 bg-slate-900/5 rounded-3xl border border-black/5 text-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Final Result</p>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{fmtBytes(resultBlob.size)}</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(resultBlob, `${outputName}.pdf`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download PDF
                </Button>
                <button onClick={reset} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Start New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolWorkspace>
  );
}
