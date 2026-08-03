"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ToolWorkspace, 
  Drop, 
  Btn, 
  Done, 
  Range, 
  F, 
  Pills, 
  Err, 
  ToolFile, 
  dl, 
  T, 
  fmtBytes 
} from "./_shared";
import { compressImage } from "./_imageUtils";
import { 
  Shrink, 
  CheckCircle2, 
  Download, 
  Loader2, 
  Activity,
  X,
  ImageIcon,
  RefreshCcw,
  Zap,
  ShieldCheck,
  Edit3,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

/**
 * AJN Professional Image Compression Unit - Real-time Node
 */
export default function ReduceImage() {
  const { toast } = useToast();
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [savedBytes, setSaved] = useState(0);
  
  const [q, setQ] = useState(70);
  const [fmt, setFmt] = useState("jpeg");
  const [preview, setPrev] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!files.length) { setPrev(""); return; }
    const u = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => {
      setPrev(u);
      setPhase('configure');
      setOutputName(files[0].name.replace(/\.[^/.]+$/, "") + "_Compressed");
    };
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [files]);

  const lvl = q >= 80 ? "High quality" : q >= 50 ? "Balanced" : "Max compression";

  const run = async () => {
    if (!files.length) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Optimizing pixel matrix...");

    try {
      for(let i=0; i<=100; i+=25) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 150));
      }
      
      const b = await compressImage(files[0].file, q, fmt);
      setSaved(files[0].size - b.size);
      setResultBlob(b);
      setPhase('done');
    } catch (e: any) {
      setPhase('configure');
      toast({ variant: "destructive", title: "Process Error", description: e.message || "Failed to process image." });
    }
  };

  const reset = () => { setF([]); setPhase('upload'); setResultBlob(null); setSaved(0); setPrev(""); };

  const ext = fmt === "png" ? "png" : "jpg";

  return (
    <ToolWorkspace title="Reduce Image" description="INTELLIGENT RASTER COMPRESSION" icon="🗜️" badge="IMAGE OPTIMIZER" accent="#E8380D">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop Image to Compress" sub="Safe local processing buffer active" />
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
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(files[0].size)} • Buffer Active</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Change File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Live Viewport</Label>
                  <Card className="bg-slate-900/5 border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[500px] flex items-center justify-center p-12">
                    <div className="relative group shadow-2xl">
                      <img src={preview} className="max-h-[400px] w-auto rounded-sm border border-black/5 transition-all" style={{ opacity: q/100 }} alt="" />
                    </div>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calibration</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-10 shadow-xl border-2">
                      <div className="space-y-6">
                        <Range label="Quality Level" value={Math.round(q)} min={10} max={100} step={5} onChange={v => setQ(v)} fmt={v => `${v}% — ${lvl}`} />
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Format</Label>
                        <Pills opts={[{label:"JPEG",value:"jpeg"},{label:"PNG",value:"png"}]} val={fmt} onChange={(v:any)=>setFmt(v)}/>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Compressed_Asset" value={outputName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-center gap-2 text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Safe local buffer active</span>
                  </div>

                  <Button onClick={run} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Compression
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
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Image correctly synthesized and compressed</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[2.5rem] w-full max-w-xl flex items-center justify-between shadow-xl mx-auto">
                <div className="text-left"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Original</p><p className="text-xl font-black text-slate-900">{fmtBytes(files[0].size)}</p></div>
                <div className="h-10 w-px bg-black/5" />
                <div className="text-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Finalized</p><p className="text-2xl font-black text-emerald-600">{fmtBytes(resultBlob.size)}</p></div>
                <div className="h-10 w-px bg-black/5" />
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Efficiency</p>
                  <Badge className="bg-emerald-500 text-white border-none font-black text-xs h-7">-{Math.round((savedBytes / files[0].size) * 100)}%</Badge>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(resultBlob, `${outputName}.${ext}`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Image
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