
"use client";

import { FileGridContent } from '../files/file-grid-content';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';

export function SharedFilesTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-white" />
          <h2 className="text-xl font-black tracking-tight uppercase">Team Junction</h2>
          <Badge className="bg-white/10 text-white border-none text-[8px] font-black uppercase">SESSION ACCESS</Badge>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden min-h-[400px]">
        <FileGridContent 
          files={[]} 
          viewMode="grid" 
          selectedFileId={null} 
          onSelectFile={() => {}} 
        />
      </div>
    </div>
  );
}
