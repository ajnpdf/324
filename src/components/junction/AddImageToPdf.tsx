"use client";

import React, { useState, useRef } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { 
  Plus, 
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
  ImageIcon,
  Maximize2
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
import { ToolWorkspace, dl, fmtBytes, Info } from './_shared';
import { initPdfWorker } from "@/lib/pdfjs-worker";

/**
 * AJN Professional Image Embedder - Real-time Unit
 */
export default function AddImageToPdf() {
  const { toast } = useToast();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  
  const [settings, setSettings] = useState({
    x: 50,
    y: 100,
    width: 200,
    height: 150,
    page: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processPdf = async (f: File) => {
    setPdfFile(f);
    setStatus("Analyzing layers...");
    try {
      initPdfWorker();
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      setPageCount(pdf.numPages);
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      setPreview(canvas.toDataURL('image/jpeg', 0.8));
      if (imageFile) setPhase('configure');
    } catch (err) {
      toast({ title: "Analysis failed", variant: "destructive" });
    }
  };

  const executeAddImage = async () => {
    if (!pdfFile || !imageFile) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Injecting high-res pixel stream...");

    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const imgBytes = await imageFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
      
      let img;
      if (imageFile.type === 'image/png') {
        img = await pdfDoc.embedPng(imgBytes);
      } else {
        img = await pdfDoc.embedJpg(imgBytes);
      }

      const idx = Math.max(0, Math.min(pdfDoc.getPageCount() - 1, settings.page - 1));
      const page = pdfDoc.getPage(idx);
      
      page.drawImage(img, {
        x: settings.x,
        y: settings.y,
        width: settings.width,
        height: settings.height,
      });

      const finalBytes = await pdfDoc.save();
      setResultBlob(new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' }));
      setPhase('done');
    } catch (err) {
      setPhase('configure');
      toast({ title: "Synthesis Error", variant: "destructive" });
    }
  };

  const reset = () => { 
    setPdfFile(null); 
    setImageFile(null); 
    setPreview(""); 
    setPhase('upload'); 
    setResultBlob(null); 
  };

  return (
    <ToolWorkspace title="Add Image to PDF" description="EMBED BRAND ASSETS OR PHOTOS SURGICALLY" icon="🖼️" badge="EDIT UNIT" accent="#7C3AED">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "group relative h-[300px] rounded-[3rem] border-4 border-dashed transition-all duration-500 shadow-xl flex flex-col items-center justify-center cursor-pointer",
                    pdfFile ? "border-emerald-500 bg-emerald-500/5" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                  )}
                >
                  <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={e => { if(e.target.files?.[0]) processPdf(e.target.files[0]); }} />
                  {pdfFile ? (
                    <div className="text-center space-y-3">
                      <FileText className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="text-xs font-black uppercase text-slate-900 truncate max-w-[200px]">{pdfFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-black/5 group-hover:scale-110 transition-transform"><FileText className="w-8 h-8 text-primary" /></div>
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Step 1: Load PDF</p>
                    </div>
                  )}
                </div>

                <div 
                  onClick={() => { if(!pdfFile) { toast({title: "Select PDF first"}); return; } const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=(e:any)=> { if(e.target.files[0]) { setImageFile(e.target.files[0]); setPhase('configure'); } }; i.click(); }}
                  className={cn(
                    "group relative h-[300px] rounded-[3rem] border-4 border-dashed transition-all duration-500 shadow-xl flex flex-col items-center justify-center cursor-pointer",
                    !pdfFile ? "opacity-20 cursor-not-allowed" : imageFile ? "border-emerald-500 bg-emerald-500/5" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                  )}
                >
                  {imageFile ? (
                    <div className="text-center space-y-3">
                      <ImageIcon className="w-10 h-10 text-emerald-500 mx-auto" />
                      <p className="text-xs font-black uppercase text-slate-900 truncate max-w-[240px]">{imageFile.name}</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-md border border-black/5 group-hover:scale-110 transition-transform"><ImageIcon className="w-8 h-8 text-primary" /></div>
                      <p className="text-sm font-black uppercase tracking-widest text-slate-400">Step 2: Load Image</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && pdfFile && imageFile && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase h-5">PDF READY</Badge>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[8px] uppercase h-5">IMAGE READY</Badge>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Flush Files</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Synthesis Viewport</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[550px] flex items-center justify-center p-12">
                    <div className="relative group shadow-2xl">
                      <img src={preview} className="max-h-[450px] w-auto rounded-sm border border-black/5" alt="" />
                      <div 
                        className="absolute border-2 border-primary border-dashed bg-primary/10 flex items-center justify-center pointer-events-none"
                        style={{ 
                          left: (settings.x / 5.95) + "%", 
                          bottom: (settings.y / 8.42) + "%",
                          width: (settings.width / 5.95) + "%",
                          height: (settings.height / 8.42) + "%"
                        }}
                      >
                        <ImageIcon className="w-4 h-4 text-primary/40" />
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
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-6 shadow-xl border-2">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2"><Label className="text-[9px] font-bold">X (left)</Label><Input type="number" value={settings.x} onChange={e => setSettings({...settings, x: +e.target.value})} className="h-11 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">Y (bottom)</Label><Input type="number" value={settings.y} onChange={e => setSettings({...settings, y: +e.target.value})} className="h-11 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">WIDTH</Label><Input type="number" value={settings.width} onChange={e => setSettings({...settings, width: +e.target.value})} className="h-11 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">HEIGHT</Label><Input type="number" value={settings.height} onChange={e => setSettings({...settings, height: +e.target.value})} className="h-11 bg-black/5 border-none font-bold rounded-xl" /></div>
                      </div>
                      <div className="space-y-2"><Label className="text-[9px] font-bold">TARGET PAGE</Label><Input type="number" min={1} max={pageCount} value={settings.page} onChange={e => setSettings({...settings, page: +e.target.value})} className="h-11 bg-black/5 border-none font-bold rounded-xl" /></div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-center gap-2 text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase">Safe Local Buffer</span>
                  </div>

                  <Button onClick={executeAddImage} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Finalize Synthesis
                  </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 flex flex-col items-center space-y-10 text-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Executing Inject</span><span className="text-xl font-black text-primary tracking-tighter">{progress}%</span></div>
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Pixel layer correctly embedded into PDF</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(resultBlob, "document_with_image.pdf")} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
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
