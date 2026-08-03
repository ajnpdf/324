
"use client";

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { APIKeys } from './api-keys';
import { APIStats } from './api-stats';
import { APIWebhooks } from './api-webhooks';
import { APIDocs } from './api-docs';
import { APISandbox } from './api-sandbox';
import { 
  KeyRound, 
  BarChart3, 
  Webhook, 
  FileCode2, 
  Terminal, 
  ShieldCheck,
  Zap,
  Activity
} from 'lucide-react';

export function APIContainer() {
  const [activeTab, setActiveTab] = useState('keys');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-lg">
            <Terminal className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">Developer API Control</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary" /> v1.2 Stable Production
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-500 uppercase">99.98% Uptime</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase">1,000 req/min limit</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white/5 border border-white/10 h-12 p-1 rounded-xl w-full lg:w-auto overflow-x-auto scrollbar-hide flex justify-start lg:justify-center">
              {[
                { id: 'keys', icon: KeyRound, label: 'API KEYS' },
                { id: 'stats', icon: BarChart3, label: 'USAGE STATS' },
                { id: 'webhooks', icon: Webhook, label: 'WEBHOOKS' },
                { id: 'docs', icon: FileCode2, label: 'DOCUMENTATION' },
                { id: 'sandbox', icon: Terminal, label: 'SANDBOX' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="px-6 h-full rounded-lg data-[state=active]:bg-primary font-black text-[10px] tracking-widest gap-2"
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TabsContent value="keys" className="m-0"><APIKeys /></TabsContent>
              <TabsContent value="stats" className="m-0"><APIStats /></TabsContent>
              <TabsContent value="webhooks" className="m-0"><APIWebhooks /></TabsContent>
              <TabsContent value="docs" className="m-0"><APIDocs /></TabsContent>
              <TabsContent value="sandbox" className="m-0"><APISandbox /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
