"use client";

import { Wand2, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolSuggestion {
  toolName: string;
  toolDescription: string;
  isRecommended: boolean;
}

export function ToolSuggestionCard({ tool }: { tool: ToolSuggestion }) {
  return (
    <div className={cn(
      "p-5 rounded-[2rem] border-2 transition-all group cursor-pointer shadow-sm relative overflow-hidden",
      tool.isRecommended 
        ? "bg-primary/[0.03] border-primary/20 shadow-primary/5 hover:border-primary/40" 
        : "bg-white/40 border-black/5 hover:border-primary/20"
    )}>
      {tool.isRecommended && (
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Zap className="w-12 h-12 text-primary" />
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
          tool.isRecommended ? "bg-primary text-white shadow-lg" : "bg-white border border-black/5 text-slate-400"
        )}>
          {tool.isRecommended ? <Zap className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
        </div>
        {tool.isRecommended && (
          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black tracking-widest px-2 h-5 uppercase">Best Choice</Badge>
        )}
      </div>

      <div className="space-y-1.5 mb-6 relative z-10">
        <h5 className="text-[11px] font-black uppercase tracking-tight text-slate-900 leading-none">{tool.toolName}</h5>
        <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed line-clamp-2 opacity-80">{tool.toolDescription}</p>
      </div>

      <Button 
        variant="ghost" 
        className={cn(
          "w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 justify-between px-4 border border-transparent relative z-10",
          tool.isRecommended 
            ? "bg-primary text-white hover:bg-primary/90 shadow-md" 
            : "bg-white border-black/5 hover:bg-black/5 text-slate-900"
        )}
      >
        <span>Launch Tool</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
