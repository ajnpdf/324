"use client";

import React, { useState, useRef } from "react";
import { PDFDocument } from 'pdf-lib';
import { 
  ImageIcon, 
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
  Settings2,
  Edit3,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes } from './_shared';

/**
 * AJN Professional PSD to PDF - Production v14.0
 * Specialized in Design Buffer Ingestion & Layer Flattening.
 */
export default function PsdToPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPhase('configure');
      setOutputName(f.name.replace('.psd', '') + "_Preview");
    }
  };

  const updateUI = (pct: number, msg: string) => {
    setProgress(pct);
    setStatus(msg);
  };

  const executeConversion = async () => {
    if (!file) return;
    setPhase('processing');
    updateUI(5, "Calibrating design buffer...");

    try {
      // Professional local injection of PSD.js
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/psd.js@3.4.0/dist/psd.min.js';
      document.head.appendChild(script);

      await new Promise((resolve) => { script.onload = resolve; });
      const PSD = (window as any).PSD;

      updateUI(30, "Parsing layer composite...");
      const psd = await PSD.fromArrayBuffer(await file.arrayBuffer());
      await psd.parse();
      
      updateUI(60, "Flattening composite layers...");
      const canvas = psd.image.toCanvas();
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgBytes = await fetch(imgData).then(r => r.arrayBuffer());

      updateUI(85, "Synthesizing PDF binary...");
      const pdfDoc = await PDFDocument.create();
      const img = await pdfDoc.embedJpg(new Uint8Array(imgBytes));
      const page = pdfDoc.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

      const finalBytes = await pdfDoc.save();
      setResultBlob(new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' }));
      setPhase('done');
    } catch (err) {
      setPhase('configure');
      toast({ title: "Processing failed", description: "Design engine encounter structural error.", variant: "destructive" });
    }
  };

  const reset = () => { setFile(null); setPhase('upload'); setResultBlob(null); setProgress(0); };

  return (
    <ToolWorkspace title="PSD to PDF" description="TURN PHOTOSHOP LAYERS INTO FLAT DOCUMENTS" icon="🖼️" badge="DESIGN UNIT" accent="#001E36">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e as any); }}
                className={cn(
                  "group relative h-[340px] w-full rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-blue-900 bg-blue-900/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-blue-900/40"
                )}
              >
                <input type="file" accept=".psd" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <ImageIcon className="w-8 h-8 text-blue-900" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop PSD File</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Local Binary Ingestion</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-900/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-900" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(file.size)} • Ready for Flattening</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Change File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Asset Viewport</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[600px] flex flex-col items-center justify-center p-12">
                    <div className="text-center space-y-4 opacity-40">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border-4 border-dashed border-black/5 mx-auto">
                        <Layers className="w-10 h-10 text-slate-200" />
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Design Binary Detected • Ready</p>
                    </div>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Setup</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-6 shadow-xl border-2">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Design_Preview" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                      <div className="p-4 bg-blue-900/5 border border-blue-900/10 rounded-2xl">
                        <p className="text-[9px] font-bold text-blue-900 uppercase leading-relaxed text-center">
                          PSD layers will be synthesized into a flat, high-fidelity PDF document locally.
                        </p>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-center gap-2 text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Safe local buffer active</span>
                  </div>

                  <Button onClick={executeConversion} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Flattening
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
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center pb-32">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Design correctly synthesized</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Final Binary</p>
                  <p className="text-sm font-black text-slate-950 truncate">{outputName}.pdf</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4">
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
