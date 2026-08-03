"use client";

import React from 'react';
import { PenTool, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

/**
 * AJN Floating Action Pen
 * High-fidelity interaction trigger for real-time PDF editing.
 */
export function FABEdit() {
  return (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-10 right-10 z-[100]"
    >
      <Link href="/tools/edit-pdf">
        <div className="relative group">
          {/* Pulsing Aura */}
          <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/40 transition-all duration-500 animate-pulse" />
          
          <button className="relative w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(30,58,138,0.4)] border-2 border-white/20 overflow-hidden">
            <PenTool className="w-7 h-7" />
            
            {/* Animated Gleam */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>

          {/* Label Tooltip */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 whitespace-nowrap px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-primary" />
              Surgical Editor
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}