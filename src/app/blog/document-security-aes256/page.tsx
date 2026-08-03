
"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../../components/dashboard/night-sky';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Lock, ShieldCheck, Activity, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../../components/landing/main-footer';
import { Badge } from '../../../components/ui/badge';

export default function SecurityArticlePage() {
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
            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Security Protocol</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-950">
              Securing Documents <br />
              <span className="text-emerald-500/40">AES-256</span> Encryption
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 pb-8">
              <span>Published: Feb 12, 2026</span>
              <span>•</span>
              <span>By ANJAN STUDIO</span>
              <span>•</span>
              <span className="text-primary flex items-center gap-2"><Lock className="w-3 h-3" /> Hardened Protocol</span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed text-sm md:text-base uppercase tracking-widest">
            <p>
              In an era where document data breaches are common, **ANJAN STUDIO** has built the **AJN** platform around a singular security philosophy: your data should never leave your sight. This is achieved through integrated AES-256 encryption and a zero-server upload policy.
            </p>

            <div className="p-8 md:p-12 bg-emerald-500/5 border-2 border-emerald-500/10 rounded-[3rem] shadow-2xl space-y-6">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter m-0">The AJN Privacy Shield</h3>
              <p className="text-[10px] leading-relaxed m-0">
                When you password-protect a PDF or unlock a restricted document on **AJN**, the cryptographic operations happen within your browser's isolated sandbox. Unlike server-based tools, **ANJAN STUDIO** provides professional security without the data risk.
              </p>
            </div>

            <p>
              AES-256 (Advanced Encryption Standard) is the global standard for securing classified information. By implementing this standard at the local buffer level, **AJN** allows users to encrypt sensitive reports, legal contracts, and personal records with total confidence.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {[
                { icon: EyeOff, title: "Zero Trace", desc: "No temporary file fragments are left on any remote server." },
                { icon: Activity, title: "Live Audit", desc: "Real-time verification of encryption integrity during creation." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white border border-black/5 rounded-2xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-tight text-slate-950">{item.title}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p>
              **ANJAN STUDIO** continues to harden the **AJN** platform against evolving threats. Our commitment to local document engineering ensures that even as tools become more powerful, they remain fundamentally private. Whether you are using the Protect PDF or Unlock PDF tools, your files are secure by design.
            </p>
          </div>

          <footer className="pt-12 border-t border-black/5">
            <Link href="/security">
              <Button className="h-16 px-12 bg-slate-950 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/10">
                Visit Security Hub <ShieldCheck className="w-4 h-4" />
              </Button>
            </Link>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
