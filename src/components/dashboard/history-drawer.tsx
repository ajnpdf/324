"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Download, Trash2, ArrowRight, FileIcon, Clock, ChevronRight, Zap, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface HistoryItem {
  id: string;
  date: string;
  fileName: string;
  size: string;
  toolId: string;
}

export function HistoryDrawer({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (open) {
      const data = JSON.parse(localStorage.getItem('ajn_history') || '[]');
      setHistory(data);
    }
  }, [open]);

  const clearHistory = () => {
    localStorage.removeItem('ajn_history');
    setHistory([]);
  };

  const getToolLabel = (id: string) => {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-white/95 backdrop-blur-3xl border-l border-black/5 p-0 flex flex-col font-sans text-slate-950">
        <header className="p-8 border-b border-black/5 flex items-center justify-between shrink-0 bg-white/40">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-xl font-black uppercase tracking-tighter">Session Archive</SheetTitle>
              <SheetDescription className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Local Cache Analysis</SheetDescription>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={clearHistory} className="h-10 w-10 text-slate-300 hover:text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </Button>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-4">
            {history.length === 0 ? (
              <div className="py-20 text-center space-y-4 opacity-40 grayscale flex flex-col items-center">
                <Clock className="w-16 h-16 text-slate-200" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No past interacting found</p>
                  <p className="text-[8px] font-bold uppercase">Begin a session to populate archive</p>
                </div>
              </div>
            ) : (
              history.map((entry) => (
                <div key={entry.id} className="p-5 bg-white border border-black/5 rounded-3xl group hover:border-primary/30 transition-all cursor-default shadow-sm hover:shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-[8px] font-black uppercase px-2 h-5 border-primary/20 text-primary bg-primary/5">
                      <Zap className="w-2.5 h-2.5 mr-1" /> {getToolLabel(entry.toolId)}
                    </Badge>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="overflow-hidden flex-1">
                      <p className="text-xs font-black truncate text-slate-900 uppercase tracking-tight">{entry.fileName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{entry.size} • Finalized</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <footer className="p-8 border-t border-black/5 bg-white/40">
          <div className="p-5 bg-primary/5 border border-primary/10 rounded-2xl mb-6">
            <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase tracking-wide">
              Archive records are stored locally in your browser cache. Clearing site data will purge this history.
            </p>
          </div>
          <Button variant="outline" className="w-full h-12 border-black/10 bg-white font-black text-[10px] uppercase tracking-widest gap-2 rounded-xl shadow-sm hover:bg-black/5">
            <Download className="w-3.5 h-3.5" /> EXPORT LOG (CSV)
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}