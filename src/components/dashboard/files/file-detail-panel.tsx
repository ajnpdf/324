"use client";

import { WorkspaceFile } from './file-explorer';
import { 
  X, 
  FileIcon, 
  ImageIcon, 
  VideoIcon, 
  MusicIcon, 
  Info, 
  History, 
  Tag, 
  Download, 
  Trash2, 
  Copy, 
  Repeat, 
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Props {
  file: WorkspaceFile | null;
  onClose: () => void;
}

/**
 * AJN File Detail Panel - Industrial Node
 * Cleaned: Sharing tab removed to ensure 100% private library architecture.
 */
export function FileDetailPanel({ file, onClose }: Props) {
  if (!file) return null;

  const getPreviewIcon = () => {
    switch (file.type) {
      case 'image': return <ImageIcon className="w-16 h-16 text-blue-500" />;
      case 'video': return <VideoIcon className="w-16 h-16 text-purple-500" />;
      case 'audio': return <MusicIcon className="w-16 h-16 text-pink-500" />;
      default: return <FileIcon className="w-16 h-16 text-indigo-500" />;
    }
  };

  return (
    <aside className="w-[320px] h-full border-l border-white/5 bg-background/40 backdrop-blur-3xl flex flex-col shrink-0 animate-in slide-in-from-right duration-300 z-30">
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
          <Info className="w-3.5 h-3.5" /> Details
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-white/5">
          <X className="w-4 h-4 text-muted-foreground" />
        </Button>
      </header>

      <ScrollArea className="flex-1">
        <div className="p-6 space-y-8">
          {/* File Preview Card */}
          <div className="aspect-[4/3] bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden flex items-center justify-center group">
            {getPreviewIcon()}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <Button size="sm" variant="secondary" className="w-full bg-white/10 backdrop-blur border-white/10 h-8 text-[10px] font-black uppercase tracking-widest gap-2">
                <ExternalLink className="w-3 h-3" /> FULL PREVIEW
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm truncate pr-2">{file.name}</h4>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground">
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{file.format} Document • {file.size}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest gap-2">
              <Repeat className="w-3.5 h-3.5 text-primary" /> CONVERT
            </Button>
            <Button variant="outline" className="h-10 border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest gap-2">
              <Download className="w-3.5 h-3.5 text-emerald-500" /> DOWNLOAD
            </Button>
          </div>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10 bg-white/5 border border-white/10 p-1 mb-6">
              <TabsTrigger value="info" className="text-[9px] font-black uppercase tracking-widest">INFO</TabsTrigger>
              <TabsTrigger value="history" className="text-[9px] font-black uppercase tracking-widest">VERSIONS</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                  <Tag className="w-3 h-3" /> Smart Tags
                </div>
                <div className="flex flex-wrap gap-2">
                  {file.tags.map(t => (
                    <Badge key={t} variant="secondary" className="bg-white/5 text-white/60 border-none text-[9px] font-bold px-2 py-0.5">
                      {t.toUpperCase()}
                    </Badge>
                  ))}
                  <Button variant="ghost" className="h-5 px-2 text-[9px] font-black text-primary hover:bg-primary/10">
                    + ADD TAG
                  </Button>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground uppercase tracking-widest">Owner</span>
                  <span>Me</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground uppercase tracking-widest">Created</span>
                  <span>{file.date}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-muted-foreground uppercase tracking-widest">Location</span>
                  <span className="text-primary cursor-pointer hover:underline italic">/My Files/Converted</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{file.versions} Versions Found</span>
                <Button variant="ghost" className="h-6 text-[9px] font-black text-primary uppercase">Snapshot Now</Button>
              </div>
              <div className="space-y-2">
                {[...Array(file.versions)].map((_, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center font-black text-[10px]">v{file.versions - i}</div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold">{i === 0 ? 'Current Version' : `Snapshot from ${i+1} days ago`}</p>
                        <p className="text-[8px] text-muted-foreground font-black">SIZE: {(parseFloat(file.size) * (1 - i * 0.1)).toFixed(1)} MB</p>
                      </div>
                    </div>
                    {i !== 0 && (
                      <Button variant="outline" className="h-7 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity border-white/10 bg-white/5 hover:bg-primary hover:text-white">RESTORE</Button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      <footer className="p-4 border-t border-white/5 bg-background/20">
        <Button variant="ghost" className="w-full text-red-400 hover:text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest gap-2">
          <Trash2 className="w-3.5 h-3.5" /> Move to Trash
        </Button>
      </footer>
    </aside>
  );
}
