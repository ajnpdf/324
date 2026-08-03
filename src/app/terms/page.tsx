
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, 
  Lock, 
  Zap, 
  CheckCircle2, 
  FileWarning, 
  Scale, 
  Users, 
  AlertTriangle, 
  ArrowLeft,
  Mail
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainFooter } from '@/components/landing/main-footer';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN Studio Master Terms of Service - AdSense Hardened
 * Version: 2.6 (February 2026)
 * Governed by the Laws of India.
 */
export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      num: "01",
      title: "Acceptance of Protocol",
      icon: CheckCircle2,
      content: (
        <p>By accessing or using AJN Studio (ajnpdf.com), you acknowledge that you have read, understood, and agree to be bound by these Master Terms. This platform is provided by Study Connect Solutions Pvt Ltd.</p>
      )
    },
    {
      id: "conduct",
      num: "02",
      title: "Acceptable Use & Responsibility",
      icon: ShieldAlert,
      content: (
        <div className="space-y-4">
          <p>Users maintain 100% responsibility for the legality and copyright of the files they process. Prohibited actions include:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li>Processing infringing or copyrighted content without permission.</li>
            <li>Using automated bots or scripts to scrape local tool logic.</li>
            <li>Attempting to bypass security headers or local WASM binaries.</li>
            <li>Uploading illegal material for transformation.</li>
          </ul>
        </div>
      )
    },
    {
      id: "services",
      num: "03",
      title: "Sovereign Utility Directive",
      icon: Zap,
      content: (
        <div className="space-y-4">
          <p>AJN Studio provides browser-native document and image processing. Key characteristics include:</p>
          <ul className="list-disc pl-6 space-y-2 text-slate-600 font-medium">
            <li><strong>Local Node:</strong> Transformations occur within your local browser memory (RAM).</li>
            <li><strong>Zero Recovery:</strong> We cannot recover files or passwords for you as we never store them.</li>
            <li><strong>As-Is Basis:</strong> Tools are provided without warranty of fitness for a particular legal purpose.</li>
          </ul>
        </div>
      )
    },
    {
      id: "liability",
      num: "04",
      title: "Limitation of Liability",
      icon: FileWarning,
      content: (
        <p>In no event shall Study Connect Solutions Pvt Ltd or its owners be liable for any direct, indirect, or incidental damages resulting from data loss, device performance issues, or legal repercussions arising from your use of these tools.</p>
      )
    },
    {
      id: "law",
      num: "05",
      title: "Governing Law & Jurisdiction",
      icon: Scale,
      content: (
        <div className="space-y-4">
          <p>These terms and conditions are governed by and construed in accordance with the <strong>laws of India</strong>. You irrevocably agree that the courts of India shall have exclusive jurisdiction to resolve any dispute which may arise in connection with these Terms.</p>
          <p>Formal legal dispatch: ajnpdf1@gmail.com</p>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-950 font-sans selection:bg-primary/30 relative overflow-x-hidden">
      <NightSky />
      
      <header className="sticky top-0 z-[100] h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
           <span className="text-2xl font-black tracking-tighter text-primary italic">AJN<span className="text-slate-950">Studio</span></span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-950 font-black text-[10px] uppercase tracking-widest gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Legal Protocol</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase leading-[0.9] mb-6 italic">
            Master <br /><span className="text-primary/40">Terms</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] pb-12 border-b border-black/5">
            Effective Date: February 21, 2026 &nbsp;·&nbsp; Study Connect Solutions Pvt Ltd (India)
          </p>
        </motion.section>

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="group bg-white/40 border border-black/5 rounded-[2.5rem] p-10 md:p-12 relative overflow-hidden shadow-xl transition-all hover:border-primary/20">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-20 group-hover:opacity-100 transition-all duration-500" />
              <div className="space-y-8 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Article {section.num}</div>
                  <section.icon className="w-5 h-5 text-slate-300" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">{section.title}</h2>
                <div className="text-[15px] leading-relaxed text-slate-600 font-medium uppercase tracking-widest">{section.content}</div>
              </div>
            </section>
          ))}

          <section className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 md:p-12 text-center space-y-8">
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto border border-black/5 shadow-2xl">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-950 uppercase tracking-tighter">Legal Dispatch</h2>
              <p className="text-[11px] font-black text-primary uppercase tracking-[0.4em] select-all">ajnpdf1@gmail.com</p>
            </div>
          </section>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
