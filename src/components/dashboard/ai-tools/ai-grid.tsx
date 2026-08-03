"use client";

import { 
  FileText, 
  Languages, 
  ScanText, 
  Tag, 
  ShieldAlert, 
  SquareUser, 
  Sparkles, 
  Search,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AITool } from './ai-tools-container';

const tools: AITool[] = [
  { id: 'summarizer', title: 'PDF Summarizer', desc: 'Structured bullet points.', icon: FileText, color: 'text-blue-400' },
  { id: 'translator', title: 'Doc Translator', desc: 'Layout-aware translation.', icon: Languages, color: 'text-purple-400' },
  { id: 'ocr', title: 'Smart OCR', desc: 'Editable text extraction.', icon: ScanText, color: 'text-emerald-400' },
  { id: 'categorize', title: 'Auto Categorize', desc: 'Smart smart tags.', icon: Tag, color: 'text-orange-400' },
  { id: 'contract', title: 'Contract Analysis', desc: 'Extract key terms.', icon: ShieldAlert, color: 'text-red-400' },
  { id: 'resume', title: 'Resume Formatter', desc: 'Clean standard layouts.', icon: SquareUser, color: 'text-pink-400' },
  { id: 'enhancer', title: 'Image Enhancer', desc: 'Automated correction.', icon: Sparkles, color: 'text-yellow-400' },
  { id: 'semantic', title: 'Semantic Search', desc: 'Natural language search.', icon: Search, color: 'text-cyan-400' },
];

export function AIGrid({ onSelect }: { onSelect: (t: AITool) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tools.map((tool) => (
        <Card 
          key={tool.id}
          onClick={() => onSelect(tool)}
          className="bg-card/40 backdrop-blur-xl border-white/5 hover:border-primary/30 transition-all group cursor-pointer overflow-hidden relative rounded-2xl"
        >
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-3 h-3 text-primary" />
          </div>
          <CardContent className="p-5 space-y-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 transition-all duration-500 group-hover:scale-110",
              tool.color
            )}>
              <tool.icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-black text-xs uppercase tracking-tighter">{tool.title}</h4>
              <p className="text-[9px] text-muted-foreground leading-tight font-bold truncate uppercase">{tool.desc}</p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="bg-primary/5 text-primary border-none text-[7px] font-black h-4 px-1.5">1 CREDIT</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}