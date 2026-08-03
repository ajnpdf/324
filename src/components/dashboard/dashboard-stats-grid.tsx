"use client";

import { FileIcon, Repeat, BrainCircuit, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Session Files', value: '0', icon: FileIcon, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { label: 'Network Load', value: 'Optimal', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { label: 'Transformations', value: '0', icon: Repeat, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { label: 'Credits', value: '10', icon: BrainCircuit, color: 'text-primary', bg: 'bg-primary/10' },
];

export function DashboardStatsGrid() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5 hover:border-primary/20 transition-all group overflow-hidden rounded-2xl">
          <CardContent className="p-4 flex flex-col justify-between relative h-full">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5 relative z-10">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                <h4 className="text-xl font-black tracking-tighter">{stat.value}</h4>
              </div>
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} relative z-10 shadow-sm`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
