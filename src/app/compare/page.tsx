
"use client";

import { motion } from 'framer-motion';
import { NightSky } from '@/components/dashboard/night-sky';
import { LogoAnimation } from '@/components/landing/logo-animation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '@/components/landing/main-footer';
import { ComparisonTable } from '@/components/landing/comparison-table';

export default function ComparePage() {
  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[100] px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center group">
            <LogoAnimation className="w-20 h-10" showGlow={false} />
          </Link>
          <div className="h-6 w-px bg-black/5" />
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Home</Link>
          <Link href="/pdf-tools" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Directory</Link>
          <Link href="/pricing" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Pricing</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-32">
        <ComparisonTable />
        <MainFooter />
      </main>
    </div>
  );
}
