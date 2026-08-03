
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ImageIcon, Settings2, Sparkles, Wand2, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import Link from 'next/link';

const categories = [
  { 
    title: "Document Core", 
    icon: FileText, 
    desc: "Merge, split, and organize PDF page flows with surgical precision.",
    tools: ["Merge PDF", "Split PDF", "Remove Pages"]
  },
  { 
    title: "Raster Mastery", 
    icon: ImageIcon, 
    desc: "Convert and upscale image assets with high-fidelity pixel preserving.",
    tools: ["JPG to PDF", "Image Resizer", "AI Enhancer"]
  },
  { 
    title: "System Utility", 
    icon: Settings2, 
    desc: "Hardened security units for metadata cleaning and password management.",
    tools: ["Protect PDF", "Unlock PDF", "Edit Metadata"]
  },
  { 
    title: "Neural Vision", 
    icon: Wand2, 
    desc: "Advanced neural extraction units for complex character recognition.",
    tools: ["Smart OCR", "PDF to Word", "Searchable PDF"]
  }
];

export function ToolCategories() {
  return (
    <section className="py-24 max-w-7xl mx-auto px-6 md:px-8 space-y-16">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full">Specialized Units</Badge>
        <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic text-slate-950">
          Professional <span className="text-primary/40">Workflows</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {categories.map((cat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full bg-white/40 border-black/5 rounded-[2.5rem] shadow-sm hover:border-primary/40 transition-all group border-2">
              <CardContent className="p-10 space-y-8 flex flex-col h-full">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500 shadow-inner border border-primary/5">
                  <cat.icon className="w-7 h-7" />
                </div>

                <div className="space-y-3 flex-1">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">{cat.title}</h3>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="space-y-2 pt-6 border-t border-black/5">
                  {cat.tools.map(tool => (
                    <div key={tool} className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-400">
                      <div className="w-1 h-1 rounded-full bg-primary/40" />
                      {tool}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
