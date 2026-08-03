"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, EyeOff, CheckCircle2, ShieldAlert, Zap, Globe } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

/**
 * AJN Sovereign Security Section - Sanitized for Hydration Stability
 */
export function TrustSecurity() {
  const verifications = [
    {
      title: "Google Safe Browsing Verified",
      status: "Verified",
      desc: "Scanned daily for malware and phishing. 100% clean record.",
      icon: Globe,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "SSL A+ Rated",
      status: "Grade A+",
      desc: "Bank-level TLS 1.3 encryption for all platform traffic.",
      icon: ShieldCheck,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Local Sandbox",
      status: "Active",
      desc: "Zero server uploads. Verified browser-native processing.",
      icon: Lock,
      color: "text-primary",
      bg: "bg-primary/10"
    }
  ];

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 space-y-16 relative">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">
            Sovereign Architecture
          </Badge>
        </div>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-slate-950">
          Security by <span className="text-primary/40">Design</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          Professional document engineering in a verified local environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {verifications.map((v, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full bg-white/40 backdrop-blur-xl border border-black/5 rounded-[2.5rem] shadow-xl hover:border-emerald-500/20 transition-all group overflow-hidden border-2">
              <CardContent className="p-8 md:p-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border border-black/5", v.bg, v.color)}>
                    <v.icon className="w-6 h-6" />
                  </div>
                  <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black px-2 h-5 tracking-widest rounded-full uppercase">
                    {v.status}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-950 group-hover:text-primary transition-colors">
                    {v.title}
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    {v.desc}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-[8px] font-black uppercase tracking-widest">Try this tool now</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-10 bg-white/40 border border-black/5 backdrop-blur-xl rounded-[4rem] flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group border-2"
      >
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
          <ShieldAlert className="w-64 h-64 text-primary" />
        </div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3 text-primary mb-2">
            <Zap className="w-5 h-5 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em]">Privacy Directive</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-black tracking-tighter uppercase m-0 leading-none text-slate-950">Zero Server Retention</h3>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest max-lg leading-relaxed">
            AJN Studio uses WebAssembly to keep your data in RAM. When the tab closes, the data vanishes permanently.
          </p>
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Network Score</span>
            <div className="text-3xl font-black text-emerald-500 tabular-nums">99.9%</div>
          </div>
          <div className="w-px h-12 bg-black/5 mx-4" />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Encryption</span>
            <div className="text-xl font-black text-slate-950 uppercase">AES-256</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
