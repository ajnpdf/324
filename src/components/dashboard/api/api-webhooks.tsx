"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TestTube2, Trash2, History, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const mockWebhooks = [
  { id: '1', url: 'https://api.my-app.com/webhooks/ajn', events: ['conversion.complete', 'job.started'], status: 'Active', lastDelivery: 'Success (200)' },
  { id: '2', url: 'https://staging.internal.io/hooks', events: ['storage.warning'], status: 'Paused', lastDelivery: 'Failed (500)' },
];

const deliveryLogs = [
  { id: 'l1', time: '2 mins ago', event: 'conversion.complete', status: 200, latency: '42ms' },
  { id: 'l2', time: '1 hour ago', event: 'job.started', status: 200, latency: '31ms' },
  { id: 'l3', time: '3 hours ago', event: 'conversion.complete', status: 500, latency: '120ms' },
];

export function APIWebhooks() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black tracking-tight uppercase">Endpoints</h2>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Receive push notifications for network events</p>
          </div>
          <Button size="sm" variant="outline" className="border-white/10 bg-white/5 font-black text-[10px] gap-2 rounded-xl h-10 px-6">
            <Plus className="w-3 h-3" /> ADD WEBHOOK
          </Button>
        </div>

        <Card className="bg-card/40 border-white/5 overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/10">
                  <TableHead className="text-[9px] font-black uppercase tracking-widest px-6 py-4">URL</TableHead>
                  <TableHead className="text-[9px] font-black uppercase tracking-widest">Events</TableHead>
                  <TableHead className="text-[9px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[9px] font-black uppercase tracking-widest text-right px-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWebhooks.map((hook) => (
                  <TableRow key={hook.id} className="border-white/5 group hover:bg-white/5">
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-bold font-mono max-w-[200px] truncate">{hook.url}</p>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{hook.lastDelivery}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {hook.events.map(e => <Badge key={e} className="text-[8px] bg-primary/10 text-primary border-none">{e}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[8px] font-black uppercase ${hook.status === 'Active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-muted text-muted-foreground'} border-none`}>
                        {hook.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-blue-500/20 text-blue-400"><TestTube2 className="w-3.5 h-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/20 text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="px-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
            <History className="w-3 h-3" /> Delivery Logs
          </h3>
        </div>
        <Card className="bg-card/40 border-white/5 rounded-[2rem]">
          <CardContent className="p-4 space-y-4">
            {deliveryLogs.map((log) => (
              <div key={log.id} className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2 group hover:border-primary/30 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-primary">{log.event}</span>
                  <span className="text-[8px] font-bold text-muted-foreground">{log.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {log.status === 200 ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-red-500" />}
                    <span className="text-xs font-bold">HTTP {log.status}</span>
                  </div>
                  <span className="text-[10px] font-mono opacity-40">{log.latency}</span>
                </div>
              </div>
            ))}
            <button className="w-full text-[9px] font-black uppercase text-muted-foreground hover:text-primary">VIEW ALL LOGS</button>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/20 rounded-[2rem]">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <AlertCircle className="w-4 h-4" />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Retry Strategy</h4>
            </div>
            <p className="text-[10px] text-muted-foreground leading-relaxed font-bold">
              We auto-retry 4xx/5xx responses up to 5 times with exponential backoff (1m, 5m, 30m, 2h, 8h). 
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
