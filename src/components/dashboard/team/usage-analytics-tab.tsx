
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, CreditCard, PieChart as PieIcon, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

const memberUsageData = [
  { name: 'Sarah J.', credits: 1450, files: 482 },
  { name: 'Marcus T.', credits: 890, files: 124 },
  { name: 'Elena R.', credits: 1200, files: 89 },
  { name: 'Linda C.', credits: 650, files: 156 },
  { name: 'James W.', credits: 210, files: 12 },
  { name: 'Others', credits: 420, files: 385 },
];

const chartConfig = {
  credits: {
    label: "Credits Consumed",
    color: "hsl(var(--primary))",
  },
};

export function UsageAnalyticsTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart Section */}
      <Card className="lg:col-span-2 bg-card/40 backdrop-blur-xl border-white/5 h-fit">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black uppercase tracking-tighter">Credit Distribution</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Monthly consumption by team member</CardDescription>
            </div>
            <Badge className="bg-primary/20 text-primary border-none font-black text-[8px] uppercase">LIVE METRICS</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#ffffff05' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-primary mb-1">{payload[0].payload.name}</p>
                          <p className="text-lg font-black">{payload[0].value} <span className="text-[9px] text-muted-foreground uppercase">credits</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="credits" radius={[6, 6, 0, 0]}>
                  {memberUsageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'rgba(59, 130, 246, 0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stats Side */}
      <div className="space-y-6">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                <Cpu className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Compute Velocity</p>
                <p className="text-2xl font-black">14.2 ops/min</p>
              </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase">AI Efficiency</span>
                <span className="text-emerald-500">+22% YoY</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase">Bot Rejections</span>
                <span>0.02%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 backdrop-blur-xl border-white/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <PieIcon className="w-3 h-3" /> Cost Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'PDF Operations', value: '45%', color: 'bg-red-500' },
              { label: 'AI Intelligence', value: '30%', color: 'bg-primary' },
              { label: 'Video Rendering', value: '15%', color: 'bg-purple-500' },
              { label: 'Other Transformations', value: '10%', color: 'bg-muted' },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className={cn("h-full", item.color)} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button className="w-full h-12 bg-brand-gradient hover:opacity-90 font-black text-xs gap-2">
          <CreditCard className="w-4 h-4" /> REDISTRIBUTE CREDITS
        </Button>
      </div>
    </div>
  );
}
