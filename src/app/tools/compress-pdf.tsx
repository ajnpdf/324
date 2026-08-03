
"use client";

import React, { useState, useRef } from "react";
import { 
  Upload, 
  Settings2, 
  Download, 
  CheckCircle2, 
  X, 
  Loader2, 
  ShieldCheck,
  Zap,
  RefreshCcw,
  FileText,
  ChevronRight,
  Home,
  ArrowLeft,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { LogoAnimation } from "@/components/landing/logo-animation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { compressPDF } from "@/lib/pdf-compress/compressPDF";
import { CompressionLevel } from "@/lib/pdf-compress/types";

export default function PDFCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'upload' | 'options' | 'processing' | 'done'>('upload');
  const [activeLevel, setActiveLevel] = useState<CompressionLevel>('recommended');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPhase('options');
    }
  };

  const startCompression = async () => {
    if (!file) return;
    setPhase('processing');
    setProgress(0);

    try {
      const blob = await compressPDF(file, activeLevel, undefined, (p) => setProgress(p));
      setResult(blob);
      setPhase('done');
    } catch (err) {
      console.error(err);
      setPhase('options');
    }
  };

  const reset = () => {
    setFile(null);
    setPhase('upload');
    setResult(null);
    setProgress(0);
  };

  const levels = [
    { 
      id: "extreme", 
      label: "🔴 Extreme Compression", 
      desc: "Lowest quality, maximum file size reduction" 
    },
    { 
      id: "recommended", 
      label: "🟡 Recommended Compression", 
      desc: "Good balance between quality and file size" 
    },
    { 
      id: "less", 
      label: "🟢 Less Compression", 
      desc: "High quality with minimal size reduction" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#c3d9fa] bg-[linear-gradient(178deg,#c3d9fa_0%,#ffe6c4_100%)] font-sans text-slate-950 flex flex-col overflow-hidden">
      {/* Surgical Header */}
      <header className="fixed top-0 left-0 right-0 h-16 z-[100] px-8 flex items-center justify-between bg-white/40 backdrop-blur-xl border-b border-black/5">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
          </Link>
          <div className="h-6 w-px bg-black/5" />
          <button 
            onClick={() => window.history.back()}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        </div>
        <Link href="/" className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center text-[#1e3a8a] shadow-sm">
          <Home size={20} />
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center pt-24 pb-32 px-6 overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {/* STEP 1: UPLOAD */}
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-3xl space-y-12">
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <span className="bg-[#2563EB] text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-lg">Compress Documents</span>
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter text-slate-900 uppercase leading-[0.85] italic">
                  COMPRESS <span className="opacity-40">PDF</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">SURGICAL BINARY OPTIMIZATION</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group h-[340px] rounded-[4rem] border-4 border-dashed border-slate-900/10 bg-white/20 backdrop-blur-xl hover:border-primary/40 transition-all duration-700 flex flex-col items-center justify-center cursor-pointer shadow-2xl overflow-hidden"
              >
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform duration-500">
                  <Upload className="w-10 h-10 text-primary" strokeWidth={3} />
                </div>
                <div className="text-center space-y-2 px-8">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Drop Files Here</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Fast local session buffer</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELECT LEVEL */}
          {phase === 'options' && file && (
            <motion.div key="options" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-7 space-y-8">
                <div className="p-8 bg-white/60 backdrop-blur-xl rounded-[3rem] border-2 border-black/5 shadow-xl flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-black uppercase truncate text-slate-900">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Original Size: {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-4">Select Optimization Mode</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {levels.map((lvl) => (
                      <button
                        key={lvl.id}
                        onClick={() => setActiveLevel(lvl.id as CompressionLevel)}
                        className={cn(
                          "p-6 rounded-[2.5rem] border-2 text-left transition-all relative group overflow-hidden",
                          activeLevel === lvl.id 
                            ? "border-primary bg-primary/5 shadow-xl" 
                            : "border-black/5 bg-white/20 hover:bg-white/40"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={cn("text-[13px] font-black uppercase tracking-widest", activeLevel === lvl.id ? "text-primary" : "text-slate-950")}>{lvl.label}</span>
                          {activeLevel === lvl.id && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-[9px] font-black text-primary uppercase">Active</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{lvl.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <aside className="lg:col-span-5 space-y-8">
                <div className="p-10 bg-slate-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                    <Zap className="w-32 h-32 text-primary" />
                  </div>
                  <div className="relative z-10 space-y-8">
                    <div className="space-y-2">
                      <h4 className="text-2xl font-black uppercase italic tracking-tighter">Ready to Deflate</h4>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">Processing will occur locally in a secure binary buffer.</p>
                    </div>
                    <Button 
                      onClick={startCompression}
                      className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl"
                    >
                      Initialize Process
                    </Button>
                  </div>
                </div>

                <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] flex items-start gap-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase leading-relaxed tracking-wide">
                    Everything runs in your browser memory. Your documents are never sent to external nodes.
                  </p>
                </div>
              </aside>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING */}
          {phase === 'processing' && (
            <motion.div key="processing" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 space-y-10 w-full max-w-md text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <div className="w-full space-y-4">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Surgical Optimization</span>
                  <span className="text-2xl font-black text-primary tabular-nums italic">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-black/5" />
              </div>
            </motion.div>
          )}

          {/* STEP 4: DONE */}
          {phase === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-12 text-center space-y-10 w-full max-w-xl">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-4xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Document correctly synthesized and compressed</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[2.5rem] w-full flex items-center justify-between shadow-xl">
                <div className="text-left">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Finalized size</p>
                  <p className="text-2xl font-black text-emerald-600 tabular-nums">{(result.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <div className="h-10 w-px bg-black/5" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency Ratio</p>
                  <div className="flex items-center justify-center bg-emerald-500 text-white font-black text-xs px-3 h-7 rounded-full border-none">
                    -{Math.round((1 - result.size / (file?.size || 1)) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 w-full max-w-sm">
                <Button 
                  onClick={() => {
                    const url = URL.createObjectURL(result);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `compressed_${file?.name || 'document.pdf'}`;
                    a.click();
                  }}
                  className="h-16 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl gap-3 transition-all"
                >
                  <Download className="w-5 h-5" /> Download PDF
                </Button>
                <button onClick={reset} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Start New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-white/40 backdrop-blur-md border-t border-black/5 flex items-center justify-center px-8 z-50">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">AJN Surgical Compression Node v4.0</p>
      </footer>
    </div>
  );
}
