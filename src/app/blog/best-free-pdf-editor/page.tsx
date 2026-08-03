"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../../components/dashboard/night-sky';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Sparkles, Wand2, Cpu, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../../components/landing/main-footer';
import { Badge } from '../../../components/ui/badge';

export default function BestEditorArticle() {
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
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Engineering Analysis</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-950">
              Why AJN is the <br />
              <span className="text-primary/40">Best PDF Editor</span>
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 pb-8">
              <span>Published: Feb 16, 2026</span>
              <span>•</span>
              <span>By ANJAN STUDIO</span>
              <span>•</span>
              <span className="text-primary flex items-center gap-2"><Sparkles className="w-3.5 h-3.5" /> Premium Tech, Zero Cost</span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed text-sm md:text-base uppercase tracking-widest">
            <p>
              In 2026, the market for PDF editors is flooded with subscription-based models and hidden paywalls. **AJN STUDIO** was built to disrupt this cycle, providing professional-grade surgical document engineering for free.
            </p>

            <div className="p-10 bg-slate-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Wand2 className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4 relative z-10 text-white">Surgical Precision</h3>
              <p className="text-xs md:text-sm font-bold opacity-80 leading-relaxed relative z-10">
                Unlike simple annotators, AJN allows you to manipulate document layers at the binary level. From high-fidelity compression to neural OCR, every tool is optimized for professional deliverables.
              </p>
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Key Engineering Advantages</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              {[
                { title: "No Watermarks", desc: "Your documents remain yours, with zero branding added." },
                { title: "No Signup", desc: "Start editing instantly without giving up your email." },
                { title: "Local Buffer", desc: "Experience the speed of hardware-accelerated processing." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white border border-black/5 rounded-2xl space-y-2 shadow-sm">
                  <h4 className="font-black text-xs text-primary uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>

            <p>
              We believe that professional software should be accessible to students, freelancers, and businesses alike. By leveraging your device's local compute power, **ANJAN STUDIO** eliminates server costs and passes those savings directly to you.
            </p>
          </div>

          <footer className="pt-12 border-t border-black/5">
            <Link href="/pdf-tools">
              <Button className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
                Explore the Network <CheckCircle2 className="w-4 h-4" />
              </Button>
            </Link>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
