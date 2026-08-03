"use client";

import { SettingsContainer } from '@/components/dashboard/settings/settings-container';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';
import { Suspense } from 'react';
import { PlatformLoader } from '@/components/platform-loader';

/**
 * AJN Account Hub - Professional Settings Node
 * Industrial infrastructure for personal and network preferences.
 */
function SettingsPageContent() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <SettingsContainer />
        </main>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<PlatformLoader />}>
      <SettingsPageContent />
    </Suspense>
  );
}
