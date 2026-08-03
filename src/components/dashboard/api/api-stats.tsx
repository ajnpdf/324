"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ArrowUpRight, TrendingUp, AlertCircle, Clock, Globe } from 'lucide-react';

const dailyVolume = [
  { day: '01', calls: 4200 }, { day: '02', calls: 3800 }, { day: '03', calls: 5100 },
  { day: '04', calls: 4900 }, { day: '05', calls: 6200 }, { day: '06', calls: 5800 },
  { day: '07', calls: 7100 }, { day: '08', calls: 6500 }, { day: '09', calls: 8200 },
  { day: '10', calls: 7800 }, { day: '11', calls: 9100 }, { day: '12', calls: 8500 },
];

const endpointUsage = [
  { name: '/v1/convert', value: 45, color: '#3b82f6' },
  { name: '/v1/ai/summarize', value: 25, color: '#8b5cf6' },
  { name: '/v1/pdf/edit', value: 20, color: '#ef4444' },
  { name: '/v1/files', value: 10, color: '#10b981' },
];

/**
 * AJN API Performance Analytics
 * Hardened: Tooltip content guards added to prevent runtime undefined access.
 */
export function APIStats() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'API Calls (30d)', value: '142,804', trend: '+12.4%', icon: Globe, color: 'text-blue-400' },
          { label: 'Avg Latency', value: '142ms', trend: '-15ms', icon: Clock, color: 'text-purple-400' },
          { label: 'Error Rate', value: '0.04%', trend: '-0.01%', icon: AlertCircle, color: 'text-emerald-400' },
          { label: 'Processed Files', value: '82,412', trend: '+8.2%', icon: TrendingUp, color: 'text-orange-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/40 border-white/5 hover:border-primary/20 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <h4 className="text-2xl font-black tracking-tighter">{stat.value}</h4>
              <div className="flex items-center gap-1.5 mt-2">
                <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-500">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 bg-card/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tighter">Call Volume History</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Daily API requests across all endpoints</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="day" stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{ fill: '#ffffff05' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length > 0 && payload[0].payload) {
                      return (
                        <div className="bg-card/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-primary mb-1">
                            Jan {payload[0].payload.day}
                          </p>
                          <p className="text-lg font-black">
                            {payload[0].value?.toLocaleString() || 0} 
                            <span className="text-[9px] text-muted-foreground uppercase ml-1">requests</span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="calls" radius={[4, 4, 0, 0]}>
                  {dailyVolume.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === dailyVolume.length - 1 ? 'var(--primary)' : 'rgba(59, 130, 246, 0.2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-tighter">Endpoint Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={endpointUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {endpointUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {endpointUsage.map(item => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold font-mono text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-xs font-black">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
