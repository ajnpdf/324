"use client";

import { TeamContainer } from '@/components/dashboard/team/team-container';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Business Infrastructure - Collaboration Node
 */
export default function TeamPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden">
          <TeamContainer />
        </main>
      </div>
    </div>
  );
}
