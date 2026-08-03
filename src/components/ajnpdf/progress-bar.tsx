"use client";

import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface ProgressBarProps {
  progress: number;
  status: string;
  className?: string;
}

export function ProgressBar({ progress, status, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full space-y-4 p-8 bg-white border border-black/5 rounded-2xl shadow-sm", className)}>
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Sequence</p>
          <span className="text-slate-900 text-lg font-bold uppercase tracking-tight">
            {status}
          </span>
        </div>
        <span className="text-primary text-3xl font-black italic tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="h-3 bg-black/5 rounded-full overflow-hidden border border-black/5 p-0.5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(30,58,138,0.4)]"
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center gap-2 pt-2 opacity-50">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Safe Session Buffer Active
        </p>
      </div>
    </div>
  );
}
