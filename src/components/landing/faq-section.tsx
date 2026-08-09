"use client";

import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, CircleHelp, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

const faqs = [
  {
    q: 'Do all tools process files in the browser?',
    a: 'No. Most public page and image tools are browser-based. Protect PDF, Unlock PDF and Repair PDF use the clearly labelled temporary Python service when it is available.',
  },
  {
    q: 'Are files stored permanently?',
    a: 'The current public release does not provide permanent document storage. Browser tools work in the current session. Temporary server-processing tools use isolated request folders that are removed after the response is delivered.',
  },
  {
    q: 'Can AJN PDF unlock a file without the password?',
    a: 'No. Unlock PDF requires the current valid password and confirmation that you own the document or have permission to remove its protection. Password guessing and brute-force workflows are not included.',
  },
  {
    q: 'Are every conversion and OCR result exact?',
    a: 'No converter is perfect for every document. Tool pages describe known layout, scan-quality, browser and format limitations. Review important results before using them as final records.',
  },
  {
    q: 'Why might advertisements not appear?',
    a: 'Ad requests are limited to the production AJN PDF domains and require the optional advertising choice. Ad blockers, inventory, regional consent requirements or AdSense review status can also prevent an ad from rendering.',
  },
  {
    q: 'Which tools are public?',
    a: 'The directory includes only tools marked public by the production policy. Hidden tools are excluded until their output and product claims pass validation.',
  },
];

export function FAQSection() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })),
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <Script id="home-faq-json-ld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="text-center">
        <span className="ajn-section-kicker"><CircleHelp className="h-3.5 w-3.5" /> Product questions</span>
        <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">Clear answers without absolute promises.</h2>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <motion.article key={faq.q} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .05 }} className="ajn-glass-card rounded-3xl p-6 md:p-7">
            <div className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><CircleHelp className="h-4.5 w-4.5" /></div>
              <div><h3 className="text-base font-black text-slate-950">{faq.q}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{faq.a}</p></div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm sm:flex-row">
        <div className="flex items-center gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><MessageSquareText className="h-5 w-5" /></span><div><p className="text-sm font-black text-slate-950">Need a specific answer?</p><p className="mt-1 text-xs font-medium text-slate-500">Read the full FAQ or contact AJN PDF with the tool name and error details.</p></div></div>
        <div className="flex gap-2"><Link href="/faq"><Button variant="outline" className="rounded-xl font-black">Full FAQ</Button></Link><Link href="/contact"><Button className="rounded-xl bg-blue-600 font-black text-white">Contact <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>
      </div>
    </section>
  );
}
