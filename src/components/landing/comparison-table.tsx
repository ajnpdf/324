"use client";

import { Check, X, Info, Zap, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export function ComparisonTable() {
  const leaderboards = [
    { feature: "Local Work (Privacy)", ajn: true, ilove: false, small: false },
    { feature: "File Size Limit (Free)", ajn: "Unlimited", ilove: "100 MB", small: "50 MB" },
    { feature: "No Signup Needed", ajn: true, ilove: "Partial", small: false },
    { feature: "Pick Specific Pages", ajn: true, ilove: true, small: "Pro" },
    { feature: "Extraction Quality", ajn: "Perfect", ilove: "Standard", small: "Standard" },
    { feature: "Language Support", ajn: true, ilove: true, small: true },
    { feature: "Safe System", ajn: true, ilove: false, small: false },
  ];

  return (
    <section className="py-16 md:py-24 max-w-6xl mx-auto px-6 md:px-8 space-y-12 md:space-y-16">
      <div className="text-center space-y-4">
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-6 uppercase tracking-widest rounded-full">Comparison</Badge>
        <h2 className="text-2xl md:text-7xl font-black uppercase tracking-tighter text-slate-950 leading-none">
          Why People <br /><span className="text-primary/40">Choose AJN</span>
        </h2>
        <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
          Better tools without giving up your privacy to cloud sites.
        </p>
      </div>

      <div className="rounded-[2.5rem] md:rounded-[3.rem] border border-black/5 bg-white/40 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-black/5 border-b border-black/5">
                <th className="p-6 md:p-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Features</th>
                <th className="p-6 md:p-8 text-center relative bg-primary/5">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xs md:text-sm font-black text-primary uppercase tracking-tighter">AJN STUDIO</span>
                    <Badge className="bg-primary text-white border-none text-[7px] font-black h-4 px-1.5 uppercase">Best</Badge>
                  </div>
                </th>
                <th className="p-6 md:p-8 text-center text-[10px] font-black uppercase text-slate-400">iLovePDF</th>
                <th className="p-6 md:p-8 text-center text-[10px] font-black uppercase text-slate-400">SmallPDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {leaderboards.map((row, i) => (
                <tr key={i} className="group hover:bg-white/50 transition-colors">
                  <td className="p-6 md:p-8">
                    <span className="text-[10px] md:text-xs font-black uppercase tracking-tight text-slate-950">{row.feature}</span>
                  </td>
                  <td className="p-6 md:p-8 bg-primary/5 text-center">
                    <div className="flex justify-center items-center">
                      {typeof row.ajn === 'boolean' ? (
                        <div className="w-5 h-5 md:w-6 md:h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                          <Check className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </div>
                      ) : (
                        <span className="text-[10px] md:text-xs font-black text-primary uppercase">{row.ajn}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 md:p-8 text-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-center items-center">
                      {row.ilove === false ? (
                        <X className="w-4 h-4 text-red-400" />
                      ) : row.ilove === true ? (
                        <Check className="w-4 h-4 text-slate-400" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase">{row.ilove}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 md:p-8 text-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="flex justify-center items-center">
                      {row.small === false ? (
                        <X className="w-4 h-4 text-red-400" />
                      ) : row.small === true ? (
                        <Check className="w-4 h-4 text-slate-400" />
                      ) : (
                        <span className="text-[10px] font-bold uppercase">{row.small}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 md:gap-6 pt-4 md:pt-8">
        <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Local System Active</span>
        </div>
        <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Info className="w-3 h-3" /> Data checked in Feb 2026.
        </p>
      </div>
    </section>
  );
}
