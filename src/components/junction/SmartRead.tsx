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
  T, 
  fmtBytes,
  Done
} from "./_shared";
import { extractText } from "./_pdfUtils";
import { 
  Brain, 
  CheckCircle2, 
  Copy, 
  Download, 
  Loader2, 
  Activity,
  X,
  FileText,
  RefreshCcw,
  Zap,
  ShieldCheck,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

/**
 * AJN Professional Smart Read Tool - Production v12.3
 * Hardened: Fixed icon reference and optimized vertical gaps.
 */
export default function SmartRead() {
  const { toast } = useToast();
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [err, setE] = useState("");
  const [copied, setCopied] = useState(false);

  const run = async () => {
    if (!files.length) return;
    setE(""); setPhase('processing');
    setProgress(5); setStatus("Mapping document structure...");

    try {
      for(let i=10; i<40; i+=10) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }

      const out = await extractText(files[0].file);
      
      setProgress(90); setStatus("Cleaning text segments...");
      await new Promise(r => setTimeout(r, 400));

      setText(out.trim() || "(No text identified in document structure)");
      setPhase('done');
    } catch (e: any) {
      setE(e.message || "Logic interrupt during extraction.");
      setPhase('configure');
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Text Copied", description: "Copied to clipboard.", variant: "success" });
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setF([]); setPhase('upload'); setText(""); setE(""); };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <ToolWorkspace title="Smart Read" description="EXTRACT TEXT LAYERS FROM PDF DOCUMENTS" icon="🤖" badge="SMART TOOL" accent={T.purple}>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".pdf" label="Drop PDF to Extract Text" sub="Processing happens on your device" />
            </motion.div>
          )}

          {phase === 'configure' && files[0] && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6 items-center">
              <Card className="w-full max-w-2xl bg-white/40 rounded-[2rem] border-black/5 shadow-2xl overflow-hidden border-2">
                 <CardContent className="p-10 space-y-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto shadow-inner border border-primary/20">
                       <Search className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-xl font-black uppercase tracking-tighter text-slate-950">{files[0].name}</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                          This tool will find and extract the text layers from your PDF document for easy copying.
                       </p>
                    </div>
                    <Button onClick={run} className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                       <Zap className="w-4 h-4" /> Start Extraction
                    </Button>
                 </CardContent>
              </Card>
              <Info bg="#F5F3FF" col="#5B21B6">🤖 Text is extracted locally — nothing leaves your device.</Info>
            </motion.div>
          )}

          {phase === 'processing' && (
            <div className="py-24 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Brain className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{status}</span><span className="text-xl font-black text-primary tracking-tighter">{progress}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 pb-32">
              <div className="p-6 bg-white border-2 border-black/5 rounded-[2rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10">
                       <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tighter">Extraction Ready</h3>
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{wordCount} Words identified</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={copy} className="h-10 px-6 rounded-xl font-black text-[9px] uppercase gap-2 border-black/5 bg-white hover:bg-black/5 shadow-sm">
                       <Copy className="w-3.5 h-3.5" /> {copied ? "Copied!" : "Copy Text"}
                    </Button>
                    <Button variant="outline" onClick={reset} className="h-10 px-6 rounded-xl font-black text-[9px] uppercase gap-2 border-black/5 bg-white hover:bg-black/5 shadow-sm">
                       <RefreshCcw className="w-3.5 h-3.5" /> New Session
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8">
                    <Card className="bg-white/40 backdrop-blur-xl border-black/5 rounded-[2rem] shadow-2xl overflow-hidden min-h-[500px] flex flex-col border-2">
                       <div className="p-4 bg-slate-50 border-b border-black/5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Result Buffer</span>
                          <button onClick={() => dl(new Blob([text], {type: 'text/plain'}), "extraction.txt")} className="text-[10px] font-black uppercase text-primary hover:underline">Save as .txt</button>
                       </div>
                       <textarea 
                          readOnly 
                          value={text} 
                          className="flex-1 p-8 text-sm font-medium leading-relaxed bg-transparent border-none resize-none focus:outline-none scrollbar-hide text-slate-900"
                       />
                    </Card>
                 </div>
                 <aside className="lg:col-span-4 space-y-6">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Statistical Analysis</Label>
                    <Card className="bg-white/60 border-black/5 rounded-[2rem] p-6 space-y-6 shadow-xl border-2">
                       {[
                         { label: "Word Count", value: wordCount, status: "Clean" },
                         { label: "Characters", value: text.length, status: "Mapped" },
                         { label: "Privacy", value: "Verified", status: "Total" }
                       ].map((s, i) => (
                         <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                               <span>{s.label}</span>
                               <span className="text-primary">{s.status}</span>
                            </div>
                            <p className="text-xl font-black tabular-nums">{s.value}</p>
                         </div>
                       ))}
                    </Card>
                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] flex items-center gap-3">
                       <ShieldCheck className="w-4 h-4 text-emerald-600" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Privacy Protected Locally</span>
                    </div>
                 </aside>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolWorkspace>
  );
}
