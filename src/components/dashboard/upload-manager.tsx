"use client";

import { useState } from 'react';
import { UploadZone } from './upload-zone';
import { FileMetadataCard } from './file-metadata-card';
import { Button } from '../ui/button';
import { LayoutGrid, List, Trash2, Activity, Shield, Sparkles, AlertTriangle, RefreshCcw } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { TierGateModal } from './tier-gate-modal';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '../../firebase';
import { doc } from 'firebase/firestore';
import * as pdfjsLib from 'pdfjs-dist';
import { initPdfWorker } from '@/lib/pdfjs-worker';

export type FileState = 'uploading' | 'scanning' | 'analyzing' | 'ready' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  state: FileState;
  insights?: string[];
  error?: string;
  previewUrl?: string;
  metadata?: {
    format: string;
    size: string;
    dimensions?: string;
    pages?: number;
    duration?: string;
    bitrate?: string;
  };
}

/**
 * AJN File Management Dashboard
 * Handles the lifecycle of uploaded assets in a local session.
 * Updated: Real-time visual previews for images and PDFs using PDF.js.
 */
export function UploadManager() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [gateOpen, setGateOpen] = useState(false);
  const [gateReason, setGateReason] = useState<'size' | 'task' | 'storage' | 'ai'>('size');

  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: profile } = useDoc(userProfileRef);

  const SESSION_FILE_SIZE_LIMIT = 200 * 1024 * 1024; // 200MB Standard Session Limit

  const generatePDFPreview = async (file: File): Promise<string> => {
    try {
      initPdfWorker();
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.4 });
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;
      const url = canvas.toDataURL('image/jpeg', 0.8);
      pdf.destroy();
      return url;
    } catch (err) {
      console.warn("[AJN Preview] PDF thumbnail synthesis failed.");
      return "";
    }
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    const validFiles: File[] = [];
    const oversizedFiles: File[] = [];

    newFiles.forEach(f => {
      if (f.size > SESSION_FILE_SIZE_LIMIT) oversizedFiles.push(f);
      else validFiles.push(f);
    });

    if (oversizedFiles.length > 0) {
      setGateReason('size');
      setGateOpen(true);
      if (validFiles.length === 0) return;
    }

    const uploadedFiles: UploadedFile[] = await Promise.all(validFiles.map(async (file) => {
      const id = Math.random().toString(36).substring(7);
      
      let previewUrl = undefined;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      } else if (file.type === 'application/pdf') {
        previewUrl = await generatePDFPreview(file);
      }

      return {
        id,
        file,
        progress: 0,
        state: 'uploading',
        previewUrl
      };
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
    uploadedFiles.forEach(fileObj => simulateProcessing(fileObj.id));
  };

  const simulateProcessing = async (id: string) => {
    try {
      // 1. Processing binary stream
      for (let i = 0; i <= 100; i += 20) {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: i } : f));
        await new Promise(r => setTimeout(r, 80));
      }

      // 2. Local Scanning
      setFiles(prev => prev.map(f => f.id === id ? { ...f, state: 'scanning', progress: 0 } : f));
      for (let i = 0; i <= 100; i += 25) {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: i } : f));
        await new Promise(r => setTimeout(r, 150));
      }

      // 3. Metadata Mapping
      setFiles(prev => prev.map(f => f.id === id ? { ...f, state: 'analyzing', progress: 0 } : f));
      for (let i = 0; i <= 100; i += 33) {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress: i } : f));
        await new Promise(r => setTimeout(r, 100));
      }

      // 4. Ready State
      setFiles(prev => prev.map(f => {
        if (f.id === id) {
          const type = f.file.type;
          const sizeMb = f.file.size / (1024 * 1024);
          const insights: string[] = [];

          if (sizeMb > 10) insights.push("LARGE_FILE_DETECTED");
          if (type === 'application/pdf') insights.push("PDF_CORE_SYNCED");
          if (type.startsWith('image/')) insights.push("IMAGE_PIXELS_READY");

          const mockMeta: UploadedFile['metadata'] = {
            format: type.split('/')[1]?.toUpperCase() || 'UNKNOWN',
            size: sizeMb.toFixed(2) + ' MB'
          };

          if (type.startsWith('image/')) mockMeta.dimensions = 'Detected';
          else if (type === 'application/pdf') mockMeta.pages = 1;

          return { ...f, state: 'ready', progress: 100, metadata: mockMeta, insights };
        }
        return f;
      }));
    } catch (err: any) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, state: 'error', error: "Internal processing error." } : f));
    }
  };

  const removeFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (file?.previewUrl && file.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(file.previewUrl);
    }
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const retryFile = (id: string) => {
    const file = files.find(f => f.id === id);
    if (!file) return;
    setFiles(prev => prev.map(f => f.id === id ? { ...f, state: 'uploading', progress: 0, error: undefined } : f));
    simulateProcessing(id);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4 p-6 bg-white/40 border border-black/5 rounded-[2.5rem] backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-tighter text-slate-900">File Management</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Real-time local analysis</p>
          </div>
        </div>
        <div className="h-10 w-px bg-black/5 hidden md:block mx-2" />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
            <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span className="text-[9px] font-black uppercase text-emerald-600">Local Processing</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/5 rounded-full border border-blue-500/10">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[9px] font-black uppercase text-blue-600">Secure Sandboxing</span>
          </div>
        </div>
      </div>

      <UploadZone onFilesAdded={handleFilesAdded} />

      {files.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-700">
          <div className="flex items-center justify-between border-b border-black/5 pb-4 px-2">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-black uppercase tracking-tighter">Session Archive</h2>
              <Badge className="bg-primary text-white border-none font-black text-[10px] px-3 h-6 rounded-full">
                {files.length} ASSETS
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-black/5 p-1 rounded-xl border border-black/5 flex gap-1 shadow-inner">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode('grid')}
                  className={cn("h-8 w-8 transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setViewMode('list')}
                  className={cn("h-8 w-8 transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  files.forEach(f => f.previewUrl && f.previewUrl.startsWith('blob:') && URL.revokeObjectURL(f.previewUrl));
                  setFiles([]);
                }}
                className="h-10 text-red-400 hover:text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest px-6"
              >
                <Trash2 className="w-4 h-4 mr-2" /> Flush Session
              </Button>
            </div>
          </div>

          <div className={cn(
            "gap-6",
            viewMode === 'grid' ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"
          )}>
            {files.map(file => (
              <FileMetadataCard 
                key={file.id} 
                file={file} 
                onRemove={() => removeFile(file.id)}
                onRetry={() => retryFile(file.id)}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      )}

      <TierGateModal 
        open={gateOpen} 
        onOpenChange={setGateOpen} 
        reason={gateReason} 
      />
    </div>
  );
}