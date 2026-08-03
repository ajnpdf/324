"use client";

import React, { useState } from "react";
import { 
  ToolWorkspace, 
  Drop, 
  Btn, 
  Info, 
  Err, 
  ToolFile, 
  dl, 
  T 
} from "./_shared";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { ocrEngine } from "@/lib/ocr/engine";
import { 
  Search, 
  CheckCircle2, 
  Download, 
  Loader2, 
  Activity,
  FileText,
  RefreshCcw,
  Zap,
  ShieldCheck,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from '../ui/progress';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { initPdfWorker } from "@/lib/pdfjs-worker";

/**
 * AJN Professional Searchable PDF Unit
 * Resolved: Missing BrainCircuit import.
 */
export default function OcrSearchable() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [err, setE] = useState("");

  const executeMakeSearchable = async () => {
    if (!files.length) return;
    setE(""); setPhase('processing');
    setProgress(5); setStatus("Inhaling PDF stream...");

    try {
      initPdfWorker();
      const file = files[0].file;
      const srcBytes = await file.arrayBuffer();
      const uint8Bytes = new Uint8Array(srcBytes);
      const pdfSrc = await pdfjsLib.getDocument({ data: uint8Bytes }).promise;
      const totalPages = pdfSrc.numPages;
      
      const pdfDoc = await PDFDocument.load(srcBytes, { ignoreEncryption: true });
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      for (let i = 1; i <= totalPages; i++) {
        const pct = 10 + Math.round((i / totalPages) * 85);
        setProgress(pct); setStatus(`Auditing Page ${i} of ${totalPages}...`);

        const page = await pdfSrc.getPage(i);
        const vp = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport: vp }).promise;

        const result = await ocrEngine.recognize(canvas, { lang: 'eng' });
        const pdfPage = pages[i - 1];
        const { width, height } = pdfPage.getSize();
        
        const scaleX = width / vp.width;
        const scaleY = height / vp.height;

        if (result.words) {
          for (const word of result.words) {
            if (!word.text.trim()) continue;
            const x = word.bbox.x0 * scaleX;
            const y = height - (word.bbox.y1 * scaleY);
            const fontSize = Math.max(1, (word.bbox.y1 - word.bbox.y0) * scaleY);
            
            try {
              pdfPage.drawText(word.text, { 
                x, y, size: fontSize, font, 
                color: rgb(0, 0, 0), opacity: 0.001 
              });
            } catch {}
          }
        }
      }

      setProgress(98); setStatus("Finalizing binary trailer...");
      const finalBytes = await pdfDoc.save();
      setResultBlob(new Blob([finalBytes.buffer as ArrayBuffer], { type: 'application/pdf' }));
      setPhase('done');
    } catch (e: any) {
      setE(e.message || "Logic interrupt during synthesis.");
      setPhase('configure');
    }
  };

  const reset = () => { setF([]); setPhase('upload'); setResultBlob(null); };

  return (
    <ToolWorkspace title="Make Searchable" description="EMBED INVISIBLE NEURAL TEXT LAYER INTO SCANS" icon="🔍" accent={T.purple} badge="OCR SUITE">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".pdf" label="Drop Scanned PDF" sub="Local indexing protocol enabled" />
            </motion.div>
          )}

          {phase === 'configure' && files[0] && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10 items-center">
              <Card className="w-full max-w-2xl bg-white/40 rounded-[2.5rem] border-black/5 shadow-2xl overflow-hidden border-2">
                 <CardContent className="p-12 space-y-10 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border border-primary/20">
                       <FileText className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                       <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-950">{files[0].name}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          This unit will append an invisible OCR text layer to your PDF, making it searchable (Ctrl+F enabled).
                       </p>
                    </div>
                    <Button onClick={executeMakeSearchable} className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                       <Zap className="w-4 h-4" /> Start Neural Embedding
                    </Button>
                 </CardContent>
              </Card>
              <Info bg="#F5F3FF" col="#5B21B6">🧠 Uses local computer vision to identify text coordinates. No data leaves your node.</Info>
            </motion.div>
          )}

          {phase === 'processing' && (
            <div className="py-24 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">PDF correctly synthesized and indexed</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(resultBlob, "Searchable_Document.pdf")} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
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
