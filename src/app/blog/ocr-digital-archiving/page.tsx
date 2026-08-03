
"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../../components/dashboard/night-sky';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, BrainCircuit, Search, FileText, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../../components/landing/main-footer';
import { Badge } from '../../../components/ui/badge';

export default function OCRArticlePage() {
  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-24 h-12" showGlow={false} />
        </Link>
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2 uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-4xl mx-auto px-8">
        <article className="space-y-12">
          <header className="space-y-6">
            <Badge className="bg-purple-500/10 text-purple-600 border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Intelligent Vision</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-950">
              Next-Gen OCR: <br />
              <span className="text-purple-500/40">Digital</span> Archiving
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 pb-8">
              <span>Published: Feb 10, 2026</span>
              <span>•</span>
              <span>By ANJAN STUDIO</span>
              <span>•</span>
              <span className="text-purple-600 flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Precision Output</span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed text-sm md:text-base uppercase tracking-widest">
            <p>
              Digital archiving is more than just scanning documents; it's about making them searchable, editable, and intelligent. At **ANJAN STUDIO**, we've integrated advanced Neural OCR (Optical Character Recognition) into the **AJN** platform to bridge the gap between paper and data.
            </p>

            <div className="p-8 md:p-12 bg-white/60 border border-black/5 rounded-[3rem] shadow-2xl backdrop-blur-xl space-y-10">
              <div className="flex items-center gap-4 border-b border-black/5 pb-6">
                <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter m-0">Intelligent Search</h3>
              </div>
              <p className="text-[10px] font-bold leading-relaxed">
                By processing every pixel locally, the **AJN** Advanced OCR tool can identify characters with 99.8% accuracy. This transforms static PDF scans into fully searchable archives, allowing you to find any keyword in a 1,000-page document instantly.
              </p>
            </div>

            <p>
              **ANJAN STUDIO** uses a unique multi-stage pipeline for OCR. First, the image is normalized for contrast and tilt. Then, our smart engine identifies text blocks, headings, and tables. Finally, an invisible layer of text is synthesized over your scan, preserving the original look while enabling full selection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 text-center">
              {[
                { title: "Multi-Lingual", desc: "Supports 15+ Indian & Global Scripts" },
                { title: "Formatting", desc: "Retains Tables & Column Layouts" },
                { title: "Exportable", desc: "Output to PDF, Word, or Text" }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-purple-500/5 rounded-2xl space-y-2">
                  <h4 className="font-black text-xs text-purple-600 uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>

            <p>
              Whether you are a student digitizing notes or a professional managing archival records, **AJN** by **ANJAN STUDIO** provides the intelligence needed for modern workflows. Best of all, because our OCR runs locally in your browser, your sensitive data is never exposed to the cloud.
            </p>
          </div>

          <footer className="pt-12 border-t border-black/5">
            <Link href="/tools/ocr-advanced">
              <Button className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
                Start Scan <Zap className="w-4 h-4" />
              </Button>
            </Link>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
