"use client";

import React, { useState, useEffect } from "react";
import { CircleCheck, ArrowRight, MessageSquare } from 'lucide-react';
import Script from 'next/script';
import Link from 'next/link';
import { useLanguage } from '../../lib/i18n/language-context';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

/**
 * AJN FAQ Section - Sanitized for Hydration v15.4
 * Standardized: Using CircleCheck icon and strict hydration guards.
 */
export function FAQSection() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const faqs = [
    {
      q: t('faq.q1'),
      a: t('faq.a1')
    },
    {
      q: t('faq.q2'),
      a: t('faq.a2')
    },
    {
      q: t('faq.q3'),
      a: t('faq.a3')
    },
    {
      q: "How does the local processing work technically?",
      a: "We utilize WebAssembly (WASM) to run C++ and JavaScript binary engines directly in your browser. This allows us to perform complex PDF manipulation and image transcoding entirely in your RAM buffer without ever sending a single byte to our servers.",
      isSpecial: true
    },
    {
      q: "Is there any hidden cost for high-res exports?",
      a: "No. AJN Studio is built to be a pure utility. All exports, including 300 DPI high-resolution PDFs and lossless images, are completely free of charge and watermark-free.",
      isSpecial: true
    },
    {
      q: t('faq.q4'),
      a: t('faq.a4'),
      isSpecial: true
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  if (!mounted) return <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 h-[600px] bg-white/5 animate-pulse rounded-[3rem]" />;

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 space-y-16 relative text-slate-950">
      <Script 
        id="faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">
            Knowledge Hub
          </Badge>
        </div>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-slate-950">
          Common <span className="text-primary/40">Questions</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about AJN Studio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              className="border border-black/5 bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-sm hover:border-primary/20 transition-all group overflow-hidden border-2 h-full"
            >
              <CardContent className="p-8 md:p-10 space-y-4 h-full flex flex-col">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/10">
                    <CircleCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-base font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                      {faq.q}
                    </h3>
                    <p className={cn(
                      "text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed",
                      faq.isSpecial && "font-serif italic text-slate-700"
                    )}>
                      {faq.a}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-8 pt-8">
        <Link href="/faq">
          <Button className="h-14 px-12 bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
            View Full Hub <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>

        <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-8 p-8 md:p-10 bg-primary/5 border border-primary/10 rounded-[3rem] w-full max-w-3xl shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-black/5">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs font-black text-slate-900 uppercase tracking-tight">Still have questions?</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact our support team for help.</p>
            </div>
          </div>
          <Link href="/contact" className="w-full md:w-auto md:ml-auto">
            <button className="w-full md:w-auto h-12 px-10 bg-white border border-black/5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-md">
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
