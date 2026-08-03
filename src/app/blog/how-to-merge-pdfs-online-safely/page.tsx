"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../../components/dashboard/night-sky';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, ShieldCheck, Zap, Lock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../../components/landing/main-footer';
import { Badge } from '../../../components/ui/badge';

export default function MergeSafetyArticle() {
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
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Security Briefing</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-950">
              How to Merge PDFs <br />
              <span className="text-primary/40">Online Safely</span>
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 pb-8">
              <span>Published: Feb 18, 2026</span>
              <span>•</span>
              <span>By ANJAN STUDIO</span>
              <span>•</span>
              <span className="text-emerald-600 flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> Zero Server Risk</span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed text-sm md:text-base uppercase tracking-widest">
            <p>
              Merging documents is one of the most common digital tasks, yet it often involves significant security risks. Most "Online PDF Mergers" work by uploading your sensitive files to a remote server, processing them, and then allowing you to download the result.
            </p>

            <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[3rem] space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-lg font-black uppercase tracking-tight">The Cloud Danger</h3>
              </div>
              <p className="text-[10px] leading-relaxed">When you upload a file to a standard converter, you lose control over who sees that data, how long it's stored, and whether it's used for training AI models.</p>
            </div>

            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">The Browser-Native Alternative</h3>
            <p>
              **AJN STUDIO** utilizes a fundamentally different approach. Our Merge PDF tool runs entirely within your browser's isolated memory buffer. Using WebAssembly (WASM), we bring the logic of professional document software directly to your device.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
              <div className="p-8 bg-white/60 border border-black/5 rounded-[2.5rem] shadow-xl space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">In-Memory Sync</h3>
                <p className="text-[10px] leading-relaxed">Files are combined in your RAM and never written to a disk or sent across a network.</p>
              </div>
              <div className="p-8 bg-white/60 border border-black/5 rounded-[2.5rem] shadow-xl space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Instant Result</h3>
                <p className="text-[10px] leading-relaxed">No upload/download wait times. The merge happens at the speed of your processor.</p>
              </div>
            </div>

            <p>
              By choosing AJN, you are prioritizing your data sovereignty. Whether you are merging legal contracts, bank statements, or personal records, you can do so with the absolute confidence that your documents never leave your side.
            </p>
          </div>

          <footer className="pt-12 border-t border-black/5">
            <Link href="/tools/merge-pdf">
              <Button className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
                Try Secure Merge <Zap className="w-4 h-4" />
              </Button>
            </Link>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
