'use client';

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  Heart, 
  ShieldCheck, 
  Zap, 
  Check, 
  Globe, 
  Lock, 
  Cpu,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../components/landing/main-footer';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import RazorpayButton from "@/components/ui/razorpay-button";
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * AJN Pricing Node - Sustainability Architecture v1.2
 * Aligned for 100% Free Sovereign Access.
 */
export default function PricingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#c3d9fa]" />;

  const features = [
    "No Monthly Subscriptions",
    "No Account Registration",
    "Unlimited File Conversions",
    "Max 200MB Per File",
    "100% Local Processing",
    "No Watermarks Added",
    "Privacy by Design",
    "Industrial Stability"
  ];

  return (
    <div className="min-h-screen text-slate-950 font-display relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[100] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-8 mr-8">
            <Link href="/" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Home</Link>
            <Link href="/pdf-tools" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Tools</Link>
            <Link href="/security" className="text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Security</Link>
          </nav>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 uppercase h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-24 md:pt-32 pb-32 max-w-6xl mx-auto px-6 md:px-8">
        
        <section className="text-center space-y-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.3em] rounded-full">Zero Cost Policy</Badge>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9] text-slate-900 italic">
              Simple. <span className="text-primary/40">Free.</span> <br />Sovereign.
            </h1>
            <p className="text-sm md:text-lg font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Professional document engineering should not belong behind a paywall. AJN Studio is free for everyone, forever.
            </p>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-32 items-stretch">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7"
          >
            <Card className="h-full bg-white border-2 border-primary/20 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Zap className="w-64 h-64 text-primary" />
              </div>
              
              <CardContent className="p-10 md:p-16 space-y-12 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <Badge className="bg-primary text-white border-none text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">Active Plan</Badge>
                    <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 italic">Sovereign</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-6xl font-black tracking-tighter text-primary italic">$0</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free Forever</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <Check className="w-3 h-3" strokeWidth={4} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-black/5 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No Credit Card Required</span>
                  </div>
                  <Link href="/pdf-tools" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-14 px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all">
                      Start Processing
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
          >
            <Card className="h-full bg-slate-950 text-white rounded-[3.5rem] shadow-2xl border-none relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Heart className="w-48 h-48 text-primary" />
              </div>

              <CardContent className="p-10 md:p-12 flex-1 flex flex-col justify-center space-y-10 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Fuel the Network</span>
                  </div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">Support AJN</h3>
                  <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                    AJN Studio is run by a single developer. Your support helps cover the costs of high-performance WASM binaries and Neural OCR models.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl space-y-8 text-center">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-4">Select Contribution</p>
                    <RazorpayButton amount={100} label="Support with ₹100" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 opacity-30 text-white">
                    <Lock className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Secure 256-Bit Gateway</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="mb-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Local Compute",
              desc: "Instead of expensive servers, we use your device's raw power. This eliminates our biggest cost and keeps your tools free.",
              icon: Cpu,
              color: "text-blue-500",
              bg: "bg-blue-500/5"
            },
            {
              title: "Transparency",
              desc: "We don't sell your data or show aggressive ads. The project is sustained by the community and minimal native sponsorship.",
              icon: Globe,
              color: "text-emerald-500",
              bg: "bg-emerald-500/5"
            },
            {
              title: "No Middlemen",
              desc: "AJN is built on open-source logic. No licensing fees or corporate overhead, just pure engineering for the world.",
              icon: Lock,
              color: "text-primary",
              bg: "bg-primary/5"
            }
          ].map((item, i) => (
            <div key={i} className="p-10 bg-white/40 border border-black/5 rounded-[3rem] space-y-6 shadow-sm">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", item.bg, item.color)}>
                <item.icon className="w-6 h-6" />
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-black uppercase tracking-tight text-slate-900">{item.title}</h4>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </section>

        <MainFooter />
      </main>
    </div>
  );
}
