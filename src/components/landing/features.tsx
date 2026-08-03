
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Zap, Lock, Globe, Search, RefreshCcw, LayoutGrid, Sparkles 
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const features = [
  { title: "Browser-Native", icon: Globe, desc: "Processing happens in your RAM buffer, not on a server." },
  { title: "Zero Retention", icon: Lock, desc: "Files are purged from memory the moment you close the tab." },
  { title: "No Accounts", icon: Zap, desc: "Surgical precision tools without the email capture loop." },
  { title: "AES-256", icon: ShieldCheck, desc: "Bank-level encryption for all local security operations." }
];

export default function Features() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 space-y-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((f, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <Card className="h-full bg-white/40 border-black/5 rounded-[2.5rem] shadow-xl hover:border-primary/40 transition-all border-2 group">
              <CardContent className="p-8 space-y-6">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-black uppercase text-slate-900">{f.title}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{f.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
