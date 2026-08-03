"use client";

import { ConversionEngine } from '@/components/dashboard/conversion/conversion-engine';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Real-time Synthesis - Conversion Node
 */
export default function ConvertPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <ConversionEngine initialFileId={null} />
        </main>
      </div>
    </div>
  );
}
