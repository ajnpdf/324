"use client";

import { motion } from 'framer-motion';
import { NightSky } from '@/components/dashboard/night-sky';
import { LogoAnimation } from '@/components/landing/logo-animation';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Heart, 
  Lock, 
  Zap, 
  Smile, 
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '@/components/landing/main-footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { ALL_TOOLS } from '@/lib/tools-data';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-white">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
           <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 uppercase h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> <span>Back Home</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-24 md:pt-32 pb-32 max-w-7xl mx-auto px-6 md:px-8 space-y-32">
        
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">The Origin</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-none italic">
              Built by <br /><span className="text-primary/40">Anjan.</span>
            </h1>
            <div className="prose prose-slate max-w-xl space-y-6">
              <p className="text-sm md:text-base font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                AJN Studio was born in India with a singular goal: to prove that high-performance professional software can be free, private, and serverless.
              </p>
              <p className="text-xs md:text-sm font-medium text-slate-400 uppercase tracking-wider leading-loose">
                As a developer, I was tired of "Free" PDF sites that were actually data traps. They asked for my email and uploaded my sensitive documents to unknown servers. By using WebAssembly, I moved the processing logic from my servers to your computer.
              </p>
            </div>
            <div className="pt-4">
              <Link href="/pdf-tools">
                <Button className="h-14 px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/10">
                  Try {ALL_TOOLS.length} Free Tools <Zap className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <Card className="bg-white border-black/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative z-10 overflow-hidden group border-2">
              <div className="absolute top-[-20%] right-[-10%] text-[200px] font-black text-primary/5 pointer-events-none select-none italic">AJN</div>
              <CardContent className="p-0 space-y-8 relative z-10">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">Independent Dev • India</Badge>
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-950 italic">Anjan</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lead Engineer • Study Connect Solutions</p>
                  </div>
                </div>
                <blockquote className="text-xl font-bold text-slate-700 italic leading-relaxed border-l-4 border-primary pl-8 py-2">
                  "Your documents are private property. My tools ensure they stay that way by processing them entirely in your browser's memory buffer."
                </blockquote>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section className="space-y-16">
          <div className="text-center space-y-4">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">Core Pillars</Badge>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-950 leading-none italic">
              Simple <span className="text-primary/40">Values</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Files Stay With You",
                body: "Our Zero-Server architecture means every tool on AJN runs inside your browser. Your files never travel to any network node — not ours, not anyone's.",
                icon: Lock,
                color: "text-blue-600",
                bg: "bg-blue-50"
              },
              {
                title: "No Account Traps",
                body: "You shouldn't need to sign up to merge a PDF. AJN Studio will never ask for your email, log your activity, or track your identity.",
                icon: Smile,
                color: "text-emerald-600",
                bg: "bg-emerald-50"
              },
              {
                title: "Free Forever",
                body: "AJN Studio is 100% free with no watermarks and no daily limits. We are funded by transparent ads, not by selling user data.",
                icon: Heart,
                color: "text-red-500",
                bg: "bg-red-50"
              }
            ].map((v, i) => (
              <Card key={i} className="h-full bg-white/40 backdrop-blur-xl border-black/5 rounded-[3rem] shadow-xl overflow-hidden group hover:border-primary/20 transition-all border-2">
                <CardContent className="p-10 space-y-8 flex flex-col h-full text-center items-center">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border border-black/5 transition-all duration-500 group-hover:scale-110", v.bg)}>
                    <v.icon className={cn("w-8 h-8", v.color)} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xl font-black uppercase tracking-tight text-slate-950">{v.title}</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                      {v.body}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <MainFooter />
      </main>
    </div>
  );
}
