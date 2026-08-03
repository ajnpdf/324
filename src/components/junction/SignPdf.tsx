"use client";

import React, { useState, useRef, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { 
  PenTool, 
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
  Eraser,
  Pen,
  Brush,
  Highlighter,
  Settings2,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { SignatureDrawingEngine, embedSignature, SignMode } from "@/lib/pdf-sign";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes } from './_shared';
import { initPdfWorker } from "@/lib/pdfjs-worker";

/**
 * AJN Professional Sign PDF Unit - Production v12.1
 * Corrected: Added missing pageCount state and synchronized with binary analysis.
 */
export default function SignPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState<SignMode>('pen');
  const [pageCount, setPageCount] = useState(0);

  const [settings, setSettings] = useState({
    x: 100, y: 100, width: 160, height: 80, page: 1
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SignatureDrawingEngine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'configure' && canvasRef.current && !engineRef.current) {
      engineRef.current = new SignatureDrawingEngine(canvasRef.current);
    }
    if (engineRef.current) {
      engineRef.current.setMode(mode);
    }
  }, [phase, mode]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== 'application/pdf') return;
    setFile(f);
    setPhase('configure');
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
    } catch (err) {
      toast({ title: "Analysis failed", variant: "destructive" });
      setPhase('upload');
    }
  };

  const executeSign = async () => {
    if (!file || !engineRef.current) return;
    setPhase('processing');
    setProgress(0); setStatus("Embedding signature nodes...");

    try {
      const dataUrl = engineRef.current.exportPNG();
      const blob = await embedSignature(file, dataUrl, settings);
      setResultBlob(blob);
      setPhase('done');
    } catch (err) {
      setPhase('configure');
      toast({ title: "Surgical Error", variant: "destructive" });
    }
  };

  const reset = () => { 
    setFile(null); 
    setPreview(""); 
    setPhase('upload'); 
    setResultBlob(null); 
    engineRef.current = null; 
    setPageCount(0);
  };

  return (
    <ToolWorkspace title="Sign PDF" description="PROFESSIONAL CALLIGRAPHIC AUTHENTICATION" icon="✍️" badge="E-SIGN UNIT" accent="#7C3AED">
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
                  isDragging ? "border-primary bg-primary/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <PenTool className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop PDF to Sign</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Local Buffer Authentication</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Signature Pad</Label>
                    <div className="flex gap-2">
                      {[
                        { id: 'pen', icon: Pen, label: 'Fine' },
                        { id: 'pencil', icon: Brush, label: 'Pencil' },
                        { id: 'marker', icon: Highlighter, label: 'Marker' }
                      ].map(t => (
                        <Button key={t.id} variant="outline" size="sm" onClick={() => setMode(t.id as any)} className={cn("h-8 rounded-xl font-black text-[8px] uppercase gap-1.5", mode === t.id && "bg-primary text-white border-primary")}>
                          <t.icon className="w-3 h-3" /> {t.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 border-2 border-dashed border-black/10 rounded-[3rem] relative overflow-hidden shadow-inner group hover:border-primary/20 transition-all">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={250}
                      onMouseDown={(e) => engineRef.current?.startDraw(e.nativeEvent)}
                      onMouseMove={(e) => engineRef.current?.continueDraw(e.nativeEvent)}
                      onMouseUp={() => engineRef.current?.endDraw()}
                      className="w-full h-[250px] cursor-crosshair touch-none"
                    />
                    <Button 
                      variant="ghost" 
                      onClick={() => engineRef.current?.clear()}
                      className="absolute bottom-6 right-6 h-10 px-6 bg-white/80 backdrop-blur rounded-xl border border-black/5 font-black text-[10px] uppercase gap-2 hover:bg-red-50 hover:text-red-500 shadow-sm"
                    >
                      <Eraser className="w-3.5 h-3.5" /> Clear
                    </Button>
                  </div>

                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Placement Preview</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[500px] flex items-center justify-center p-12">
                    <div className="relative group shadow-2xl">
                      <img src={preview} className="max-h-[400px] w-auto rounded-sm border border-black/5" alt="" />
                      <div className="absolute border-2 border-primary border-dashed bg-primary/10 pointer-events-none"
                        style={{ 
                          left: (settings.x / 5.95) + "%", bottom: (settings.y / 8.42) + "%",
                          width: (settings.width / 5.95) + "%", height: (settings.height / 8.42) + "%"
                        }}>
                        <div className="absolute inset-0 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-primary/40" /></div>
                      </div>
                    </div>
                  </Card>
                </div>

                <aside className="lg:col-span-4 space-y-6">
                   <Card className="bg-white border-black/5 rounded-[2.5rem] p-8 space-y-8 shadow-xl border-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center block">Calibration</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[9px] font-bold">X</Label><Input type="number" value={settings.x} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, x: +e.target.value})} className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">Y</Label><Input type="number" value={settings.y} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, y: +e.target.value})} className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">W</Label><Input type="number" value={settings.width} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, width: +e.target.value})} className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">H</Label><Input type="number" value={settings.height} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, height: +e.target.value})} className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                      </div>
                      <div className="space-y-2"><Label className="text-[9px] font-bold">PAGE</Label><Input type="number" min={1} max={pageCount} value={settings.page} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings({...settings, page: +e.target.value})} className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                   </Card>

                   <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center gap-3 text-emerald-600">
                     <ShieldCheck className="w-5 h-5" /><span className="text-[9px] font-black uppercase">Safe Local Buffer</span>
                   </div>

                   <Button onClick={executeSign} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                     <Zap className="w-4 h-4" /> Finalize Signature
                   </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <div className="py-24 flex flex-col items-center space-y-10 text-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{status}</span><span className="text-xl font-black text-primary tracking-tighter">{progress}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </div>
          )}

          {phase === 'done' && resultBlob && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Document correctly signed and synthesized</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(resultBlob, "signed_doc.pdf")} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
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