"use client";

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';
import { DashboardStatsGrid } from '@/components/dashboard/dashboard-stats-grid';
import { DashboardRightPanel } from '@/components/dashboard/dashboard-right-panel';
import { SmartHelper } from '@/components/dashboard/smart-helper';
import { Zap } from 'lucide-react';

/**
 * AJN Dashboard Overview - Primary Navigation Hub
 * Centralized command center for local file operations.
 */
export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans text-slate-950">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-500">
        <DashboardTopBar />
        
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto scrollbar-hide p-8 space-y-10">
            <header className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter uppercase">Dashboard Overview</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Real-time local file management system.</p>
            </header>

            <DashboardStatsGrid />
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <SmartHelper />
              <div className="p-10 bg-primary/5 rounded-[3rem] border border-primary/10 flex flex-col justify-center space-y-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-900">Private Processing</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                    The workspace provides specialized tools for PDF, Image, Video, and Audio. Everything happens in your browser.
                  </p>
                </div>
              </div>
            </div>

            {/* Industrial Disclaimer */}
            <div className="pt-12 text-center opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                AJN can make mistakes. Please double-check responses.
              </p>
            </div>
          </main>
          
          <DashboardRightPanel />
        </div>
      </div>
    </div>
  );
}
