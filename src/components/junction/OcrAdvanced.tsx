"use client";

import React, { useState } from "react";
import { ToolWorkspace, Drop, ToolFile, dl, T } from "./_shared";
import { applyPipeline, DEFAULT_CONFIG } from "@/lib/ocr/pipeline";
import { ocrEngine } from "@/lib/ocr/engine";
import { cleanText, computeStats } from "@/lib/ocr/nlp";
import { BrainCircuit, CheckCircle2, Copy, Loader2, Activity, RefreshCcw, Zap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';

export default function OcrAdvanced() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultText, setText] = useState("");
  const [stats, setStats] = useState<any>(null);
  const [, setE] = useState("");

  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const runOcr = async () => {
    if (!files.length) return;
    setE(""); setPhase('processing');
    setProgress(5); setStatus("Loading the document…");

    try {
      const file = files[0].file;
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.width; canvas.height = img.height;
      canvas.getContext('2d')!.drawImage(img, 0, 0);

      setProgress(20); setStatus("Recognizing text…");
      const workCanvas = await applyPipeline(canvas, config);

      setProgress(50); setStatus("Neural character recognition...");
      const result = await ocrEngine.recognize(workCanvas, { lang: 'eng' });
      
      const cleaned = cleanText(result.text);
      setText(cleaned);
      setStats(computeStats(result));
      setPhase('done');
    } catch (e: any) {
      setE(e.message || "Recognition interrupted.");
      setPhase('configure');
    }
  };

  const reset = () => { setF([]); setPhase('upload'); setText(""); setStats(null); };

  return (
    <ToolWorkspace title="Advanced OCR" description="DOCUMENT TEXT RECOGNITION WITH REVIEW CONTROLS" icon="🧠" badge="OCR WORKSPACE" accent={T.purple}>
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".pdf,.png,.jpg,.jpeg,.webp" label="Drop Scan to Process" sub="Processed locally in your browser" />
            </motion.div>
          )}

          {phase === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{files[0]?.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">OCR workspace ready</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Change Source</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                   <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-[2.5rem] p-10 space-y-10 shadow-xl border-2">
                      <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OCR settings</Label>
                          <div className="space-y-3">
                            <label className="flex items-center justify-between p-3 bg-black/5 rounded-xl cursor-pointer">
                              <span className="text-xs font-black uppercase">Straighten</span>
                              <input type="checkbox" checked={config.deskew} onChange={e => setConfig({...config, deskew: e.target.checked})} />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-black/5 rounded-xl cursor-pointer">
                              <span className="text-xs font-black uppercase">Reduce noise</span>
                              <input type="checkbox" checked={config.denoise} onChange={e => setConfig({...config, denoise: e.target.checked})} />
                            </label>
                            <label className="flex items-center justify-between p-3 bg-black/5 rounded-xl cursor-pointer">
                              <span className="text-xs font-black uppercase">Text threshold</span>
                              <input type="checkbox" checked={config.autoThreshold} onChange={e => setConfig({...config, autoThreshold: e.target.checked})} />
                            </label>
                          </div>
                        </div>
                        <div className="space-y-6">
                           <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">OCR settings</Label>
                           <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-2xl">
                             <p className="text-[11px] font-bold text-purple-700 leading-relaxed uppercase">Extra image cleanup can help OCR read low-quality scans.</p>
                           </div>
                        </div>
                      </div>
                   </Card>
                </div>

                <div className="space-y-6">
                   <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group h-full flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                      <BrainCircuit className="w-32 h-32 text-purple-500" />
                    </div>
                    <div className="relative z-10 space-y-8">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">Start OCR</h4>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">Processing occurs locally via Tesseract.js WASM core.</p>
                      </div>
                      <Button onClick={runOcr} className="w-full h-16 bg-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-purple-700 transition-all shadow-xl active:scale-95 gap-3 border-2 border-white/10">
                        <Zap className="w-4 h-4" /> Run Advanced OCR
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <div className="py-32 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-20 h-20 text-purple-600 animate-spin" />
                <BrainCircuit className="absolute inset-0 m-auto w-8 h-8 text-purple-600 animate-pulse" />
              </div>
              <div className="w-full max-w-sm space-y-4 mx-auto">
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">{status}</span><span className="text-xl font-black text-purple-600 tracking-tighter">{progress}%</span></div>
                <Progress value={progress} className="h-1.5 bg-black/5" />
              </div>
            </div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10 pb-32">
              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/10">
                       <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Your files are ready</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stats?.wordCount} Text ready</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => navigator.clipboard.writeText(resultText)} className="h-12 px-8 rounded-xl font-black text-[10px] uppercase gap-2 border-black/5 bg-white hover:bg-black/5 shadow-sm">
                       <Copy className="w-4 h-4" /> Copy All
                    </Button>
                    <Button variant="outline" onClick={reset} className="h-12 px-8 rounded-xl font-black text-[10px] uppercase gap-2 border-black/5 bg-white hover:bg-black/5 shadow-sm">
                       <RefreshCcw className="w-4 h-4" /> Process another file
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 <div className="lg:col-span-8">
                    <Card className="bg-white/40 backdrop-blur-xl border-black/5 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col border-2">
                       <div className="p-6 bg-slate-50 border-b border-black/5 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Result</span>
                          <button onClick={() => dl(new Blob([resultText], {type: 'text/plain'}), "extraction.txt")} className="text-[10px] font-black uppercase text-primary hover:underline">Download .txt</button>
                       </div>
                       <textarea 
                          readOnly 
                          value={resultText} 
                          className="flex-1 p-12 text-sm font-medium leading-relaxed bg-transparent resize-none focus:outline-none scrollbar-hide"
                       />
                    </Card>
                 </div>
                 <aside className="lg:col-span-4 space-y-6">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Text details</Label>
                    <Card className="bg-white/60 border-black/5 rounded-[2.5rem] p-8 space-y-8 shadow-xl border-2">
                       {[
                         { label: "Confidence", value: `${Math.round(stats?.avgConfidence || 0)}%`, status: "High Fidelity" },
                         { label: "Characters", value: resultText.length, status: "Text recognized" },
                         { label: "Logic Map", value: "Neural Layer 4", status: "WASM Engine" }
                       ].map((s, i) => (
                         <div key={i} className="space-y-1">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                               <span>{s.label}</span>
                               <span className="text-primary">{s.status}</span>
                            </div>
                            <p className="text-2xl font-black tabular-nums">{s.value}</p>
                         </div>
                       ))}
                    </Card>
                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center gap-3">
                       <ShieldCheck className="w-5 h-5 text-emerald-600" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Runs in your browser</span>
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
