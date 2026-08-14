"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Grip, Search, Sparkles, X } from 'lucide-react';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import type { ServiceTool } from '@/lib/tools-data';
import { toolPath } from '@/lib/tool-routes';
import { ToolArtwork } from '@/components/ajn/tool-artwork';
import { useLanguage } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';
import { scoreToolSearch } from '@/lib/tool-search';

const POPULAR_IDS = [
  'merge-pdf', 'compress-pdf', 'pdf-to-word', 'word-to-pdf', 'jpg-to-pdf',
  'pdf-to-jpg', 'split-pdf', 'scanned-pdf-to-text', 'image-to-pdf', 'protect-pdf',
];

const GROUP_ORDER = [
  'Popular', 'Organize PDF', 'Compress & Optimize', 'Convert from PDF', 'Convert to PDF',
  'OCR & Scan', 'Image Tools', 'Edit & Sign', 'Security', 'Documents', 'More Tools',
] as const;

type GroupName = (typeof GROUP_ORDER)[number];

function groupFor(tool: ServiceTool): GroupName {
  const id = tool.id;
  if (POPULAR_IDS.includes(id)) return 'Popular';
  if (id === 'compress-pdf' || id === 'repair-pdf' || id.includes('reducer') || id.includes('resizer')) return 'Compress & Optimize';
  if (id.startsWith('pdf-to-') || id === 'pdf-text' || id === 'extract-images' || id === 'pdf-zip-extract') return 'Convert from PDF';
  if (id.endsWith('-to-pdf') || ['image-to-pdf', 'jpg-to-pdf', 'jpeg-to-pdf', 'png-to-pdf'].includes(id)) return 'Convert to PDF';
  if (/(ocr|scan|searchable|handwriting|receipt)/.test(id)) return 'OCR & Scan';
  if (tool.cat === 'img' || /(image|photo|jpg|jpeg|png|webp|tiff|bmp|gif|svg|heic|avif)/.test(id)) return 'Image Tools';
  if (/(merge|split|organize|delete-pdf-pages|page-number|flatten|rotate-pdf|crop-pdf)/.test(id)) return 'Organize PDF';
  if (/(sign|watermark|add-text|add-image|metadata|compare)/.test(id)) return 'Edit & Sign';
  if (/(protect|unlock)/.test(id)) return 'Security';
  if (/(word|docx|doc-|excel|xlsx|xls-|powerpoint|pptx|ppt-|odt|ods|odp|rtf|txt|html|markdown|xml|json|csv|epub|mobi|azw3|eml|msg|xps)/.test(id)) return 'Documents';
  return 'More Tools';
}

export function AllToolsMenu({ className, iconOnly = false }: { className?: string; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const { t, tool: localizeTool } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((element) => element.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [open]);

  const localizedTools = useMemo(() => BUILD_PUBLIC_TOOLS.map((item) => {
    const localized = localizeTool(item.id, item.name, item.desc, item.keywords);
    return { item, localized };
  }), [localizeTool]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return localizedTools;
    return localizedTools.map((entry) => ({ ...entry, score: scoreToolSearch(q, entry.item, entry.localized) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }, [localizedTools, query]);

  const groups = useMemo(() => {
    const map = new Map<GroupName, typeof filtered>();
    for (const name of GROUP_ORDER) map.set(name, []);
    for (const entry of filtered) {
      const group = groupFor(entry.item);
      map.get(group)?.push(entry);
    }
    return GROUP_ORDER.map((name) => ({ name, items: map.get(name) || [] })).filter((group) => group.items.length > 0);
  }, [filtered]);

  const openTool = () => {
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('common.openAllTools')}
        data-analytics-id="nav-all-tools"
        onClick={() => setOpen(true)}
        className={cn('inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[11px] font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700', iconOnly && 'h-10 w-10 px-0', className)}
      >
        <Grip className="h-[18px] w-[18px]" />
        {!iconOnly && <span>{t('common.allTools')}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[250] bg-slate-950/25 px-0 pt-0 backdrop-blur-[3px] sm:px-4 sm:pt-[76px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-label={t('common.openAllTools')}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.99 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.99 }}
              className="mx-auto flex h-[100dvh] w-full max-w-7xl flex-col overflow-hidden bg-white shadow-[0_30px_100px_rgba(15,23,42,.24)] sm:h-[min(78vh,760px)] sm:rounded-[1.4rem] sm:border sm:border-slate-200"
            >
              <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:flex"><Grip className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2"><h2 className="text-lg font-black tracking-[-.025em] text-slate-950 sm:text-xl">All AJN PDF Tools</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-600">{BUILD_PUBLIC_TOOLS.length}</span></div>
                    <p className="mt-0.5 hidden text-xs font-semibold text-slate-500 sm:block">Search and open any workflow without leaving the page first.</p>
                  </div>
                  <button type="button" aria-label={t('nav.closeMenu')} onClick={() => setOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"><X className="h-5 w-5" /></button>
                </div>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                  <input autoFocus aria-label="Search all AJN PDF tools" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search: merge, make PDF smaller, image to text, Word..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
                {filtered.length === 0 ? (
                  <div className="mx-auto max-w-md py-16 text-center"><Search className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-4 text-base font-black text-slate-800">No matching tool</p><p className="mt-2 text-sm font-medium text-slate-500">Try a task like “combine PDF”, “scan text” or “Word to PDF”.</p></div>
                ) : (
                  <div className="space-y-8">
                    {groups.map((group) => (
                      <section key={group.name}>
                        <div className="mb-3 flex items-center justify-between gap-4"><h3 className="text-[11px] font-black uppercase tracking-[.14em] text-slate-500">{group.name}</h3><span className="text-[10px] font-bold text-slate-400">{group.items.length}</span></div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                          {group.items.map(({ item, localized }) => (
                            <Link
                              key={item.id}
                              href={toolPath(item.id)}
                              prefetch={false}
                              onPointerEnter={() => router.prefetch(toolPath(item.id))}
                              onFocus={() => router.prefetch(toolPath(item.id))}
                              onClick={openTool}
                              className="group flex min-h-[68px] items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-2.5 transition hover:-translate-y-px hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                            >
                              <ToolArtwork toolId={item.id} toolName={localized.name} className="h-10 w-10 shrink-0" />
                              <div className="min-w-0 flex-1"><p className="truncate text-[12px] font-black text-slate-900 group-hover:text-blue-800">{localized.name}</p><p className="mt-0.5 line-clamp-1 text-[10.5px] font-medium text-slate-500">{localized.desc}</p></div>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/80 px-4 py-3 sm:px-6">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-500"><Sparkles className="h-3.5 w-3.5 text-blue-600" /> Direct root URLs for faster tool navigation</span>
                <Link href="/pdf-tools" onClick={() => setOpen(false)} className="text-[11px] font-black text-blue-700 hover:text-blue-900">Browse directory →</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
