
"use client";
import React, { useCallback, useRef, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Home, ArrowLeft, Download, CheckCircle2, RefreshCcw } from "lucide-react";
import { LogoAnimation } from "@/components/landing/logo-animation";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
export interface ToolFile {
  file: File;
  name: string;
  size: number;
  url?: string;
}

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
export function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${((b / 1024)).toFixed(1)} KB`;
  return `${((b / 1048576)).toFixed(1)} MB`;
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.body.appendChild(document.createElement("a"));
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    // Trigger feedback modal after download
    window.dispatchEvent(new CustomEvent('trigger-ajn-feedback'));
  }, 2000);
}

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────────────────────── */
export const C = {
  red: "#E8380D",
  redLight: "#FF5733",
  dark: "#1A1A2E",
  gray: "#475569",
  grayLight: "rgba(30, 41, 59, 0.1)",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  green: "#10B981",
  blue: "#2563EB",
  purple: "#7C3AED",
  amber: "#D97706",
};

export const S = {
  card: {
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: 26,
    backdropFilter: "blur(25px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7)",
    padding: "clamp(0.5rem, 2vw, 1rem)",
  } as React.CSSProperties,
  label: {
    fontSize: 11,
    fontWeight: 900,
    color: "#374151",
    display: "block",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  } as React.CSSProperties,
  input: {
    width: "100%",
    border: `1.5px solid rgba(30, 41, 59, 0.1)`,
    borderRadius: 14,
    padding: "10px 13px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.6)",
    fontWeight: 700,
  } as React.CSSProperties,
  select: {
    width: "100%",
    border: `1.5px solid rgba(30, 41, 59, 0.1)`,
    borderRadius: 14,
    padding: "10px 13px",
    fontSize: 14,
    background: "#fff",
    outline: "none",
    cursor: "pointer",
    boxSizing: "border-box",
    fontWeight: 700,
  } as React.CSSProperties,
};

/* ─────────────────────────────────────────────────────────────
   BUTTON
───────────────────────────────────────────────────────────── */
export interface BtnProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  full?: boolean;
  fullWidth?: boolean;
  type?: "button" | "submit";
  style?: React.CSSProperties;
}
export function Btn({ onClick, disabled, loading, children, variant = "primary", full, fullWidth, type = "button", style }: BtnProps) {
  const isFull = full || fullWidth;
  const base: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 900,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    border: "none", transition: "all 0.2s", width: isFull ? "100%" : undefined,
    opacity: disabled || loading ? 0.6 : 1, fontFamily: "inherit",
    textTransform: "uppercase", letterSpacing: "0.1em",
    ...style,
  };
  const colors = {
    primary: { background: "#0a0e14", color: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.15)" },
    secondary: { background: "rgba(255,255,255,0.6)", color: "#0a0e14", border: `1.5px solid rgba(0,0,0,0.05)` },
    danger: { background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} style={{ ...base, ...colors[variant] }} className="active:scale-95">
      {loading && <Spinner size={14} color={variant === "primary" ? "#fff" : C.red} />}
      {children}
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   SPINNER
───────────────────────────────────────────────────────────── */
export function Spinner({ size = 20, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: `2.5px solid ${color}40`, borderTopColor: color,
      borderRadius: "50%", animation: "ajn-spin 0.7s linear infinite",
    }} />
  );
}

/* ─────────────────────────────────────────────────────────────
   FILE DROPZONE
───────────────────────────────────────────────────────────── */
interface DropzoneProps {
  accept?: string;
  multiple?: boolean;
  files: ToolFile[];
  onChange: (files: ToolFile[]) => void;
  label?: string;
  sublabel?: string;
}
export function Dropzone({ accept, multiple, files, onChange, label, sublabel }: DropzoneProps) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((raw: FileList | null) => {
    if (!raw) return;
    const arr = Array.from(raw).map(f => ({ file: f, name: f.name, size: f.size }));
    onChange(multiple ? [...files, ...arr] : arr);
  }, [files, multiple, onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${drag ? C.blue : "rgba(30, 41, 59, 0.1)"}`,
          borderRadius: 24, padding: "clamp(1rem, 4vh, 1.5rem) 1rem", textAlign: "center",
          cursor: "pointer", background: drag ? "rgba(37,99,235,0.05)" : "rgba(255,255,255,0.3)",
          transition: "all 0.3s",
        }}
        className="hover:border-primary/40"
      >
        <input ref={ref => { (inputRef as any).current = ref; }} type="file" accept={accept} multiple={multiple} style={{ display: "none" }}
          onChange={e => addFiles(e.target.files)} />
        <div style={{ fontSize: 24, marginBottom: 4 }}>☁️</div>
        <p style={{ fontWeight: 900, fontSize: 13, color: "#111827", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {drag ? "Drop it here!" : (label || "Drop files or click to browse")}
        </p>
        <p style={{ fontSize: 8, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.6 }}>{sublabel || "Files stay private on your device"}</p>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} className="jn-file-pill">
              <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                <span style={{ fontSize: 18 }}>📄</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#111827" }}>{f.name}</p>
                  <p style={{ fontSize: 9, color: "#6B7280", margin: 0, fontWeight: 700 }}>{formatBytes(f.size)}</p>
                </div>
              </div>
              <button onClick={() => onChange(files.filter((_, j) => j !== i))}
                style={{ background: "rgba(0,0,0,0.05)", border: "none", cursor: "pointer", color: "#6B7280", fontSize: 14, width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }} className="hover:bg-red-50 hover:text-red-500 transition-colors">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUCCESS STATE
───────────────────────────────────────────────────────────── */
interface DoneProps {
  message?: string;
  onReset: () => void;
  onDownload?: () => void;
  downloadLabel?: string;
}
export function DoneState({ message = "Process Complete!", onReset, onDownload, downloadLabel = "Download" }: DoneProps) {
  return (
    <div style={{ textAlign: "center", padding: "0.25rem" }} className="animate-in zoom-in-95 duration-500">
      <div style={{
        width: 60, height: 60, borderRadius: "50%", background: "rgba(16,185,129,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, margin: "0 auto 16px", border: "2px solid rgba(16,185,129,0.2)"
      }} className="flex items-center justify-center">✅</div>
      <h2 style={{ fontSize: "clamp(1.25rem, 4vw, 1.5rem)", fontWeight: 900, color: "#0a0e14", marginBottom: 6, textTransform: "uppercase", letterSpacing: "-0.02em" }}>{message}</h2>
      <p style={{ fontSize: 10, color: "#475569", marginBottom: 24, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6 }}>Processed entirely in your browser.</p>
      
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        {onDownload && (
          <Btn onClick={onDownload} style={{ height: 48, padding: "0 32px", background: "#10B981" }}>
            <Download size={16} /> {downloadLabel}
          </Btn>
        )}
        <Btn variant="secondary" onClick={onReset} style={{ height: 48, padding: "0 24px" }}>
          <RefreshCcw size={14} /> New Process
        </Btn>
      </div>

      <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(0,0,0,0.05)" }}>
        <p style={{ fontSize: 8, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.4 }}>
          Private Buffer Integrity Verified
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TOOL LAYOUT
───────────────────────────────────────────────────────────── */
interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  accentColor?: string;
  children: ReactNode;
}
export function ToolLayout({ title, description, icon, accentColor = "#0a0e14", children }: ToolLayoutProps) {
  const router = useRouter();
  
  const parts = title.split(' ');
  const first = parts[0] || "";
  const rest = parts.slice(1).join(' ') || "";

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: var(--font-inter), sans-serif; background: transparent; color: #111827; }
        @keyframes ajn-spin { to { transform: rotate(360deg); } }
        @keyframes ajn-fadeup { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        .ajn-card { animation: ajn-fadeup 0.4s ease-out; }
        .jn-range { -webkit-appearance: none; height: 6px; border-radius: 3px; background: rgba(0,0,0,0.05); outline: none; cursor: pointer; }
        .jn-range::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${accentColor}; cursor: pointer; boxShadow: 0 4px 12px ${accentColor}44; border: 2px solid white; }
        .jn-range::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: ${accentColor}; border: 2px solid white; cursor: pointer; }
        input[type=checkbox] { accent-color: ${accentColor}; cursor: pointer; transform: scale(1.1); }
        @media (max-width: 640px) { .jn-grid2 { grid-template-columns: 1fr !important; gap: 8px !important; } }
      `}</style>

      <div style={{ minHeight: "100vh", background: "transparent" }}>
        {/* Header */}
        <div style={{
          background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)", borderBottom: `1px solid rgba(0,0,0,0.05)`,
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              <LogoAnimation className="w-12 h-6 md:w-16 md:h-8" showGlow={false} />
            </Link>
            <div style={{ width: 1, height: 20, background: "rgba(0,0,0,0.05)", margin: "0 2px" }} />
            <button 
              onClick={() => router.back()}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 9, fontWeight: 900, color: "#475569",
                textTransform: "uppercase", letterSpacing: "0.1em",
                display: "flex", alignItems: "center", gap: 3
              }}
            >
              <ArrowLeft size={11} /> Back
            </button>
          </div>
          
          <Link href="/" style={{ width: 32, height: 32, borderRadius: 10, background: "white", border: "1px solid rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e3a8a", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <Home size={16} />
          </Link>
        </div>

        {/* Hero */}
        <div style={{
          padding: "clamp(80px, 12vh, 120px) 1rem 0.15rem", textAlign: "center"
        }}>
          <h1 style={{ fontSize: "clamp(24px, 6vw, 42px)", fontWeight: 900, color: "#111827", margin: "0", letterSpacing: "-0.05em", textTransform: "uppercase", lineHeight: 0.85, fontStyle: "italic" }}>
            {first} <span style={{ color: "rgba(17,24,39,0.3)" }}>{rest}</span>
          </h1>
          <p style={{ fontSize: 9, color: "#4B5563", margin: "6px 0 0", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", opacity: 0.6 }}>{description}</p>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 1rem 2rem" }}>
          <div className="ajn-card" style={S.card}>
            {children}
          </div>
          
          {/* Industrial Disclaimer */}
          <div style={{ marginTop: 24, textAlign: "center", opacity: 0.3 }}>
            <p style={{ fontSize: 8, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: "0.2em" }}>
              AJN can make mistakes. Verify important files.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   UI COMPONENTS
───────────────────────────────────────────────────────────── */
export function Slider({ label, value, min, max, step = 1, onChange, format }: {
  label: string; value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <label style={{ fontSize: 9, fontWeight: 900, color: "#374151", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
        <span style={{ fontSize: 9, color: C.gray, fontWeight: 900 }}>{format ? format(value) : value}</span>
      </div>
      <input className="jn-range" type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Pills<T extends string | number>({ options, value, onChange, color = C.dark }: {
  options: { label: string; value: T }[]; value: T; onChange: (v: T) => void; color?: string;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
      {options.map(o => (
        <button key={String(o.value)} onClick={() => onChange(o.value)}
          style={{
            padding: "5px 10px", borderRadius: 10, fontSize: 9, fontWeight: 900, cursor: "pointer", border: "none",
            background: value === o.value ? color : "rgba(0,0,0,0.05)",
            color: value === o.value ? "#fff" : "#374151",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GRID WRAPPER
───────────────────────────────────────────────────────────── */
export function Grid2({ children, gap = 8 }: { children: ReactNode; gap?: number }) {
  return (
    <div className="jn-grid2" style={{ gap, display: "grid", gridTemplateColumns: "1fr 1fr" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FIELD WRAPPER
───────────────────────────────────────────────────────────── */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <label style={{ fontSize: 9, fontWeight: 900, color: "#374151", display: "block", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize: 8, color: "#6B7280", margin: 0, fontWeight: 700, textTransform: "uppercase", opacity: 0.5, letterSpacing: "0.05em" }}>{hint}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   INFO BOX
───────────────────────────────────────────────────────────── */
export function InfoBox({ children, color = "rgba(37,99,235,0.05)", textColor = "#1E40AF" }: { children: ReactNode; color?: string; textColor?: string }) {
  return (
    <div style={{ background: color, borderRadius: 12, padding: "8px 12px", fontSize: 10, color: textColor, lineHeight: 1.4, fontWeight: 700, border: "1px solid rgba(0,0,0,0.05)" }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   DIVIDER
───────────────────────────────────────────────────────────── */
export function Divider() {
  return <div style={{ height: 1, background: "rgba(0,0,0,0.05)", margin: "0.75rem 0" }} />;
}

/* ─────────────────────────────────────────────────────────────
   PROGRESS BAR
───────────────────────────────────────────────────────────── */
export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "#475569", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>
          <span>{label}</span><span>{Math.round(value)}%</span>
        </div>
      )}
      <div style={{ background: "rgba(0,0,0,0.05)", borderRadius: 4, height: 6, overflow: "hidden", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)" }}>
        <div style={{ height: "100%", width: `${value}%`, background: "#0a0e14", borderRadius: 4, transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      </div>
    </div>
  );
}
