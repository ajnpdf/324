"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  CircleCheck,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

/**
 * AJN Hero Section - Skyline Modern Minimalist
 * Refactored to use a unified image across all device breakpoints.
 */
export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <section className="relative min-h-[500px] bg-slate-50" />;

  return (
    <section className="relative w-full h-[60vh] min-h-[500px] md:h-[600px] overflow-hidden font-sans bg-[#faf9ff]">
      {/* 1. UNIFIED BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full">
          <Image 
            src="/images/image.png" 
            fill 
            alt="AJN Workspace" 
            className="object-cover object-center opacity-80"
            priority
            data-ai-hint="office workspace"
          />
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px]" />
        </div>
        {/* Brand Fade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#faf9ff]" />
      </div>

      {/* 2. CONTENT OVERLAY LAYER */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col items-center justify-center md:items-start text-center md:text-left">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="space-y-6 max-w-2xl"
        >
          <div className="space-y-3">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-950 uppercase leading-[0.9] italic">
              ALL PDF TOOLS <br />
              <span className="text-primary/40">IN ONE PLACE</span>
            </h1>
            
            <p className="text-xs md:text-sm font-black text-slate-400 tracking-[0.3em] uppercase max-w-xl">
              Free • Fast • Easy to Use
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link href="/pdf-tools" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto h-14 px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-3 border-2 border-white/10">
                Start Working <Zap className="w-3.5 h-3.5 fill-current" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 pt-8">
            {[
              { icon: ShieldCheck, text: "Privacy-First" },
              { icon: Zap, text: "No Signup" },
              { icon: CircleCheck, text: "Universal" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <item.icon className={cn("w-3.5 h-3.5 text-primary")} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
