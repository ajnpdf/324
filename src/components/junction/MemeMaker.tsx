"use client";

import React, { useState, useEffect, useRef } from "react";
import { ToolWorkspace, Drop, Range, ToolFile, dl, shareResult, beginToolProcessing, completeToolProcessing, failToolProcessing} from "./_shared";
import { makeMeme } from "./_imageUtils";
import { Smile, CheckCircle2, Download, Loader2, Activity, RefreshCcw, Zap, Settings2, Edit3, Type, Share2} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

import { useToast } from '../../hooks/use-toast';

/**
 * AJN Professional Meme Maker Unit
 */
export default function MemeMaker() {
  const { toast } = useToast();
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  const [top, setTop] = useState("WHEN YOU FINALLY FIX THE BUG");
  const [bot, setBot] = useState("BUT CREATE 3 MORE");
  const [size, setSize] = useState(0); // 0 = auto
  const [preview, setPrev] = useState("");
  const [imgSz, setImgSz] = useState({w:0, h:0});

  const cRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!files.length) { setPrev(""); return; }
    const u = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => {
      setImgSz({w: img.naturalWidth, h: img.naturalHeight});
      setPrev(u);
      setPhase('configure');
      setOutputName(files[0].name.replace(/\.[^/.]+$/, "") + "_Meme");
    };
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [files]);

  useEffect(() => {
    const c = cRef.current;
    if (!c || !preview || !imgSz.w) return;
    const img = new Image();
    img.onload = () => {
      const dW = c.width;
      const dH = Math.round(c.width * (imgSz.h / imgSz.w));
      c.height = dH;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(img, 0, 0, dW, dH);
      
      const fs = size > 0 ? Math.round(size * dW / imgSz.w) : Math.max(18, Math.round(dW / 10));
      const drawText = (text: string, yPos: number) => {
        ctx.font = `900 ${fs}px Impact, "Arial Narrow", Arial, sans-serif`;
        ctx.textAlign = "center";
        const ol = Math.max(2, Math.round(fs / 12));
        ctx.lineWidth = ol * 2;
        ctx.strokeStyle = "#000";
        ctx.strokeText(text, dW / 2, yPos);
        ctx.fillStyle = "#fff";
        ctx.fillText(text, dW / 2, yPos);
      };
      if (top) drawText(top.toUpperCase(), fs + 8);
      if (bot) drawText(bot.toUpperCase(), dH - 10);
    };
    img.src = preview;
  }, [preview, top, bot, size, imgSz]);

  const run = async () => {
    if (!files.length) return;
    beginToolProcessing("MemeMaker");
    setPhase('processing');
    setProgress(0);
    setStatus("Creating your meme…");

    try {
      for(let i=0; i<=100; i+=25) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }
      
      const b = await makeMeme(files[0].file, top, bot, size);
      setResultBlob(b);
      setPhase('done');
      completeToolProcessing();
    } catch {
      failToolProcessing();
      setPhase('configure');
      toast({ title: "Process Error", variant: "destructive" });
    }
  };

  const reset = () => { setF([]); setPhase('upload'); setResultBlob(null); setPrev(""); setTop(""); setBot(""); };

  return (
    <ToolWorkspace title="Meme Maker" description="CREATE A MEME WITH CUSTOM CAPTIONS" icon="😂" badge="MEME TOOL" accent="#F59E0B">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp,.gif" label="Drop Image to Meme-ify" sub="Local creative buffer active" />
            </motion.div>
          )}

          {phase === 'configure' && files[0] && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Smile className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{files[0].name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Editor ready</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Change File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preview</Label>
                  <Card className="bg-slate-900/5 border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[500px] flex items-center justify-center p-12">
                    <canvas ref={cRef} width={540} className="shadow-2xl border-2 border-white/20 rounded-sm" />
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Settings</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-8 shadow-xl border-2">
                      <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Top Caption</Label>
                        <div className="relative">
                           <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <Input value={top} onChange={e => setTop(e.target.value.toUpperCase())} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-black text-sm" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Bottom Caption</Label>
                        <div className="relative">
                           <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                           <Input value={bot} onChange={e => setBot(e.target.value.toUpperCase())} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-black text-sm" />
                        </div>
                      </div>

                      <Range label="Font Size (0 = Auto)" value={size} min={0} max={200} step={4} onChange={setSize} fmt={v => v === 0 ? "Auto" : `${v}px`} />

                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="meme" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </Card>
                  </section>

                  <Button onClick={run} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Create Meme
                  </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-24 flex flex-col items-center space-y-10 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
              </div>
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your meme is ready</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4">
                <Button onClick={() => dl(resultBlob, `${outputName}.jpg`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Meme
                </Button>
                <Button variant="outline" onClick={() => void shareResult(resultBlob, `${outputName}.jpg`)} className="h-12 border-slate-200 bg-white text-slate-700 font-black text-xs rounded-xl shadow-sm hover:border-blue-200 hover:bg-blue-50/60 gap-2">
                  <Share2 className="w-4 h-4" /> Share result
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
