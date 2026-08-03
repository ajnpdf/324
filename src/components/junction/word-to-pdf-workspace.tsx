"use client";

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Edit3,
  Loader2,
  X,
  Activity,
  Upload,
  Eye,
  Settings2,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import mammoth from 'mammoth';
import { useLanguage } from '../../lib/i18n/language-context';

export function WordToPDFWorkspace() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'upload' | 'analyze' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [perfStats, setPerfStats] = useState({ time: "0.0s", quality: "High" });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [config] = useState({
    pageSize: 'a4',
    orientation: 'portrait',
    preserveLinks: true,
    hiRes: true
  });

  const handleFile = async (newFile: File) => {
    const ext = newFile.name.split('.').pop()?.toLowerCase();
    if (ext !== 'docx' && ext !== 'doc') {
      toast({ title: t('checkFiles'), description: "Only Word documents (.docx, .doc) are supported.", variant: "destructive" });
      return;
    }
    setFile(newFile);
    setOutputName(newFile.name.replace(/\.[^/.]+$/, "") + "_converted");
    
    try {
      const arrayBuffer = await newFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setPreviewHtml(result.value);
      setPhase('configure');
    } catch (err) {
      setPreviewHtml("<p class='text-slate-400 font-bold text-xs uppercase tracking-widest text-center py-20'>Document loaded. Preview restricted by layout complexity.</p>");
      setPhase('configure');
    }
  };

  const executeConversion = async () => {
    if (!file) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Analyzing structure...");
    const start = Date.now();

    try {
      const res = await engine.runTool('word-pdf', [file], config, (p: any) => { 
        setProgress(p.pct);
        if (p.detail) setStatus(p.detail);
      });
      
      if (res.success && res.blob) {
        setResultBlob(res.blob);
        setPerfStats({ time: `${((Date.now() - start) / 1000).toFixed(2)}s`, quality: "High Fidelity" });
        setPhase('done');
        toast({ title: t('success') });
      }
    } catch (err: any) { 
      setPhase('configure'); 
      toast({ title: "Failed", description: "Process error during creation.", variant: "destructive" }); 
    }
  };

  const reset = useCallback(() => { 
    setFile(null); setPhase('upload'); setResultBlob(null); setProgress(0); setPreviewHtml(""); 
  }, []);

  return (
    <div className="h-full flex flex-col items-center overflow-hidden bg-transparent font-sans text-slate-950 px-4 md:px-8">
      <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-8 w-full max-w-3xl mx-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
                className={cn(
                  "group relative h-[300px] md:h-[400px] w-full rounded-[4rem] md:rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden mx-auto flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-primary bg-primary/10 shadow-primary/20 scale-[0.98]" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" multiple accept=".docx,.doc" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 relative z-10 border border-black/5">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop Word Here</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{t('localSafe')}</p>
                </div>
              </div>
            </motion.div>
          )}

          {(phase === 'analyze' || phase === 'processing') && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-12 space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{status || "Synthesizing PDF"}</span>
                  <span className="text-xl font-black text-primary tracking-tighter">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-black/5 rounded-full shadow-inner" />
              </div>
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col lg:flex-row overflow-hidden border border-black/5 rounded-[2.5rem] bg-white/40 backdrop-blur-xl shadow-2xl min-h-[500px] mb-8">
              <aside className="w-full lg:w-80 border-r border-black/5 bg-white/40 backdrop-blur-2xl flex flex-col shrink-0 shadow-sm">
                <header className="p-6 border-b border-black/5 flex items-center justify-between bg-white/20">
                  <div className="flex items-center gap-3">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Advanced Setup</span>
                  </div>
                </header>
                <ScrollArea className="flex-1">
                  <div className="p-8 space-y-10">
                    <section className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('outputLabel')}</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Converted_Document" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-2xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </section>
                    <div className="hidden md:flex p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-3">
                      <div className="flex items-center justify-center gap-2 text-emerald-600"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Safe session</span></div>
                      <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase text-center">Everything runs in your browser.</p>
                    </div>
                  </div>
                </ScrollArea>
                <div className="p-6 border-t border-black/5 bg-white/40">
                  <Button onClick={executeConversion} className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Save changes
                  </Button>
                </div>
              </aside>
              <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30 relative overflow-hidden">
                <header className="h-14 border-b border-black/5 bg-white/40 backdrop-blur px-8 flex items-center justify-between shrink-0 z-20 shadow-sm">
                  <div className="flex items-center gap-4">
                    <Eye className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Layout Preview</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={reset} className="h-10 w-10 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </Button>
                </header>
                <div className="flex-1 overflow-auto p-12 flex justify-center bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:32px_32px] scrollbar-hide">
                  <Card className="bg-white shadow-[0_40px_120px_rgba(0,0,0,0.15)] rounded-sm p-16 w-full max-w-2xl min-h-[1123px] prose prose-slate relative overflow-hidden">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="w-full h-full" />
                  </Card>
                </div>
              </main>
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center py-12 space-y-10 w-full text-center pb-32 px-8 overflow-y-auto scrollbar-hide">
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
                <Button 
                  onClick={() => { if (resultBlob) engine.download(resultBlob, `${outputName}.pdf`); }} 
                  className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95"
                >
                  <Download className="w-4 h-4" /> {t('download')}
                </Button>
                
                <button 
                  onClick={reset} 
                  className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all"
                >
                  <RefreshCcw className="w-3.5 h-3.5" /> {t('newSession')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
