"use client";

import { 
  FileText, 
  ImageIcon, 
  Video, 
  Music, 
  Box, 
  Archive, 
  Code, 
  BookOpen, 
  Wand2, 
  Layers,
  ChevronLeft,
  ChevronRight,
  FileImage
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const categories = [
  { id: 'Document', icon: FileText, label: 'Documents', color: 'text-slate-950' },
  { id: 'Imagery', icon: FileImage, label: 'AJN IMG', color: 'text-slate-950' },
  { id: 'Image', icon: ImageIcon, label: 'Imagery', color: 'text-slate-950' },
  { id: 'Video', icon: Video, label: 'Motion', color: 'text-slate-950' },
  { id: 'Audio', icon: Music, label: 'Audio', color: 'text-slate-950' },
  { id: 'Archive', icon: Archive, label: 'Archives', color: 'text-slate-950' },
  { id: 'Code', icon: Code, label: 'Data & Code', color: 'text-slate-950' },
  { id: 'eBook', icon: BookOpen, label: 'Ebooks', color: 'text-slate-950' },
  { id: 'Design', icon: Wand2, label: 'Design', color: 'text-slate-950' },
  { id: '3D/CAD', icon: Layers, label: 'Technical', color: 'text-slate-950' },
  { id: 'Specialized', icon: Box, label: 'Specialized', color: 'text-slate-950' },
];

interface Props {
  active: string;
  onSelect: (id: string) => void;
}

/**
 * AJN Category Sidebar - Icon-only control strip with Scrollbar Hide
 */
export function CategorySidebar({ active, onSelect }: Props) {
  return (
    <aside className="h-full border-r border-black/5 bg-white/40 backdrop-blur-3xl flex flex-col shrink-0 w-20 z-30 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-black/5 flex items-center justify-center">
        <div className="w-8 h-8 bg-black/5 rounded-xl flex items-center justify-center">
          <Layers className="w-4 h-4 text-slate-950/40" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 scrollbar-hide py-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={cn(
              "w-full flex items-center justify-center h-12 rounded-xl transition-all group relative",
              active === cat.id 
                ? "bg-primary text-white shadow-lg shadow-primary/10" 
                : "text-slate-950/40 hover:bg-black/5 hover:text-slate-950"
            )}
          >
            <cat.icon className={cn(
              "w-5 h-5 transition-transform group-hover:scale-110",
              active === cat.id ? "text-white" : "text-slate-950"
            )} />
            
            {active === cat.id && (
              <div className="absolute right-1 w-1 h-1 rounded-full bg-white animate-pulse" />
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-black/5 bg-white/20 flex flex-col items-center gap-4 py-6">
        <div className="w-8 h-8 rounded-lg border border-black/5 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>
    </aside>
  );
}
