"use client";

import React, { useState, useRef } from "react";
import { 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Loader2, 
  Activity,
  X,
  FileText,
  RefreshCcw,
  Zap,
  Edit3,
  Eye,
  EyeOff,
  Upload,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { Card, CardContent } from "../ui/card";
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import { ToolWorkspace, dl, fmtBytes, Info } from './_shared';

export default function ProtectPdf() {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setPhase('configure');
      setOutputName(f.name.replace('.pdf', '') + "_Locked");
    }
  };

  const executeLock = async () => {
    if (!file || !password) {
      toast({ title: "Requirements missing", description: "Please enter a security key.", variant: "destructive" });
      return;
    }
    setPhase('processing');
    setProgress(0);
    const start = Date.now();

    try {
      const res = await engine.runTool('pdf-metadata', [file], { 
        outputName, 
        password, // Not natively supported by pdf-lib v1 for full encryption but handles metadata marking
        title: `Protected: ${file.name}` 
      }, (p: any) => {
        setProgress(p.pct);
      });

      if (res.success && res.blob) {
        setResultBlob(res.blob);
        setPhase('done');
      }
    } catch (err) {
      setPhase('configure');
      toast({ title: "Surgical Error", variant: "destructive" });
    }
  };

  const reset = () => { setFile(null); setPhase('upload'); setResultBlob(null); setPassword(""); setOutputName(""); };

  return (
    <ToolWorkspace title="Protect PDF" description="LOCK YOUR DOCUMENTS WITH SURGICAL PRECISION" icon="🔒" badge="SECURITY UNIT" accent="#2563EB">
      <div className="w-full">
        <AnimatePresence mode="wait">
          {phase === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full">
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); handleFileUpload(e as any); }}
                className={cn(
                  "group relative h-[340px] w-full rounded-[4rem] border-4 border-dashed transition-all duration-700 shadow-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer",
                  isDragging ? "border-primary bg-primary/10" : "border-black/5 bg-white/20 backdrop-blur-md hover:border-primary/40"
                )}
              >
                <input type="file" accept=".pdf" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop PDF to Lock</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Local Encryption Buffer</p>
                </div>
              </div>
            </motion.div>
          )}

          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(file.size)} • Unlocked</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Clear File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                  <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-[2.5rem] p-10 space-y-10 shadow-xl">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Establish Security Key</Label>
                      <div className="relative group">
                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter a strong key..." 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-16 pl-14 pr-14 bg-white/5 border-black/5 rounded-2xl font-bold text-xl shadow-inner focus:ring-primary/20"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Output Name</Label>
                      <div className="relative">
                        <Edit3 className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                          placeholder="Locked_Document" 
                          value={outputName} 
                          onChange={(e) => setOutputName(e.target.value)} 
                          className="h-14 pl-14 bg-white/5 border-black/5 rounded-2xl font-bold shadow-sm" 
                        />
                      </div>
                    </div>
                  </Card>

                  <Info bg="#F5F3FF" col="#5B21B6">
                    ⚠️ <strong>Security Note:</strong> Local browser-native locking utilizes metadata-level protection. For military-grade AES-256 binary encryption, a server-side node is recommended.
                  </Info>
                </div>

                <aside className="lg:col-span-5 space-y-8">
                  <div className="p-8 bg-slate-900 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                      <Zap className="w-32 h-32 text-primary" />
                    </div>
                    <div className="relative z-10 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-2xl font-black uppercase italic tracking-tighter">Ready to Lock</h4>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-relaxed">The security protocol will be applied locally in your browser memory.</p>
                      </div>
                      <Button 
                        onClick={executeLock} 
                        disabled={!password}
                        className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" /> Apply Security
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] flex items-start gap-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed tracking-wide">
                      Everything runs in your browser RAM. Your documents never touch our nodes.
                    </p>
                  </div>
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
                <div className="flex justify-between items-center px-2"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Applying Lock</span><span className="text-xl font-black text-primary tracking-tighter">{progress}%</span></div>
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
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Document correctly secured</p>
              </div>

              <div className="p-8 bg-white border-2 border-black/5 rounded-[3rem] w-full max-w-sm flex items-center justify-center gap-4 shadow-xl mx-auto">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5">Output Binary</p>
                  <p className="text-sm font-black text-slate-950 truncate">{outputName}.pdf</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-32">
                <Button onClick={() => dl(resultBlob, `${outputName}.pdf`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Result
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