
"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  ShieldCheck, 
  Lock, 
  Trash2, 
  EyeOff, 
  ServerOff, 
  CheckCircle2, 
  ArrowLeft,
  Activity,
  Info,
  Zap,
  HardDrive
} from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../components/landing/main-footer';

/**
 * AJN Security Hub - Real-time Protocol Audit v6.0
 * Corrected: Replaced "100% local" claims with transparent "Privacy-First Processing" logic.
 */
const securityPillars = [
  {
    title: "Privacy-First Flow",
    icon: ShieldCheck,
    desc: "Our architecture prioritizes local browser-native tasking for maximum data privacy."
  },
  {
    title: "Secure Processing",
    icon: HardDrive,
    desc: "Advanced units use temporary secure processing nodes with automatic cleanup."
  },
  {
    title: "No Trace Sessions",
    icon: Trash2,
    desc: "Temporary assets are purged immediately after task completion. We maintain no persistent file storage."
  },
  {
    title: "Surgical Encryption",
    icon: Lock,
    desc: "Files are optimized using standard security protocols to maintain document integrity."
  },
  {
    title: "WASM Architecture",
    icon: Zap,
    desc: "We leverage local compute power for instant document operations, minimizing data transit."
  },
  {
    title: "Zero Profiling",
    icon: EyeOff,
    desc: "We do not track file content, names, or user data. Metrics are used for system health only."
  }
];

export default function SecurityPage() {
  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-8 mr-8">
            <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Home</Link>
            <Link href="/pdf-tools" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Tools</Link>
            <Link href="/security" className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Security</Link>
            <Link href="/about" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Our Story</Link>
          </nav>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2 uppercase h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-6xl mx-auto px-8">
        <section className="space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center space-y-4"
          >
            <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] px-3 h-6 uppercase tracking-widest mb-2">Protocol Verified</Badge>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-none italic">
              Safe <span className="text-primary/40">Network</span>
            </h1>
            <p className="text-sm md:text-lg font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-3xl mx-auto">
              Your data belongs to you. AJN Studio protects your documents through a hybrid privacy-first architecture.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityPillars.map((pillar, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 bg-white/60 border border-black/5 rounded-[3rem] space-y-6 shadow-xl backdrop-blur-xl hover:border-primary/20 transition-all group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                  <pillar.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-slate-900 leading-none">{pillar.title}</h3>
                <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest opacity-80">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="p-12 bg-slate-950 rounded-[4rem] text-center space-y-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
              <ShieldCheck className="w-64 h-64 text-white" />
            </div>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-center gap-3 text-primary mb-4">
                <Activity className="w-6 h-6 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Active Monitoring</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter m-0">Zero Trace</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-3xl mx-auto leading-relaxed">
                Whether running in your browser or on temporary secure nodes, your data is never stored long-term and is automatically purged after the task is finalized.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 relative z-10">
              <div className="flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Automatic Cleanup</span>
              </div>
              <div className="flex items-center gap-3 px-6 py-2.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-xl">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Safe Session Protocol</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
