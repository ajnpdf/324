"use client";

import Link from 'next/link';
import Script from 'next/script';
import { ArrowRight, CircleHelp, MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

const faqs = [
  {
    q: 'Where are my files processed?',
    a: 'AJN PDF uses the processing method that fits each tool. Many everyday tools work in your current session, while advanced workflows use secure processing when required.',
  },
  {
    q: 'Are my documents kept permanently?',
    a: 'AJN PDF does not provide permanent document storage for these tools. Files used for secure processing are removed after delivery according to the file-processing policy.',
  },
  {
    q: 'Can AJN PDF unlock a file without the password?',
    a: 'No. Unlock PDF requires the current valid password and confirmation that you own the document or have permission to remove its protection.',
  },
  {
    q: 'Will every conversion look exactly the same?',
    a: 'Complex layouts, scans and uncommon formats can vary during conversion. Important limitations are shown where relevant, and important results should be reviewed before final use.',
  },
  {
    q: 'Why might advertisements not appear?',
    a: 'Advertising can depend on your consent choice, ad blockers, regional requirements, inventory and the current advertising-service status.',
  },
  {
    q: 'Which tools appear in the directory?',
    a: 'The directory shows tools that are ready for public use. Tools still being tested stay out of the main experience until they meet release checks.',
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
        <span className="ajn-section-kicker"><CircleHelp className="h-3.5 w-3.5" /> Helpful answers</span>
        <h2 className="mx-auto mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">The important details, explained simply.</h2>
        <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-slate-600">Quick answers to common questions about files, conversions, privacy and availability.</p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {faqs.map((faq, index) => (
          <motion.article key={faq.q} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .05 }} className="ajn-glass-card rounded-2xl p-6 md:p-7">
            <div className="flex gap-4">
              <div className="ajn-white-icon-tile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-blue-600"><CircleHelp className="h-4.5 w-4.5" /></div>
              <div><h3 className="text-base font-black text-slate-950">{faq.q}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{faq.a}</p></div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row">
        <div className="flex items-center gap-4"><span className="ajn-white-icon-tile flex h-11 w-11 items-center justify-center rounded-xl text-emerald-600"><MessageSquareText className="h-5 w-5" /></span><div><p className="text-sm font-black text-slate-950">Need help with a specific tool?</p><p className="mt-1 text-xs font-medium text-slate-500">Open the full FAQ or contact AJN PDF with the tool name and the issue you see.</p></div></div>
        <div className="flex gap-2"><Link href="/faq"><Button variant="outline" className="rounded-xl font-black">Full FAQ</Button></Link><Link href="/contact"><Button className="rounded-xl bg-blue-600 font-black text-white">Contact <ArrowRight className="ml-2 h-4 w-4" /></Button></Link></div>
      </div>
    </section>
  );
}
