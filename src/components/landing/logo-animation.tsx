"use client";

import React, { useId } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function LogoAnimation({ className, showGlow = false }: { className?: string; showGlow?: boolean }) {
  const reduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const gradientId = `ajn-symbol-gradient-${id}`;
  const shadowId = `ajn-symbol-shadow-${id}`;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -5, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn('relative flex select-none items-center', className)}
      aria-label="AJN PDF"
    >
      {showGlow && <div className="absolute -inset-8 rounded-full bg-blue-500/15 blur-3xl dark:bg-blue-400/10" />}
      <svg viewBox="0 0 330 96" role="img" aria-labelledby={`ajn-logo-title-${id}`} className="relative h-full w-full overflow-visible">
        <title id={`ajn-logo-title-${id}`}>AJN PDF</title>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9233f" />
            <stop offset="0.54" stopColor="#2563eb" />
            <stop offset="1" stopColor="#059669" />
          </linearGradient>
          <filter id={shadowId} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="8" stdDeviation="7" floodColor="#2563eb" floodOpacity="0.2" />
          </filter>
        </defs>

        <motion.g
          filter={`url(#${shadowId})`}
          animate={reduceMotion ? undefined : { y: [0, -2.5, 0], rotate: [0, -0.8, 0.8, 0] }}
          transition={{ duration: 5.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '40px 48px' }}
        >
          <rect x="4" y="10" width="72" height="72" rx="22" className="fill-white stroke-blue-100 dark:fill-slate-900 dark:stroke-slate-700" />
          <motion.path
            d="M18 67 39 27c3-6 12-6 15 0l18 40H58l-5-12H34l-5 12H18Z"
            fill={`url(#${gradientId})`}
            initial={reduceMotion ? false : { pathLength: 0.75, opacity: 0.7 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <path d="M38 48h12l-6-14-6 14Z" fill="#fff" fillOpacity=".96" />
          <motion.circle cx="65" cy="22" r="3.2" fill="#10b981" animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], scale: [0.75, 1.15, 0.75] }} transition={{ duration: 2.4, repeat: Infinity }} />
        </motion.g>

        <motion.text
          x="94"
          y="61"
          className="fill-slate-950 dark:fill-slate-50"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="38"
          fontWeight="850"
          letterSpacing="-1.7"
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >AJN</motion.text>
        <motion.text
          x="170"
          y="61"
          fill="#2563eb"
          fontFamily="Inter, Arial, sans-serif"
          fontSize="38"
          fontWeight="850"
          letterSpacing="-1.7"
          initial={reduceMotion ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >PDF</motion.text>
      </svg>
    </motion.div>
  );
}
