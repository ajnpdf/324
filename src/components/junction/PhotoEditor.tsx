"use client";

import { RuntimeImage } from '@/components/ui/runtime-image';
import React, { useState, useEffect } from "react";
import { ToolWorkspace, Drop, Range, ToolFile, dl, T, fmtBytes } from "./_shared";
import { editPhoto } from "./_imageUtils";
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  Settings2, 
  RefreshCcw, 
  Sparkles,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Zap,
  Download,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const FILTERS = [
  { v: "none", l: "None", icon: "🎨" },
  { v: "grayscale", l: "Grayscale", icon: "⚫" },
  { v: "sepia", l: "Sepia", icon: "🟤" },
  { v: "invert", l: "Invert", icon: "🔄" },
  { v: "warm", l: "Warm", icon: "🌅" },
  { v: "cool", l: "Cool", icon: "❄️" },
];

export default function PhotoEditor() {
  const [files, setF] = useState<ToolFile[]>([]);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  
  const [settings, setSettings] = useState({
    brightness: 1.0,
    contrast: 1.0,
    saturation: 1.0,
    exposure: 0,
    filter: "none",
    rotation: 0,
    flipH: false,
    flipV: false
  });

  const [, setL] = useState(false);
  const [result, setR] = useState<Blob | null>(null);
  const [preview, setPrev] = useState("");
  const [, setE] = useState("");

  useEffect(() => {
    if (!files.length) { setPrev(""); return; }
    const u = URL.createObjectURL(files[0].file);
    setPrev(u);
    setPhase('configure');
    return () => URL.revokeObjectURL(u);
  }, [files]);

  const cssFilter = `
    brightness(${settings.brightness}) 
    contrast(${settings.contrast}) 
    saturate(${settings.saturation})
    ${settings.filter === "grayscale" ? "grayscale(100%)" : ""}
    ${settings.filter === "sepia" ? "sepia(100%)" : ""}
    ${settings.filter === "invert" ? "invert(100%)" : ""}
    ${settings.filter === "warm" ? "sepia(40%) saturate(1.4) hue-rotate(-10deg)" : ""}
    ${settings.filter === "cool" ? "hue-rotate(180deg) saturate(0.8)" : ""}
  `;

  const run = async () => {
    if (!files.length) { setE("Upload an image."); return; }
    setE(""); setL(true);
    setPhase('processing');
    try {
      const blob = await editPhoto(files[0].file, settings);
      setR(blob);
      setPhase('done');
    } catch (e: any) {
      setE(e.message);
      setPhase('configure');
    }
    setL(false);
  };

  const resetSettings = () => {
    setSettings({
      brightness: 1.0,
      contrast: 1.0,
      saturation: 1.0,
      exposure: 0,
      filter: "none",
      rotation: 0,
      flipH: false,
      flipV: false
    });
  };

  const resetAll = () => {
    setF([]);
    setR(null);
    setPrev("");
    setPhase('upload');
    resetSettings();
  };

  return (
    <ToolWorkspace title="Photo Editor" description="ADJUST BRIGHTNESS, CONTRAST, AND COLOUR" icon="🎨" accent={T.pink} badge="PHOTO EDITOR">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <Drop files={files} onChange={setF} accept=".jpg,.jpeg,.png,.webp,.bmp" label="Drop Image to Edit" sub="RAW pixels stay private on your device" />
            </motion.div>
          )}

          {phase === 'configure' && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-10">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{files[0]?.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(files[0]?.size || 0)} • Image ready</p>
                  </div>
                </div>
                <button onClick={resetAll} className="text-[10px] font-black uppercase text-red-500 hover:underline">Reset</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-7 space-y-4">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Preview</Label>
                  <Card className="bg-slate-900/5 border-black/5 rounded-[3rem] shadow-inner min-h-[600px] flex items-center justify-center p-12 overflow-hidden relative">
                    <div className="absolute inset-0 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:20px_20px]" />
                    {preview && (
                      <motion.div 
                        layout
                        className="relative shadow-2xl transition-all duration-500"
                        style={{ 
                          filter: cssFilter,
                          transform: `rotate(${settings.rotation}deg) scaleX(${settings.flipH ? -1 : 1}) scaleY(${settings.flipV ? -1 : 1})`
                        }}
                      >
                        <RuntimeImage src={preview} alt="preview" className="max-h-[500px] w-auto rounded-sm border border-white/20" />
                      </motion.div>
                    )}
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Controls</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-[2.5rem] p-8 space-y-10 shadow-xl border-2">
                      <div className="space-y-6">
                        <Range label="☀️ Brightness" value={Math.round(settings.brightness * 100)} min={10} max={250} onChange={v => setSettings({...settings, brightness: v / 100})} fmt={v => `${v}%`} />
                        <Range label="🌓 Contrast" value={Math.round(settings.contrast * 100)} min={50} max={200} onChange={v => setSettings({...settings, contrast: v / 100})} fmt={v => `${v}%`} />
                        <Range label="🌈 Saturation" value={Math.round(settings.saturation * 100)} min={0} max={200} onChange={v => setSettings({...settings, saturation: v / 100})} fmt={v => `${v}%`} />
                        <Range label="💡 Exposure" value={settings.exposure} min={-100} max={100} onChange={v => setSettings({...settings, exposure: v})} fmt={v => v > 0 ? `+${v}` : `${v}`} />
                      </div>

                      <div className="pt-6 border-t border-black/5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Transformation</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" className="h-11 rounded-xl bg-white border-black/5 hover:bg-black/5" onClick={() => setSettings({...settings, rotation: (settings.rotation + 90) % 360})}><RotateCw className="w-4 h-4" /></Button>
                          <Button variant="outline" className={cn("h-11 rounded-xl border-black/5 transition-all", settings.flipH && "bg-primary/10 border-primary text-primary")} onClick={() => setSettings({...settings, flipH: !settings.flipH})}><FlipHorizontal className="w-4 h-4" /></Button>
                          <Button variant="outline" className={cn("h-11 rounded-xl border-black/5 transition-all", settings.flipV && "bg-primary/10 border-primary text-primary")} onClick={() => setSettings({...settings, flipV: !settings.flipV})}><FlipVertical className="w-4 h-4" /></Button>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-black/5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-4 block">Filters</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {FILTERS.map(f => (
                            <button 
                              key={f.v} 
                              onClick={() => setSettings({...settings, filter: f.v})}
                              className={cn(
                                "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1",
                                settings.filter === f.v ? "bg-primary text-white shadow-lg scale-95" : "bg-black/5 text-slate-500 hover:bg-black/10"
                              )}
                            >
                              <span>{f.icon}</span>
                              <span className="scale-75">{f.l}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-center justify-center gap-2 text-emerald-600 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Runs in your browser</span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={resetSettings} className="flex-1 h-14 font-black text-[10px] uppercase tracking-widest">Reset</Button>
                    <Button onClick={run} className="flex-[2] h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                      <Zap className="w-4 h-4" /> Save image
                    </Button>
                  </div>
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
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Processing image…</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Preparing your edited image…</p>
              </div>
            </div>
          )}

          {phase === 'done' && result && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Your image is ready</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Output file</p>
                  <p className="text-sm font-black text-slate-950 truncate">edited.jpg</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(result, "Edited_Photo.jpg")} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Retouched Image
                </Button>
                <button onClick={resetAll} className="h-12 rounded-xl font-black text-[10px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all">
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
