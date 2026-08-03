"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  ArrowLeft,
  Scale,
  Zap,
  CheckCircle2,
  FileWarning
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * AJN DISCLAIMER — Professional Legal Node
 */
export default function DisclaimerPage() {
  const sections = [
    {
      id: "general",
      num: "Article 01",
      title: "General Information",
      icon: Info,
      content: "The tools provided by AJN Studio are for utility and educational purposes. While we strive for absolute binary precision, we make no guarantees regarding the legal validity or official acceptance of processed documents."
    },
    {
      id: "liability",
      num: "Article 02",
      title: "Liability Limitation",
      icon: Scale,
      content: "In no event shall AJN Studio, ANJAN, or Study Connect Solutions Pvt Ltd be held liable for data loss, device corruption, or legal repercussions resulting from the use of our browser-native toolset."
    },
    {
      id: "accuracy",
      num: "Article 03",
      title: "Content Accuracy",
      icon: FileWarning,
      content: "Users are responsible for verifying the accuracy of all output files. AI-driven tools (like OCR) may have margins of error depending on source quality."
    }
  ];

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
          className="mb-20 text-center md:text-left"
        >
          <Badge variant="outline" className="bg-[#e8a045]/10 border-[#e8a045]/30 text-[#e8a045] text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Legal Disclaimer</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-[#f0f2f7] tracking-tighter uppercase leading-[0.9] mb-6 italic font-serif">
            Notice & <br /><span className="text-[#e8a045]/40">Warning</span>
          </h1>
        </motion.section>

        <div className="space-y-8">
          {sections.map((s) => (
            <section key={s.id} className="p-10 bg-[#14171f] border border-[#1e2330] rounded-[2.5rem] relative overflow-hidden group shadow-xl">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#e8a045] opacity-20 group-hover:opacity-100 transition-all duration-500" />
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-black text-[#e8a045] uppercase tracking-widest">{s.num}</span>
                <s.icon className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4 font-serif">{s.title}</h3>
              <p className="text-slate-400 leading-relaxed font-medium">{s.content}</p>
            </section>
          ))}
        </div>

        <div className="mt-16 p-10 bg-amber-500/5 border border-amber-500/20 rounded-[3rem] flex items-center gap-6">
          <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
          <p className="text-xs font-bold text-amber-200/60 uppercase tracking-widest leading-relaxed">
            By using our tools, you acknowledge that you have read and understood these professional limitations.
          </p>
        </div>
      </main>

      <footer className="bg-[#14171f] border-t border-[#1e2330] py-16 text-center">
        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em]">© 2026 AJN STUDIO</p>
      </footer>
    </div>
  );
}
