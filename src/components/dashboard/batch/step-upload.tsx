"use client";

import { useState, useRef } from 'react';
import { Upload, Folder, HardDrive, X, FileIcon, ImageIcon, FileText, Video, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BatchFile } from './batch-container';
import { cn } from '@/lib/utils';

export function StepUpload({ files, setFiles }: { files: BatchFile[], setFiles: (f: BatchFile[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: File[]) => {
    const formatted: BatchFile[] = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      status: 'ready',
      progress: 100,
      format: f.name.split('.').pop()?.toUpperCase() || 'UNK',
      size: (f.size / (1024 * 1024)).toFixed(2) + ' MB'
    }));
    setFiles([...files, ...formatted]);
  };

  const removeFile = (id: string) => {
    setFiles(files.filter(f => f.id !== id));
  };

  const getIcon = (format: string) => {
    if (['JPG', 'PNG', 'WEBP', 'HEIC'].includes(format)) return <ImageIcon className="w-4 h-4 text-blue-400" />;
    if (['PDF'].includes(format)) return <FileText className="w-4 h-4 text-red-400" />;
    if (['MP4', 'MOV'].includes(format)) return <Video className="w-4 h-4 text-purple-400" />;
    if (['MP3', 'WAV'].includes(format)) return <Music className="w-4 h-4 text-pink-400" />;
    return <FileIcon className="w-4 h-4 text-muted-foreground" />;
  };

  const stats = {
    total: files.length,
    images: files.filter(f => ['JPG', 'PNG', 'WEBP'].includes(f.format)).length,
    docs: files.filter(f => f.format === 'PDF').length,
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <section className="text-center space-y-2">
        <h2 className="text-3xl font-black tracking-tight">Load Batch Data</h2>
        <p className="text-muted-foreground font-medium">Select up to 500 files to begin processing.</p>
      </section>

      <div 
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(Array.from(e.dataTransfer.files)); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "h-64 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group",
          isDragging ? "bg-primary/10 border-primary scale-[0.99]" : "bg-white/5 border-white/10 hover:border-primary/40 hover:bg-white/10"
        )}
      >
        <input type="file" multiple ref={inputRef} className="hidden" onChange={(e) => e.target.files && handleFiles(Array.from(e.target.files))} />
        <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <p className="text-xl font-bold text-slate-900">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-black">Multi-File Processing System</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" className="h-12 bg-white/5 border-white/10 gap-2 font-bold"><Folder className="w-4 h-4" /> LOCAL FOLDER</Button>
        <Button variant="outline" className="h-12 bg-white/5 border-white/10 gap-2 font-bold"><HardDrive className="w-4 h-4" /> NETWORK VAULT</Button>
      </div>

      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-black tracking-tight">Queue Summary</h3>
              <div className="flex gap-2">
                <Badge className="bg-primary/20 text-primary border-none text-[10px] font-bold">{stats.total} FILES</Badge>
                {stats.images > 0 && <Badge variant="outline" className="text-[10px] opacity-60 border-white/10">{stats.images} IMAGES</Badge>}
                {stats.docs > 0 && <Badge variant="outline" className="text-[10px] opacity-60 border-white/10">{stats.docs} PDFS</Badge>}
              </div>
            </div>
            <Button variant="ghost" onClick={() => setFiles([])} className="h-8 text-[10px] font-black uppercase text-red-400 hover:text-red-500 hover:bg-red-50">CLEAR ALL</Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl max-h-[400px] overflow-y-auto scrollbar-hide">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-white/10 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-3">File</th>
                  <th className="px-6 py-3">Format</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {files.map((f) => (
                  <tr key={f.id} className="group hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">{getIcon(f.format)}</div>
                        <span className="text-sm font-bold truncate max-w-[240px]">{f.file.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3"><Badge variant="outline" className="text-[10px] border-white/10">{f.format}</Badge></td>
                    <td className="px-6 py-3 text-xs font-medium text-muted-foreground">{f.size}</td>
                    <td className="px-6 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => removeFile(f.id)} className="h-8 w-8 text-muted-foreground hover:text-red-500">
                        <X className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
