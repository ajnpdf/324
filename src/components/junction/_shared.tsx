"use client";
import React, { useCallback, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Download, RefreshCcw, ShieldCheck, Activity, Loader2, Upload, FileText, CheckCircle2 } from "lucide-react";
import { LogoAnimation } from "../landing/logo-animation";
import { cn } from "../../lib/utils";
import dynamic from 'next/dynamic';
import { Badge } from "../ui/badge";

const AdSenseUnit = dynamic(() => import('../adsense-unit').then(m => m.AdSenseUnit), { ssr: false });
const AdsMultiplex = dynamic(() => import('../ads-multiplex').then(m => m.AdsMultiplex), { ssr: false });

/* --- Types --- */
export interface ToolFile { file: File; name: string; size: number; }

/* --- Helpers --- */
export function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

export function dl(blob: Blob, name: string) {
  if (typeof window === 'undefined') return;
  const u = URL.createObjectURL(blob);
  const a = document.body.appendChild(document.createElement("a"));
  a.style.display = 'none';
  a.href = u; 
  a.download = name;
  a.click();
  
  setTimeout(() => {
    if (document.body.contains(a)) document.body.removeChild(a);
    URL.revokeObjectURL(u);
    window.dispatchEvent(new CustomEvent('trigger-ajn-feedback'));
  }, 2000);
}

/* --- Tokens --- */
export const T = {
  primary: "#467AF2",
  secondary: "#a885e2",
  tertiary: "#eb9040",
  dark: "#101b32",
  gray: "#717785",
  border: "rgba(16, 27, 50, 0.1)", 
  bg: "#faf9ff",
  white: "#FFFFFF",
  green: "#10B981",
  blue: "#467AF2",
  purple: "#a885e2",
  amber: "#eb9040",
};

/* --- Shared Styles --- */
export const IS: React.CSSProperties = { 
  width: "100%", 
  border: `1.5px solid rgba(16, 27, 50, 0.1)`, 
  borderRadius: 10, 
  padding: "10px 14px", 
  fontSize: 13, 
  outline: "none", 
  fontFamily: "inherit", 
  boxSizing: "border-box", 
  background: "#ffffff", 
  fontWeight: 600,
  transition: "all 0.2s ease"
};

export const SS: React.CSSProperties = { 
  ...IS, 
  cursor: "pointer" 
};

/* --- Shared UI Logic --- */
export function ToolWorkspace({ title, description, badge, children }: WorkspaceProps) {
  const router = useRouter();
  
  const parts = title.split(' ');
  const first = parts[0] || "";
  const rest = parts.slice(1).join(' ') || "";

  return (
    <div className="min-h-screen bg-[#faf9ff] font-sans text-slate-900 selection:bg-primary/30 antialiased">
      <header className="h-14 border-b border-black/5 bg-white/60 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <LogoAnimation className="w-14 h-7 md:w-16 md:h-8" showGlow={false} />
          </Link>
          <div className="h-5 w-px bg-black/5 hidden sm:block" />
          <button onClick={() => router.back()} className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center gap-1.5">
            <ArrowLeft size={11} /> BACK
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Safe session</span>
          </div>
          <Link href="/" className="w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center text-primary shadow-sm hover:scale-105 transition-all">
            <Home size={14} />
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10 md:py-16 text-center space-y-4">
        <div className="flex justify-center">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">{badge || "Unit"}</Badge>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tighter uppercase leading-none italic">
          {first} <span className="text-primary/40">{rest}</span>
        </h1>
        <p className="text-xs md:text-sm font-medium text-slate-500 uppercase tracking-widest max-xl mx-auto leading-relaxed opacity-80">
          {description}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-32 space-y-6">
        <AdSenseUnit />

        <div className="liquid-card jn-card p-8 md:p-10 space-y-6">
          {children}
        </div>

        <AdsMultiplex />
        
        <div className="pt-10 text-center opacity-30">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">AJN System • 2026 Engine</p>
        </div>
      </div>
    </div>
  );
}

export function Btn({ onClick, disabled, loading, children, variant = "primary", full, style }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: ReactNode;
  variant?: "primary"|"secondary"|"ghost"; full?: boolean; style?: React.CSSProperties;
}) {
  const v = {
    primary:   "bg-primary text-white shadow-md hover:scale-[1.02] hover:shadow-primary/20",
    secondary: "bg-white text-slate-900 border border-black/10 hover:bg-slate-50",
    ghost:     "bg-transparent text-primary border border-primary hover:bg-primary/5",
  };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled||loading} 
      className={cn(
        "inline-flex items-center justify-center gap-2 px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
        full && "w-full",
        v[variant]
      )}
      style={style}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}

