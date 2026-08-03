"use client";

import { useState } from 'react';
import { TeamOverview } from './team-overview';
import { MembersTab } from './members-tab';
import { SharedFilesTab } from './shared-files-tab';
import { TeamActivityTab } from './team-activity-tab';
import { UsageAnalyticsTab } from './usage-analytics-tab';
import { TeamSettingsTab } from './team-settings-tab';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, FolderCode, History, BarChart3, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export function TeamContainer() {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-16 border-b border-white/5 bg-background/40 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-sm font-black tracking-tighter uppercase">Innovate Inc. Workspace</h1>
            <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary" /> Business Infrastructure
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto p-8 space-y-10">
          {/* Overview Stats */}
          <TeamOverview />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white/5 border border-white/10 h-14 p-1 rounded-2xl w-full lg:w-auto overflow-x-auto scrollbar-hide flex justify-start lg:justify-center">
              {[
                { id: 'members', icon: Users, label: 'MEMBERS' },
                { id: 'files', icon: FolderCode, label: 'SHARED FILES' },
                { id: 'activity', icon: History, label: 'ACTIVITY LOG' },
                { id: 'analytics', icon: BarChart3, label: 'USAGE ANALYTICS' },
                { id: 'settings', icon: SettingsIcon, label: 'TEAM SETTINGS' },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="px-8 h-full rounded-xl data-[state=active]:bg-primary font-black text-[10px] tracking-widest gap-2"
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TabsContent value="members" className="m-0"><MembersTab /></TabsContent>
              <TabsContent value="files" className="m-0"><SharedFilesTab /></TabsContent>
              <TabsContent value="activity" className="m-0"><TeamActivityTab /></TabsContent>
              <TabsContent value="analytics" className="m-0"><UsageAnalyticsTab /></TabsContent>
              <TabsContent value="settings" className="m-0"><TeamSettingsTab /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
