"use client";

import { useState } from 'react';
import { AIGrid } from './ai-grid';
import { AIWorkspace } from './ai-workspace';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, BrainCircuit, History, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export type AITool = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
};

export function AIToolsContainer() {
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          {selectedTool ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedTool(null)}
              className="h-9 w-9 rounded-lg hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 text-muted-foreground" />
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-white/5">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </Button>
            </Link>
          )}
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">
              {selectedTool ? selectedTool.title : 'Advanced Tools Suite'}
            </h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-primary" /> System Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-9 gap-2 border-white/10 bg-white/5 text-xs font-bold">
            <History className="w-3.5 h-3.5" /> TASK LOGS
          </Button>
          <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase">10 Credits Left</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-6xl mx-auto p-8 space-y-10">
          {!selectedTool ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <section className="text-center space-y-3">
                <h2 className="text-4xl font-black tracking-tighter">Professional File Processing</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
                  Go beyond conversion. Understand content, extract insights, and generate professional deliverables with integrated processing models.
                </p>
              </section>
              <AIGrid onSelect={setSelectedTool} />
              
              <section className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Privacy & Consent First</h4>
                    <p className="text-xs text-muted-foreground">Your files are processed securely and never used for training models without permission.</p>
                  </div>
                </div>
                <Button variant="outline" className="border-primary/20 text-primary font-bold text-xs">VIEW TERMS</Button>
              </section>
            </div>
          ) : (
            <AIWorkspace tool={selectedTool} />
          )}
        </div>
      </div>
    </div>
  );
}
