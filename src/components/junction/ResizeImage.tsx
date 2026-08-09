"use client";

import { RuntimeImage } from '@/components/ui/runtime-image';
import React, { useState, useEffect } from "react";
import { ToolWorkspace, Drop, ToolFile, dl, fmtBytes } from "./_shared";
import { resizeImage } from "./_imageUtils";
import { CheckCircle2, Download, Loader2, Activity, ImageIcon, RefreshCcw, Zap, ShieldCheck, Settings2, Edit3, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';

import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { useToast } from '../../hooks/use-toast';


const PRESETS = [
  { l: "HD 720p", w: 1280, h: 720 },
  { l: "Full HD", w: 1920, h: 1080 },
  { l: "Square", w: 1080, h: 1080 },
  { l: "Thumb", w: 300, h: 300 },
  { l: "X / Twitter", w: 1500, h: 500 },
  { l: "FB Cover", w: 851, h: 315 }
];

/**
 * AJN Professional Image Resizer Unit
 * Fixed: Restored missing UI component imports.
 */
export default function ResizeImage() {
  const { toast } = useToast();
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  const [w, setW] = useState(800);
  const [h, setH] = useState(600);
  const [aspect, setA] = useState(true);
  const [preview, setPrev] = useState("");
  useEffect(() => {
    if (!files.length) { setPrev(""); return; }
    const u = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => {
      setW(img.naturalWidth);
      setH(img.naturalHeight);
      setPrev(u);
      setPhase('configure');
      setOutputName(files[0].name.replace(/\.[^/.]+$/, "") + "_Resized");
    };
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [files]);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setW(preset.w);
    setH(preset.h);
    setA(false);
  };

  const run = async () => {
    if (!files.length) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Recalibrating pixel grid...");

    try {
      for(let i=0; i<=100; i+=33) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 120));
      }
      
      const b = await resizeImage(files[0].file, w, h, aspect);
      setResultBlob(b);
      setPhase('done');
    } catch (e: any) {
      setPhase('configure');
      toast({ title: "Process Error", description: e.message || "Failed to process image.", variant: "destructive" });
    }
  };

  const reset = () => { setF([]); setPhase('upload'); setResultBlob(null); setPrev(""); };

  return (
    <ToolWorkspace title="Resize Image" description="RESIZE AN IMAGE TO CUSTOM DIMENSIONS" icon="📐" accent="#2563EB" badge="IMAGE RESIZE">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop Image to Scale" sub="Hardware-accelerated processing" />
            </motion.div>
          )}

          {phase === 'configure' && files[0] && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{files[0].name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(files[0].size)} &bull; File ready</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Clear</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preview</Label>
                  <Card className="bg-slate-900/5 border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[500px] flex items-center justify-center p-12">
                    <div className="relative group shadow-2xl">
                      <RuntimeImage src={preview} className="max-h-[400px] w-auto rounded-sm border border-black/5 transition-all" alt="" />
                    </div>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Settings</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-8 shadow-xl border-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Width (px)</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            max={10000} 
                            value={w} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setW(+e.target.value)} 
                            className="h-11 bg-white/5 border-black/5 rounded-xl font-bold" 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Height (px)</Label>
                          <Input 
                            type="number" 
                            min={1} 
                            max={10000} 
                            value={h} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setH(+e.target.value)} 
                            className="h-11 bg-white/5 border-black/5 rounded-xl font-bold" 
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="flex items-center gap-3">
                          <LinkIcon className="w-4 h-4 text-primary" />
                          <span className="text-[10px] font-black uppercase text-primary">Lock Aspect Ratio</span>
                        </div>
                        <Switch checked={aspect} onCheckedChange={setA} />
                      </div>

                      <div className="space-y-3">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Presets</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {PRESETS.map(p => (
                            <button key={p.l} onClick={() => applyPreset(p)} className="h-10 text-[8px] font-black uppercase tracking-widest border border-black/5 bg-white/40 hover:bg-black/5 rounded-lg transition-all">{p.l}</button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input 
                            placeholder="resized" 
                            value={outputName} 
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutputName(e.target.value)} 
                            className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" 
                          />
                        </div>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-center gap-2 text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Runs in your browser</span>
                  </div>

                  <Button onClick={run} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Resize image
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Image resized to {w} &times; {h} px</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Output file</p>
                  <p className="text-sm font-black text-slate-950 truncate">{outputName}.jpg</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4">
                <Button onClick={() => dl(resultBlob, `${outputName}.jpg`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Image
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
