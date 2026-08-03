"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Mail, 
  Info, 
  FileWarning, 
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Scale
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * AJN DMCA — Intellectual Property Node
 */
export default function DMCAPage() {
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
          <Badge variant="outline" className="bg-[#e8a045]/10 border-[#e8a045]/30 text-[#e8a045] text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Compliance Node</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-[#f0f2f7] tracking-tighter uppercase leading-[0.9] mb-6 italic font-serif">
            DMCA <br /><span className="text-[#e8a045]/40">Directive</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] pb-12 border-b border-[#1e2330]">
            Version 2026.1 &nbsp;·&nbsp; Administrative Protocol
          </p>
        </motion.section>

        <div className="space-y-12">
          <Card className="bg-[#14171f] border-[#1e2330] p-10 rounded-[3rem] shadow-2xl">
            <CardContent className="p-0 space-y-6">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="w-12 h-12 bg-[#e8a045]/10 rounded-2xl flex items-center justify-center border border-[#e8a045]/20">
                  <Scale className="w-6 h-6 text-[#e8a045]" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight font-serif">Content Policy</h2>
              </div>
              <p className="text-slate-400 font-medium leading-relaxed">
                AJN Studio respects intellectual property. Our platform is a browser-native utility; we do not index or store content uploaded by users. However, if you find your copyrighted material being used via a direct tool link on our site without permission, we provide a structured takedown path.
              </p>
            </CardContent>
          </Card>

          <section className="p-10 bg-[#14171f] border border-[#1e2330] rounded-[3rem] space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <FileWarning className="w-32 h-32" />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" /> Takedown Requirements
            </h3>
            <ul className="space-y-4 text-slate-400 font-medium text-sm">
              <li className="flex gap-4">
                <CheckCircle2 className="w-4 h-4 text-[#e8a045] shrink-0 mt-1" />
                <span>Identification of the copyrighted work claimed to have been infringed.</span>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-4 h-4 text-[#e8a045] shrink-0 mt-1" />
                <span>Exact URLs of the infringing material on AJN Studio.</span>
              </li>
              <li className="flex gap-4">
                <CheckCircle2 className="w-4 h-4 text-[#e8a045] shrink-0 mt-1" />
                <span>Your contact information including email and phone number.</span>
              </li>
            </ul>
          </section>

          <div className="p-12 bg-slate-950 border border-white/5 rounded-[3rem] text-center space-y-6 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            <h4 className="text-sm font-black uppercase text-[#e8a045] tracking-[0.4em]">Administrative Dispatch</h4>
            <div className="flex items-center justify-center gap-3 text-2xl font-black text-white select-all">
              <Mail className="w-6 h-6 text-[#e8a045]" />
              ajnpdf1@gmail.com
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expected Response Time: 24-48 Hours</p>
          </div>
        </div>
      </main>

      <footer className="py-16 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">AJN Legal Layer v1.2</p>
      </footer>
    </div>
  );
}
