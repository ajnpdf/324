
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Users, Zap, Files, Activity } from 'lucide-react';

const stats = [
  { label: 'Active Members', value: '1', sub: 'Just you', icon: Users, color: 'text-white', bg: 'bg-white/5' },
  { label: 'Network Health', value: '100%', sub: 'No latency', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Credits Used', value: '0', sub: 'of 10,000 pooled', icon: Zap, color: 'text-white', bg: 'bg-white/5' },
  { label: 'Project Count', value: '0', sub: 'Create one to start', icon: Files, color: 'text-white', bg: 'bg-white/5' },
];

export function TeamOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5 hover:border-white/20 transition-all group overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                <h4 className="text-2xl font-black tracking-tighter">{stat.value}</h4>
                <p className="text-[10px] font-bold text-muted-foreground/40 uppercase">{stat.sub}</p>
              </div>
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
