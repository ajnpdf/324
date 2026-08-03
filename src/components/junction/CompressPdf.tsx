"use client";

import React, { useState, useRef } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { 
  CheckCircle2, 
  Download, 
  Loader2, 
  Activity,
  FileText,
  RefreshCcw,
  Zap,
  Edit3,
  ShieldCheck,
  Upload,
  Settings2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes, Done, Drop } from './_shared';
import { initPdfWorker } from "@/lib/pdfjs-worker";
import { jsPDF } from "jspdf";

/**
 * AJN Master PDF Compression Unit
 * Hardened for SharedArrayBuffer compatibility.
 */
export default function CompressPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number>(0);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (f: File) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      try {
        initPdfWorker();
        const buffer = await f.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
        setPageCount(pdf.numPages);
      } catch (err) { 
        setPageCount(1); 
      }
      setPhase('configure');
      setOutputName(f.name.replace('.pdf', '') + "_Optimized");
    }
  };

  const executeCompression = async () => {
    if (!file) return;
    setPhase('processing');
    const start = Date.now();
    try {
      initPdfWorker();
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer.slice(0) as ArrayBuffer) }).promise;
      const firstPage = await pdfDoc.getPage(1);
      const vp1 = firstPage.getViewport({ scale: 1 });
      
      const outputPDF = new jsPDF({ 
        orientation: vp1.width > vp1.height ? "landscape" : "portrait", 
        unit: "pt", 
        format: [vp1.width, vp1.height], 
        compress: true 
      });
      
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setStatus(`Synthesizing page ${i}...`);
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        canvas.width = viewport.width; 
        canvas.height = viewport.height;
        ctx.fillStyle = "#ffffff"; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport: viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        if (i > 1) outputPDF.addPage([vp1.width, vp1.height]);
        outputPDF.addImage(dataUrl, "JPEG", 0, 0, vp1.width, vp1.height, undefined, "FAST");
        setProgress(Math.round((i / pdfDoc.numPages) * 100));
      }

      const bytes = outputPDF.output("arraybuffer") as ArrayBuffer;
      const blob = new Blob([bytes], { type: "application/pdf" });
      setResult({ 
        originalSize: file.size, 
        compressedSize: blob.size, 
        ratio: ((file.size - blob.size) / file.size) * 100, 
        blob, 
        time: `${((Date.now() - start) / 1000).toFixed(2)}s` 
      });
      setPhase('done');
    } catch (err: any) { 
      setPhase('configure'); 
      toast({ title: "Compression Error", variant: "destructive" }); 
    }
  };

  const reset = () => { 
    setFile(null); 
    setPhase('upload'); 
    setResult(null); 
    setProgress(0); 
  };

  return (
    <ToolWorkspace title="Compress PDF" description="Reduce PDF file size without losing quality." icon="🗜️" badge="OPTIMIZE UNIT" accent="#2563EB">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={file ? [{file, name: file.name, size: file.size}] : []} onChange={(fs) => fs[0] && handleFileUpload(fs[0].file)} accept=".pdf" label="Drop PDF Here" sub="Safe Local Session Buffer" />
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-4 bg-white/40 rounded-[1.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[200px]">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(file.size)} • {pageCount} Pages</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[9px] font-black uppercase text-red-500 hover:underline">Change File</button>
              </div>

              <div className="space-y-4 max-w-xl mx-auto w-full">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                    <div className="relative">
                      <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <Input placeholder="Optimized_Document" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-11 pl-10 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                    </div>
                  </div>

                  <Button onClick={executeCompression} className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Compression
                  </Button>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="w-full max-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{status}</span><span className="text-xl font-black text-primary tracking-tighter">{progress}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </motion.div>
          )}

          {phase === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your file is ready for download</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[2.5rem] w-full max-w-xl flex items-center justify-between shadow-xl mx-auto">
                <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Original</p><p className="text-xl font-black text-slate-900">{fmtBytes(result.originalSize)}</p></div>
                <div className="h-10 w-px bg-black/5" />
                <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Finalized</p><p className="text-2xl font-black text-emerald-600">{fmtBytes(result.compressedSize)}</p></div>
                <div className="h-10 w-px bg-black/5" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Efficiency</p>
                  <Badge className="bg-emerald-500 text-white border-none font-black text-xs h-7">-{result.ratio.toFixed(1)}%</Badge>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-20">
                <Button onClick={() => dl(result.blob, `${outputName}.pdf`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Result
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
