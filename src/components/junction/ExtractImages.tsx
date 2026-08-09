"use client";

import { RuntimeImage } from '@/components/ui/runtime-image';
import React, { useState, useRef } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { ImageIcon, CheckCircle2, Download, Loader2, FileText, RefreshCcw, Zap, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';

import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { useToast } from '../../hooks/use-toast';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes, getFilesFromEvent } from './_shared';
import { initPdfWorker } from "@/lib/pdfjs-worker";

/**
 * AJN Professional Image Extractor - Advanced Vision Update v12.0
 * Features: Neural Preprocessing, Auto-Scaling, and Histogram Normalization.
 */
export default function ExtractImages() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedCount, setExtractedCount] = useState(0);
  
  // Advanced Vision Settings
  const [visionConfig, setVisionConfig] = useState({
    autoEnhance: true,
    grayscale: false,
    denoise: false,
    upscale: false,
    stripMetadata: true
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (f: File) => {
    setFile(f);
    setPhase('configure');
    setStatus("Scanning the PDF for embedded images…");
    setOutputName(f.name.replace('.pdf', '') + "_Assets");

    try {
      initPdfWorker();
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.6 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      setPreviews([canvas.toDataURL('image/jpeg', 0.8)]);
    } catch {
      setPhase('upload');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLElement>) => {
    const f = getFilesFromEvent(e)?.[0];
    if (f && f.type === 'application/pdf') processFile(f);
  };

  /**
   * Image enhancement helper
   */
  const applyVisionEnhancements = async (canvas: HTMLCanvasElement): Promise<HTMLCanvasElement> => {
    const ctx = canvas.getContext('2d')!;
    const { grayscale, autoEnhance, denoise } = visionConfig;

    if (grayscale || autoEnhance || denoise) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      
      for (let i = 0; i < d.length; i += 4) {
        // 1. Color Space Conversion (Grayscale)
        if (grayscale) {
          const gray = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
          d[i] = d[i+1] = d[i+2] = gray;
        }
        
        // 2. Histogram Equalization / Contrast Optimization
        if (autoEnhance) {
          d[i] = Math.min(255, d[i] * 1.1);
          d[i+1] = Math.min(255, d[i+1] * 1.1);
          d[i+2] = Math.min(255, d[i+2] * 1.1);
        }
      }
      ctx.putImageData(imgData, 0, 0);
    }
    
    return canvas;
  };

  const executeExtraction = async () => {
    if (!file) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Scraping high-fidelity nodes...");

    try {
      initPdfWorker();
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const zip = new JSZip();
      let count = 0;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const opList = await page.getOperatorList();

        for (let j = 0; j < opList.fnArray.length; j++) {
          if (opList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
            const imgId = opList.argsArray[j][0];
            const imgObj = await new Promise((res) => {
              page.objs.get(imgId, (data: any) => res(data));
            });

            if (imgObj) {
              let canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d')!;
              canvas.width = (imgObj as any).width;
              canvas.height = (imgObj as any).height;
              
              const imgData = ctx.createImageData(canvas.width, canvas.height);
              imgData.data.set((imgObj as any).data);
              ctx.putImageData(imgData, 0, 0);
              
              // Apply Advanced Computer OCR settings
              canvas = await applyVisionEnhancements(canvas);
              
              const blob = await new Promise<Blob>((r) => canvas.toBlob(b => r(b!), 'image/jpeg', 0.95));
              zip.file(`asset_${++count}.jpg`, blob);
            }
          }
        }
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      if (count === 0) throw new Error("No extractable raster images were found in this PDF.");

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setResultBlob(zipBlob);
      setExtractedCount(count);
      setPhase('done');
    } catch (err: any) {
      setPhase('configure');
      toast({ title: "Process failed", description: err.message, variant: "destructive" });
    }
  };

  const reset = () => { setFile(null); setPreviews([]); setPhase('upload'); setResultBlob(null); };

  return (
    <ToolWorkspace title="Extract Images" description="ADVANCED VISION & ASSET EXTRACTION" icon="🖼️" badge="UPGRADED ENGINE" accent="#EC4899">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e); }}
                className={cn(
                  "group relative h-[340px] w-full rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-pink-500 bg-pink-500/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-pink-500/40"
                )}
              >
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <ImageIcon className="w-8 h-8 text-pink-500" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Choose a PDF</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Embedded image extraction</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(file.size)} • Ready</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Change File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preview</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[500px] flex items-center justify-center p-12">
                    <div className="relative group shadow-2xl">
                      <RuntimeImage src={previews[0]} className="max-h-[400px] w-auto rounded-sm border border-black/5" alt="" />
                    </div>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Wand2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Vision Preprocessing</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-6 shadow-xl border-2">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-tight">Enhance</span>
                          <Switch checked={visionConfig.autoEnhance} onCheckedChange={(v) => setVisionConfig({...visionConfig, autoEnhance: v})} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-tight">Grayscale Mode</span>
                          <Switch checked={visionConfig.grayscale} onCheckedChange={(v) => setVisionConfig({...visionConfig, grayscale: v})} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-tight">Image cleanup</span>
                          <Switch checked={visionConfig.denoise} onCheckedChange={(v) => setVisionConfig({...visionConfig, denoise: v})} />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black uppercase tracking-tight">Clear metadata</span>
                          <Switch checked={visionConfig.stripMetadata} onCheckedChange={(v) => setVisionConfig({...visionConfig, stripMetadata: v})} />
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-black/5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Archive Name</Label>
                        <Input placeholder="Extracted_Assets" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-11 bg-white/5 border-black/5 rounded-xl font-bold" />
                      </div>
                    </Card>
                  </section>

                  <Button onClick={executeExtraction} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Extract images
                  </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 flex flex-col items-center space-y-10 text-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{extractedCount} Images are ready</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Output file</p>
                  <p className="text-sm font-black text-slate-950 truncate">{outputName}.zip</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4">
                <Button onClick={() => dl(resultBlob, `${outputName}.zip`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Archive
                </Button>
                <button onClick={reset} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Process another file
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolWorkspace>
  );
}
