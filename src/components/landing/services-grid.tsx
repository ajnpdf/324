"use client";

import Link from 'next/link';
import { ChevronRight, Grid2X2, Grid3X3, Rows3, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getPublicToolCategory } from '../../lib/tools-data';
import { BUILD_PUBLIC_TOOLS } from '../../lib/build-public-tools';
import { useLanguage } from '@/lib/i18n/language-context';
import { ToolArtwork } from '@/components/ajn/tool-artwork';
import { cn } from '@/lib/utils';

interface ServicesGridProps { query: string; category: string; }
type ViewMode = 'list' | 'comfortable' | 'compact';

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <>{text}</>;
  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return <>{parts.map((part, index) => part.toLowerCase() === highlight.toLowerCase() ? <mark key={index} className="rounded-sm bg-blue-50 px-0.5 text-blue-700">{part}</mark> : <span key={index}>{part}</span>)}</>;
}

function ToolCard({ tool, query, priority = false, view }: { tool: (typeof BUILD_PUBLIC_TOOLS)[number]; query: string; priority?: boolean; view: ViewMode }) {
  const { tool: localizeTool } = useLanguage();
  const localized = localizeTool(tool.id, tool.name, tool.desc, tool.keywords);
  const category = getPublicToolCategory(tool);

  return (
    <Link
      href={`/tools/${tool.id}`}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={localized.name}
      data-analytics-id={`tool-card-${tool.id}`}
      data-analytics-category={category}
    >
      <article className={cn('ajn-tool-card ajn-horizontal-tool-card h-full', view === 'compact' && 'ajn-tool-card-compact', view === 'list' && 'ajn-tool-card-list')}>
        <div className="relative z-10 flex min-h-[76px] items-center gap-3 px-3 py-2.5 sm:min-h-[80px] sm:px-3.5 sm:py-3">
          <ToolArtwork
            toolId={tool.id}
            toolName={localized.name}
            priority={priority}
            className="h-11 w-11 sm:h-12 sm:w-12"
          />

          <div className="min-w-0 flex flex-1 flex-col justify-center">
            <h3 className="min-w-0 truncate text-[14px] font-extrabold leading-5 tracking-[-.01em] text-slate-950 sm:text-[14.5px]">
              <Highlight text={localized.name} highlight={query} />
            </h3>
            <p className={cn('mt-0.5 text-[11px] font-medium leading-4 text-slate-500 sm:text-[11.5px]', view === 'list' ? 'line-clamp-2' : 'line-clamp-1')}>
              <Highlight text={localized.desc} highlight={query} />
            </p>
          </div>

          <span className="ajn-card-arrow flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" aria-hidden="true">
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </article>
    </Link>
  );
}

export function ServicesGrid({ query, category }: ServicesGridProps) {
  const { language, tool: localizeTool, t } = useLanguage();
  const [view, setView] = useState<ViewMode>('compact');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ajn-tool-view');
      if (saved === 'list' || saved === 'comfortable' || saved === 'compact') setView(saved);
    } catch { /* storage can be unavailable */ }
  }, []);

  const chooseView = (next: ViewMode) => {
    setView(next);
    try { localStorage.setItem('ajn-tool-view', next); } catch { /* storage can be unavailable */ }
  };

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

  const gridClass = view === 'list'
    ? 'grid-cols-1 max-w-5xl mx-auto'
    : view === 'comfortable'
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  const viewOptions: { id: ViewMode; label: string; icon: typeof Rows3 }[] = [
    { id: 'comfortable', label: '2 columns', icon: Grid2X2 },
    { id: 'compact', label: '4 columns', icon: Grid3X3 },
    { id: 'list', label: 'List', icon: Rows3 },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="hidden items-center justify-between gap-4 md:flex">
        <p className="text-[11px] font-bold text-slate-500"><span className="font-black text-slate-900">{filteredTools.length}</span> tools shown</p>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm" role="group" aria-label="Choose tool layout">
          {viewOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => chooseView(id)}
              aria-pressed={view === id}
              title={label}
              className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500', view === id ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900')}
            >
              <Icon className="h-3.5 w-3.5" /> <span className="hidden xl:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={cn('grid gap-2.5 sm:gap-3', gridClass)}>
        {filteredTools.map((tool, index) => (
          <ToolCard key={tool.id} tool={tool} query={query} priority={index < 8} view={view} />
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="ajn-glass-card rounded-2xl py-12 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-4 text-base font-black text-slate-800">{t('home.noMatch')}</p>
          <p className="mt-2 text-sm text-slate-500">{t('home.tryShorter')}</p>
        </div>
      )}

    </div>
  );
}
