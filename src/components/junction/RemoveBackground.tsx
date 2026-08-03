"use client";
import React, { useState, useEffect } from "react";
import { 
  ToolWorkspace, 
  Drop, 
  Done, 
  Range, 
  Err, 
  ToolFile, 
  dl, 
  T, 
  fmtBytes 
} from "./_shared";
import { removeBackground } from "./_imageUtils";
import { 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Loader2, 
  Settings2,
  RefreshCcw,
  Sparkles,
  Zap,
  AlertTriangle,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";
import { useToast } from "../../hooks/use-toast";

/**
 * AJN Professional Background Removal Unit
 * Specialized in local raster isolation and subject extraction.
 */
export default function RemoveBackground() {
  const { toast } = useToast();
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  
  const [settings, setSettings] = useState({
    threshold: 30,
    backgroundMode: 'transparent' as 'transparent' | 'solid',
    bgColor: '#ffffff'
  });

  const [loading, setL] = useState(false);
  const [result, setR] = useState<Blob | null>(null);
  const [preview, setPrev] = useState("");
  const [err, setE] = useState("");

  useEffect(() => {
    if (!files.length) { setPrev(""); return; }
    const u = URL.createObjectURL(files[0].file);
    const img = new Image();
    img.onload = () => {
      setImgSz({w: img.naturalWidth, h: img.naturalHeight});
      setPrev(u);
      setPhase('configure');
    };
    img.src = u;
    return () => URL.revokeObjectURL(u);
  }, [files]);

  const [imgSz, setImgSz] = useState({w:0, h:0});

  const run = async () => {
    if (!files.length) return;
    setE(""); setL(true);
    setPhase('processing');
    try {
      const blob = await removeBackground(files[0].file, settings.threshold);
      
      let finalBlob = blob;
      if (settings.backgroundMode === 'solid') {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = url;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = settings.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        const solidBlob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), 'image/jpeg', 0.95));
        finalBlob = new Blob([await solidBlob.arrayBuffer()], { type: 'image/jpeg' });
        URL.revokeObjectURL(url);
      }

      setR(finalBlob);
      setPhase('done');
    } catch (e: any) {
      setE(e.message);
      setPhase('configure');
    }
    setL(false);
  };

  const resetAll = () => {
    setF([]);
    setR(null);
    setPrev("");
    setPhase('upload');
  };

  return (
    <ToolWorkspace title="Remove Background" description="AUTOMATED RASTER ISOLATION & SUBJECT EXTRACTION" icon="🪄" accent={T.purple} badge="NEURAL UNIT">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop Photo to Process" sub="Pixel data remains 100% local" />
            </motion.div>
          )}

          {phase === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
              {/* MAINTENANCE NOTICE */}
              <div className="p-6 bg-amber-500/10 border-2 border-amber-500/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl animate-in zoom-in-95 duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shrink-0 border border-amber-500/10">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="text-sm font-black uppercase tracking-tight text-amber-700">Unit Under Process</h4>
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest leading-relaxed">
                    We are currently upgrading this tool to a neural-based AI model. <br className="hidden md:block" /> 
                    The current local heuristic engine may have difficulty with complex backgrounds.
                  </p>
                </div>
                <div className="md:ml-auto">
                  <Badge className="bg-amber-500 text-white border-none font-black text-[9px] px-3 h-6 uppercase tracking-[0.2em]">Calibration Active</Badge>
                </div>
              </div>

              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{files[0]?.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(files[0]?.size || 0)} • Target: {settings.backgroundMode.toUpperCase()}</p>
                  </div>
                </div>
                <button onClick={resetAll} className="text-[10px] font-black uppercase text-red-500 hover:underline">Flush Workspace</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-4">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Isolation Preview</Label>
                  <Card className="bg-slate-950/5 border-black/5 rounded-[3rem] shadow-inner min-h-[600px] flex items-center justify-center p-12 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:20px_20px]" />
                    {preview && (
                      <motion.div 
                        layout
                        className="relative shadow-2xl transition-all duration-500"
                      >
                        <img src={preview} alt="preview" className="max-h-[500px] w-auto rounded-sm border border-white/20" />
                      </motion.div>
                    )}
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Calibration</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-[2.5rem] p-8 space-y-10 shadow-xl border-2">
                      <div className="space-y-6">
                        <Range label="Edge Sensitivity" value={settings.threshold} min={5} max={150} onChange={v => setSettings({...settings, threshold: v})} fmt={v => `${v}px`} />
                      </div>

                      <div className="pt-6 border-t border-black/5 space-y-6">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Output Synthesis</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <Button 
                            variant="outline" 
                            className={cn("h-12 rounded-2xl border-black/5 transition-all flex flex-col items-center justify-center gap-1", settings.backgroundMode === 'transparent' && "bg-primary/10 border-primary text-primary")} 
                            onClick={() => setSettings({...settings, backgroundMode: 'transparent'})}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">Transparent</span>
                            <span className="text-[8px] opacity-60">PNG Format</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className={cn("h-12 rounded-2xl border-black/5 transition-all flex flex-col items-center justify-center gap-1", settings.backgroundMode === 'solid' && "bg-primary/10 border-primary text-primary")} 
                            onClick={() => setSettings({...settings, backgroundMode: 'solid'})}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest">Solid Color</span>
                            <span className="text-[8px] opacity-60">JPG Format</span>
                          </Button>
                        </div>

                        {settings.backgroundMode === 'solid' && (
                          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Fill Color</Label>
                            <div className="flex gap-3">
                              <div className="relative w-full h-11 rounded-2xl border border-black/5 overflow-hidden shadow-inner cursor-pointer group">
                                <input type="color" value={settings.bgColor} onChange={(e) => setSettings({...settings, bgColor: e.target.value})} className="absolute inset-0 w-full h-full scale-150 cursor-pointer" />
                              </div>
                              <Input value={settings.bgColor} onChange={(e) => setSettings({...settings, bgColor: e.target.value})} className="h-11 text-[10px] font-mono uppercase bg-white border-black/5 rounded-2xl w-32 font-black" />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-start gap-4">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed tracking-wide text-center w-full">
                      Everything runs in your browser RAM. Your documents never touch our nodes.
                    </p>
                  </div>

                  <Button onClick={run} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Execute Extraction
                  </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <div className="py-32 flex flex-col items-center space-y-8 text-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Isolating Foreground</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Hardware-accelerated edge detection...</p>
              </div>
            </div>
          )}

          {phase === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center space-y-10 text-center pb-32">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Subject isolated successfully</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Final Binary</p>
                  <p className="text-sm font-black text-slate-950 truncate">Isolated_Cutout.png</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4">
                <Button onClick={() => dl(result, settings.backgroundMode === 'transparent' ? "Isolated_Cutout.png" : "Solid_Background.jpg")} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Result
                </Button>
                <button onClick={resetAll} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
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
