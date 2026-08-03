"use client";

import { useState } from 'react';
import { FolderTree } from './folder-tree';
import { FileGridContent } from './file-grid-content';
import { FileDetailPanel } from './file-detail-panel';
import { Button } from '@/components/ui/button';
import { Search, Plus, LayoutGrid, List, Loader2, Activity, Archive } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export interface WorkspaceFile {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'video' | 'audio' | 'doc';
  format: string;
  size: string;
  date: string;
  tags: string[];
  versions: number;
}

/**
 * AJN Workspace Archive Explorer
 */
export function FileExplorer() {
  const [selectedFile, setSelectedFile] = useState<WorkspaceFile | null>(null);
  const [activeFolder, setActiveFolder] = useState('My Files');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { user } = useUser();
  const firestore = useFirestore();

  const filesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'conversionJobs'),
      orderBy('startTime', 'desc')
    );
  }, [firestore, user]);

  const { data: dbFiles, isLoading } = useCollection<any>(filesQuery);

  const files: WorkspaceFile[] = (dbFiles || []).map(f => ({
    id: f.id,
    name: f.outputName || 'Untitled Asset',
    type: (f.targetFormat?.toLowerCase() === 'pdf' ? 'pdf' : 'doc'),
    format: f.targetFormat || 'UNK',
    date: f.startTime ? new Date(f.startTime).toLocaleDateString() : 'Just now',
    size: f.sizeFormatted || '0.2 MB',
    tags: [f.toolId || 'Converted'],
    versions: 1,
  }));

  return (
    <div className="flex h-full overflow-hidden animate-in fade-in duration-700 font-sans text-slate-950">
      <FolderTree 
        activeFolder={activeFolder} 
        onSelectFolder={setActiveFolder} 
      />

      <div className="flex-1 flex flex-col min-w-0 border-r border-black/5 relative bg-white/20">
        <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary animate-pulse" />
              <h1 className="text-sm font-black tracking-tighter uppercase">{activeFolder}</h1>
            </div>
            <div className="h-6 w-px bg-black/5 mx-2" />
            <div className="relative max-w-sm w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
              <Input 
                placeholder="Search files..." 
                className="h-9 pl-9 bg-black/5 border-black/5 text-[10px] font-black uppercase tracking-widest focus:ring-primary/20 rounded-xl shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-black/5 p-1 rounded-xl border border-black/5 flex gap-1 shadow-inner">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('grid')}
                className={cn("h-7 w-7 rounded-lg transition-all", viewMode === 'grid' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewMode('list')}
                className={cn("h-7 w-7 rounded-lg transition-all", viewMode === 'list' ? "bg-white text-primary shadow-sm" : "text-slate-400")}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Link href="/pdf-tools">
              <Button className="h-9 gap-2 bg-primary text-white hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest shadow-xl rounded-xl px-5 transition-all hover:scale-105 active:scale-95">
                <Plus className="w-3.5 h-3.5" /> Add New
              </Button>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-40">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-primary">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6 animate-in fade-in duration-1000">
              <div className="w-24 h-24 bg-primary/5 rounded-[3rem] flex items-center justify-center border-4 border-dashed border-black/5">
                <Archive className="w-10 h-10 text-slate-200" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-950">Empty library</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
                  Start a session to add files to your library.
                </p>
              </div>
              <Link href="/pdf-tools">
                <Button className="h-12 bg-white text-slate-950 border border-black/10 hover:bg-black/5 font-black text-xs px-10 rounded-2xl shadow-xl gap-3 uppercase tracking-widest transition-all">
                  <Plus className="w-4 h-4" /> Start New Session
                </Button>
              </Link>
            </div>
          ) : (
            <FileGridContent 
              files={files} 
              viewMode={viewMode} 
              selectedFileId={selectedFile?.id || null}
              onSelectFile={setSelectedFile} 
            />
          )}
        </div>
      </div>

      <FileDetailPanel 
        file={selectedFile} 
        onClose={() => setSelectedFile(null)} 
      />
    </div>
  );
}
