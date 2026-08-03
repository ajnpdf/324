"use client";

import { 
  Folder, 
  Upload, 
  Repeat, 
  Trash2, 
  Plus,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Props {
  activeFolder: string;
  onSelectFolder: (f: string) => void;
}

const folders = [
  { id: 'session', name: 'Active Session', icon: Activity },
  { id: 'uploads', name: 'Recent Uploads', icon: Upload },
  { id: 'converted', name: 'Processed', icon: Repeat },
  { id: 'trash', name: 'Discarded', icon: Trash2 },
];

export function FolderTree({ activeFolder, onSelectFolder }: Props) {
  return (
    <aside className="w-[220px] h-full border-r border-white/5 bg-background/20 backdrop-blur-xl flex flex-col shrink-0">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Library</h3>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
          <Plus className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => onSelectFolder(folder.name)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all group",
              activeFolder === folder.name 
                ? "bg-white/10 text-white" 
                : "text-muted-foreground hover:bg-white/5 hover:text-white"
            )}
          >
            <folder.icon className={cn(
              "w-4 h-4 shrink-0",
              activeFolder === folder.name ? "text-white" : "text-muted-foreground group-hover:text-white"
            )} />
            <span className="flex-1 text-left truncate">{folder.name}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/5 space-y-4">
        <Button className="w-full h-10 bg-white text-black font-black text-[9px] uppercase tracking-widest shadow-lg">
          EXPAND STORAGE
        </Button>
      </div>
    </aside>
  );
}
