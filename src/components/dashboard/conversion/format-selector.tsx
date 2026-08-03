"use client";

import { 
  FileText, 
  ImageIcon, 
  Video, 
  Music, 
  FileCode, 
  Database, 
  Presentation, 
  Code2,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Format {
  id: string;
  label: string;
  icon: any;
  color: string;
}

const FORMATS: Record<string, Format[]> = {
  Document: [
    { id: 'PDF', label: 'Universal PDF', icon: FileText, color: 'text-red-500' },
    { id: 'DOCX', label: 'Word Document', icon: FileText, color: 'text-blue-500' },
    { id: 'XLSX', label: 'Excel Sheet', icon: Database, color: 'text-emerald-600' },
    { id: 'PPTX', label: 'PowerPoint', icon: Presentation, color: 'text-orange-500' },
    { id: 'TXT', label: 'Plain Text', icon: FileText, color: 'text-slate-600' },
  ],
  Image: [
    { id: 'JPG', label: 'Standard JPEG', icon: ImageIcon, color: 'text-amber-500' },
    { id: 'PNG', label: 'Lossless PNG', icon: ImageIcon, color: 'text-blue-400' },
    { id: 'WEBP', label: 'WebP Image', icon: ImageIcon, color: 'text-teal-500' },
    { id: 'GIF', label: 'Animated GIF', icon: ImageIcon, color: 'text-pink-500' },
  ],
  Audio: [
    { id: 'MP3', label: 'Standard MP3', icon: Music, color: 'text-pink-400' },
    { id: 'WAV', label: 'PCM Audio', icon: Music, color: 'text-blue-500' },
    { id: 'FLAC', label: 'High Fidelity', icon: Music, color: 'text-emerald-500' },
  ],
  Video: [
    { id: 'MP4', label: 'H.264 Video', icon: Video, color: 'text-purple-500' },
    { id: 'MOV', label: 'Apple QuickTime', icon: Video, color: 'text-slate-900' },
    { id: 'WEBM', label: 'Web Stream', icon: Video, color: 'text-orange-500' },
  ]
};

interface Props {
  category: string;
  selected: string;
  onSelect: (id: string) => void;
}

/**
 * AJN Format Selector - Professional Transcode Targets
 */
export function FormatSelector({ category, selected, onSelect }: Props) {
  const activeFormats = FORMATS[category] || FORMATS.Document;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Target Format</h3>
        </div>
        <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary uppercase">Safe Selection</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeFormats.map((fmt) => (
          <button
            key={fmt.id}
            onClick={() => onSelect(fmt.id)}
            className={cn(
              "p-5 rounded-[2rem] border-2 text-left transition-all relative group overflow-hidden shadow-sm",
              selected === fmt.id 
                ? "border-primary bg-primary/[0.03] shadow-xl scale-[1.02]" 
                : "border-black/5 bg-white/40 hover:border-primary/20 hover:bg-white/60"
            )}
          >
            <div className="flex items-start justify-between gap-4 relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 bg-white shadow-sm border border-black/5",
                fmt.color
              )}>
                <fmt.icon className="w-5 h-5" />
              </div>
              {selected === fmt.id && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in-50 duration-300">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-0.5 relative z-10">
              <h4 className={cn("text-sm font-black uppercase tracking-tight", selected === fmt.id ? "text-primary" : "text-slate-900")}>
                {fmt.id}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {fmt.label}
              </p>
            </div>

            {/* Decorative background accent */}
            <div className={cn(
              "absolute -bottom-4 -right-4 w-24 h-24 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-10",
              selected === fmt.id ? "opacity-20" : ""
            )} style={{ backgroundColor: 'currentColor' }} />
          </button>
        ))}
      </div>
    </section>
  );
}
