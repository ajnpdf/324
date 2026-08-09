"use client";

import { RuntimeImage } from '@/components/ui/runtime-image';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolWorkspace, T, dl } from "./_shared";
import { Camera, X, Check, Loader2, Smartphone, Download, RefreshCcw, ShieldCheck, Activity } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { Progress } from "../ui/progress";

declare global {
  interface Window {
    cv: any;
    jscanify: any;
  }
}

interface Capture { 
  dataUrl: string; 
  id: string; 
}

/**
 * AJN Document Scanner - Hardened v15.2
 * Fixed: Explicit ArrayBuffer casting for SharedArrayBuffer stability.
 */
export default function DocumentScanner() {
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [result, setR] = useState<Blob | null>(null);
  const [loading, setL] = useState(false);
  const [err, setE] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scannerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const checkEngine = setInterval(() => {
      if (window.cv && window.jscanify) {
        scannerRef.current = new window.jscanify();
        setEngineReady(true);
        clearInterval(checkEngine);
      }
    }, 500);
    return () => {
      clearInterval(checkEngine);
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const tick = useCallback(() => {
    if (videoRef.current && canvasRef.current && scannerRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { alpha: false });

      if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          const resultCanvas = scannerRef.current.highlightPaper(canvas);
          ctx.drawImage(resultCanvas, 0, 0);
        } catch {}
      }
      frameRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const startCamera = async () => {
    setE("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play();
      }
      setCameraActive(true);
      frameRef.current = requestAnimationFrame(tick);
    } catch {
      setE("Camera access denied. Please verify browser permissions.");
    }
  };

  const capture = async () => {
    if (!canvasRef.current || !scannerRef.current || isCapturing) return;
    setIsCapturing(true);
    try {
      const canvas = canvasRef.current;
      const finalDoc = scannerRef.current.extractPaper(canvas, 1200, 1600);
      const dataUrl = finalDoc.toDataURL('image/jpeg', 0.95);
      setCaptures(prev => [...prev, { dataUrl, id: Math.random().toString(36).substr(7) }]);
    } catch {
      setE("Capture failed. Ensure document borders are visible.");
    } finally {
      setIsCapturing(false);
    }
  };

  const buildPdf = async () => {
    if (!captures.length) return;
    setL(true);
    setCompileProgress(0);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const doc = await PDFDocument.create();
      
      for (let i = 0; i < captures.length; i++) {
        const cap = captures[i];
        const res = await fetch(cap.dataUrl);
        const arrayBuf = await res.arrayBuffer();
        // Explicitly cast to ArrayBuffer to resolve BlobPart type issues
        const img = await doc.embedJpg(new Uint8Array(arrayBuf.slice(0) as ArrayBuffer));
        const page = doc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        setCompileProgress(Math.round(((i + 1) / captures.length) * 100));
      }
      
      const bytes = await doc.save();
      setR(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
      stopCamera();
    } catch {
      setE("The scanned pages could not be assembled.");
    }
    setL(false);
  };

  const reset = () => {
    setR(null);
    setCaptures([]);
    setE("");
    stopCamera();
  };

  return (
    <ToolWorkspace title="Document Scanner" description="CAPTURE AND STRAIGHTEN DOCUMENT PAGES" icon="📄" accent={T.teal} badge="DOCUMENT SCANNER">
      <div className="w-full max-w-4xl mx-auto space-y-10">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="text-center p-12 bg-white/40 rounded-[3rem] border border-black/5 shadow-2xl">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                  <Check className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-3xl font-black uppercase tracking-tight text-slate-950 mb-2">Scan ready</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-12">{captures.length} pages ready to export.</p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => result && dl(result, "scanned_doc.pdf")} className="h-16 px-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl gap-3 active:scale-95 transition-all">
                    <Download className="w-4 h-4" /> Download PDF
                  </Button>
                  <Button variant="outline" onClick={reset} className="h-16 px-12 border-black/10 bg-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black/5 transition-all">
                    <RefreshCcw className="w-4 h-4" /> Scan another
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="scanner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="relative aspect-video bg-slate-950 rounded-[3rem] overflow-hidden shadow-2xl border-4 border-black/5">
                <video ref={videoRef} playsInline className="absolute inset-0 w-full h-full object-cover opacity-0" />
                <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-700", cameraActive ? "opacity-100" : "opacity-0")} />
                <AnimatePresence>
                  {!cameraActive && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 space-y-4">
                      <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center border border-white/10"><Smartphone className="w-10 h-10" /></div>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Ready</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex flex-col items-center gap-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  {!cameraActive ? (
                    <Button onClick={startCamera} disabled={!engineReady} className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 activation:scale-95">
                      {engineReady ? <><Camera className="w-5 h-5" /> Start camera</> : <><Loader2 className="w-5 h-5 animate-spin" /> Calibrating...</>}
                    </Button>
                  ) : (
                    <div className="flex gap-4">
                      <Button onClick={capture} disabled={isCapturing} className="h-16 px-12 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                        {isCapturing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Capture page</>}
                      </Button>
                      <Button variant="ghost" onClick={stopCamera} className="h-16 w-16 rounded-2xl bg-white/40 backdrop-blur border border-black/5 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <X className="w-6 h-6" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {err && <p className="text-xs font-black uppercase text-red-500 tracking-widest">⚠️ {err}</p>}
                
                <div className="flex items-center gap-4 py-2 opacity-60">
                   <div className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /><span className="text-[8px] font-black uppercase tracking-widest">Runs in your browser</span></div>
                   <div className="w-1 h-1 rounded-full bg-slate-300" />
                   <div className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-primary" /><span className="text-[8px] font-black uppercase tracking-widest">Scanner ready</span></div>
                </div>
              </div>

              <AnimatePresence>
                {captures.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-10 border-t border-black/5">
                    <div className="flex items-center justify-between px-2">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Captured segments ({captures.length})</h4>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {captures.map((cap, i) => (
                        <motion.div key={cap.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative group w-24 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                          <RuntimeImage src={cap.dataUrl} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => setCaptures(prev => prev.filter(c => c.id !== cap.id))} className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"><X className="w-3.5 h-3.5" /></button>
                          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 backdrop-blur rounded text-[8px] font-black text-white">PAGE {i + 1}</div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="pt-6 flex flex-col gap-4">
                      {loading && (
                        <div className="space-y-2">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-primary"><span>Creating PDF…</span><span>{compileProgress}%</span></div>
                           <Progress value={compileProgress} />
                        </div>
                      )}
                      <Button onClick={buildPdf} disabled={loading} className="w-full h-16 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl hover:scale-[1.02] transition-all gap-3 border-2 border-white/10">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> Create PDF</>}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolWorkspace>
  );
}
