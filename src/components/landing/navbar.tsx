"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  ShieldCheck, 
  Zap, 
  ArrowRight 
} from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { Button } from '../ui/button';
import { PDFToolsDropdown, IMGToolsDropdown } from './tools-megamenu';
import { LanguageSelector } from '../dashboard/language-selector';
import { cn } from '@/lib/utils';
import { ALL_TOOLS } from '../../lib/tools-data';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 h-16 z-[100] px-4 md:px-8 flex items-center justify-between transition-all duration-500",
        scrolled || mobileOpen ? "bg-white/70 backdrop-blur-xl border-b border-black/5 shadow-sm" : "bg-transparent"
      )}>
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center group">
            <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8 h-full">
            <PDFToolsDropdown />
            <IMGToolsDropdown />
            <Link href="/pdf-tools" className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-[0.2em] transition-all">
              All Tools
            </Link>
            <Link href="/security" className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-[0.2em] transition-all">Security</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden sm:block"><LanguageSelector /></div>
          
          <Link href="/pdf-tools">
            <Button className="h-10 px-8 bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-xl shadow-xl hidden sm:flex border-2 border-white/20 hover:scale-105 active:scale-95 transition-all">
              Launch
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="lg:hidden h-10 w-10 text-slate-950 rounded-xl hover:bg-black/5"
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 right-0 bg-white border-b border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.2)] lg:hidden flex flex-col overflow-hidden z-[90]"
            >
              <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto scrollbar-hide">
                <nav className="flex flex-col gap-6">
                  <Link href="/pdf-tools" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-2xl font-bold uppercase tracking-tighter text-slate-900 group">
                    <span>Tools</span> <ArrowRight className="w-6 h-6 text-primary" />
                  </Link>
                  <Link href="/security" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-2xl font-bold uppercase tracking-tighter text-slate-900 group">
                    Security <ArrowRight className="w-6 h-6 text-primary" />
                  </Link>
                  <Link href="/blog" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-2xl font-bold uppercase tracking-tighter text-slate-900 group">
                    Guides <ArrowRight className="w-6 h-6 text-primary" />
                  </Link>
                </nav>

                <div className="pt-8 border-t border-black/5 flex flex-col gap-4">
                   <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language</span>
                     <LanguageSelector />
                   </div>
                   <Link href="/pdf-tools" onClick={() => setMobileOpen(false)}>
                     <Button className="w-full h-14 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl">
                       Get Started
                     </Button>
                   </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}