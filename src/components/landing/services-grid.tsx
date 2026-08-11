"use client";

import Link from 'next/link';
import { ArrowRight, Search, Server, ShieldCheck, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
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
  return <>{parts.map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? <mark key={index} className="rounded-sm bg-blue-50 px-0.5 text-blue-700">{part}</mark> : <span key={index}>{part}</span>)}</>;
}

function ToolCard({ tool, query, priority = false }: { tool: (typeof BUILD_PUBLIC_TOOLS)[number]; query: string; priority?: boolean }) {
  const { tool: localizeTool, t } = useLanguage();
  const policy = getToolPolicy(tool.id);
  const localized = localizeTool(tool.id, tool.name, tool.desc, tool.keywords);
  const category = getPublicToolCategory(tool);
  const mode = policy.processingMode === 'browser' ? t('processing.browser') : t('processing.server');
  const ModeIcon = policy.processingMode === 'browser' ? ShieldCheck : Server;

  return (
    <Link
      href={`/tools/${tool.id}`}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={localized.name}
      data-analytics-id={`tool-card-${tool.id}`}
      data-analytics-category={category}
    >
      <article className="ajn-tool-card ajn-horizontal-tool-card h-full">
        <div className="relative z-10 flex min-h-[82px] items-center gap-3 px-3 py-2.5 sm:min-h-[88px] sm:px-3.5 sm:py-3">
          <ToolArtwork
            toolId={tool.id}
            toolName={localized.name}
            priority={priority}
            className="h-12 w-16 sm:h-[54px] sm:w-[72px]"
          />

          <div className="min-w-0 flex flex-1 flex-col justify-center">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="min-w-0 flex-1 truncate text-[14px] font-extrabold leading-5 tracking-[-.01em] text-slate-950 sm:text-[15px]">
                <Highlight text={localized.name} highlight={query} />
              </h3>
              <span className="ajn-card-brand-badge">AJN</span>
            </div>
            <p className="mt-1 line-clamp-1 text-[11px] font-medium leading-4 text-slate-500 sm:text-[11.5px]">
              <Highlight text={localized.desc} highlight={query} />
            </p>
            <div className="mt-1.5 flex min-w-0 items-center gap-1.5 text-[9.5px] font-bold text-slate-500">
              <ModeIcon className={`h-3 w-3 shrink-0 ${policy.processingMode === 'browser' ? 'text-emerald-600' : 'text-blue-600'}`} />
              <span className="truncate">{mode}</span>
            </div>
          </div>

          <span className="ajn-card-arrow flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
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
    <div className="space-y-5 md:space-y-7">
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredTools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} query={query} priority={index < 6} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="ajn-glass-card rounded-2xl py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-4 text-base font-black text-slate-800">{t('home.noMatch')}</p>
          <p className="mt-2 text-sm text-slate-500">{t('home.tryShorter')}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 text-xs font-semibold text-amber-900 sm:flex-row sm:items-center">
        <TriangleAlert className="h-4 w-4 shrink-0" />{t('home.limitNote')}
      </div>
    </div>
  );
}
