"use client";

import { VideoToolsContainer } from '@/components/dashboard/video-tools/video-tools-container';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Video Studio - Industrial Motion Node
 */
export default function VideoToolsPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <VideoToolsContainer initialFileId={null} />
        </main>
      </div>
    </div>
  );
}
