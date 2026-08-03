"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Command, 
  Zap, 
  ArrowRight, 
  History, 
  Sparkles,
  FileText,
  ImageIcon,
  BrainCircuit,
  Globe,
  ShieldCheck
} from 'lucide-react';
import { ALL_TOOLS, ServiceTool } from '../lib/tools-data';
import Link from 'next/link';
import { cn } from '../lib/utils';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

/**
 * AJN Global Search Command Palette - Performance Optimized v1.7
 * Optimized: useMemo filtering ensures matching 55+ units is jitter-free.
 * UI/UX: Adopted "Try Now" engagement trigger for industrial discovery.
 */
export function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<ServiceTool[]>([]);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('ajn_recent_search');
      if (saved) {
        const ids = JSON.parse(saved);
        const recentTools = ALL_TOOLS.filter(t => ids.includes(t.id));
        setRecent(recentTools.slice(0, 4));
      }
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];

    return ALL_TOOLS.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.desc.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [query]);

  const handleSelect = (tool: ServiceTool) => {
    const saved = JSON.parse(localStorage.getItem('ajn_recent_search') || '[]');
    const next = [tool.id, ...saved.filter((id: string) => id !== tool.id)].slice(0, 5);
    localStorage.setItem('ajn_recent_search', JSON.stringify(next));
    onClose();
    setQuery("");
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-white border border-black/5 shadow-[0_40px_100px_rgba(0,0,0,0.2)] rounded-[2.5rem] overflow-hidden relative z-10 will-change-transform"
          >
            <div className="relative border-b border-black/5">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                autoFocus
                placeholder="Search tools, formats, or keywords... (e.g. 'word', 'compress')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-20 pl-16 pr-20 bg-transparent text-lg font-bold text-slate-950 placeholder:text-slate-300 focus:outline-none"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-black/5 rounded-lg border border-black/5">
                  <span className="text-[10px] font-black text-slate-400">ESC</span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-slate-400 hover:text-slate-900">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <ScrollArea className="max-h-[60vh]">
              <div className="p-4">
                {query.trim() === "" ? (
                  <div className="space-y-8 p-4">
                    {recent.length > 0 && (
                      <section className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                          <History className="w-3.5 h-3.5 text-slate-400" /> Recent Units
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {recent.map(tool => (
                            <Link key={tool.id} href={`/tools/${tool.id}`} onClick={() => handleSelect(tool)}>
                              <div className="p-4 bg-slate-50 border border-black/5 rounded-2xl flex items-center gap-4 hover:border-primary/20 hover:bg-white transition-all group">
                                <div className={cn("w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm", tool.color)}>
                                  <tool.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">{tool.name}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    )}

                    <section className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        <Sparkles className="w-3.5 h-3.5 text-primary/40" /> Frequent Modules
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {ALL_TOOLS.slice(0, 6).map(tool => (
                          <Link key={tool.id} href={`/tools/${tool.id}`} onClick={() => handleSelect(tool)}>
                            <div className="p-4 hover:bg-slate-50 rounded-2xl flex items-center justify-between group transition-colors border border-transparent hover:border-black/5">
                              <div className="flex items-center gap-4">
                                <div className={cn("w-8 h-8 rounded-lg bg-white border border-black/5 flex items-center justify-center shadow-sm", tool.color)}>
                                  <tool.icon className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-950 transition-colors uppercase">{tool.name}</span>
                              </div>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-200 group-hover:text-primary transition-all group-hover:translate-x-1" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="space-y-2 p-2">
                    <div className="px-3 mb-4 flex items-center justify-between">
                       <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Matches ({results.length})</span>
                    </div>
                    {results.length > 0 ? (
                      results.map(tool => (
                        <Link key={tool.id} href={`/tools/${tool.id}`} onClick={() => handleSelect(tool)}>
                          <div className="p-5 bg-white border border-black/5 rounded-3xl flex items-center justify-between group hover:border-primary/40 hover:shadow-xl transition-all mb-2">
                            <div className="flex items-center gap-5 overflow-hidden">
                              <div className={cn("w-12 h-12 rounded-[1.25rem] bg-slate-50 border border-black/5 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110", tool.color)}>
                                <tool.icon className="w-6 h-6" />
                              </div>
                              <div className="overflow-hidden">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h4 className="text-sm font-black uppercase tracking-tight text-slate-950 group-hover:text-primary transition-colors">{tool.name}</h4>
                                  <Badge className="bg-primary/5 text-primary border-none text-[8px] h-4.5 font-bold uppercase">{tool.cat}</Badge>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{tool.desc}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Try Now</span>
                               <ArrowRight className="w-4 h-4 text-primary" />
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="py-20 text-center space-y-6 opacity-40">
                         <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto"><Search className="w-10 h-10 text-slate-400" /></div>
                         <div className="space-y-1">
                           <p className="text-sm font-black uppercase tracking-widest text-slate-900">No matching units</p>
                           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Try searching for formats like "png" or "docx"</p>
                         </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-6 bg-slate-50 border-t border-black/5 flex items-center justify-center gap-10">
               <div className="flex items-center gap-2">
                 <Globe className="w-3.5 h-3.5 text-slate-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Universal Directory</span>
               </div>
               <div className="flex items-center gap-2">
                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Local Integrity</span>
               </div>
               <div className="flex items-center gap-2">
                 <Zap className="w-3.5 h-3.5 text-primary" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-primary">Fast Session</span>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
