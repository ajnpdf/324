"use client";

import React, { useState, useRef } from "react";
import * as XLSX from 'xlsx';
import { 
  Download, 
  CheckCircle2, 
  RefreshCcw,
  Zap,
  Edit3,
  Loader2,
  FileSpreadsheet,
  Activity,
  Upload,
  ShieldCheck,
  Table as TableIcon,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useToast } from '../../hooks/use-toast';
import { engine } from '../../lib/engine';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../lib/i18n/language-context';
import { ToolWorkspace, dl, fmtBytes } from './_shared';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function ExcelToPdf() {
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
  const [perfStats, setPerfStats] = useState({ time: "0.0s", format: "A4 Landscape" });
  
  const [settings, setSettings] = useState({
    orientation: 'landscape',
    margin: 'normal',
    fitToWidth: true,
    quality: 'standard'
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      toast({ title: "Unsupported Format", description: "Please upload a valid Excel or CSV file.", variant: "destructive" });
      return;
    }

    setFile(f);
    setPhase('configure');
    setStatus("Analyzing spreadsheet...");
    setOutputName(f.name.replace(/\.[^/.]+$/, "") + "_Spreadsheet");

    try {
      const buffer = await f.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const firstSheet = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "" }) as string[][];
      
      setPreviewData(data.slice(0, 25)); 
    } catch (err) {
      console.error(err);
      toast({ title: "Analysis failed", description: "Could not parse Excel structure.", variant: "destructive" });
      setPhase('upload');
    }
  };

  const executeConversion = async () => {
    if (!file) return;
    setPhase('processing');
    setProgress(0);
    const start = Date.now();

    try {
      // Local conversion logic for Junction Excel-to-PDF
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheetNames = wb.SheetNames;
      const orientation = settings.orientation === 'landscape' ? 'l' : 'p';
      const pdf = new jsPDF(orientation, 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();

      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        setStatus(`Rendering ${sheetName}...`);
        const ws = wb.Sheets[sheetName];
        const html = XLSX.utils.sheet_to_html(ws);
        
        const container = document.createElement('div');
        container.style.padding = '40px';
        container.style.background = 'white';
        container.style.width = '1000px';
        container.innerHTML = html;
        document.body.appendChild(container);

        const canvas = await html2canvas(container, { scale: 2 });
        document.body.removeChild(container);

        if (i > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgW = pdfWidth - 80;
        const imgH = (canvas.height * imgW) / canvas.width;
        pdf.addImage(imgData, 'JPEG', 40, 40, imgW, imgH);
        
        setProgress(Math.round(((i + 1) / sheetNames.length) * 100));
      }

      const resBlob = pdf.output('blob');
      setResultBlob(resBlob);
      setPerfStats({ 
        time: `${((Date.now() - start) / 1000).toFixed(2)}s`, 
        format: `A4 ${settings.orientation === 'landscape' ? 'Landscape' : 'Portrait'}` 
      });
      setPhase('done');
    } catch (err: any) {
      setPhase('configure');
      toast({ title: "Conversion Error", description: err.message || "Failed to process document.", variant: "destructive" });
    }
  };

  const reset = () => { 
    setFile(null); 
    setPhase('upload'); 
    setResultBlob(null); 
    setPreviewData([]); 
    setOutputName("");
  };

  return (
    <ToolWorkspace title="Excel to PDF" description="CONVERT SPREADSHEETS INTO PDF DOCUMENTS" icon="📊" badge="EXCEL CONVERSION" accent="#059669">
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
                <input type="file" accept=".xlsx,.xls,.csv" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500 border border-black/5">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center space-y-1 px-8 relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-950">Drop Excel or CSV</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Safe local processing</p>
                </div>
              </div>
            </motion.div>
          )}

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
                <button onClick={reset} className="text-[10px] font-black uppercase text-red-500 hover:underline">Remove File</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-3">
                  <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Spreadsheet Preview (Sheet 1)</Label>
                  <Card className="bg-white border-black/5 rounded-[2.5rem] shadow-inner overflow-hidden min-h-[600px]">
                    <ScrollArea className="h-[600px]">
                      {previewData.length > 0 ? (
                        <table className="w-full text-left border-collapse bg-white">
                          <thead className="sticky top-0 bg-slate-50 z-10">
                            <tr className="border-b border-black/5">
                              {previewData[0]?.map((_, i) => (
                                <th key={i} className="p-3 text-[8px] font-black text-slate-400 uppercase tracking-widest border-r border-black/5">Col {i + 1}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-3 text-[10px] font-medium border-r border-slate-50 text-slate-600 truncate max-w-[150px]">
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4 opacity-40">
                          <TableIcon className="w-12 h-12 text-slate-300" />
                          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Loading columns...</p>
                        </div>
                      )}
                    </ScrollArea>
                  </Card>
                </div>

                <aside className="lg:col-span-5 space-y-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <Settings2 className="w-3.5 h-3.5 text-primary" />
                      <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Settings</Label>
                    </div>
                    
                    <Card className="bg-white/60 backdrop-blur-xl border-black/5 rounded-3xl p-6 space-y-6">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Output File Name</Label>
                        <div className="relative">
                          <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input placeholder="Master_Report" value={outputName} onChange={(e) => setOutputName(e.target.value)} className="h-12 pl-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Orientation</Label>
                          <Select value={settings.orientation} onValueChange={(v) => setSettings({...settings, orientation: v})}>
                            <SelectTrigger className="h-11 bg-white border-black/5 rounded-xl font-bold text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white rounded-xl">
                              <SelectItem value="portrait" className="font-bold text-xs uppercase">Portrait</SelectItem>
                              <SelectItem value="landscape" className="font-bold text-xs uppercase">Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Margins</Label>
                          <Select value={settings.margin} onValueChange={(v) => setSettings({...settings, margin: v})}>
                            <SelectTrigger className="h-11 bg-white border-black/5 rounded-xl font-bold text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent className="bg-white rounded-xl">
                              <SelectItem value="normal" className="font-bold text-xs uppercase">Normal</SelectItem>
                              <SelectItem value="narrow" className="font-bold text-xs uppercase">Narrow</SelectItem>
                              <SelectItem value="wide" className="font-bold text-xs uppercase">Wide</SelectItem>
                              <SelectItem value="none" className="font-bold text-xs uppercase">None</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-black uppercase text-primary">Fit to Width</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Auto-scale spreadsheet columns</p>
                        </div>
                        <button 
                          onClick={() => setSettings({...settings, fitToWidth: !settings.fitToWidth})}
                          className={cn("w-10 h-6 rounded-full transition-all relative p-1", settings.fitToWidth ? "bg-primary" : "bg-slate-200")}
                        >
                          <div className={cn("w-4 h-4 bg-white rounded-full transition-all", settings.fitToWidth ? "translate-x-4" : "translate-x-0")} />
                        </button>
                      </div>
                    </Card>
                  </section>

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] space-y-3 shadow-sm text-center">
                    <div className="flex items-center justify-center gap-2 text-emerald-600"><ShieldCheck className="w-4 h-4" /><span className="text-[9px] font-black uppercase tracking-widest">Safe session active</span></div>
                    <p className="text-[9px] text-slate-500 font-bold leading-relaxed uppercase">Processing is performed entirely in your browser.</p>
                  </div>

                  <Button onClick={executeConversion} className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20 active:scale-95">
                    <Zap className="w-4 h-4" /> Start Conversion
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

          {phase === 'done' && resultBlob && (
            <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="py-12 flex flex-col items-center space-y-10 text-center">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase text-slate-950">Success 🎉</h3>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Excel file correctly processed</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl mx-auto text-left">
                <div className="p-6 bg-slate-900/5 rounded-3xl border border-black/5 text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Processing time</p>
                  <p className="text-2xl font-black text-slate-950">{perfStats.time}</p>
                </div>
                <div className="p-6 bg-slate-900/5 rounded-3xl border border-black/5 text-center shadow-inner">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Output Result</p>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">{perfStats.format}</p>
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