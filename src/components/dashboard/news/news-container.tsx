"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Zap, Cpu, ArrowRight } from 'lucide-react';

const updates = [
  {
    id: 1,
    tag: 'NEURAL UPDATE',
    title: 'v2.5 Vision Model Integration',
    desc: 'Our neural OCR engine now features improved layout preservation for complex multi-column documents.',
    date: '2 HOURS AGO',
    icon: Cpu
  },
  {
    id: 2,
    tag: 'NEW FEATURE',
    title: 'Dynamic Rename Tokens',
    desc: 'Added support for {width} and {height} tokens in batch renaming workflows.',
    date: 'YESTERDAY',
    icon: Zap
  },
  {
    id: 3,
    tag: 'PLATFORM',
    title: 'Cloud Storage Expansion',
    desc: 'Business workspaces now support up to 10TB of pooled team storage.',
    date: '3 DAYS AGO',
    icon: Zap
  }
];

export function NewsContainer() {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <header className="h-16 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <Megaphone className="w-6 h-6 text-black" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">What&apos;s New</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Product Intelligence Stream</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-4xl auto p-10 space-y-10">
          {updates.map((item) => (
            <Card key={item.id} className="bg-card/40 border-white/5 hover:border-white/20 transition-all rounded-[2.5rem] overflow-hidden group">
              <CardContent className="p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-white/5 text-white border-white/10 text-[8px] font-black tracking-[0.2em] px-3 h-6">{item.tag}</Badge>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{item.date}</span>
                </div>
                <div className="flex gap-8 items-start">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-black tracking-tight uppercase leading-none">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {item.desc}
                    </p>
                    <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors pt-2">
                      READ FULL BRIEFING <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
