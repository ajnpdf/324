"use client";

import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function LogoAnimation({ className, showGlow = false }: { className?: string; showGlow?: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative flex select-none items-center gap-2.5', className)}
      aria-label="AJN PDF"
    >
      {showGlow && <span className="absolute -inset-6 rounded-full bg-blue-500/10 blur-3xl dark:bg-orange-500/10" />}
      <motion.span
        className="relative h-full aspect-square shrink-0 overflow-hidden rounded-[14px] border border-slate-200/80 bg-white shadow-[0_8px_22px_rgba(37,99,235,.12)] dark:border-orange-400/15"
        animate={reduceMotion ? undefined : { y: [0, -1.5, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Image src="/brand/ajn-logo.png" alt="" fill sizes="48px" className="object-contain p-0.5" priority />
      </motion.span>
      <span className="relative whitespace-nowrap text-[clamp(1.05rem,2vw,1.42rem)] font-black tracking-[-.045em] text-slate-950 dark:text-white">
        AJN <span className="text-blue-600 dark:text-orange-400">PDF</span>
      </span>
    </motion.div>
  );
}
