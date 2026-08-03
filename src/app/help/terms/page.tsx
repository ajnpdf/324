"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Lock, 
  Info, 
  Scale, 
  ArrowLeft,
  Mail,
  Zap,
  Globe,
  FileWarning
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainFooter } from '@/components/landing/main-footer';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN TERMS & CONDITIONS — Industrial Help Node
 */
export default function HelpTermsPage() {
  const sections = [
    {
      id: "copyright",
      num: "Node 01",
      title: "Intellectual Sovereignty",
      icon: ShieldAlert,
      content: (
        <div className="space-y-4">
          <p>Documents processed via <strong className="text-slate-900">AJN Studio</strong> remain the exclusive property of their respective owners. We operate as a pure utility node.</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-500 font-medium">
            <li><strong>No Ownership Transfer:</strong> Use of our tools does not grant us any rights over your content.</li>
            <li><strong>User Responsibility:</strong> You must ensure compliance with global copyright laws for files you process.</li>
            <li><strong>Local Isolation:</strong> Because we do not store files, we cannot monitor or block specific content.</li>
          </ul>
        </div>
      )
    },
    {
      id: "security",
      num: "Node 02",
      title: "Security Assessment",
      icon: Lock,
      content: (
        <div className="space-y-4">
          <p>While AJN Studio uses a sandbox-native model, users accept the following technical conditions:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-500 font-medium">
            <li><strong>Zero Recovery:</strong> We do not recover passwords for documents locked via our security tools.</li>
            <li><strong>Hardware Load:</strong> Intensive processing (like OCR or Large Compression) may impact local device performance.</li>
            <li><strong>Browser Sandboxing:</strong> All transformations occur within the isolated JavaScript context of your local hardware.</li>
          </ul>
        </div>
      )
    },
    {
      id: "usage",
      num: "Node 03",
      title: "Fair Use Directive",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p>AJN Studio provides professional tools for utility and educational purposes:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-500 font-medium">
            <li><strong>No Botting:</strong> Automated scraping or botting of our local tool logic is prohibited.</li>
            <li><strong>As-Is Basis:</strong> The tools are provided without warranty of fitness for a particular legal purpose.</li>
            <li><strong>Adherence:</strong> Use of the network implies agreement with our privacy-first processing model.</li>
          </ul>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-950 font-sans selection:bg-primary/30 selection:text-primary relative overflow-x-hidden">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[100] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
           <span className="text-2xl font-black tracking-tighter text-primary font-serif">Ajn<span className="text-slate-950">PDF</span></span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-950 font-black text-[10px] uppercase tracking-widest gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Button>
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-32">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Legal Protocol</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9] mb-6 italic font-serif">
            Terms & <br /><span className="text-primary/40">Conditions</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] pb-12 border-b border-black/5">
            Effective: February 2026 &nbsp;·&nbsp; Study Connect Solutions Pvt Ltd
          </p>
        </motion.section>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="group bg-white/40 border border-black/5 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-all duration-500" />
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{section.num}</div>
                  <section.icon className="w-5 h-5 opacity-20" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-serif">{section.title}</h2>
                <div className="text-[15px] leading-relaxed text-slate-600 font-medium">{section.content}</div>
              </div>
            </section>
          ))}

          <section className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 md:p-12 text-center space-y-8 shadow-xl">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto border border-black/5 shadow-2xl">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Legal Dispatch</h2>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em]">ajnpdf1@gmail.com</p>
            </div>
            <p className="text-xs font-medium text-slate-500 max-w-md mx-auto leading-relaxed uppercase tracking-widest">
              Contact our administrative node for formal compliance inquiries.
            </p>
          </section>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
