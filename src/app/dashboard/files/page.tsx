"use client";

import { FileExplorer } from '@/components/dashboard/files/file-explorer';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Workspace Archive - Professional Storage Layer
 * Real-time synchronized file orchestration.
 */
export default function WorkspacePage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <FileExplorer />
        </main>
      </div>
    </div>
  );
}
