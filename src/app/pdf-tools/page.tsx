"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { 
  FileText,
  FileImage,
  Home,
  Layers,
  Zap,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { ServicesGrid } from '../../components/junction/services-grid';
import { ALL_TOOLS } from '../../lib/tools-data';
import { AdSenseUnit } from '../../components/adsense-unit';
import { Badge } from '../../components/ui/badge';
import { MainFooter } from '../../components/landing/main-footer';
import { PDFToolsDropdown, IMGToolsDropdown } from '../../components/landing/tools-megamenu';
import { LanguageSelector } from '../../components/dashboard/language-selector';
import { useLanguage } from '../../lib/i18n/language-context';
import { FormatStrip } from '../../components/landing/format-strip';

export default function PDFToolsPage() {
  const [activeCat, setActiveCat] = useState("All");
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: "All", label: "All Tools", icon: Layers },
    { id: "AJN PDF", label: "PDF Tools", icon: FileText },
    { id: "AJN IMG", label: "Image Tools", icon: FileImage },
  ];

  const getToolCount = (catId: string) => {
    if (catId === 'All') return ALL_TOOLS.length;
    return ALL_TOOLS.filter(t => t.cat === (catId === 'AJN PDF' ? 'pdf' : 'img')).length;
  };

  if (!mounted) return <div className="min-h-screen bg-[#faf9ff]" />;

  return (
    <div className="min-h-screen w-full text-slate-950 relative font-sans flex flex-col bg-transparent overflow-x-hidden">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[100] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8 h-full">
          <Link href="/" className="flex items-center group">
            <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-6 h-full">
            <PDFToolsDropdown />
            <IMGToolsDropdown />
            <Link href="/pdf-tools" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-colors">Directory</Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:block"><LanguageSelector /></div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 h-9 px-3 uppercase border-black/5 rounded-xl">
              <Home className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-32 md:pt-40 pb-20 w-full relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-12 space-y-16">
          
          <section className="text-center space-y-8">
            <div className="space-y-4">
               <div className="flex justify-center mb-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">
                  Full Directory
                </Badge>
              </div>
              <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-none italic text-slate-900">
                TOOL <span className="text-primary/40">COLLECTION</span>
              </h1>
            </div>

            <div className="flex items-center justify-start md:justify-center gap-3 overflow-x-auto scrollbar-hide py-4 px-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={cn(
                    "px-6 md:px-8 py-3 rounded-2xl text-[10px] md:text-xs font-black border-2 transition-all uppercase tracking-widest flex items-center gap-3 whitespace-nowrap shadow-sm",
                    activeCat === cat.id 
                      ? "bg-primary border-primary text-white shadow-xl scale-105" 
                      : "bg-white border-black/5 text-slate-400 hover:border-primary/40"
                  )}
                >
                  <cat.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {cat.label}
                  <Badge className={cn(
                    "text-[8px] px-2 h-4.5 border-none font-black",
                    activeCat === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
                  )}>
                    {getToolCount(cat.id)}
                  </Badge>
                </button>
              ))}
            </div>
          </section>

          <div className="py-4">
            <AdSenseUnit />
          </div>

          <section className="min-h-[400px]">
            <ServicesGrid query="" category={activeCat} />
          </section>
        </div>

        <div className="mt-24">
          <FormatStrip />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-12 mt-20 space-y-16">
          <div className="p-8 md:p-12 bg-white/40 border border-black/5 backdrop-blur-xl rounded-[3rem] md:rounded-[4rem] text-center space-y-6 shadow-2xl relative overflow-hidden group border-2">
             <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-all duration-1000">
                <Zap className="w-48 h-48 md:w-64 md:h-64 text-primary" />
             </div>
             <div className="relative z-10 space-y-2">
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-950 italic">Safe & Private</h3>
                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-[0.4em] leading-relaxed max-xl mx-auto">
                  Files stay in your browser. All processing is local.
                </p>
             </div>
             <div className="flex justify-center items-center gap-3 pt-4 relative z-10">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Local Integrity Verified</span>
             </div>
          </div>
          
          <MainFooter />
        </div>
      </main>
    </div>
  );
}
