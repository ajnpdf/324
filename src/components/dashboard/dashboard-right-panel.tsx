"use client";

import { Clock, Sparkles, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

/**
 * AJN Dashboard Right Panel - Session Intelligence
 * All pricing and upgrade prompts removed.
 */
export function DashboardRightPanel() {
  return (
    <aside className="w-[280px] h-full flex flex-col p-6 space-y-10 border-l border-white/5 bg-background/20 backdrop-blur-xl shrink-0 overflow-y-auto scrollbar-hide">
      {/* Session Tools */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Quick Access</h3>
          <Zap className="w-3.5 h-3.5 text-muted-foreground/40" />
        </div>
        <div className="space-y-4 p-8 text-center bg-white/5 rounded-2xl border border-white/10">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">
            Recently used tools will appear here during your active session.
          </p>
        </div>
      </section>

      {/* Suggested Tools (AI) */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Intelligence</h3>
          </div>
        </div>
        <Card className="bg-white/5 border-white/10 shadow-none overflow-hidden group">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              Upload a file to receive neural workflow recommendations.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Activity Feed */}
      <section className="flex-1">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Session History</h3>
          <Badge variant="outline" className="h-4 text-[8px] border-white/20 text-white animate-pulse">LIVE</Badge>
        </div>
        <div className="py-10 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl">
          <Clock className="w-6 h-6 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Awaiting interactions...</p>
        </div>
      </section>

      {/* Free Platform Message */}
      <section className="pt-6">
        <Card className="bg-primary/10 border-primary/20 shadow-xl relative overflow-hidden">
          <CardContent className="p-5 relative z-10 text-primary">
            <h4 className="font-black text-sm mb-2 uppercase tracking-tighter">Pure Archive Power</h4>
            <p className="text-[10px] opacity-70 mb-0 leading-relaxed font-bold uppercase">
              AJN is 100% free. All tools are unlocked for unlimited professional use.
            </p>
          </CardContent>
        </Card>
      </section>
    </aside>
  );
}
