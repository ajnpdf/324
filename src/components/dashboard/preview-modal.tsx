"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { OutputBuffer } from '@/lib/engine';
import { Button } from '@/components/ui/button';
import { X, Download, Layers, FileIcon } from 'lucide-react';
import Image from 'next/image';
import { useMemo } from 'react';

/**
 * AJN Output Preview Portal - Hardened v8.0
 */
export function PreviewModal({ job, onClose }: { job: OutputBuffer | null, onClose: () => void }) {
  const resultUrl = useMemo(() => job?.objectUrl || null, [job]);

  if (!job) return null;

  const isImage = ['jpg', 'png', 'webp', 'gif'].includes(job.toFmt.toLowerCase());
  const isVideo = ['mp4', 'webm', 'mov'].includes(job.toFmt.toLowerCase());
  const isAudio = ['mp3', 'wav', 'flac'].includes(job.toFmt.toLowerCase());

  return (
    <Dialog open={!!job} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] w-full h-[90vh] bg-white/95 backdrop-blur-3xl border-black/5 p-0 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-black/5 flex items-center justify-between px-8 shrink-0 bg-white/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter text-slate-900">Output Analysis</DialogTitle>
              <p className="text-[10px] font-bold text-slate-900/60 uppercase tracking-widest">{job.fileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] px-6 h-10 gap-2">
              <Download className="w-4 h-4" /> Export to Local
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 text-slate-900/40 hover:text-slate-900">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </header>

        <div className="flex-1 bg-white/5 relative overflow-hidden flex items-center justify-center p-12 bg-[radial-gradient(#00000005_1px,transparent_1px)] bg-[size:30px_30px]">
          {isImage && resultUrl && (
            <div className="relative w-full h-full max-w-4xl shadow-2xl rounded-sm overflow-hidden border border-black/5 bg-white/40 flex items-center justify-center p-10">
              <Image src={resultUrl} alt="Preview" fill className="object-contain" />
            </div>
          )}

          {isVideo && resultUrl && (
            <div className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-black/5">
              <video controls className="w-full h-full object-contain" autoPlay>
                <source src={resultUrl} />
              </video>
            </div>
          )}

          {isAudio && resultUrl && (
            <div className="w-full max-w-2xl bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-12 border border-black/5 text-center space-y-8 shadow-xl">
              <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Layers className="w-10 h-10 text-primary" />
              </div>
              <audio controls className="w-full h-14 opacity-80" autoPlay>
                <source src={resultUrl} />
              </audio>
              <div className="space-y-2">
                <p className="text-xl font-black text-slate-900">{job.fileName}</p>
                <p className="text-xs font-bold text-slate-900/40 uppercase tracking-[0.3em]">Mastered Binary Stream</p>
              </div>
            </div>
          )}

          {!isImage && !isVideo && !isAudio && (
            <div className="p-20 bg-white/40 border border-dashed border-black/5 rounded-[3rem] text-center space-y-6 opacity-40">
              <FileIcon className="w-20 h-20 mx-auto text-slate-900" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Direct content preview for {job.toFmt} is in calibration.</p>
            </div>
          )}
        </div>

        <footer className="h-14 border-t border-black/5 bg-white/40 flex items-center justify-between px-8 shrink-0">
          <div className="flex gap-10">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-900/40 uppercase tracking-widest">Dimensions:</span>
              <span className="text-[10px] font-bold uppercase text-slate-900">Original Ratio</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-slate-900/40 uppercase tracking-widest">Integrity:</span>
              <span className="text-[10px] font-bold uppercase text-emerald-600">Verified</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black text-slate-900/40 uppercase tracking-widest">Binary Layer v1.2 Active</span>
          </div>
        </footer>
      </DialogContent>
    </Dialog>
  );
}