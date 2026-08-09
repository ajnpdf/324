'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeftRight, FileImage, FileText, Layers, Search, ShieldCheck, X } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';
import { FormatStrip } from '@/components/landing/format-strip';
import { ServicesGrid } from '@/components/landing/services-grid';
import { AdSenseUnit } from '@/components/adsense-unit';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { getPublicToolCategory, type PublicToolCategory } from '@/lib/tools-data';
import { ADSENSE_SLOTS } from '@/lib/ad-slots';
import { sendAjnAnalytics } from '@/components/analytics/site-analytics';

const categories: Array<{ id: 'all' | PublicToolCategory; label: string; icon: typeof Layers }> = [
  { id: 'all', label: 'All tools', icon: Layers }, { id: 'conversion', label: 'Conversion', icon: ArrowLeftRight },
  { id: 'image', label: 'Image', icon: FileImage }, { id: 'pdf', label: 'PDF', icon: FileText },
];

function queryBucket(value: string): string { const n=value.trim().length; return n===0?'empty':n<=3?'1-3':n<=8?'4-8':n<=20?'9-20':'21+'; }

function PDFToolsContent() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const initialCategory = params.get('category');
  const [search, setSearch] = useState(params.get('q') || '');
  const [activeCategory, setActiveCategory] = useState<'all' | PublicToolCategory>(initialCategory === 'conversion' || initialCategory === 'image' || initialCategory === 'pdf' ? initialCategory : 'all');

  useEffect(() => { setSearch(params.get('q') || ''); const value=params.get('category'); setActiveCategory(value==='conversion'||value==='image'||value==='pdf'?value:'all'); }, [params]);
  const counts = useMemo(() => BUILD_PUBLIC_TOOLS.reduce((acc, tool) => { acc.all += 1; acc[getPublicToolCategory(tool)] += 1; return acc; }, { all:0, conversion:0, image:0, pdf:0 }), []);
  const updateUrl = (nextSearch: string, nextCategory: 'all' | PublicToolCategory, replace=false) => { const next=new URLSearchParams(); if(nextSearch.trim()) next.set('q',nextSearch.trim()); if(nextCategory!=='all') next.set('category',nextCategory); const url=next.toString()?`${pathname}?${next}`:pathname; if(replace){router.replace(url,{scroll:false});}else{router.push(url,{scroll:false});} };
  const selectCategory = (id: 'all' | PublicToolCategory) => { setActiveCategory(id); updateUrl(search,id); sendAjnAnalytics({event_name:'category_filter',path:pathname,category:id}); };
  const changeSearch = (value:string) => { setSearch(value); window.clearTimeout((window as Window & {__ajnSearchTimer?:number}).__ajnSearchTimer); (window as Window & {__ajnSearchTimer?:number}).__ajnSearchTimer=window.setTimeout(()=>{updateUrl(value,activeCategory,true); if(value.trim()) sendAjnAnalytics({event_name:'search',path:pathname,query_length_bucket:queryBucket(value),category:activeCategory});},300); };

  return <div className="ajn-page-shell"><Navbar /><main className="relative z-10 pb-24 pt-28 md:pt-36"><section className="mx-auto w-full max-w-7xl px-4 md:px-6 xl:px-8">
    <div className="mx-auto max-w-4xl text-center"><span className="ajn-section-kicker">Public production directory</span><h1 className="mt-6 text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[.98] tracking-[-.05em] text-foreground">Conversion, image and PDF tools in one clear directory.</h1><p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-7 text-muted-foreground">Every listed tool explains its processing mode, input limits and known constraints. Tools unavailable in this deployment are excluded from the public directory and sitemap.</p></div>
    <div className="mx-auto mt-9 max-w-2xl"><label htmlFor="directory-search" className="sr-only">Search public tools</label><div className="ajn-glass-card relative rounded-2xl p-2"><Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600 dark:text-blue-300" /><Input id="directory-search" value={search} onChange={(event)=>changeSearch(event.target.value)} placeholder="Search merge, convert, image, OCR, protect…" className="h-14 rounded-xl border-0 bg-transparent pl-12 pr-12 text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-blue-500/25" />{search && <button type="button" onClick={()=>changeSearch('')} className="absolute right-5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Clear tool search"><X className="h-4 w-4" /></button>}</div></div>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:justify-center" aria-label="Tool categories">{categories.map(({id,label,icon:Icon})=><button type="button" key={id} onClick={()=>selectCategory(id)} aria-pressed={activeCategory===id} className={cn('flex min-h-11 shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-[11px] font-black transition focus-visible:ring-2 focus-visible:ring-blue-500',activeCategory===id?'border-blue-600 bg-blue-600 text-white shadow-lg':'border-border bg-card text-muted-foreground hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10')}><Icon className="h-4 w-4" />{label}<span className={cn('rounded-full px-2 py-0.5 text-[9px]',activeCategory===id?'bg-white/15':'bg-muted text-muted-foreground')}>{counts[id]}</span></button>)}</div>
    <div className="mt-12"><ServicesGrid query={search} category={activeCategory} /></div><div className="mt-12 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold leading-6 text-emerald-900 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />Browser workflows run in the current session. Temporary server-processing tools use files only for the requested action and follow the file-processing policy.</div>
  </section><div className="mt-20"><FormatStrip /></div><div className="ajn-ad-zone my-12"><AdSenseUnit slot={ADSENSE_SLOTS.homeSecondary} width={300} height={150} className="min-h-[150px]" label="Tool directory advertisement" /></div></main><MainFooter /></div>;
}


export default function PDFToolsPage() {
  return (
    <Suspense fallback={<div className="ajn-page-shell flex min-h-screen items-center justify-center px-4 text-center"><p className="text-sm font-bold text-muted-foreground">Preparing the tool directory…</p></div>}>
      <PDFToolsContent />
    </Suspense>
  );
}
