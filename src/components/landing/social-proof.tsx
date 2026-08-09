"use client";

import { motion } from 'framer-motion';
import { BriefcaseBusiness, GraduationCap, Landmark, CheckCircle2 } from 'lucide-react';

const workflows = [
  {
    icon: BriefcaseBusiness,
    title: 'Work and applications',
    text: 'Combine certificates, compress a resume, add page numbers or convert supporting images to PDF.',
    checklist: ['Merge documents', 'Compress for upload limits', 'Create a clean final PDF'],
    tone: 'blue',
  },
  {
    icon: GraduationCap,
    title: 'Study and research',
    text: 'Split reading material, extract text, organize scanned pages or prepare images for assignments.',
    checklist: ['Extract selected pages', 'Run OCR with review', 'Reorder study material'],
    tone: 'green',
  },
  {
    icon: Landmark,
    title: 'Business documents',
    text: 'Watermark drafts, compare revisions, protect authorized documents or repair minor PDF structure issues.',
    checklist: ['Watermark and compare', 'Protect with AES-256', 'Use documented limitations'],
    tone: 'red',
  },
];

export function SocialProof() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="text-center">
        <span className="ajn-section-kicker">Common workflows</span>
        <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">Designed around real tasks, not fabricated testimonials.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600">These examples describe supported workflows. They are not user reviews, customer counts or performance guarantees.</p>
      </div>

      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {workflows.map(({ icon: Icon, title, text, checklist, tone }, index) => (
          <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="ajn-glass-card rounded-3xl p-7">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tone === 'red' ? 'bg-red-50 text-red-600' : tone === 'green' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}><Icon className="h-6 w-6" /></div>
            <h3 className="mt-6 text-xl font-black text-slate-950">{title}</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-500">{text}</p>
            <div className="mt-6 space-y-3 border-t border-slate-100 pt-5">{checklist.map((item) => <div key={item} className="flex items-center gap-2 text-xs font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{item}</div>)}</div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
