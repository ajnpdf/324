"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { LogoAnimation } from "@/components/landing/logo-animation";

interface ToolLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
  category?: string;
  icon?: string | React.ReactNode;
}

/**
 * AJN Master Tool Layout - Glassmorphism Edition
 * High-fidelity layout for 2026 industrial file tools.
 */
export function ToolLayout({ children, title, description, category = "Processing", icon = "📄" }: ToolLayoutProps) {
  return (
    <div className="min-h-screen bg-transparent text-slate-950 selection:bg-primary/30 selection:text-primary font-sans">
      <header className="h-16 border-b border-white/20 bg-white/40 backdrop-blur-2xl sticky top-0 z-[100] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="flex items-center group">
            <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
          </Link>
          <div className="h-6 w-px bg-black/5 mx-1 hidden sm:block" />
          <nav className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
              Home
            </Link>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
              {category}
            </span>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Safe session</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/10 rounded-full">
            <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 md:px-8 py-12 md:py-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12 space-y-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all group">
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            Back to Directory
          </Link>
          
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-primary rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center text-3xl md:text-4xl shadow-xl shadow-primary/20 border-2 border-white/20">
                {typeof icon === 'string' ? icon : icon}
              </div>
              <div className="space-y-1">
                <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-none italic">
                  {title}
                </h1>
                <div className="flex items-center gap-2 opacity-40">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Hardware Accelerated</span>
                </div>
              </div>
            </div>
            <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest max-w-2xl leading-relaxed md:pl-24 opacity-80">
              {description}
            </p>
          </div>
        </motion.div>

        <div className="relative pb-32">
          {children}
        </div>
      </main>

      {/* Decorative Blur Orbs */}
      <div className="fixed top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
    </div>
  );
}
