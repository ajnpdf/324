"use client";

import React, { useState, useRef, useEffect } from "react";
import * as pdfjsLib from 'pdfjs-dist';
import { 
  Download, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Edit3,
  Loader2,
  X,
  FileSpreadsheet,
  Activity,
  Upload,
  ShieldCheck,
  Table as TableIcon,
  Settings2,
  ArrowRight,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../lib/i18n/language-context';
import { ToolWorkspace, dl, fmtBytes } from './_shared';
import { initPdfWorker } from "@/lib/pdfjs-worker";

export default function PdfToExcel() {
  const { toast } = useToast();
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<'upload' | 'configure' | 'processing' | 'done'>('upload');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [outputName, setOutputName] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [perfStats, setPerfStats] = useState({ time: "0.0s", rows: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.type !== 'application/pdf') return;

    setFile(f);
    setPhase('configure');
    setStatus("Analyzing document...");
    setOutputName(f.name.replace('.pdf', '') + "_Data_Extract");

    try {
      initPdfWorker();
      const buffer = await f.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      
      const page = await pdf.getPage(1);
      const textContent = await page.getTextContent();
      
      const rows: string[][] = [];
      let currentRow: string[] = [];
      let lastY = -1;

      textContent.items.forEach((item: any) => {
        const y = Math.round(item.transform[5]);
        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
          if (currentRow.length > 0) rows.push(currentRow);
          currentRow = [];
        }
        currentRow.push(item.str);
        lastY = y;
      });
      if (currentRow.length > 0) rows.push(currentRow);

      setPreviewData(rows.slice(0, 15)); 
    } catch (err) {
      toast({ title: "Analysis failed", description: "Could not parse document data.", variant: "destructive" });
      setPhase('upload');
    }
  };

  const executeExtraction = async () => {
    if (!file) return;
    setPhase('processing');
    setProgress(0);
    const start = Date.now();

    try {
      const res = await engine.runTool('pdf-excel', [file], { outputName }, (p: any) => {
        setProgress(p.pct);
        if (p.detail) setStatus(p.detail);
      });

      if (res.success && res.blob) {
        setResultBlob(res.blob);
        setPerfStats({ time: `${((Date.now() - start) / 1000).toFixed(2)}s`, rows: 0 });
        setPhase('done');
      }
    } catch (err) {
      setPhase('configure');
      toast({ title: "Extraction Error", description: "Failed to process data.", variant: "destructive" });
    }
  };

  const reset = () => { setFile(null); setPhase('upload'); setResultBlob(null); setPreviewData([]); };

  return (
    <ToolWorkspace title="PDF to Excel" description="EXTRACT TABLES INTO SPREADSHEETS" icon="📊" badge="DATA EXTRACTION" accent="#2563EB">
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
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop PDF Here</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Stays private on your device</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Configuration */}
          {phase === 'configure' && file && (
            <motion.div key="configure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
              <div className="p-6 bg-white/40 rounded-[2.5rem] border border-black/5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <FileSpreadsheet className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-[240px]">{file.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{fmtBytes(file.size)} • Processing Ready</p>
                  </div>
                </div>
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Flush File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Data Preview (Page 1)</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[600px]">
                    <ScrollArea className="h-[600px]">
                      {previewData.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                          <tbody>
                            {previewData.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 text-[10px] font-medium border-r border-slate-50 text-slate-600 truncate max-w-[120px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-40">
                          <TableIcon className="w-12 h-12 text-slate-300" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Analyzing file...</p>
                        </div>
                      )}
                    </ScrollArea>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-6">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t('outputLabel')}</Label>
                    <div className="relative">
                      <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input placeholder="Extracted_Data" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                    </div>
                  </div>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] space-y-3 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-600"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Safe Session Active</span></div>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">Processing performed entirely in RAM.</p>
                  </div>

                  <Button onClick={executeExtraction} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Extraction
                  </Button>
                </aside>
              </div>
            </motion.div>
          )}

          {phase === 'processing' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center space-y-10 text-center">
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

          {phase === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Excel file correctly created</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl mx-auto text-left">
                <div className="p-6 bg-slate-900/5 rounded-3xl border border-black/5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Processing time</p>
                  <p className="text-2xl font-black text-slate-950">{perfStats.time}</p>
                </div>
                <div className="p-6 bg-slate-900/5 rounded-3xl border border-black/5 text-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Output Result</p>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">XLSX Format</p>
                </div>
              </div>

              <div className="w-full max-w-sm flex flex-col gap-4 mx-auto pt-4 pb-20">
                <Button onClick={() => resultBlob && dl(resultBlob, `${outputName}.xlsx`)} className="h-16 bg-emerald-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl hover:bg-emerald-600 transition-all gap-3 border-2 border-white/20 active:scale-95">
                  <Download className="w-4 h-4" /> Download Excel
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
