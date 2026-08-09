"use client";

import { motion } from 'framer-motion';
import { CheckCircle2, Download, Settings2, UploadCloud } from 'lucide-react';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';

const steps = [
  { icon: UploadCloud, number: '01', title: 'Choose a tool and file', text: 'Each page states its supported formats, file limits and processing mode before you begin.', tone: 'red' },
  { icon: Settings2, number: '02', title: 'Set only relevant options', text: 'Use clear controls for page ranges, quality, output names, passwords or permissions when supported.', tone: 'blue' },
  { icon: CheckCircle2, number: '03', title: 'Process with visible status', text: 'Browser tools work on-device. Protect, Unlock and Repair check the secure service before enabling processing.', tone: 'green' },
  { icon: Download, number: '04', title: 'Review and download', text: 'A result appears only after the processor succeeds. Errors keep your settings available for retry.', tone: 'blue' },
];

export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="max-w-3xl">
        <span className="ajn-section-kicker">Simple workflow</span>
        <h2 className="mt-5 text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">Easy to use without hiding the technical truth.</h2>
        <p className="mt-5 text-base leading-7 text-slate-600">AJN PDF currently lists {BUILD_PUBLIC_TOOLS.length} public tools. Every public tool is classified as stable, limited or secure-service based.</p>
      </div>

      <div className="relative mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="pointer-events-none absolute left-[7%] right-[7%] top-12 hidden h-px bg-gradient-to-r from-red-200 via-blue-300 to-emerald-200 xl:block" />
        {steps.map(({ icon: Icon, number, title, text, tone }, index) => (
          <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .07 }} className="ajn-glass-card relative rounded-3xl p-6">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'red' ? 'bg-red-50 text-red-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}><Icon className="h-5 w-5" /></div>
            <p className="mt-6 text-[10px] font-black tracking-[.18em] text-slate-400">STEP {number}</p>
            <h3 className="mt-2 text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
