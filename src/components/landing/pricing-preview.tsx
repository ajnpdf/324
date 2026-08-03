
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import Link from 'next/link';

/**
 * AJN Transparent Pricing Section
 */
export function PricingPreview() {
  return (
    <section className="py-24 max-w-4xl mx-auto px-6 md:px-8 space-y-16">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">No Paywalls</Badge>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-slate-950">
          Always <span className="text-emerald-500/40">Free</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xl mx-auto leading-relaxed">
          Professional document tools should be accessible to everyone. No hidden subscriptions or account traps.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Card className="bg-slate-950 text-white rounded-[4rem] shadow-2xl overflow-hidden border-none relative group">
          <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <Heart className="w-64 h-64 text-white" />
          </div>

          <CardContent className="p-12 md:p-20 flex flex-col md:flex-row items-center gap-12 md:gap-20 relative z-10">
            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">Universal Access</h3>
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest leading-relaxed">
                  By processing files locally on your device, we eliminate server costs and pass the savings directly to you.
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  "No Signups Required",
                  "No File Size Limits",
                  "No Daily Task Caps",
                  "No Watermarks Added",
                  "Bank-Level Privacy",
                  "Industrial Reliability"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <Check className="w-3 h-3 text-white" strokeWidth={4} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full md:w-80 space-y-6">
              <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] text-center space-y-2 backdrop-blur-md">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Sovereign Plan</p>
                <div className="text-6xl font-black tracking-tighter italic">$0</div>
                <p className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Free Forever</p>
              </div>
              <Link href="/pdf-tools" className="block w-full">
                <Button className="w-full h-16 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-widest rounded-[2rem] shadow-2xl transition-all hover:scale-105 active:scale-95">
                  Start Processing Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="flex items-center justify-center gap-3 px-6 py-3 bg-white border border-black/5 rounded-full shadow-lg w-fit mx-auto">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-950">Verified Account-Free Architecture</span>
      </div>
    </section>
  );
}
