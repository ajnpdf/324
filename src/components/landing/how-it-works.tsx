"use client";
import { motion } from 'framer-motion';
import { Download, FileCheck2, Settings2, Share2, UploadCloud } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/language-context';

export function HowItWorks(){
  const { t } = useLanguage();
  const steps = [
    { icon: UploadCloud, number: '01', title: t('home.howStep1Title'), text: t('home.howStep1Desc'), tone: 'violet' },
    { icon: Settings2, number: '02', title: t('home.howStep2Title'), text: t('home.howStep2Desc'), tone: 'blue' },
    { icon: FileCheck2, number: '03', title: t('home.howStep3Title'), text: t('home.howStep3Desc'), tone: 'green' },
    { icon: Download, number: '04', title: t('home.howStep4Title'), text: t('home.howStep4Desc'), tone: 'blue' }];
  return <section className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28"><div className="max-w-3xl"><span className="ajn-section-kicker">{t('home.howKicker')}</span><h2 className="mt-5 text-4xl font-black tracking-[-.04em] text-slate-950 md:text-6xl">{t('home.howTitle')}</h2><p className="mt-5 text-base leading-7 text-slate-600">{t('home.howDesc')}</p></div><div className="relative mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{steps.map(({icon:Icon,number,title,text,tone},index)=><motion.article key={number} initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:index*.05}} className="ajn-glass-card relative rounded-2xl p-6"><div className={`ajn-white-icon-tile flex h-11 w-11 items-center justify-center rounded-xl ${tone==='violet'?'text-violet-600':tone==='green'?'text-emerald-600':'text-blue-600'}`}><Icon className="h-5 w-5"/></div><p className="mt-6 text-[10px] font-black tracking-[.18em] text-slate-400">{t('landing.step')} {number}</p><h3 className="mt-2 text-lg font-black text-slate-950">{title}</h3><p className="mt-3 text-sm font-medium leading-6 text-slate-500">{text}</p>{index===3&&<div className="mt-4 flex gap-2 text-[10px] font-black text-blue-600"><Share2 className="h-3.5 w-3.5"/>{t('home.howShare')}</div>}</motion.article>)}</div></section>;
}
