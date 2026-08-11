"use client";

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Search, Server, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useMemo, useRef } from 'react';
import { getPublicToolCategory } from '../../lib/tools-data';
import { BUILD_PUBLIC_TOOLS } from '../../lib/build-public-tools';
import { getToolPolicy } from '../../lib/tool-policy';
import { useLanguage } from '@/lib/i18n/language-context';
import { ToolArtwork } from '@/components/ajn/tool-artwork';

interface ServicesGridProps { query: string; category: string; }

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return <>{parts.map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? <mark key={index} className="rounded bg-blue-50 px-0.5 text-blue-700 dark:bg-orange-500/15 dark:text-orange-200">{part}</mark> : <span key={index}>{part}</span>)}</>;
}

function ToolCard({ tool, query, priority = false }: { tool: (typeof BUILD_PUBLIC_TOOLS)[number]; query: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { tool: localizeTool, t } = useLanguage();
  const policy = getToolPolicy(tool.id);
  const localized = localizeTool(tool.id, tool.name, tool.desc, tool.keywords);
  const category = getPublicToolCategory(tool);

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
    <Link
      href={`/tools/${tool.id}`}
      className="group block h-full"
      aria-label={localized.name}
      data-analytics-id={`tool-card-${tool.id}`}
      data-analytics-category={category}
    >
      <div ref={ref} onPointerMove={onPointerMove} className="ajn-tool-card ajn-horizontal-tool-card h-full">
        <div className="relative z-10 flex min-h-[106px] items-center gap-3 p-2.5 sm:min-h-[116px] sm:gap-3.5 sm:p-3">
          <ToolArtwork toolId={tool.id} toolName={localized.name} priority={priority} className="h-[78px] w-[104px] sm:h-[88px] sm:w-[118px]" />

          <div className="min-w-0 flex flex-1 flex-col self-stretch py-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="ajn-card-brand-badge">AJN</span>
              <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600 dark:text-zinc-600 dark:group-hover:text-orange-400" />
            </div>

            <h3 className="mt-1.5 line-clamp-1 text-[14px] font-black leading-5 tracking-[-.015em] text-slate-950 dark:text-zinc-50 sm:text-[15px]">
              <Highlight text={localized.name} highlight={query} />
            </h3>
            <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-[1.05rem] text-slate-500 dark:text-zinc-400 sm:text-[11.5px]">
              <Highlight text={localized.desc} highlight={query} />
            </p>

            <div className="mt-auto flex min-w-0 items-center gap-1.5 pt-1.5 text-[9.5px] font-bold text-slate-500 dark:text-zinc-500">
              <ModeIcon className={`h-3.5 w-3.5 shrink-0 ${policy.processingMode === 'browser' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-orange-400'}`} />
              <span className="truncate">{mode}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ServicesGrid({ query, category }: ServicesGridProps) {
  const { language, tool: localizeTool, t } = useLanguage();
  const reduceMotion = useReducedMotion();
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
    <div className="space-y-5 md:space-y-7">
      <div className="grid grid-cols-1 gap-3 sm:gap-3.5 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredTools.map((tool, index) => (
            <motion.div
              key={tool.id}
              layout
              initial={reduceMotion ? false : reduceMotionInitial(index)}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: .985 }}
              transition={{ duration: .18, delay: Math.min(index, 5) * .015 }}
            >
              <ToolCard tool={tool} query={query} priority={index < 6} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTools.length === 0 && (
        <div className="ajn-glass-card rounded-2xl py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-zinc-600" />
          <p className="mt-4 text-base font-black text-slate-800 dark:text-zinc-100">{t('home.noMatch')}</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">{t('home.tryShorter')}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-xs font-semibold text-amber-900 dark:border-orange-400/15 dark:bg-orange-400/5 dark:text-orange-100 sm:flex-row sm:items-center">
        <TriangleAlert className="h-4 w-4 shrink-0" />{t('home.limitNote')}
      </div>
    </div>
  );
}

function reduceMotionInitial(index: number) {
  return { opacity: 0, y: Math.min(8 + index, 14) };
}
