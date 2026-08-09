"use client";

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Search, Server, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { getPublicToolCategory } from '../../lib/tools-data';
import { BUILD_PUBLIC_TOOLS } from '../../lib/build-public-tools';
import { getToolPolicy } from '../../lib/tool-policy';
import { Badge } from '../ui/badge';
import { useLanguage } from '@/lib/i18n/language-context';

interface ServicesGridProps { query: string; category: string; }

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return <>{parts.map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? <mark key={index} className="rounded bg-blue-50 px-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">{part}</mark> : <span key={index}>{part}</span>)}</>;
}

function ToolCard({ tool, query }: { tool: (typeof BUILD_PUBLIC_TOOLS)[number]; query: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { tool: localizeTool, t } = useLanguage();
  const policy = getToolPolicy(tool.id);
  const localized = localizeTool(tool.id, tool.name, tool.desc, tool.keywords);
  const category = getPublicToolCategory(tool);
  const iconClass = category === 'pdf' ? 'ajn-tool-icon-pdf' : category === 'conversion' ? 'ajn-tool-icon-conversion' : 'ajn-tool-icon-image';

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    ref.current.style.setProperty('--ajn-card-x', `${x}%`);
    ref.current.style.setProperty('--ajn-card-y', `${y}%`);
  };
  const mode = policy.processingMode === 'browser' ? t('processing.browser') : t('processing.server');
  const ModeIcon = policy.processingMode === 'browser' ? ShieldCheck : Server;

  return (
    <Link href={`/tools/${tool.id}`} className="group block h-full" aria-label={`${localized.name}`} data-analytics-id={`tool-card-${tool.id}`} data-analytics-category={category}>
      <div ref={ref} onPointerMove={onPointerMove} className="ajn-tool-card min-h-[142px] sm:min-h-[168px]">
        <div className="relative z-10 flex h-full flex-col p-3.5 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-[14px] sm:h-12 sm:w-12 ${iconClass}`}><tool.icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" /></div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {tool.badge && <Badge className="border-0 bg-blue-600 px-2 py-1 text-[9px] font-black text-white">{tool.badge}</Badge>}
              {policy.maturity === 'limited' && <Badge variant="outline" className="border-amber-200 bg-amber-50 text-[9px] font-black text-amber-700 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">LIMITED</Badge>}
            </div>
          </div>
          <div className="mt-3 flex-1 sm:mt-4">
            <h3 className="line-clamp-2 text-[14px] font-black leading-[1.25] tracking-tight text-slate-950 dark:text-slate-50 sm:text-[15px]"><Highlight text={localized.name} highlight={query} /></h3>
            <p className="mt-2 line-clamp-3 text-[12px] font-medium leading-[1.18rem] text-slate-500 dark:text-slate-400"><Highlight text={localized.desc} highlight={query} /></p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
            <div className="hidden min-w-0 items-center gap-1.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 sm:flex"><ModeIcon className={`h-3.5 w-3.5 shrink-0 ${policy.processingMode === 'browser' ? 'text-emerald-600' : 'text-blue-600'}`} /><span className="truncate">{mode}</span></div>
            <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-slate-600" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServicesGrid({ query, category }: ServicesGridProps) {
  const { language, tool: localizeTool, t } = useLanguage();
  const filteredTools = useMemo(() => {
    const normalized = query.toLocaleLowerCase(language).trim();
    return BUILD_PUBLIC_TOOLS.filter((tool) => {
      const localized = localizeTool(tool.id, tool.name, tool.desc, tool.keywords);
      const haystack = [localized.name, localized.desc, ...localized.aliases, ...tool.keywords].join(' ').toLocaleLowerCase(language);
      const matchesSearch = !normalized || haystack.includes(normalized);
      const matchesCategory = category === 'all' || getPublicToolCategory(tool) === category;
      return matchesSearch && matchesCategory;
    });
  }, [query, category, language, localizeTool]);

  return (
    <div className="space-y-5 md:space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool) => (
            <motion.div key={tool.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: .98 }} transition={{ duration: .18 }}>
              <ToolCard tool={tool} query={query} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {filteredTools.length === 0 && <div className="ajn-glass-card rounded-3xl py-14 text-center"><Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" /><p className="mt-4 text-base font-black text-slate-800 dark:text-slate-100">{t('home.noMatch')}</p><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t('home.tryShorter')}</p></div>}
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-xs font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200 sm:flex-row sm:items-center"><TriangleAlert className="h-4 w-4 shrink-0" />{t('home.limitNote')}</div>
    </div>
  );
}
