
"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Filter, Search, History } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function TeamActivityTab() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Filter audit trail..." className="h-10 pl-10 bg-white/5 border-white/10 text-xs font-bold" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 gap-2 border-white/10 bg-white/5 text-xs font-bold uppercase">
            <Filter className="w-3.5 h-3.5" /> FILTER
          </Button>
        </div>
      </div>

      <div className="py-24 text-center bg-white/5 border border-dashed border-white/10 rounded-[3rem]">
        <History className="w-12 h-12 text-muted-foreground/10 mx-auto mb-4" />
        <h3 className="text-lg font-black uppercase tracking-widest text-muted-foreground/40">Audit Trail Clear</h3>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">Team activity will be logged here in real-time.</p>
      </div>
    </div>
  );
}
