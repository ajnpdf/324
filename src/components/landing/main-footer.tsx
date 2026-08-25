'use client';

import Link from 'next/link';
import { ArrowRight, Cookie, Mail, ShieldCheck } from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { AJN_BRAND } from '@/lib/brand';
import { useLanguage } from '@/lib/i18n/language-context';
import { toolPath } from '@/lib/tool-routes';

const commonToolIds = ['merge-pdf', 'split-pdf', 'compress-pdf', 'protect-pdf', 'unlock-pdf', 'repair-pdf'] as const;

const productLinks = [
  ['PDF Tools', '/pdf-tools'],
  ['AJN Sign', '/sign'],
  ['AJN API', '/developers'],
  ['AJN Desktop', '/desktop'],
  ['AJN Mobile', '/mobile'],
  ['AJN IMG', '/img'],
  ['Pricing', '/pricing'],
  ['Account', '/account'],
  ['About', '/about'],
  ['Contact', '/contact'],
] as const;

const legalLinks = [
  ['Privacy Policy', '/privacy'],
  ['Terms', '/terms'],
  ['Cookie Policy', '/cookies'],
  ['File Processing Policy', '/file-processing-policy'],
  ['Acceptable Use', '/acceptable-use'],
  ['Data Deletion', '/data-deletion'],
  ['Unlock Authorization', '/unlock-authorization-policy'],
  ['Copyright', '/copyright'],
  ['DMCA', '/dmca'],
] as const;

const commonFallback: Record<string, [string, string]> = {
  'merge-pdf': ['Merge PDF', 'Combine PDF files in the order you choose.'],
  'split-pdf': ['Split PDF', 'Separate a PDF into the pages you need.'],
  'compress-pdf': ['Compress PDF', 'Make a PDF smaller.'],
  'protect-pdf': ['Protect PDF', 'Add a password to your PDF.'],
  'unlock-pdf': ['Unlock PDF', 'Remove a password when you have permission.'],
  'repair-pdf': ['Repair PDF', 'Try to fix a damaged PDF.'],
};

export function MainFooter() {
  const { t, tool } = useLanguage();
  const openPrivacyChoices = () => window.dispatchEvent(new Event('ajn-open-cookie-consent'));
  const trustItems = [
    'Clear tool-specific limits',
    'Core tools work without an account',
    'Temporary-server workflows are disclosed',
    'Downloads stay under your control',
  ];

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-slate-800 bg-slate-950 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-10 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_.8fr_.8fr_.9fr]">
          <div>
            <LogoAnimation className="h-11 w-[176px]" />
            <p className="mt-5 max-w-sm text-sm font-medium leading-7 text-slate-300">
              Focused online PDF tools for merging, compressing, organizing, editing, signing and protecting documents, connected to the wider AJN product family.
            </p>
            <a
              href={`mailto:${AJN_BRAND.contactEmail}`}
              aria-label={t('common.contact')}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-black text-slate-200 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
            >
              <Mail className="h-4 w-4" />
              Contact AJN
            </a>
          </div>

          <div>
            <h3 className="text-xs font-black tracking-[.12em] text-blue-300">PDF TOOLS</h3>
            <nav className="mt-5 space-y-3">
              {commonToolIds.map((id) => {
                const [name, desc] = commonFallback[id];
                const localized = tool(id, name, desc, []);
                return (
                  <Link key={id} href={toolPath(id)} className="flex items-center gap-2 text-xs font-bold text-slate-300 transition hover:text-white">
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                    {localized.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-black tracking-[.12em] text-emerald-300">AJN PRODUCTS</h3>
            <nav className="mt-5 space-y-3">
              {productLinks.map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs font-bold text-slate-300 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-xs font-black tracking-[.12em] text-red-300">LEGAL & TRUST</h3>
            <nav className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {legalLinks.map(([label, href]) => (
                <Link key={href} href={href} className="block text-xs font-bold text-slate-300 transition hover:text-white">
                  {label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={openPrivacyChoices}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black text-white transition hover:bg-white/10"
            >
              <Cookie className="h-4 w-4" />
              {t('cookie.privacy')}
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-3 border-y border-white/10 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="flex items-start gap-2 rounded-lg bg-white/[.025] px-2 py-2 text-[11px] font-semibold leading-5 text-slate-300">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              {item}
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 text-[11px] font-semibold text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.developed')}</p>
        </div>
      </div>
    </footer>
  );
}
