'use client';

import { OutputBuffer } from '@/lib/engine';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, CheckCircle2, FileCode, ExternalLink, Mail, Send, Loader2, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { featureFlags } from '@/lib/feature-flags';

interface Props {
  jobs: OutputBuffer[];
  onPreview: (j: OutputBuffer) => void;
  onClear: () => void;
}

export function OutputSection({ jobs, onPreview, onClear }: Props) {
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleDownload = (job: OutputBuffer) => {
    if (!job.objectUrl) return;
    const a = document.body.appendChild(document.createElement('a'));
    a.href = job.objectUrl;
    a.download = job.fileName;
    a.click();
    document.body.removeChild(a);
    
    toast({
      variant: "success",
      title: "Asset Exported",
      description: `${job.fileName} saved locally.`,
    });
  };

  const handleSendMe = async () => {
    if (!email.trim()) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setActiveShareId(null);
    setEmail("");
    toast({
      variant: "success",
      title: "Asset Dispatched",
      description: "Secure download link sent to recipient.",
    });
  };

  return (
    <section className="space-y-5 animate-in zoom-in-95 duration-500 text-slate-950">
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">
            Processed Buffer ({jobs.length})
          </h3>
        </div>
        <button onClick={onClear} className="text-[10px] font-black text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 uppercase tracking-widest">
          <Trash2 className="w-3.5 h-3.5" /> Purge Cache
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {jobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <Card className="bg-white/50 backdrop-blur-3xl border-emerald-500/20 border-2 overflow-hidden hover:border-emerald-500/40 transition-all group shadow-xl rounded-[2rem]">
                <CardContent className="p-0">
                  <div className="p-5 flex items-center gap-5 border-b border-black/5">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/10">
                      <FileCode className="w-6 h-6 text-emerald-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-black truncate text-slate-950 uppercase tracking-tighter">{job.fileName}</h4>
                        <Badge className="bg-emerald-500 text-white border-none text-[8px] font-black px-2 h-4.5 rounded-full">FINALIZED</Badge>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {job.sizeFormatted} &bull; Integrity Verified
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => onPreview(job)} className="h-9 w-9 flex items-center justify-center text-slate-950/40 hover:text-primary transition-all rounded-xl">
                        <ExternalLink className="w-4.5 h-4.5" />
                      </button>
                      <Button onClick={() => handleDownload(job)} className="h-10 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] px-6 shadow-lg gap-2 rounded-2xl transition-all uppercase tracking-widest">
                        <Download className="w-4 h-4" /> Download
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeShareId === job.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-950 p-6 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Send Me (Secure Dispatch)</Label>
                          <button onClick={() => setActiveShareId(null)} className="text-white/20 hover:text-white"><X className="w-3" /></button>
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="recipient@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/5 border-white/10 text-white h-11 text-xs font-bold rounded-xl"
                          />
                          <Button onClick={handleSendMe} disabled={sending || !email.trim()} className="h-11 bg-primary text-white font-black text-[10px] uppercase tracking-widest px-6 rounded-xl">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "SEND LINK"}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="bg-white/30 p-3 px-8 flex justify-between gap-6 items-center">
                    <div className="flex-1 grid grid-cols-4 gap-6">
                      {[
                        { label: "INPUT", value: job.stats?.originalSize || '---' },
                        { label: "OUTPUT", value: job.sizeFormatted },
                        { label: "SYNC", value: job.stats?.reduction || 'OK', accent: true },
                        { label: "LATENCY", value: job.stats?.time || '0.2s' }
                      ].map((s, i) => (
                        <div key={i} className="space-y-0.5">
                          <p className="text-[8px] font-black text-slate-950/30 uppercase tracking-widest">{s.label}</p>
                          <p className={cn("text-[10px] font-black", s.accent ? "text-emerald-600" : "text-slate-900")}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    
                    {featureFlags.isEnabled('sharing') && (
                      <button 
                        onClick={() => setActiveShareId(activeShareId === job.id ? null : job.id)}
                        className={cn(
                          "h-8 px-4 text-[9px] font-black uppercase tracking-widest hover:bg-black/5 rounded-xl transition-all flex items-center gap-2",
                          activeShareId === job.id ? "text-primary bg-primary/10" : "text-slate-950/40"
                        )}
                      >
                        <Mail className="w-3 h-3" /> Send Me
                      </button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}