export function Drop({ files, onChange, accept="*", multiple=false, label, sub }: {
  files: ToolFile[]; onChange: (f: ToolFile[]) => void;
  accept?: string; multiple?: boolean; label?: string; sub?: string;
}) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const add = useCallback((raw: FileList|null) => {
    if (!raw) return;
    const arr = Array.from(raw).map(f => ({ file: f, name: f.name, size: f.size }));
    onChange(multiple ? [...files,...arr] : arr);
  }, [files,multiple,onChange]);

  return (
    <div className="space-y-3">
      <div 
        className={cn(
          "h-48 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group",
          drag ? "border-primary bg-primary/5 scale-[0.99]" : "border-black/5 bg-slate-50/50 hover:border-primary/40 hover:bg-white"
        )}
        onClick={() => ref.current?.click()}
        onDragOver={e=>{e.preventDefault();setDrag(true)}}
        onDragLeave={() => setDrag(false)}
        onDrop={e=>{e.preventDefault();setDrag(false);add(e.dataTransfer.files)}}
      >
        <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e=>add(e.target.files)} />
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md mb-4 group-hover:scale-110 transition-transform duration-500 border border-black/5">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <p className="text-base font-bold uppercase tracking-tight text-slate-900">{drag ? "Drop now" : (label || "Load Files")}</p>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{sub || "Safe local session"}</p>
      </div>

      {files.length > 0 && (
        <div className="grid gap-2">
          {files.map((f, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-xl shadow-sm animate-in slide-in-from-bottom-1">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                  <FileText size={14} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-bold truncate uppercase text-slate-950">{f.name}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{fmtBytes(f.size)}</p>
                </div>
              </div>
              <button onClick={()=>onChange(files.filter((_,j) => j !== i))} className="h-7 w-7 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all flex items-center justify-center text-lg">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Done({ msg="Process Complete!", onDownload, dlLabel="Download", onReset }: {
  msg?:string; onDownload?:() => void; dlLabel?:string; onReset: () => void;
}) {
  return (
    <div className="py-8 flex flex-col items-center text-center space-y-8 animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase text-slate-950 italic">{msg}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing correct locally</p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-[300px]">
        {onDownload && (
          <Button onClick={onDownload} className="h-14 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-md transition-all border-2 border-white/20">
            <Download className="w-4 h-4" /> {dlLabel}
          </Button>
        )}
        <button onClick={onReset} className="h-10 flex-1 rounded-xl font-black text-[8px] uppercase text-slate-400 gap-2 flex items-center justify-center hover:bg-black/5 transition-all tracking-widest">
          <RefreshCcw className="w-3.5 h-3.5" /> NEW SESSION
        </button>
      </div>
    </div>
  );
}

export function Range({ label, value, min, max, step=1, onChange, fmt }: {
  label:string; value:number; min:number; max:number; step?:number;
  onChange:(v:number)=>void; fmt?:(v:number)=>string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
        <span className="text-base font-black text-primary italic tabular-nums">{fmt?.(value)??value}</span>
      </div>
      <input className="jn-range h-1.5" type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(+e.target.value)} />
    </div>
  );
}

export function Pills<T extends string|number>({ opts, val, onChange }: {
  opts:{label:string;value:T}[]; val:T; onChange:(v:T)=>void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map(o=>(
        <button 
          key={String(o.value)} 
          onClick={() => onChange(o.value)}
          className={cn(
            "px-5 h-9 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
            val === o.value 
              ? "bg-primary text-white border-primary shadow-sm" 
              : "bg-white text-slate-400 border-black/5 hover:border-primary/20"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function F({ label, hint, children }: { label:string; hint?:string; children:ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">{label}</label>
      {children}
      {hint && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide leading-relaxed px-1">{hint}</p>}
    </div>
  );
}

export function G2({ children, gap=12 }: { children:ReactNode; gap?:number }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ gap }}>{children}</div>;
}

export function Err({ msg }: { msg:string }) {
  return msg ? <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest">⚠️ {msg}</div> : null;
}

export function Info({ bg="#EFF6FF", col="#1E40AF", children }: { bg?:string; col?:string; children:ReactNode }) {
  return <div className="p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest leading-relaxed border border-black/5" style={{ background: bg, color: col }}>{children}</div>;
}

export interface WorkspaceProps {
  title: string;
  description: string;
  icon: string;
  accent?: string;
  badge?: string;
  children: ReactNode;
}
