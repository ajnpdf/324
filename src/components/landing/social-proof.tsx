"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, MapPin, CircleCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const reviews = [
  {
    name: "Arjun K.",
    country: "India",
    text: "Finally a site that doesn't ask for my email just to merge two files. Fast and actually free.",
    rating: 5
  },
  {
    name: "Sarah L.",
    country: "UK",
    text: "I was worried about my bank statements, but knowing it's processed in the browser makes me feel so much safer. Great tool.",
    rating: 5
  },
  {
    name: "Mateo R.",
    country: "Spain",
    text: "The speed is actually insane. No waiting for uploads, just drop and it's done. Saved me so much time today.",
    rating: 5
  },
  {
    name: "Priya S.",
    country: "India",
    text: "The interface is so clean. No ads popping up in my face every 5 seconds. Really appreciate the simple approach.",
    rating: 5
  },
  {
    name: "Thomas B.",
    country: "Germany",
    text: "Needed to compress a massive PDF for a gov portal and this worked perfectly on the first try. No watermark either!",
    rating: 5
  },
  {
    name: "David W.",
    country: "Australia",
    text: "I use this for all my client docs now. The fact that nothing leaves my laptop is the biggest selling point for me.",
    rating: 5
  }
];

export function SocialProof() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-[400px]" />;

  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 space-y-16 relative text-slate-950">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">
            Community
          </Badge>
        </div>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-slate-950">
          User <span className="text-primary/40">Reviews</span>
        </h2>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          Trusted by professionals for local document engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        {reviews.map((review, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full bg-white/40 backdrop-blur-xl border border-black/5 rounded-[3rem] shadow-xl hover:border-primary/20 transition-all group overflow-hidden border-2">
              <CardContent className="p-10 md:p-12 flex flex-col h-full gap-8">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {[...Array(review.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />
                </div>

                <p className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-widest leading-relaxed flex-1 italic">
                  &quot;{review.text}&quot;
                </p>

                <div className="pt-8 border-t border-black/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-black uppercase tracking-tight text-slate-950">{review.name}</p>
                    <div className="flex items-center gap-2 opacity-40">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{review.country}</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/10">
                    <CircleCheck className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-4 pt-12">
        <div className="px-6 py-3 bg-primary/5 rounded-full border border-primary/10 shadow-sm">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">50,000+ files processed in-browser</span>
        </div>
      </div>
    </section>
  );
}
