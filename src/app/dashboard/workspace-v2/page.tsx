"use client";

import PDFWorkspaceV2 from "@/components/dashboard/workspace/pdf-workspace-v2";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";
import { NightSky } from "@/components/dashboard/night-sky";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { PlatformLoader } from "@/components/platform-loader";

/**
 * AJN Workspace V2 - Professional Data Node
 * Secure environment for high-fidelity asset management.
 */
export default function WorkspaceV2Page() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace("/login");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return <PlatformLoader message="Syncing Network Layers..." />;
  }

  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 relative overflow-hidden bg-slate-950/20">
          <PDFWorkspaceV2 />
        </main>
      </div>
    </div>
  );
}
