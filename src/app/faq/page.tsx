"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { 
  ArrowLeft, 
  HelpCircle, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Activity,
  CheckCircle2,
  FileText,
  Mail,
  Cpu,
  RefreshCcw
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import { MainFooter } from '../../components/landing/main-footer';
import { useState, useEffect } from 'react';

const fullFaqs = [
  {
    cat: "SECURITY & PRIVACY",
    items: [
      {
        q: "How can AJN process files without uploading them?",
        a: "We use standard web technology called WebAssembly to run tools directly in your browser. Your computer does all the work, so files never need to leave your device."
      },
      {
        q: "What happens to the temporary files?",
        a: "Files are kept in your browser's memory (RAM). When you close the tab or refresh the page, the memory is cleared instantly. No files are saved on any server."
      },
      {
        q: "Can anyone else see my documents?",
        a: "No. Since files stay on your device, it is impossible for anyone else to see them. Your data is 100% private by design."
      }
    ]
  },
  {
    cat: "USAGE & LIMITS",
    items: [
      {
        q: "Is there a daily limit on free tasks?",
        a: "No. AJN Studio offers unlimited tasks. You can merge, split, or compress as many files as you need for free."
      },
      {
        q: "What is the maximum file size supported?",
        a: "We support files up to 200MB. This limit ensures your browser stays fast and stable while processing large documents."
      },
      {
        q: "Do I need an account to use the tools?",
        a: "No account is needed. We want to provide instant access to everyone. All features are unlocked without signup."
      }
    ]
  }
];

export default function FAQHubPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-8 mr-8">
            <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Home</Link>
            <Link href="/pdf-tools" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Tools</Link>
            <Link href="/transparency" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Verification</Link>
          </nav>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 uppercase h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> <span>Back</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-24 md:pt-32 pb-32 max-w-5xl mx-auto px-6 md:px-8">
        <section className="space-y-12 md:space-y-16 mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-widest rounded-full mb-2">Help Center</Badge>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.9] italic">
              Knowledge <span className="text-primary/40">Hub</span>
            </h1>
            <p className="text-xs md:text-lg font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed max-w-2xl mx-auto">
              Everything you need to know about AJN Studio and private document tools.
            </p>
          </motion.div>

          <div className="space-y-20">
            {fullFaqs.map((category, idx) => (
              <section key={idx} className="space-y-10">
                <div className="flex items-center gap-4 border-b border-black/5 pb-6">
                  <div className="w-10 h-10 bg-white border border-black/5 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-widest text-slate-900">{category.cat}</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {category.items.map((faq, fIdx) => (
                    <Card key={fIdx} className="bg-white/40 backdrop-blur-xl border-black/5 rounded-[2.5rem] shadow-xl overflow-hidden hover:border-primary/20 transition-all group border-2">
                      <CardContent className="p-8 md:p-12 space-y-6">
                        <div className="flex items-start gap-6">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 shrink-0 group-hover:scale-110 transition-transform">
                            <HelpCircle className="w-6 h-6 text-primary" />
                          </div>
                          <div className="space-y-4">
                            <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900 leading-tight">
                              {faq.q}
                            </h3>
                            <div className="text-[11px] md:text-sm font-medium text-slate-500 uppercase tracking-widest leading-relaxed font-serif italic text-slate-700">
                              {faq.a}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="p-12 md:p-20 bg-white/40 border border-black/5 backdrop-blur-xl rounded-[4rem] text-center space-y-10 relative overflow-hidden group shadow-2xl border-2">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Zap className="w-64 h-64 text-primary" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter m-0">Can&apos;t find what <br /> you&apos;re looking for?</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Our team is here to help with any technical questions.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
            <div className="flex items-center gap-3 text-slate-900">
              <Mail className="w-5 h-5 text-primary" />
              <span className="text-lg font-black select-all">ajnpdf1@gmail.com</span>
            </div>
            <Link href="/contact">
              <Button className="h-14 px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all">
                Submit Inquiry
              </Button>
            </Link>
          </div>
        </section>

        <div className="mt-20 pt-8 border-t border-black/5 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            AJN Studio is a private platform. <br />
            We do not store your files or data.
          </p>
        </div>
        
        <div className="pt-32">
          <MainFooter />
        </div>
      </main>
    </div>
  );
}
