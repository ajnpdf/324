"use client";

import Link from "next/link";
import { ArrowRight, FileStack, LockKeyhole, Sparkles, WandSparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PremiumBackground } from "@/components/premium/premium-background";

export function MobileHomeHero() {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative px-4 pb-3 pt-[78px] md:hidden">
      <div className="ajn-mobile-hero ajn-liquid-card relative overflow-hidden rounded-[2rem] p-5">
        <PremiumBackground compact />
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
          className="relative z-10"
        >
          <div className="ajn-mobile-hero-kicker"><Sparkles className="h-3.5 w-3.5" /> All-in-one PDF workspace</div>
          <h1 className="mt-4 text-[2.15rem] font-black leading-[.98] tracking-[-.055em] text-slate-950 dark:text-white">
            PDF tools made <span className="ajn-gradient-text">simple.</span>
          </h1>
          <p className="mt-3 max-w-sm text-[13px] font-semibold leading-5 text-slate-600 dark:text-zinc-300">
            Merge, convert, compress, protect, OCR and more with clear browser or temporary-server processing labels.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Button asChild className="ajn-primary-action h-12 rounded-2xl text-[12px] font-black">
              <Link href="/pdf-tools">Explore tools <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-12 rounded-2xl text-[12px] font-black">
              <Link href="/conversion-tools"><WandSparkles className="h-4 w-4" /> Convert</Link>
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-extrabold text-slate-600 dark:text-zinc-300">
            <span className="ajn-mini-trust"><LockKeyhole className="h-3.5 w-3.5" /> Clear processing</span>
            <span className="ajn-mini-trust"><FileStack className="h-3.5 w-3.5" /> Real tool routes</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
