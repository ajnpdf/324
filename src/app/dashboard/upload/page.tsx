"use client";

import { UploadManager } from '@/components/dashboard/upload-manager';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Intelligent Ingest - Upload Node
 */
export default function UploadPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <div className="max-w-5xl mx-auto p-10">
            <UploadManager />
          </div>
        </main>
      </div>
    </div>
  );
}
