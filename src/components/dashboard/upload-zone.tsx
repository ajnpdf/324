"use client";

import { useState, useRef } from 'react';
import { Upload, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export function UploadZone({ onFilesAdded }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      onFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <section className="space-y-6">
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer transition-all duration-500 rounded-[2.5rem] border-2 border-dashed p-16",
          isDragging 
            ? "border-primary bg-primary/10 scale-[0.99] shadow-2xl shadow-primary/20" 
            : "border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10 shadow-xl"
        )}
      >
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
        />
        
        <div className="flex flex-col items-center gap-6 text-center">
          <div className={cn(
            "w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-500",
            isDragging ? "scale-125 rotate-6" : "group-hover:scale-110"
          )}>
            <Upload className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tighter uppercase">Drop Files Here</h3>
            <p className="text-muted-foreground font-medium">Files are processed in-session and never stored permanently.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Session Limit: 200 MB
            </div>
            <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              300+ FORMATS SUPPORTED <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}