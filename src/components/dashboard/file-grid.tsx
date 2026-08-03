
"use client";

import { FileIcon, ImageIcon, VideoIcon, MusicIcon, Download, Trash2, Eye, Repeat, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface FileGridProps {
  view: 'grid' | 'list';
}

export function FileGrid({ view }: FileGridProps) {
  // Demo data removed. User session data should be passed here or fetched.
  const files: any[] = [];

  if (files.length === 0) {
    return (
      <div className="py-32 text-center space-y-8 bg-white/5 border border-dashed border-white/10 rounded-[3rem] animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
          <FileIcon className="w-10 h-10 text-muted-foreground/20" />
        </div>
        <div className="space-y-2">
          <h3 className="font-black text-xl uppercase tracking-tighter">Your Workspace is Empty</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest max-w-[240px] mx-auto leading-relaxed">
            Begin your session by loading files for real-time neural processing.
          </p>
        </div>
        <Link href="/dashboard/convert" className="inline-block">
          <Button className="h-12 bg-white text-black hover:bg-white/90 font-black text-xs px-10 rounded-xl gap-2 shadow-xl">
            <Plus className="w-4 h-4" /> START NEW PROCESS
          </Button>
        </Link>
      </div>
    );
  }

  // Implementation for rendering files would go here...
  return null;
}
