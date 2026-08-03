"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  CheckCircle2, 
  FileArchive,
  RefreshCcw,
  Zap,
  Edit3,
  Loader2,
  X,
  FileText,
  Activity,
  Upload,
  Plus,
  Settings2,
  Trash2
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../lib/i18n/language-context';

export function PDFToZipWorkspace() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [files, setFiles] = useState<File[]>([]);
  const [phase, setPhase] = useState<'upload' | 'organize' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === 'application/pdf');
    if (pdfs.length === 0) {
      toast({ title: t('checkFiles'), description: "Only PDF documents are supported.", variant: "destructive" });
      return;
    }
    setFiles(prev => [...prev, ...pdfs]);
    setPhase('organize');
    if (!outputName) setOutputName("Archive_" + new Date().toISOString().slice(0, 10));
  };

  const executePacking = async () => {
    if (files.length === 0) return;
    setPhase('processing');
    setProgress(0);
    try {
      const res = await engine.runTool('pdf-to-zip', files, { outputName }, (p: any) => {
        setProgress(p.pct);
      });
      if (res.success && res.blob) { setResultBlob(res.blob); setPhase('done'); }
    } catch (err) { setPhase('organize'); toast({ title: "Surgical Error", description: "Failed to deflate binary stream.", variant: "destructive" }); }
  };

  const reset = () => { setFiles([]); setPhase('upload'); setResultBlob(null); setProgress(0); setOutputName(""); };

  return (
    <div className="h-full flex flex-col items-center py-4 px-8 overflow-y-auto scrollbar-hide bg-transparent font-sans text-slate-950">
      <div className="w-full h-full flex flex-col max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="pt-8 w-full max-w-3xl mx-auto">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); e.dataTransfer.files[0] && handleFiles(Array.from(e.dataTransfer.files)); }}
                className={cn(
                  "group relative h-[300px] md:h-[400px] w-full rounded-[4rem] md:rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden mx-auto flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-primary bg-primary/10 shadow-primary/20 scale-[0.98]" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" multiple accept=".pdf" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
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

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-12 space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Compressing ZIP</span>
                  <span className="text-xl font-black text-primary tracking-tighter">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-black/5 rounded-full shadow-inner" />
              </div>
            </motion.div>
          )}

          {phase === 'organize' && files.length > 0 && (
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
                          <Input placeholder="Archive_Name" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
                <div className="p-6 border-t border-black/5 bg-white/40">
                  <Button onClick={executePacking} className="w-full h-16 bg-primary text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Packing
                  </Button>
                </div>
              </aside>
              <main className="flex-1 flex flex-col min-w-0 bg-slate-50/30 relative overflow-hidden">
                <header className="h-14 border-b border-black/5 bg-white/40 backdrop-blur px-8 flex items-center justify-between shrink-0 z-20 shadow-sm">
                  <div className="flex items-center gap-4">
                    <FileArchive className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Queue List</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={reset} className="h-10 w-10 text-slate-400 hover:text-red-500 rounded-xl transition-all">
                    <X className="w-5 h-5" />
                  </Button>
                </header>
                <ScrollArea className="flex-1 p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {files.map((f, i) => (
                      <div key={i} className="p-5 bg-white border border-black/5 rounded-2xl flex items-center justify-between shadow-sm group hover:border-primary/40 transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-black/5">
                            <FileText className="w-5 h-5 text-slate-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate text-slate-950 uppercase">{f.name}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">PDF • {(f.size/1024/1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your archive is ready for export</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => { if (resultBlob) engine.download(resultBlob, `${outputName}.zip`); }} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95"><Download className="w-4 h-4" /> Download ZIP</Button>
                <button onClick={reset} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" /> Start New Session
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default PDFToZipWorkspace;
