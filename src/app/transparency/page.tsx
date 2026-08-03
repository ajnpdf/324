"use client";

import { motion } from 'framer-motion';
import { NightSky } from '@/components/dashboard/night-sky';
import { LogoAnimation } from '@/components/landing/logo-animation';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  Github, 
  Monitor, 
  WifiOff, 
  Lock, 
  ArrowLeft,
  Terminal,
  Activity,
  ExternalLink,
  Code2,
  HardDrive,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MainFooter } from '@/components/landing/main-footer';

/**
 * AJN Transparency Node - Production Stabilized
 * Fixed: Removed head tags from body to prevent SSR Internal Server Errors.
 */
export default function TransparencyPage() {
  const verificationSteps = [
    {
      title: "Open Developer Tools",
      desc: "Press F12 or right-click and select &quot;Inspect&quot; on any tool page.",
      icon: Terminal
    },
    {
      title: "Switch to Network Tab",
      desc: "Select the &quot;Network&quot; tab at the top of the panel.",
      icon: Activity
    },
    {
      title: "Process a Document",
      desc: "Upload and process any file. Watch as zero outgoing requests are made.",
      icon: FileText
    }
  ];

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
            <Link href="/blog" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Updates</Link>
          </nav>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 uppercase h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Back</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-24 md:pt-32 pb-32 max-w-5xl mx-auto px-6 md:px-8">
        
        <section className="space-y-12 mb-32">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-widest rounded-full mb-2">Technical Audit</Badge>
            <h1 className="text-4xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-[0.85] italic text-center">
              Verifiable <br /><span className="text-primary/40">Transparency</span>
            </h1>
            <p className="text-xs md:text-lg font-bold text-slate-400 uppercase tracking-[0.3em] leading-relaxed max-w-2xl mx-auto text-center">
              We guarantee that your files never leave your device. Here is how you can verify this for yourself.
            </p>
          </motion.div>

          <section className="space-y-10">
            <div className="flex items-center gap-4 border-b border-black/5 pb-6 px-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-black/5">
                <Monitor className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">The 60-Second Audit</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {verificationSteps.map((step, i) => (
                <Card key={i} className="bg-white/40 border border-black/5 rounded-[2.5rem] shadow-xl overflow-hidden group hover:border-primary/20 transition-all border-2">
                  <CardContent className="p-8 md:p-10 text-center space-y-6">
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto border border-primary/10 group-hover:scale-110 transition-transform">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-sm font-black uppercase tracking-tight text-slate-950">{step.title}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{step.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="p-8 md:p-10 bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] text-center space-y-4">
              <p className="text-[11px] md:text-sm font-bold text-emerald-700 uppercase tracking-widest leading-relaxed px-4 md:px-12">
                &quot;When you click Process, you will notice that no new entries appear in the Network tab. The processing progress bar is driven by local browser computation, not a server response.&quot;
              </p>
              <div className="flex items-center justify-center gap-3 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Sovereignty Verified by Design</span>
              </div>
            </div>
          </section>

          <section className="space-y-10 pt-20">
            <div className="flex items-center gap-4 border-b border-black/5 pb-6 px-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-black/5">
                <Code2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Open Core Architecture</h2>
            </div>

            <Card className="bg-white/40 backdrop-blur-xl rounded-[3.5rem] overflow-hidden shadow-2xl relative group border-2 border-black/5">
              <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Github className="w-48 h-48 md:w-64 md:h-64 text-slate-900" />
              </div>
              <CardContent className="p-10 md:p-20 space-y-10 relative z-10">
                <div className="space-y-4 max-w-2xl text-left">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black uppercase px-3 h-6 rounded-full mb-2">Public Repository</Badge>
                  <h3 className="text-3xl font-black uppercase tracking-tighter leading-none m-0 text-slate-900">Our Code is <span className="text-primary/40 italic">Open</span></h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    We believe the only way to prove total privacy is to be fully transparent. Every tool on AJN uses standard libraries like pdf-lib, FFmpeg.wasm, and Tesseract.js.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="https://github.com/ajnpdf/ajnpdf.git" target="_blank" rel="noopener noreferrer">
                    <Button className="h-14 px-10 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/10">
                      <Github className="w-4 h-4" /> Explore GitHub Repo
                    </Button>
                  </Link>
                  <Button variant="ghost" className="h-14 px-10 text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest gap-2">
                    Review Audit Trail <ExternalLink className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-10 pt-20">
            <div className="flex items-center gap-4 border-b border-black/5 pb-6 px-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-black/5">
                <HardDrive className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Local Buffer Engineering</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 md:p-10 bg-white/40 border border-black/5 rounded-[2.5rem] md:rounded-[3rem] shadow-xl backdrop-blur-xl space-y-6">
                <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <Lock className="w-5 h-5 text-primary" /> In-Memory Sync
                </h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  When you upload a file, it is converted into a base64 or blob stream stored exclusively in your browser&apos;s RAM. It is never written to a disk or broadcast over a network.
                </p>
              </div>
              <div className="p-8 md:p-10 bg-white/40 border border-black/5 rounded-[2.5rem] md:rounded-[3rem] shadow-xl backdrop-blur-xl space-y-6">
                <h4 className="text-lg font-black uppercase tracking-tight flex items-center gap-3">
                  <WifiOff className="w-5 h-5 text-emerald-600" /> Air-Gapped Mode
                </h4>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  AJN tools are designed to work even if you turn off your Wi-Fi after the page has loaded. Once the WASM core is ready, the internet is no longer required for processing.
                </p>
              </div>
            </div>
          </section>
        </section>

        <MainFooter />
      </main>
    </div>
  );
}
