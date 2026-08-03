
"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../../components/dashboard/night-sky';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, ShieldCheck, Zap, ServerOff, Cpu } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../../components/landing/main-footer';
import { Badge } from '../../../components/ui/badge';

export default function ArticlePage() {
  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-24 h-12" showGlow={false} />
        </Link>
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2 uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-4xl mx-auto px-8">
        <article className="space-y-12">
          <header className="space-y-6">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Engineering Briefing</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-950">
              The Future of File Tools: <br />
              <span className="text-primary/40">Browser-Native</span> Architecture
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 pb-8">
              <span>Published: Feb 15, 2026</span>
              <span>•</span>
              <span>By ANJAN STUDIO</span>
              <span>•</span>
              <span className="text-emerald-600 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Verified Secure</span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed text-sm md:text-base uppercase tracking-widest">
            <p>
              In the modern landscape of digital document engineering, the traditional server-side processing model is becoming obsolete. **AJN**, the flagship platform developed by **ANJAN STUDIO**, is pioneering a new standard: the Browser-Native Architecture.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
              <div className="p-8 bg-white/60 border border-black/5 rounded-[2.5rem] shadow-xl space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <ServerOff className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Zero Server Uploads</h3>
                <p className="text-[10px] leading-relaxed">Unlike competitors, **AJN** ensures your files never transit through an external network during the creation process.</p>
              </div>
              <div className="p-8 bg-white/60 border border-black/5 rounded-[2.5rem] shadow-xl space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Local Compute Power</h3>
                <p className="text-[10px] leading-relaxed">**ANJAN STUDIO** leverages your device's raw processing power for instant PDF creation and conversion.</p>
              </div>
            </div>

            <p>
              By utilizing advanced technologies like WebAssembly (WASM), **AJN** brings the complexity of professional document software directly to your browser. This means that when you use our PDF to Word or Merge PDF tools, the actual "work" happens in an isolated memory buffer on your computer.
            </p>

            <div className="p-10 bg-slate-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Zap className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4 relative z-10 text-white">Why AJN PDF is Different</h3>
              <p className="text-xs md:text-sm font-bold opacity-80 leading-relaxed relative z-10">
                Traditional tools require you to trust their servers with your most sensitive data. **ANJAN STUDIO** believes that you shouldn't have to choose between convenience and privacy. **AJN** gives you professional-grade tools with the absolute security of a local workflow.
              </p>
            </div>

            <p>
              As we move further into 2026, **ANJAN STUDIO** continues to expand the capabilities of the **AJN** platform, adding high-fidelity image development and complex data extraction—all running 100% locally. This isn't just a convenience; it's a commitment to a safer, faster open-access network.
            </p>
          </div>

          <footer className="pt-12 border-t border-black/5">
            <Link href="/pdf-tools">
              <Button className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
                Experience AJN Power <Zap className="w-4 h-4" />
              </Button>
            </Link>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
