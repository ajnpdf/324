"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Loader2, 
  Layout, 
  Shrink, 
  FileText, 
  FileCode, 
  Download,
  RefreshCcw,
  MousePointer2,
  FileUp
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

type DemoStep = 'choose' | 'upload' | 'processing' | 'done';

const DEMO_TOOLS = [
  { id: 'merge', name: 'Merge PDF', icon: Layout, color: 'text-blue-500', bg: 'bg-blue-500/10', ext: '.pdf' },
  { id: 'compress', name: 'Compress PDF', icon: Shrink, color: 'text-emerald-500', bg: 'bg-emerald-500/10', ext: '.pdf' },
  { id: 'word', name: 'Word to PDF', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-600/10', ext: '.docx' },
  { id: 'xml', name: 'XML to PDF', icon: FileCode, color: 'text-amber-500', bg: 'bg-amber-500/10', ext: '.xml' },
];

/**
 * AJN Interactive Experience - Fast & Easy Mobile Edition
 * Modern industrial UX with clear language and simple words.
 * Hardened: Hydration guard for Next.js 15 stability.
 */
export function LiveDemo() {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<DemoStep>('choose');
  const [selectedTool, setSelectedTool] = useState<typeof DEMO_TOOLS[0] | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToolSelect = (tool: typeof DEMO_TOOLS[0]) => {
    setSelectedTool(tool);
    setStep('upload');
  };

  const startProcessing = () => {
    setStep('processing');
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('done');
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  if (!mounted) return <div className="h-[500px] flex items-center justify-center opacity-20"><Loader2 className="animate-spin" /></div>;

  return (
    <section className="py-16 md:py-24 max-w-7xl mx-auto px-6 md:px-8 space-y-12 md:space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="space-y-8 md:space-y-12">
          <div className="space-y-4 text-left">
            <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-full">Interactive Demo</Badge>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none text-slate-900">
              Fast, Private <br /><span className="text-primary/40 italic">& Easy</span>
            </h2>
            <p className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-md">
              Try AJN Studio now. Pick a tool, add your file, and get results instantly without any server uploads.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { text: "Safe for your files", icon: ShieldCheck, desc: "Private browser work only" },
              { text: "Super fast local tools", icon: Zap, desc: "No waiting for uploads" },
              { text: "Verified local output", icon: CheckCircle2, desc: "Professional quality results" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-5 p-6 bg-white/40 border border-black/5 rounded-[2rem] group hover:border-primary/20 transition-all shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-black uppercase tracking-tight text-slate-950">{item.text}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative group w-full">
          <div className="absolute -inset-6 bg-primary/5 rounded-[4rem] blur-[80px] group-hover:bg-primary/10 transition-all duration-700 pointer-events-none" />
          
          <Card className="bg-white/80 backdrop-blur-2xl border-2 border-black/5 rounded-[3rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden h-[500px] flex flex-col">
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="h-16 border-b border-black/5 bg-slate-50/50 flex items-center justify-between px-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/20" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/20" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/20" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Secure Session Buffer</span>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 relative">
                <AnimatePresence mode="wait">
                  {step === 'choose' && (
                    <motion.div 
                      key="choose" 
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="w-full space-y-8"
                    >
                      <div className="text-center space-y-1">
                        <div className="flex items-center justify-center gap-2 text-primary mb-1">
                          <MousePointer2 className="w-4 h-4 animate-bounce" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Step 01</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Choose a Tool</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {DEMO_TOOLS.map((tool) => (
                          <button 
                            key={tool.id}
                            onClick={() => handleToolSelect(tool)}
                            className="p-6 bg-white border border-black/5 rounded-[2rem] flex flex-col items-center gap-4 hover:border-primary/40 hover:shadow-xl transition-all group active:scale-95 shadow-sm"
                          >
                            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110", tool.bg, tool.color)}>
                              <tool.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tool.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 'upload' && selectedTool && (
                    <motion.div 
                      key="upload" 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 1.1 }}
                      className="flex flex-col items-center gap-8 w-full"
                    >
                      <div className="text-center space-y-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Step 02</span>
                        <h3 className="text-2xl font-black uppercase tracking-tighter">Add Your File</h3>
                      </div>
                      <div 
                        onClick={startProcessing}
                        className="w-full h-48 md:h-56 bg-slate-50 border-4 border-dashed border-black/5 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-all group shadow-inner relative"
                      >
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                          <FileUp className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-xs font-black uppercase text-slate-900">Sample_File{selectedTool.ext}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tap to start local work</p>
                        <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-600 text-[8px] font-black px-2 py-1 rounded-full uppercase">Private</div>
                      </div>
                      <button onClick={() => setStep('choose')} className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-950 transition-colors tracking-widest">← Pick different tool</button>
                    </motion.div>
                  )}

                  {step === 'processing' && (
                    <motion.div 
                      key="processing" 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full space-y-10 flex flex-col items-center"
                    >
                      <div className="relative">
                        <Loader2 className="w-16 h-16 text-primary animate-spin" />
                        <Zap className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <div className="w-full max-w-[320px] space-y-5">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                          <span>{progress < 50 ? 'Analyzing...' : 'Creating result...'}</span>
                          <span className="tabular-nums italic text-lg">{progress}%</span>
                        </div>
                        <div className="h-2 bg-black/5 rounded-full overflow-hidden shadow-inner border border-black/5 p-0.5">
                          <motion.div 
                            className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(30,58,138,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ ease: "linear" }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 'done' && selectedTool && (
                    <motion.div 
                      key="done" 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-8 text-center w-full"
                    >
                      <div className="w-24 h-24 bg-emerald-500/10 rounded-[3rem] flex items-center justify-center border border-emerald-500/20 shadow-xl">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-950">Success 🎉</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          Your file was processed safely <br /> on your own hardware.
                        </p>
                      </div>
                      <div className="flex flex-col gap-4 w-full max-w-[280px]">
                        <Button className="h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl gap-3 transition-all active:scale-95 border-2 border-white/10">
                          <Download className="w-4 h-4" /> Download Result
                        </Button>
                        <button onClick={() => setStep('choose')} className="h-10 text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-all flex items-center justify-center gap-2 tracking-widest">
                          <RefreshCcw className="w-3.5 h-3.5" /> Start another demo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
