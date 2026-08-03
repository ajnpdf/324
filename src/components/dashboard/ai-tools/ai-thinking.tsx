"use client";

import { BrainCircuit, Sparkles } from 'lucide-react';

export function AIThinking() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        {/* Pulsing Neurons Visualization */}
        <div className="w-32 h-32 bg-primary/10 rounded-full border-2 border-primary/20 flex items-center justify-center animate-pulse relative">
          <BrainCircuit className="w-12 h-12 text-primary" />
          
          <div className="absolute inset-0 border-4 border-primary/40 rounded-full animate-ping opacity-20" />
          
          {/* Orbiting particles */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce">
            <Sparkles className="w-4 h-4 text-primary opacity-60" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-lg font-black tracking-tight text-gradient">Processing...</h4>
        <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed font-medium uppercase tracking-widest">
          Analyzing document structure and identifying patterns
        </p>
      </div>

      {/* Progress placeholder line */}
      <div className="w-full max-w-[180px] h-1 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-brand-gradient w-1/2 animate-shimmer" />
      </div>
    </div>
  );
}
