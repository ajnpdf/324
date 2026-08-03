"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  Video, 
  Sparkles, 
  Copy, 
  Zap, 
  Monitor, 
  Smartphone, 
  Camera, 
  Mic,
  Clapperboard,
  Gamepad2,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../components/landing/main-footer';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { useToast } from '../../hooks/use-toast';

/**
 * AJN Promotional Toolkit
 * Professional prompts and scripts for reel creation.
 */
export default function PromoToolkitPage() {
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Prompt Copied", description: "Ready for AI video generator." });
  };

  const prompts = [
    {
      title: "Cinematic Workspace",
      desc: "Perfect for high-fidelity brand reveals.",
      prompt: "Cinematic wide shot of a modern minimalist office in Mumbai at night, neon navy blue lighting, rain on the window, a sleek laptop open on a wooden desk showing AJN STUDIO website, digital particles flowing into the screen, 8k resolution, photorealistic."
    },
    {
      title: "Fast Processing Visual",
      desc: "Demonstrates speed and power.",
      prompt: "Extreme close up of a sleek computer mouse clicking 'Merge PDF' button on a glass-textured website, followed by a burst of blue digital energy, high-speed shutter, professional studio lighting, macro lens."
    },
    {
      title: "Abstract Privacy",
      desc: "Focuses on security and local processing.",
      prompt: "Abstract digital visualization of a glowing document staying inside a local circuit board, protected by a translucent blue shield, zero data leaving the circle, tech aesthetic, glowing lines, 4k."
    }
  ];

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-24 h-12" showGlow={false} />
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2 uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-5xl mx-auto px-8 space-y-20">
        <section className="text-center space-y-6">
          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Marketing Node</Badge>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-none">
            Promotion <span className="text-primary/40">Toolkit</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            Professional prompts and scripts to help you create viral reels for AJN STUDIO.
          </p>
        </section>

        {/* REEL SCRIPT SECTION */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-black/5 pb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Clapperboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">30s Reel Script</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Structured for engagement</p>
            </div>
          </div>

          <Card className="bg-slate-950 text-white rounded-[3rem] overflow-hidden shadow-2xl border-none">
            <CardContent className="p-12 space-y-10">
              <div className="space-y-6">
                {[
                  { time: "00-05s", hook: "The Hook", desc: "Stop paying for PDF tools. AJN is free and faster." },
                  { time: "05-15s", hook: "The Problem", desc: "Show a screen recording of slow server-based tools." },
                  { time: "15-25s", hook: "The Solution", desc: "Show AJN Studio processing files 100% locally in seconds." },
                  { time: "25-30s", hook: "Call to Action", desc: "Link in bio. Built by ANJAN." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-8 items-start group">
                    <div className="w-16 shrink-0 text-[10px] font-black text-primary uppercase tracking-widest pt-1">{step.time}</div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black uppercase text-white/40">{step.hook}</h4>
                      <p className="text-lg font-bold leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => copyToClipboard("00-05s: Stop paying for PDF tools. AJN is free and faster.\n05-15s: Show a screen recording of slow server-based tools.\n15-25s: Show AJN Studio processing files 100% locally in seconds.\n25-30s: Link in bio. Built by ANJAN.")}
                className="w-full h-14 bg-white/10 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl border border-white/10"
              >
                Copy Full Script
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* AI VIDEO PROMPTS */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 border-b border-black/5 pb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">AI Visual Prompts</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">For Midjourney / Veo / Sora</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prompts.map((p, i) => (
              <Card key={i} className="bg-white/40 border-black/5 rounded-[2.5rem] shadow-xl backdrop-blur-xl group hover:border-primary/20 transition-all overflow-hidden flex flex-col">
                <CardContent className="p-8 space-y-6 flex-1 flex flex-col">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black uppercase tracking-tight">{p.title}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="flex-1 p-4 bg-black/5 rounded-2xl font-mono text-[9px] text-slate-500 leading-relaxed italic">
                    "{p.prompt}"
                  </div>
                  <Button 
                    onClick={() => copyToClipboard(p.prompt)}
                    className="w-full h-10 bg-primary/10 hover:bg-primary text-primary hover:text-white font-black text-[9px] uppercase tracking-widest rounded-xl transition-all gap-2"
                  >
                    <Copy className="w-3 h-3" /> Copy Prompt
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="p-12 bg-emerald-500/5 border border-emerald-500/10 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <CheckCircle2 className="w-64 h-64 text-emerald-600" />
          </div>
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter m-0">Ready to <span className="text-emerald-600">Promote</span></h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Use these assets to build high-converting content. If you need specific visual elements, reach out to the engineering team.
            </p>
          </div>
          <div className="flex justify-center relative z-10">
            <Link href="/contact">
              <Button className="h-14 px-12 bg-slate-950 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 transition-all">
                Contact Media Node
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
