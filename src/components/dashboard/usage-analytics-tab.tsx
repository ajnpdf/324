"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, CreditCard, PieChart as PieIcon, Cpu, ArrowUpRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const memberUsageData = [
  { name: 'Sarah J.', credits: 1450, files: 482 },
  { name: 'Marcus T.', credits: 890, files: 124 },
  { name: 'Elena R.', credits: 1200, files: 89 },
  { name: 'Linda C.', credits: 650, files: 156 },
  { name: 'James W.', credits: 210, files: 12 },
  { name: 'Others', credits: 420, files: 385 },
];

const endpointUsage = [
  { label: 'PDF Operations', value: '45%', color: 'bg-red-500' },
  { label: 'AI Intelligence', value: '30%', color: 'bg-primary' },
  { label: 'Video Rendering', value: '15%', color: 'bg-purple-500' },
  { label: 'Other Transformations', value: '10%', color: 'bg-muted' },
];

/**
 * AJN Professional Usage Analytics Dashboard
 */
export function UsageAnalyticsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-950">
      {/* Chart Section */}
      <Card className="lg:col-span-2 bg-white/40 backdrop-blur-xl border-black/5 shadow-xl rounded-[2.5rem]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Credit Distribution</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monthly consumption metrics</CardDescription>
            </div>
            <Badge className="bg-primary/10 text-primary border-none font-black text-[8px] uppercase px-3">LIVE SYNC</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(0,0,0,0.3)" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="rgba(0,0,0,0.3)" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/90 backdrop-blur-xl border border-black/5 p-4 rounded-2xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-primary mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black">{payload[0].value} <span className="text-[10px] text-slate-400 uppercase">credits</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="credits" radius={[8, 8, 0, 0]}>
                  {memberUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(0,0,0,0.05)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Side */}
      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/10 rounded-3xl shadow-sm">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-black/5">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Compute Velocity</p>
                <p className="text-2xl font-black tabular-nums">14.2 ops/min</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-black/5">
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-slate-400">AI Efficiency</span>
                <span className="text-emerald-600">+22% YoY</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase">
                <span className="text-slate-400">Error Delta</span>
                <span className="text-slate-900">0.02%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/40 backdrop-blur-xl border-black/5 rounded-3xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <PieIcon className="w-3.5 h-3.5" /> Logical Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 px-8 pb-8">
            {endpointUsage.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-1000", item.color)} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl gap-2 transition-all hover:scale-105 active:scale-95">
          <CreditCard className="w-4 h-4" /> Manage Subscriptions
        </Button>
      </div>
    </div>
  );
}
