"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { NightSky } from '../components/dashboard/night-sky';
import { Navbar } from '../components/landing/navbar';
import Hero from '../components/landing/hero';
import { ServicesGrid } from '../components/landing/services-grid';
import { useLanguage } from '../lib/i18n/language-context';
import { cn } from '../lib/utils';
import { Badge } from '@/components/ui/badge';

const FormatStrip = dynamic(() => import('../components/landing/format-strip').then(m => m.FormatStrip), { ssr: false });
const LiveDemo = dynamic(() => import('../components/landing/live-demo').then(m => m.LiveDemo), { ssr: false });
const HowItWorks = dynamic(() => import('../components/landing/how-it-works').then(m => m.HowItWorks), { ssr: false });
const TrustSecurity = dynamic(() => import('../components/landing/trust-security').then(m => m.TrustSecurity), { ssr: false });
const MainFooter = dynamic(() => import('../components/landing/main-footer').then(m => m.MainFooter), { ssr: false });
const AdSenseUnit = dynamic(() => import('../components/adsense-unit').then(m => m.AdSenseUnit), { ssr: false });

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("All");
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setMounted(true);
  }, []);

  const categories = [
    { id: "All", label: t('allTools') },
    { id: "AJN PDF", label: t('pdfTools') },
    { id: "AJN IMG", label: t('imgTools') },
  ];

  if (!mounted) return <div className="min-h-screen bg-[#faf9ff]" />;

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      <Navbar />

      <main className="relative z-10">
        <Hero />

        <div className="max-w-7xl mx-auto px-6 md:px-8 pb-12">
          <AdSenseUnit />
        </div>

        <section className="pb-24 pt-0 max-w-7xl mx-auto px-6 md:px-8 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-black/5 pb-8">
            <div className="space-y-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">Directory</Badge>
              <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-tighter text-slate-950 italic">
                CHOOSE <span className="text-primary/40">A TOOL</span>
              </h2>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em]">Select a unit to start working locally.</p>
            </div>

            <div className="flex p-1 bg-slate-900/5 rounded-xl border border-black/5 shadow-inner w-full md:w-auto">
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCat(cat.id)} 
                  className={cn(
                    "flex-1 md:flex-none px-5 md:px-8 py-2.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95", 
                    activeCat === cat.id ? "bg-white text-primary shadow-md scale-[1.02]" : "text-slate-400 hover:text-slate-950"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="min-h-[400px]">
            <ServicesGrid query="" category={activeCat} />
          </div>
        </section>

        <FormatStrip />

        <div className="py-16">
          <AdSenseUnit />
        </div>

        <LiveDemo />
        
        <div className="py-16">
          <HowItWorks />
        </div>
        
        <div className="py-8">
          <AdSenseUnit />
        </div>
        
        <TrustSecurity />

        <MainFooter />
      </main>
    </div>
  );
}
