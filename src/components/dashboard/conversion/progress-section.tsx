"use client";

import { ProcessingJob, engine } from '@/lib/engine';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { X, Loader2, Clock, Terminal, ChevronDown, Activity, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

export function ProgressSection({ jobs }: { jobs: ProcessingJob[] }) {
  const [showLogs, setShowLogs] = useState<Record<string, boolean>>({});
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [jobs]);

  const toggleLogs = (id: string) => {
    setShowLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (jobs.length === 0) return null;

  return (
    <section className="space-y-6 text-slate-950">
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            >
              <Card className="bg-white/50 backdrop-blur-3xl border-black/5 overflow-hidden group border-2 shadow-2xl rounded-[2rem] relative">
                <CardContent className="p-0 relative z-10">
                  <div className="p-6 flex items-center gap-8">
                    <div className="w-16 h-16 bg-white/60 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-black/5 relative overflow-hidden shadow-inner">
                      {job.status === 'running' ? (
                        <>
                          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                          <Loader2 className="w-8 h-8 text-primary animate-spin relative z-10" />
                        </>
                      ) : (
                        <Clock className="w-8 h-8 text-slate-950/10" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <p className="text-base font-black tracking-tighter truncate max-w-[320px] text-slate-950 uppercase">
                            {job.inputs.length === 1 ? job.inputs[0].name : `File processing`}
                          </p>
                          <span className="text-[10px] font-black text-primary px-3 py-1 bg-primary/5 rounded-full border border-primary/10">Active Tool</span>
                        </div>
                        <span className="text-xl font-black text-primary tracking-tighter">{Math.round(job.progress)}%</span>
                      </div>
                      
                      <div className="relative h-2 bg-black/5 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${job.progress}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_20px_rgba(30,58,138,0.4)]"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center pt-1">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                            <motion.span animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </motion.span>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">{job.stage}</p>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-950/40 uppercase"><Zap className="w-3 h-3" /> 14.2 MB/s</div>
                        </div>
                        <button onClick={() => toggleLogs(job.id)} className="text-[10px] font-black text-primary uppercase flex items-center gap-2 hover:underline">
                          <Terminal className="w-3.5 h-3.5" /> {showLogs[job.id] ? 'Hide' : 'Inspect'} Logs
                        </button>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => engine.cancelJob(job.id)} className="h-12 w-12 text-slate-950/20 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"><X className="w-6 h-6" /></Button>
                  </div>

                  <AnimatePresence>
                    {showLogs[job.id] && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-black p-6 font-mono text-[10.5px] leading-relaxed text-emerald-400 border-t border-white/10 shadow-inner max-h-[300px] overflow-y-auto scrollbar-hide" ref={terminalRef}>
                        {job.logs.map((log, i) => (
                          <div key={i} className={cn("flex gap-4 items-start mb-1", log.level === 'error' ? 'text-red-400' : log.level === 'success' ? 'text-emerald-400' : i === job.logs.length - 1 ? 'text-white' : 'opacity-40')}>
                            <span className="opacity-30 shrink-0 select-none">[{log.timestamp}]</span>
                            <span>{log.message}</span>
                          </div>
                        ))}
                        {job.progress < 100 && <div className="text-primary animate-pulse mt-1">▋</div>}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
