"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PDFPage, PDFElement, PDFTool } from './types';
import { PDFToolbar } from './pdf-toolbar';
import { PDFThumbnailStrip } from './pdf-thumbnail-strip';
import { PDFCanvas } from './pdf-canvas';
import { PDFPropertiesPanel } from './pdf-properties-panel';
import { 
  Download, 
  ArrowLeft, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  FileText, 
  Pen, 
  X,
  Activity,
  History as HistoryIcon,
  Zap,
  Home,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import Link from 'next/link';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from 'firebase/firestore';

/**
 * AJN Professional Surgical PDF Editor
 * Implementation synchronized with iLovePDF standard.
 */
export function PDFEditor() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PDFPage[]>([]);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);
  const [activeTool, setActiveTool] = useState<PDFTool>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [isExporting, setIsExporting] = useState(false);
  const [history, setHistory] = useState<PDFPage[][]>([]);
  const [redoStack, setRedoStack] = useState<PDFPage[][]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commitToHistory = (newPages: PDFPage[]) => {
    setHistory(prev => [...prev.slice(-19), pages]);
    setRedoStack([]);
    setPages(newPages);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setRedoStack(prevStack => [pages, ...prevStack]);
    setHistory(prevHistory => prevHistory.slice(0, -1));
    setPages(prev);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setHistory(prevHistory => [...prevHistory, pages]);
    setRedoStack(prevStack => prevStack.slice(1));
    setPages(next);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    setFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const newPages: PDFPage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        newPages.push({
          id: `p-${i}-${Date.now()}`,
          pageNumber: i,
          rotation: 0,
          elements: [],
          previewUrl: canvas.toDataURL('image/jpeg', 0.8)
        });
      }

      setPages(newPages);
      setCurrentPageIdx(0);
      setHistory([]);
      setRedoStack([]);
      toast({ title: "Document Loaded", description: `${pdf.numPages} pages synchronized.` });
    } catch (err) {
      toast({ title: "Failed to load", variant: "destructive" });
    }
  };

  const addElement = (element: PDFElement) => {
    const newPages = pages.map((p, i) => i === currentPageIdx ? { ...p, elements: [...p.elements, element] } : p);
    commitToHistory(newPages);
    setSelectedElementId(element.id);
  };

  const updateElement = (element: PDFElement) => {
    const newPages = pages.map((p, i) => i === currentPageIdx ? { ...p, elements: p.elements.map(el => el.id === element.id ? element : el) } : p);
    setPages(newPages);
  };

  const deleteElement = () => {
    if (!selectedElementId) return;
    const newPages = pages.map((p, i) => i === currentPageIdx ? { ...p, elements: p.elements.filter(el => el.id !== selectedElementId) } : p);
    commitToHistory(newPages);
    setSelectedElementId(null);
  };

  const rotatePage = (idx: number) => {
    const newPages = pages.map((p, i) => i === idx ? { ...p, rotation: (p.rotation + 90) % 360 } : p);
    commitToHistory(newPages);
  };

  const handleExport = async () => {
    if (!file) return;
    setIsExporting(true);
    try {
      const buffer = await file.arrayBuffer();
      // Explicit ArrayBuffer cast
      const pdfDoc = await PDFDocument.load(buffer.slice(0) as ArrayBuffer, { ignoreEncryption: true });
      const standardFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (let i = 0; i < pages.length; i++) {
        const pageState = pages[i];
        if (pageState.elements.length === 0 && pageState.rotation === 0) continue;

        const pdfPage = pdfDoc.getPage(i);
        const { width: pW, height: pH } = pdfPage.getSize();
        
        if (pageState.rotation !== 0) pdfPage.setRotation(degrees(pageState.rotation));

        for (const el of pageState.elements) {
          const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;
            return rgb(r || 0, g || 0, b || 0);
          };

          const scaleX = pW / 595;
          const scaleY = pH / 842;

          if (el.type === 'text') {
            pdfPage.drawText(el.content || "", {
              x: el.x * scaleX,
              y: pH - (el.y * scaleY) - (el.fontSize || 12),
              size: el.fontSize || 12,
              font: standardFont,
              color: hexToRgb(el.color || "#000000"),
              opacity: el.opacity || 1,
              rotate: degrees(el.rotation || 0)
            });
          } else if (el.type === 'image' && el.content) {
            const imgBytes = await fetch(el.content).then(r => r.arrayBuffer());
            const img = await pdfDoc.embedJpg(imgBytes);
            pdfPage.drawImage(img, {
              x: el.x * scaleX,
              y: pH - (el.y * scaleY) - (el.height * scaleY),
              width: el.width * scaleX,
              height: el.height * scaleY,
              rotate: degrees(el.rotation || 0),
              opacity: el.opacity || 1
            });
          }
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace('.pdf', '')}_Edited.pdf`;
      link.click();

      if (user && firestore) {
        addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'editJobs'), {
          userId: user.uid,
          filename: file.name,
          startTime: new Date().toISOString(),
          status: 'completed',
          pageCount: pages.length
        });
      }

      toast({ title: "Export Successful", description: "Document correctly synthesized." });
    } catch (err) {
      toast({ title: "Export Error", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white text-slate-900 overflow-hidden font-sans">
      <PDFToolbar 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
        zoom={zoom} 
        setZoom={setZoom}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={history.length > 0}
        canRedo={redoStack.length > 0}
        onSave={handleExport}
        onRotate={() => rotatePage(currentPageIdx)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <PDFThumbnailStrip 
          pages={pages} 
          activeIdx={currentPageIdx} 
          onSelect={setCurrentPageIdx} 
          onRotate={rotatePage}
          onAdd={() => fileInputRef.current?.click()}
          onReorder={() => {}}
        />

        <main className="flex-1 relative bg-slate-100/50 overflow-auto scrollbar-hide flex items-start justify-center p-16 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:32px_32px]">
          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full max-w-xl text-center space-y-8">
                <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center border-4 border-dashed border-primary/20">
                  <Plus className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-black uppercase tracking-tighter">Load document</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    Select a PDF from your device to begin professional surgical editing.
                  </p>
                </div>
                <Button onClick={() => fileInputRef.current?.click()} className="h-14 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
                  <Upload className="w-4 h-4" /> Choose File
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf" onChange={handleFileUpload} />
              </motion.div>
            ) : (
              <div className="relative">
                <PDFCanvas 
                  page={pages[currentPageIdx]} 
                  zoom={zoom} 
                  activeTool={activeTool}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateElement={updateElement}
                  onAddElement={addElement}
                />
              </div>
            )}
          </AnimatePresence>
        </main>

        {selectedElementId && (
          <PDFPropertiesPanel 
            element={pages[currentPageIdx].elements.find(el => el.id === selectedElementId) || null}
            onUpdate={updateElement}
            onDelete={deleteElement}
          />
        )}
      </div>

      <footer className="h-8 border-t border-black/5 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-[100]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Network Synchronized</span>
          </div>
          <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Page {currentPageIdx + 1} of {pages.length}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline flex items-center gap-2">
            <Home className="w-3 h-3" /> Exit Editor
          </Link>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">AJN Core • 2026</span>
        </div>
      </footer>
    </div>
  );
}
