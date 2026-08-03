"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Activity, CheckCircle2, Cpu, Globe, Zap, Clock } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';

export default function StatusPage() {
  const tools = [
    { name: "Tool Center 01 (India)", status: "Optimal", ping: "42ms" },
    { name: "Processing Center 02 (Global)", status: "Optimal", ping: "89ms" },
    { name: "Binary Sync Layer", status: "Optimal", ping: "12ms" }
  ];

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-4xl mx-auto px-8">
        <section className="space-y-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-[0.3em]">All Systems Operational</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase">
              Network <span className="text-primary">Status</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              Live heartbeat of the tools and infrastructure.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-10 bg-emerald-500/5 border-2 border-emerald-500/20 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Global Uptime</h3>
                <Badge className="bg-emerald-500 text-white border-none font-black text-[8px] px-2 h-5">99.99%</Badge>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[99.9%]" />
                </div>
                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  <span>30 Days Ago</span>
                  <span>Today</span>
                </div>
              </div>
            </div>

            <div className="p-10 bg-primary/5 border-2 border-primary/20 rounded-[3rem] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black uppercase tracking-tight">Active Tools</h3>
                <Badge className="bg-primary text-white border-none font-black text-[8px] px-2 h-5">3 Modules</Badge>
              </div>
              <div className="flex gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex-1 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-primary opacity-40" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Operational Report</h3>
            <div className="space-y-3">
              {tools.map((node, i) => (
                <div key={i} className="p-6 bg-white/60 border border-black/5 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{node.name}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{node.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-900">{node.ping}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Latency</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-black/5 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] text-center">
          © 2026 AJNPDF. All rights reserved.
        </p>
        <div className="flex items-center gap-3 px-6 py-2.5 bg-white border border-black/5 rounded-full shadow-lg hover:scale-105 transition-all duration-500">
          <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest flex items-center">
            Made in India
            <span className="animate-heart-beat ml-2 text-red-500 text-4xl leading-none inline-block">❤️</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
