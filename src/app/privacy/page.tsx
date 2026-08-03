
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  ArrowLeft,
  Mail,
  ServerOff,
  DatabaseZap,
  Cookie,
  Globe,
  Scale,
  ShieldAlert
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MainFooter } from '@/components/landing/main-footer';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Studio Professional Privacy Policy - AdSense Hardened v7.0
 * Compliance: Mandatory Google AdSense Third-Party Advertising & Hybrid Processing Disclosure
 * Updated: Removed absolute local claims for accuracy.
 */
export default function PrivacyPage() {
  const sections = [
    {
      id: "processing-architecture",
      num: "01",
      title: "Processing Architecture",
      icon: ShieldAlert,
      color: "text-red-500",
      content: (
        <div className="space-y-4">
          <p>AJN Studio is designed with a privacy-first approach. Most of our tools operate directly within your browser using WebAssembly. However, some advanced or complex document units may temporarily utilize our secure servers to complete the requested operation.</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li><strong>Hybrid Model:</strong> While many tasks are browser-native, server-assisted tools use a temporary secure node for synthesis.</li>
            <li><strong>Immediate Deletion:</strong> Any files processed on our infrastructure are automatically and permanently purged immediately after the session or task is finalized.</li>
            <li><strong>Zero Retention:</strong> We do not index, profile, or store your documents for any purpose. Your files are your property.</li>
          </ul>
        </div>
      )
    },
    {
      id: "advertising-compliance",
      num: "02",
      title: "Advertising & Cookies",
      icon: Cookie,
      color: "text-amber-500",
      content: (
        <div className="space-y-4">
          <p>We partner with Google AdSense to serve advertisements. To maintain transparency, we adhere to the following standards:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li><strong>Third-Party Vendors:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</li>
            <li><strong>Google Advertising Cookies:</strong> Google's use of advertising cookies enables it and its partners to serve ads based on visits to this site and/or other sites on the Internet.</li>
            <li><strong>Personalized Ads:</strong> Users may opt out of personalized advertising by visiting <Link href="https://www.google.com/settings/ads" target="_blank" className="text-primary font-bold">Google Ads Settings</Link>.</li>
            <li><strong>Cookie Opt-Out:</strong> Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <Link href="https://www.aboutads.info" target="_blank" className="text-primary font-bold">www.aboutads.info</Link>.</li>
          </ul>
        </div>
      )
    },
    {
      id: "data-collection",
      num: "03",
      title: "Data Collection Practices",
      icon: DatabaseZap,
      color: "text-emerald-500",
      content: (
        <div className="space-y-4">
          <p>We only collect anonymous technical metrics to ensure the stability of our local processing engine:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li><strong>Usage Metrics:</strong> Anonymous data on tool popularity via session IDs.</li>
            <li><strong>Diagnostic Reports:</strong> Error logs to help our engineers fix browser-level bugs.</li>
            <li><strong>Essential Cookies:</strong> Cookies required for the functioning of the UI and processing sandbox.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-950 font-sans relative overflow-x-hidden">
      <NightSky />
      
      <header className="sticky top-0 z-[100] h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
           <span className="text-2xl font-black tracking-tighter text-primary uppercase italic">AJN<span className="text-slate-950">Studio</span></span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-950 font-black text-[10px] uppercase tracking-widest gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center md:text-left"
        >
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Privacy Directive</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase leading-[0.9] mb-6 italic">
            Privacy <br /><span className="text-primary/40">Policy</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] pb-12 border-b border-black/5">
            Updated: February 21, 2026 &nbsp;·&nbsp; Study Connect Solutions Pvt Ltd
          </p>
        </motion.section>

        <div className="space-y-12">
          {sections.map((section) => (
            <section 
              key={section.id} 
              id={section.id}
              className="group bg-white/40 backdrop-blur-xl border border-black/5 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-all duration-500" />
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                    Section {section.num}
                  </div>
                  <section.icon className={cn("w-6 h-6", section.color)} />
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">{section.title}</h2>
                <div className="text-[14px] leading-relaxed text-slate-600 font-medium uppercase tracking-widest">
                  {section.content}
                </div>
              </div>
            </section>
          ))}
        </div>

        <div className="mt-20 p-12 bg-slate-950 rounded-[3rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Globe className="w-64 h-64 text-white" />
          </div>
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto border border-white/10 relative z-10">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-3 relative z-10">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Data Liaison</h2>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] select-all">ajnpdf1@gmail.com</p>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
