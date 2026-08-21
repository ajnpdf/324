'use client';

import Link from 'next/link';
import { ArrowRight, Cookie, Mail, ShieldCheck } from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { AJN_BRAND } from '@/lib/brand';
import { useLanguage } from '@/lib/i18n/language-context';
import { toolPath } from '@/lib/tool-routes';

const commonToolIds = ['merge-pdf','split-pdf','compress-pdf','protect-pdf','unlock-pdf','repair-pdf'] as const;
const productLinks = [
  ['footer.allTools','/pdf-tools'],['footer.imageTools','/image-tools'],['footer.pdfUtilities','/pdf-utilities'],['common.chromeExtension','/chrome-extension'],
  ['footer.developer','/developer'],['footer.studio','/ajn-studio'],['footer.contact','/contact']] as const;
const legalLinks = [
  ['footer.privacyPolicy','/privacy'],['footer.terms','/terms'],['footer.cookiePolicy','/cookies'],['footer.filePolicy','/file-processing-policy'],
  ['footer.acceptableUse','/acceptable-use'],['footer.dataDeletion','/data-deletion'],['footer.unlockPolicy','/unlock-authorization-policy'],['footer.imageLicensing','/image-licensing'],['footer.dmca','/dmca']] as const;
const commonFallback: Record<string,[string,string]> = {
  'merge-pdf':['Merge PDF','Combine PDF files in the order you choose.'], 'split-pdf':['Split PDF','Separate a PDF into the pages you need.'],
  'compress-pdf':['Compress PDF','Make a PDF smaller.'], 'protect-pdf':['Protect PDF','Add a password to your PDF.'],
  'unlock-pdf':['Unlock PDF','Remove a password when you have permission.'], 'repair-pdf':['Repair PDF','Try to fix a damaged PDF.'],
};

export function MainFooter() {
  const { t, tool } = useLanguage();
  const openPrivacyChoices = () => window.dispatchEvent(new Event('ajn-open-cookie-consent'));
  const socialLinks = [{ icon: Mail, href: `mailto:${AJN_BRAND.contactEmail}`, label: t('common.contact') }];
  const trustItems = [t('footer.trustTools'),t('footer.trustLimits'),t('footer.trustNoAccount'),t('footer.trustDownloads')];
  return <footer className="relative mt-20 overflow-hidden border-t border-slate-800 bg-slate-950 text-white">
    <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_.9fr]">
        <div><LogoAnimation className="h-11 w-[176px]" /><p className="mt-5 max-w-sm text-sm font-medium leading-7 text-slate-300">Focused PDF and image tools with clear processing, practical controls and direct result actions.</p><div className="mt-6 flex gap-2">{socialLinks.map(({icon:Icon,href,label})=><a key={href} href={href} aria-label={label} className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-500/15 hover:text-white"><Icon className="h-4 w-4"/></a>)}</div></div>
        <div><h3 className="text-xs font-black tracking-[.12em] text-violet-300">{t('footer.commonTools')}</h3><nav className="mt-5 space-y-3">{commonToolIds.map(id=>{const [name,desc]=commonFallback[id];const localized=tool(id,name,desc,[]);return <Link key={id} href={toolPath(id)} className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white"><ArrowRight className="h-3 w-3 text-violet-400"/>{localized.name}</Link>})}</nav></div>
        <div><h3 className="text-xs font-black tracking-[.12em] text-emerald-300">{t('footer.product')}</h3><nav className="mt-5 space-y-3">{productLinks.map(([key,href])=><Link key={href} href={href} className="block text-xs font-bold text-slate-300 hover:text-white">{t(key)}</Link>)}</nav></div>
        <div><h3 className="text-xs font-black tracking-[.12em] text-red-300">{t('footer.legal')}</h3><nav className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">{legalLinks.map(([key,href])=><Link key={href} href={href} className="block text-xs font-bold text-slate-300 hover:text-white">{t(key)}</Link>)}</nav><button type="button" onClick={openPrivacyChoices} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white hover:bg-white/10"><Cookie className="h-4 w-4"/>{t('cookie.privacy')}</button></div>
      </div>
      <div className="mt-12 grid gap-3 border-y border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-4">{trustItems.map((item,i)=><div key={i} className="flex items-start gap-2 text-[11px] font-semibold leading-5 text-slate-300"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400"/>{item}</div>)}</div>
      <div className="mt-8 flex flex-col gap-3 text-[11px] font-semibold text-slate-300 sm:flex-row sm:items-center sm:justify-between"><p>{t('footer.copyright')}</p><p>{t('footer.developed')}</p></div>
    </div>
  </footer>;
}
