"use client";

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Edit3,
  Loader2,
  FileText,
  Activity,
  Upload,
  ShieldCheck,
  Settings2,
  ImageIcon
} from 'lucide-react';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import mammoth from 'mammoth';
import { useLanguage } from '../../lib/i18n/language-context';
import { ToolWorkspace, dl, fmtBytes, Info } from './_shared';

export default function WordToPdf() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [files, setF] = useState<File[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [imageScale, setImageScale] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [perfStats, setPerfStats] = useState({ time: "0.0s", quality: "High Fidelity A4" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (newFile: File) => {
    const ext = newFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx' && ext !== 'doc') {
      toast({ title: t('checkFiles'), description: "Only Word documents (.docx, .doc) are supported.", variant: "destructive" });
      return;
    }
    setF([newFile]);
    setOutputName(newFile.name.replace(/\.[^/.]+$/, "") + "_Optimized");
    
    try {
      const arrayBuffer = await newFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewHtml(result.value);
      setPhase('configure');
    } catch (err) {
      setPreviewHtml("<p class='text-slate-400 font-bold text-xs uppercase tracking-widest text-center py-20'>Document loaded. Layout preview limited by complexity.</p>");
      setPhase('configure');
    }
  };

  const executeConversion = async () => {
    if (files.length === 0) return;
    setPhase('processing');
    const start = Date.now();

    try {
      const res = await engine.runTool('word-pdf', files, { outputName, imageScale }, (p: any) => { 
        setProgress(p.pct);
        setStatus(p.detail);
      });
      
      if (res.success && res.blob) {
        setResultBlob(res.blob);
        setPerfStats({ time: `${((Date.now() - start) / 1000).toFixed(2)}s`, quality: "High Fidelity A4" });
        setPhase('done');
      }
    } catch (err: any) { 
      setPhase('configure'); 
      toast({ title: "Process Error", description: "Synthesis interrupted.", variant: "destructive" }); 
    }
  };

  const reset = useCallback(() => { 
    setF([]); setPhase('upload'); setResultBlob(null); setProgress(0); setPreviewHtml(""); setOutputName("");
  }, []);

  return (
    <ToolWorkspace title="Word to PDF" description="TURN WORD FILES INTO PROFESSIONAL PDF DOCUMENTS" icon="📝" badge="SURGICAL CONVERSION" accent="#2563EB">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
                className={cn(
                  "group relative h-[340px] w-full rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-primary bg-primary/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" accept=".docx,.doc" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop Word Document</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('localSafe')}</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[320px]">{files[0]?.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(files[0]?.size || 0)} • Safe Session Active</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Flush File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">A4 Synthesis Preview</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[600px] flex justify-center py-12">
                    <ScrollArea className="h-[600px] w-full px-8">
                      <div className="bg-white p-12 shadow-2xl border border-black/5 w-full max-w-[794px] mx-auto min-h-[1123px] text-left text-slate-900 prose prose-slate">
                        <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                      </div>
                    </ScrollArea>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Surgical Settings</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-6 space-y-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Output PDF Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Final_Document" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-primary" /> Master Image Scale
                          </Label>
                          <span className="text-xs font-black text-primary">{imageScale}%</span>
                        </div>
                        <Slider value={[imageScale]} min={25} max={100} step={5} onValueChange={([v]) => setImageScale(v)} />
                      </div>
                    </Card>
                  </section>

                  <Info bg="#F5F3FF" col="#5B21B6">
                    ⚠️ <strong>Disclosure:</strong> Browser-native Word to PDF extraction focuses on structural fidelity and plain-text integrity. Some complex proprietary styles or OLE objects may be simplified during synthesis.
                  </Info>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-3 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-600"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Local Privacy Verified</span></div>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">Everything is processed locally in your browser memory.</p>
                  </div>

                  <Button onClick={executeConversion} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Conversion
                  </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{status || "Synthesizing PDF"}</span><span className="text-xl font-black text-primary tracking-tighter">{Math.round(progress)}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 w-full text-center pb-32 px-8 overflow-y-auto scrollbar-hide">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your file is ready for download</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl mx-auto text-left">
                <div className="p-6 bg-white border border-black/5 rounded-3xl text-center shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Processing time</p>
                  <p className="text-2xl font-black text-slate-950">{perfStats.time}</p>
                </div>
                <div className="p-6 bg-white border border-black/5 rounded-3xl text-center shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Output Fidelity</p>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{perfStats.quality}</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-20">
                <Button onClick={() => resultBlob && dl(resultBlob, `${outputName}.pdf`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> {t('download')}
                </Button>
                <button onClick={reset} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> {t('newSession')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolWorkspace>
  );
}
