"use client";

import React from 'react';
import { LogoSlider } from '../ui/logo-slider';
import { FileText, ImageIcon, Video, Music, Box, Archive, Database, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FormatStrip() {
  const formats = [
    { label: "PDF", icon: FileText, color: "text-red-500" },
    { label: "DOCX", icon: FileText, color: "text-blue-500" },
    { label: "JPG", icon: ImageIcon, color: "text-purple-500" },
    { label: "XLSX", icon: Database, color: "text-emerald-600" },
    { label: "PNG", icon: ImageIcon, color: "text-blue-400" },
    { label: "HTML", icon: Code2, color: "text-orange-500" },
    { label: "ZIP", icon: Archive, color: "text-slate-900" },
    { label: "PPTX", icon: Box, color: "text-red-600" },
    { label: "WEBP", icon: ImageIcon, color: "text-teal-500" },
  ];

  const logoNodes = formats.map((fmt, i) => (
    <div key={i} className="flex items-center gap-3 px-8 group cursor-default">
      <fmt.icon className={cn("w-6 h-6 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500", fmt.color)} />
      <span className="text-[13px] font-black text-slate-950 uppercase tracking-widest opacity-20 group-hover:opacity-100 transition-all duration-500 italic">
        {fmt.label}
      </span>
    </div>
  ));

  return (
    <div className="py-8 border-y border-black/5 bg-white/20 backdrop-blur-sm relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 mb-4">
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">Supported In-Session Encodings</span>
        <div className="h-px flex-1 bg-black/5 mx-8" />
        <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-950 italic">300+ EXTENSIONS</span>
      </div>
      <LogoSlider logos={logoNodes} speed={120} />
    </div>
  );
}