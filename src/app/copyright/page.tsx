"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  FileWarning, 
  Mail, 
  Trash2, 
  ShieldCheck, 
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Scale
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * AJN COPYRIGHT — Removal Policy Node
 */
export default function CopyrightPage() {
  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#d4d8e2] font-sans selection:bg-[#e8a045]/30 relative overflow-x-hidden">
      <div className="fixed top-[-200px] right-[-200px] w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(232,160,69,0.04)_0%,transparent_70%)] pointer-events-none z-0" />
      
      <header className="sticky top-0 z-100 h-20 bg-[#14171f]/80 backdrop-blur-xl border-b border-[#1e2330] px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <span className="text-2xl font-black tracking-tighter text-[#e8a045] font-serif">Ajn<span className="text-[#f0f2f7]">PDF</span></span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <Badge variant="outline" className="bg-[#e8a045]/10 border-[#e8a045]/30 text-[#e8a045] text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Integrity Protocol</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-[#f0f2f7] tracking-tighter uppercase leading-[0.9] mb-6 italic font-serif">
            Copyright <br /><span className="text-[#e8a045]/40">Removal</span>
          </h1>
        </motion.section>

        <div className="space-y-12">
          <Card className="bg-[#14171f] border-[#1e2330] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Trash2 className="w-32 h-32" />
            </div>
            <CardContent className="p-0 space-y-6 relative z-10">
              <h2 className="text-2xl font-black text-white uppercase tracking-tight font-serif">Our Stance</h2>
              <p className="text-slate-400 font-medium leading-relaxed">
                AJN Studio provides document tools for research and educational purposes. We do not support or authorize the distribution of copyrighted material. If you represent a rights-holder and have identified unauthorized content linked through our network, we act quickly to resolve the breach.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="p-10 bg-[#14171f] border border-[#1e2330] rounded-[2.5rem] space-y-6">
              <div className="w-10 h-10 bg-[#e8a045]/10 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#e8a045]" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest font-serif">Verified Request</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Include evidence of ownership and the exact signature of the authorized person in your removal dispatch.
              </p>
            </section>
            <section className="p-10 bg-[#14171f] border border-[#1e2330] rounded-[2.5rem] space-y-6">
              <div className="w-10 h-10 bg-[#e8a045]/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#e8a045]" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-widest font-serif">Good Faith</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                Ensure your claim is based on a good faith belief that the use of material is not authorized by the owner.
              </p>
            </section>
          </div>

          <div className="p-12 bg-slate-950 border border-white/5 rounded-[3rem] text-center space-y-6">
            <h4 className="text-sm font-black uppercase text-[#e8a045] tracking-[0.4em]">Administrative Dispatch</h4>
            <div className="flex items-center justify-center gap-3 text-2xl font-black text-white select-all">
              <Mail className="w-6 h-6 text-[#e8a045]" />
              ajnpdf1@gmail.com
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Typical Processing Cycle: 24-48 Hours</p>
          </div>
        </div>
      </main>

      <footer className="py-16 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">AJN Compliance Layer • 2026</p>
      </footer>
    </div>
  );
}
