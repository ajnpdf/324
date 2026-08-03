"use client";

import { AIAssistant } from '@/components/dashboard/ai-tools/ai-assistant';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN AI Assistant Hub - Professional Intelligence Node
 * Purpose: Agentic PDF interaction and document synthesis.
 */
export default function AIAssistantPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <AIAssistant />
        </main>
      </div>
    </div>
  );
}
