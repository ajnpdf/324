
"use client";

import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { DashboardTopBar } from '@/components/dashboard/dashboard-top-bar';
import { NightSky } from '@/components/dashboard/night-sky';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, LayoutGrid, Zap } from 'lucide-react';
import Link from 'next/link';

/**
 * AJN Decommissioned Node - PDF Editor
 * Replaced silent redirect with an informative industrial status page.
 */
export default function PDFEditorPage() {
  return (
    <div className="flex h-screen bg-transparent overflow-hidden font-sans text-slate-950">
      <NightSky />
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 lg:ml-60 transition-all duration-500">
        <DashboardTopBar />
        
        <main className="flex-1 flex items-center justify-center p-8 bg-white/10 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl"
          >
            <Card className="bg-white/60 border-black/5 rounded-[3rem] shadow-2xl overflow-hidden border-2">
              <CardContent className="p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-amber-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto border border-amber-500/20">
                  <ShieldAlert className="w-12 h-12 text-amber-600" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Unit Decommissioned</h2>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed px-8">
                    The surgical PDF editor has been removed from the local network to focus on autonomous conversion and security units.
                  </p>
                </div>

                <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Zap className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Recommended Alternative</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Use <span className="text-primary font-black">Organize PDF</span> or <span className="text-primary font-black">Merge PDF</span> for standard page-level manipulation.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link href="/pdf-tools">
                    <Button className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3">
                      <LayoutGrid className="w-4 h-4" /> View All Active Tools
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="ghost" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all gap-2">
                      <ArrowLeft className="w-3.5 h-3.5" /> Return Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
