"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ToolWorkspace, 
  Drop, 
  Btn, 
  Done, 
  Range, 
  F, 
  G2, 
  Err, 
  IS, 
  ToolFile, 
  dl, 
  T, 
  fmtBytes 
} from "./_shared";
import { blurRegion } from "./_imageUtils";
import { 
  Eraser, 
  CheckCircle2, 
  Download, 
  Loader2, 
  Activity,
  X,
  ImageIcon,
  RefreshCcw,
  Zap,
  ShieldCheck,
  Settings2,
  Edit3,
  Crosshair
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import { useToast } from '../../hooks/use-toast';

/**
 * AJN Professional Anonymization Unit - Real-time Unit
 */
export default function BlurFace() {
  const { toast } = useToast();
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [w, setW] = useState(150);
  const [h, setH] = useState(150);
  const [radius, setRadius] = useState(15);
  const [preview, setPrev] = useState("");
  const [imgSz, setImgSz] = useState({w:0, h:0});
  const [drag, setDrag] = useState(false);
  const [start, setStart] = useState({x:0, y:0});

  const cRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!files.length) { setPrev(""); return; }
    const u = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => {
      setImgSz({w: img.naturalWidth, h: img.naturalHeight});
      setPrev(u);
      setPhase('configure');
      setOutputName(files[0].name.replace(/\.[^/.]+$/, "") + "_Anonymized");
    };
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [files]);

  useEffect(() => {
    const c = cRef.current;
    if (!c || !preview || !imgSz.w) return;
    const img = new Image();
    img.onload = () => {
      const scX = c.width / imgSz.w;
      const scY = c.height / imgSz.h;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      
      ctx.strokeStyle = T.red;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(x * scX, y * scY, w * scX, h * scY);
      ctx.setLineDash([]);
      ctx.fillStyle = T.red + "22";
      ctx.fillRect(x * scX, y * scY, w * scX, h * scY);
    };
    img.src = preview;
  }, [preview, x, y, w, h, imgSz]);

  const gp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = cRef.current!.getBoundingClientRect();
    const sX = imgSz.w / cRef.current!.width;
    const sY = imgSz.h / cRef.current!.height;
    return {
      x: Math.round((e.clientX - r.left) * sX),
      y: Math.round((e.clientY - r.top) * sY)
    };
  };

  const md = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = gp(e);
    setStart(p); setX(p.x); setY(p.y); setW(0); setH(0); setDrag(true);
  };

  const mm = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drag) return;
    const p = gp(e);
    setW(Math.max(1, p.x - start.x));
    setH(Math.max(1, p.y - start.y));
  };

  const run = async () => {
    if (!files.length) return;
    setPhase('processing');
    setProgress(0);
    setStatus("Executing local scrambling...");

    try {
      for(let i=0; i<=100; i+=25) {
        setProgress(i);
        await new Promise(r => setTimeout(r, 100));
      }
      
      const b = await blurRegion(files[0].file, x, y, w, h, radius);
      setResultBlob(b);
      setPhase('done');
    } catch (e: any) {
      setPhase('configure');
      toast({ title: "Process Error", variant: "destructive" });
    }
  };

  const reset = () => { setF([]); setPhase('upload'); setResultBlob(null); setPrev(""); setW(0); setH(0); };

  return (
    <ToolWorkspace title="Blur Face" description="HIDE FACES OR SENSITIVE DATA MANUALLY" icon="😶" badge="PRIVACY UNIT" accent="#4F46E5">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop Image to Anonymize" sub="Safe local buffer active" />
            </motion.div>
          )}

          {phase === 'configure' && files[0] && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{files[0].name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(files[0].size)} • Select Region Below</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Change File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Interactive Viewport (Drag to Select)</Label>
                  <Card className="bg-slate-900/5 border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[500px] flex items-center justify-center p-12">
                    <canvas 
                      ref={cRef} 
                      width={560} 
                      height={imgSz.h ? Math.round(560 * (imgSz.h / imgSz.w)) : 300}
                      className="cursor-crosshair shadow-2xl border-2 border-white/20 rounded-sm"
                      onMouseDown={md} onMouseMove={mm} onMouseUp={() => setDrag(false)} onMouseLeave={() => setDrag(false)}
                    />
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calibration</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-8 space-y-8 shadow-xl border-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label className="text-[9px] font-bold">X (left)</Label><Input type="number" value={x} readOnly className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">Y (top)</Label><Input type="number" value={y} readOnly className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">WIDTH</Label><Input type="number" value={w} readOnly className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                        <div className="space-y-2"><Label className="text-[9px] font-bold">HEIGHT</Label><Input type="number" value={h} readOnly className="h-10 bg-black/5 border-none font-bold rounded-xl" /></div>
                      </div>

                      <div className="space-y-6">
                        <div className="flex justify-between items-end">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Blur Intensity</Label>
                          <span className="text-xs font-black text-primary">{radius}px</span>
                        </div>
                        <input className="jn-range" type="range" min={4} max={60} step={2} value={radius} onChange={e => setRadius(+e.target.value)} />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Anonymized_Asset" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>
                    </Card>
                  </section>

                  <Button onClick={run} disabled={w < 5 || h < 5} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Finalize Scramble
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Image correctly anonymized locally</p>
              </div>
              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4">
                <Button onClick={() => dl(resultBlob, `${outputName}.jpg`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Anonymized
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
