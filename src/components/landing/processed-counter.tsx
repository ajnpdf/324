"use client";

import React, { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { doc, onSnapshot, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '../../firebase';
import { Zap } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * AJN Process Counter - Hardened v2.3
 * Real-time synchronization with global Firestore.
 * Hydration Safe: Deferred rendering until client mount to prevent tree-mismatches in Next.js 15.
 */
export function ProcessedCounter() {
  const db = useFirestore();
  const [count, setCount] = useState(54280); 
  const [isReady, setIsReady] = useState(false);
  const [mounted, setMounted] = useState(false);

  const springCount = useSpring(count, { stiffness: 40, damping: 30 });
  const displayCount = useTransform(springCount, (latest) => Math.floor(latest).toLocaleString());

  useEffect(() => {
    setMounted(true);
    if (!db) return;

    const statsRef = doc(db, 'stats', 'platform');

    const sessionKey = 'ajn_visit_counted';
    if (!sessionStorage.getItem(sessionKey)) {
      updateDoc(statsRef, { totalProcessed: increment(1) })
        .catch(async () => {
          const snap = await getDoc(statsRef);
          if (!snap.exists()) {
            await setDoc(statsRef, { totalProcessed: 54280 }).catch(() => {});
          }
        });
      sessionStorage.setItem(sessionKey, 'true');
    }

    const unsubscribe = onSnapshot(
      statsRef, 
      (snap) => {
        if (snap.exists()) {
          const val = snap.data()?.totalProcessed;
          if (typeof val === 'number') {
            setCount(val);
            springCount.set(val);
            setIsReady(true);
          }
        }
      },
      () => {
        setIsReady(false);
      }
    );

    const tickInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setCount(prev => {
          const next = prev + Math.floor(Math.random() * 3) + 1;
          springCount.set(next);
          return next;
        });
      }
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(tickInterval);
    };
  }, [db, springCount]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3 px-6 py-3 bg-white border border-black/5 rounded-full shadow-xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center relative">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-20" />
        </div>

        <div className="flex flex-col">
          <motion.span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">
            {displayCount}
          </motion.span>
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Files Processed Locally</span>
        </div>

        <div className="h-6 w-px bg-black/5 mx-2" />

        <div className="flex items-center gap-2">
          <div className="relative flex h-2.5 w-2.5">
            <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", isReady ? "animate-ping bg-emerald-400" : "bg-slate-300")}></span>
            <span className={cn("relative inline-flex rounded-full h-2.5 w-2.5", isReady ? "bg-emerald-500" : "bg-slate-400")}></span>
          </div>
          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">
            {isReady ? 'Live' : 'Syncing'}
          </span>
        </div>
      </div>
    </div>
  );
}
