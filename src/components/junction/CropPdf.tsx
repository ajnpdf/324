
"use client";

import React, { useState, useRef } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { 
  Crop, 
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
  Maximize2,
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

export default function CropPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [margins, setMargins] = useState({ top: 0, bottom: 0, left: 0, right: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (f: File) => {
    setFile(f);
    setPhase('configure');
    setStatus("Synthesizing preview...");
    setOutputName(f.name.replace('.pdf', '') + "_Cropped");

    try {
      initPdfWorker();
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      setPreview(canvas.toDataURL('image/jpeg', 0.8));
    } catch (err) {
      toast({ title: "Preview failed", variant: "destructive" });
      setPhase('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') processFile(f);
  };

  const executeCrop = async () => {
    setPhase('processing');
    setProgress(0);
    setStatus("Executing precision reframing...");
    const start = Date.now();

    try {
      const res = await engine.runTool('split-pdf', [file!], { 
        indices: [0], // For junction we handle 1 page crop or simple ranges
        outputName,
        crop: margins
      }, (p: any) => {
        setProgress(p.pct);
      });

      // Special handling for junction: using existing manipulator
      const bytes = await file!.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const pages = pdfDoc.getPages();
      pages.forEach(p => {
        const { height: pH, width: pW } = p.getSize();
        p.setCropBox(margins.left, margins.bottom, pW - margins.left - margins.right, pH - margins.top - margins.bottom);
      });
      const finalBytes = await pdfDoc.save();
      setResultBlob(new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' }));
      setPhase('done');
    } catch (err) {
      setPhase('configure');
      toast({ title: "Process Error", variant: "destructive" });
    }
  };

  const reset = () => { setFile(null); setPreview(""); setPhase('upload'); setResultBlob(null); setMargins({top:0,bottom:0,left:0,right:0}); };

  return (
    <ToolWorkspace title="Crop PDF" description="SURGICAL MARGIN REFRAMING" icon="🔲" badge="PRECISION UNIT" accent="#F59E0B">
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
                  isDragging ? "border-amber-500 bg-amber-500/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-amber-500/40"
                )}
              >
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <Crop className="w-8 h-8 text-amber-500" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop PDF to Reframe</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Surgical Boundary Mapping</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(file.size)} • Re-encoding Buffer Active</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">Change File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">A4 Synthesis Preview</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[600px] flex items-center justify-center p-12">
                    <div className="relative group shadow-2xl">
                      <img src={preview} className="max-h-[500px] w-auto rounded-sm border border-black/5" alt="" />
                      
                      {/* CROP OVERLAY VISUALIZATION */}
                      <div className="absolute inset-0 border-primary/40 border-2 pointer-events-none" 
                        style={{ 
                          top: (margins.top / 8.42) + "%", 
                          bottom: (margins.bottom / 8.42) + "%",
                          left: (margins.left / 5.95) + "%",
                          right: (margins.right / 5.95) + "%"
                        }}
                      >
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                        <Maximize2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary/20" />
                      </div>
                    </div>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calibration</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-8 shadow-xl">
                      <div className="grid grid-cols-2 gap-6">
                        {['top', 'bottom', 'left', 'right'].map((dir) => (
                          <div key={dir} className="space-y-2">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">{dir} Margin (pt)</Label>
                            <Input 
                              type="number" 
                              value={margins[dir as keyof typeof margins]} 
                              onChange={(e) => setMargins({...margins, [dir]: parseInt(e.target.value) || 0})}
                              className="h-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-inner" 
                            />
                          </div>
                        ))}
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Cropped_Document" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-3 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-600"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Safe session active</span></div>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">Reframing is executed locally in your browser memory.</p>
                  </div>

                  <Button onClick={executeCrop} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Finalize Crop
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Document correctly reframed</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Final Binary</p>
                  <p className="text-sm font-black text-slate-950 truncate">{fmtBytes(resultBlob.size)}</p>
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
