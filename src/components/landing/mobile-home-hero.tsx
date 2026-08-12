"use client";

import Link from "next/link";
import { ArrowRight, Gauge, Search, Sparkles, WandSparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/language-context";

export function MobileHomeHero() {
  const { t } = useLanguage();
  const valueWords = t('home.kicker').split('•').map((part) => part.trim());
  return (
    <section className="relative px-4 pb-3 pt-[78px] md:hidden">
      <div className="ajn-mobile-hero relative overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_18px_44px_rgba(37,62,113,.07)]">
        <div className="relative z-10">
          <div className="flex flex-wrap gap-1.5 text-[9px] font-black text-slate-700">
            <span className="ajn-mobile-value-chip"><Sparkles className="h-3 w-3 text-violet-600" /> {valueWords[0]}</span>
            <span className="ajn-mobile-value-chip"><Zap className="h-3 w-3 text-blue-600" /> {valueWords[1]}</span>
            <span className="ajn-mobile-value-chip"><Gauge className="h-3 w-3 text-emerald-600" /> {valueWords[2]}</span>
          </div>
          <h1 className="mt-4 text-[2.05rem] font-black leading-[.99] tracking-[-.052em] text-slate-950">
            {t('home.title1')} <span className="text-violet-600">{t('home.title2')}</span>
          </h1>
          <p className="mt-3 max-w-sm text-[12.5px] font-semibold leading-5 text-slate-600">{t('home.subtitle')}</p>
          <div className="mt-5 grid grid-cols-2 gap-2.5">
            <Button asChild className="ajn-primary-action h-11 rounded-xl text-[11px] font-black">
              <Link href="/pdf-tools">{t('home.explore100')} <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="ajn-secondary-action h-11 rounded-xl text-[11px] font-black">
              <Link href="/conversion-tools"><WandSparkles className="h-4 w-4" /> {t('filters.conversion')}</Link>
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/75 px-3 py-2 text-[10px] font-bold text-slate-500">
            <Search className="h-3.5 w-3.5 text-blue-600" /> {t('home.mobileSearchHint')}
          </div>
        </div>
      </div>
    </section>
  );
}
