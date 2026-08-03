"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '../../lib/i18n/language-context';
import { LayoutGrid, CircleCheck, Zap, FileUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { ALL_TOOLS } from '../../lib/tools-data';

/**
 * AJN "How it Works" - Simple Modern Language
 * Corrected: Replaced CheckCircle2 with CircleCheck.
 */
export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      title: "Pick a Tool",
      desc: `Choose from ${ALL_TOOLS.length}+ specialized units for PDF, Images, or Data.`,
      icon: <LayoutGrid className="w-10 h-10" />,
      color: "bg-blue-500",
      accent: "text-blue-500"
    },
    {
      num: "02",
      title: "Add Files",
      desc: "Upload safely. Everything happens locally in your browser RAM.",
      icon: <FileUp className="w-10 h-10" />,
      color: "bg-primary",
      accent: "text-primary"
    },
    {
      num: "03",
      title: "Get Result",
      desc: "Your file is ready instantly. No waiting, no signups, no cost.",
      icon: <Zap className="w-10 h-10" />,
      color: "bg-emerald-500",
      accent: "text-emerald-500"
    }
  ];

  return (
    <section className="py-24 bg-white/20 backdrop-blur-sm relative overflow-hidden border-y border-black/5 text-slate-950">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center space-y-4 mb-20">
          <div className="flex justify-center mb-2">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">Workflows</Badge>
          </div>
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter text-slate-950 italic leading-none">
            How it <span className="text-primary/40">Works</span>
          </h2>
          <p className="text-sm md:text-lg font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
            Professional document tools made easy for everyone.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-16 relative">
          <div className="hidden md:block absolute top-1/3 left-0 w-full h-px border-t-2 border-dashed border-black/5 -translate-y-1/2 z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-white/60 p-10 md:p-12 rounded-[3rem] shadow-2xl border border-black/5 flex flex-col items-center text-center group hover:border-primary/20 transition-all duration-500 z-10"
            >
              <div className={cn(
                "absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xl ring-8 ring-white/50",
                step.color
              )}>
                {step.num}
              </div>

              <div className={cn(
                "w-20 h-20 md:w-24 md:h-24 bg-white rounded-[2rem] flex items-center justify-center mb-8 shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3 border border-black/5",
                step.accent
              )}>
                {step.icon}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="pt-8 mt-auto flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-all">
                <CircleCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[8px] font-black uppercase tracking-widest">Verified Process</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
