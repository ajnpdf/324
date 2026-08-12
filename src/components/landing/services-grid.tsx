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
type ViewMode = 'horizontal' | 'comfortable' | 'compact';

const INITIAL_VISIBLE_TOOLS = 18;
const VISIBLE_STEP = 18;

const INTENT_IDS: Record<string, string[]> = {
  ocr: ['ocr','scan','searchable','handwriting','image-to-text','image-to-word','scanned-pdf'],
  edit: ['add-text','add-image','watermark','crop','rotate','page-number','flatten','sign','metadata','compare','remove-pages'],
  organize: ['merge-pdf','split-pdf','organize-pdf','remove-pages','extract-images','pdf-to-zip','pdf-pages-to-zip'],
  security: ['protect-pdf','unlock-pdf','repair-pdf'],
};
const SEARCH_EXPANSIONS: Record<string,string[]> = {
  reduce:['compress','smaller','optimize'], smaller:['compress','reduce'], photo:['image','jpg','jpeg'], picture:['image','jpg','png'],
  scan:['ocr','scanner','searchable'], text:['ocr','txt','read'], word:['doc','docx'], slides:['ppt','pptx','powerpoint'], sheet:['xls','xlsx','excel'],
  secure:['protect','lock'], password:['protect','unlock'], combine:['merge'], separate:['split'], reorder:['organize'], remove:['delete'],
};

function normalize(value:string){return value.toLocaleLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu,' ').trim();}
function distanceAtMostTwo(a:string,b:string){
  if(Math.abs(a.length-b.length)>2)return 3;
  const row=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){let prev=row[0];row[0]=i;let min=row[0];for(let j=1;j<=b.length;j++){const old=row[j];row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));prev=old;min=Math.min(min,row[j]);}if(min>2)return 3;}
  return row[b.length];
}
function searchScore(query:string, haystack:string, name:string){
  if(!query)return 1;
  const q=normalize(query), h=normalize(haystack), n=normalize(name); if(!q)return 1;
  let score=0; if(n===q)score+=160; else if(n.startsWith(q))score+=110; else if(n.includes(q))score+=80; if(h.includes(q))score+=55;
  const raw=q.split(' ').filter(Boolean); const tokens=[...new Set(raw.flatMap(t=>[t,...(SEARCH_EXPANSIONS[t]||[])]))]; const words=h.split(' ');
  for(const token of tokens){if(words.includes(token))score+=24;else if(words.some(w=>w.startsWith(token)||token.startsWith(w)))score+=12;else if(token.length>=4&&words.some(w=>w.length>=4&&distanceAtMostTwo(token,w)<=1))score+=7;}
  if(raw.every(t=>h.includes(t)))score+=35; return score;
}
function matchesCategory(tool:(typeof BUILD_PUBLIC_TOOLS)[number],category:string){
  if(category==='all')return true; if(category==='pdf'||category==='image'||category==='conversion')return getPublicToolCategory(tool)===category;
  return (INTENT_IDS[category]||[]).some(token=>tool.id.includes(token));
}

function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const q=highlight.trim(); if(!q||q.includes(' '))return <>{text}</>;
  const escaped=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const parts=text.split(new RegExp(`(${escaped})`,'gi'));
  return <>{parts.map((part,index)=>part.toLowerCase()===q.toLowerCase()?<mark key={index} className="rounded-sm bg-blue-50 px-0.5 text-blue-800">{part}</mark>:<span key={index}>{part}</span>)}</>;
}

function ToolCard({ tool, query, priority=false, view }:{tool:(typeof BUILD_PUBLIC_TOOLS)[number];query:string;priority?:boolean;view:ViewMode}){
  const {tool:localizeTool}=useLanguage(); const localized=localizeTool(tool.id,tool.name,tool.desc,tool.keywords); const category=getPublicToolCategory(tool);
  return <Link href={`/tools/${tool.id}`} className="ajn-progressive-tool-card group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" aria-label={localized.name} data-analytics-id={`tool-card-${tool.id}`} data-analytics-category={category}>
    <article className={cn('ajn-tool-card ajn-horizontal-tool-card h-full',view==='compact'&&'ajn-tool-card-compact',view==='horizontal'&&'ajn-tool-card-list')}>
      <div className="relative z-10 flex min-h-[78px] items-center gap-3 px-3 py-2.5 sm:min-h-[82px] sm:px-3.5 sm:py-3"><ToolArtwork toolId={tool.id} toolName={localized.name} priority={priority} className="h-11 w-11 sm:h-12 sm:w-12"/><div className="min-w-0 flex flex-1 flex-col justify-center"><h3 className="min-w-0 truncate text-[14px] font-extrabold leading-5 tracking-[-.01em] text-slate-950 sm:text-[14.5px]"><Highlight text={localized.name} highlight={query}/></h3><p className={cn('mt-0.5 text-[11px] font-medium leading-4 text-slate-600 sm:text-[11.5px]',view==='horizontal'?'line-clamp-2':'line-clamp-1')}><Highlight text={localized.desc} highlight={query}/></p></div><ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-slate-600"/></div>
    </article></Link>;
}

export function ServicesGrid({query,category}:ServicesGridProps){
  const {language,tool:localizeTool,t}=useLanguage();
  const [view,setView]=useState<ViewMode>('comfortable');
  const [visibleCount,setVisibleCount]=useState(INITIAL_VISIBLE_TOOLS);

  useEffect(()=>{try{const saved=localStorage.getItem('ajn-tool-view');if(saved==='list')setView('horizontal');else if(saved==='horizontal'||saved==='comfortable'||saved==='compact')setView(saved);}catch{}},[]);
  useEffect(()=>{setVisibleCount(INITIAL_VISIBLE_TOOLS);},[query,category]);

  const chooseView=(next:ViewMode)=>{setView(next);try{localStorage.setItem('ajn-tool-view',next);}catch{}};
  const filteredTools=useMemo(()=>{
    const normalized=query.toLocaleLowerCase(language).trim();
    return BUILD_PUBLIC_TOOLS.map((tool,index)=>{const localized=localizeTool(tool.id,tool.name,tool.desc,tool.keywords);const haystack=[localized.name,localized.desc,...localized.aliases,...tool.keywords,tool.id].join(' ');return{tool,index,score:searchScore(normalized,haystack,localized.name)};}).filter(x=>matchesCategory(x.tool,category)&&(!normalized||x.score>0)).sort((a,b)=>normalized?(b.score-a.score||a.index-b.index):a.index-b.index).map(x=>x.tool);
  },[query,category,language,localizeTool]);

  const visibleTools=filteredTools.slice(0,visibleCount);
  const hasMore=visibleTools.length<filteredTools.length;
  const gridClass=view==='horizontal'?'grid-cols-1 max-w-6xl mx-auto':view==='comfortable'?'grid-cols-1 md:grid-cols-2':'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  const viewOptions:{id:ViewMode;label:string;icon:typeof Rows3}[]=[{id:'comfortable',label:t('home.layoutComfortable'),icon:Grid2X2},{id:'compact',label:t('home.layoutCompact'),icon:Grid3X3},{id:'horizontal',label:t('home.layoutList'),icon:Rows3}];

  return <div className="space-y-4 md:space-y-6">
    <div className="flex items-center justify-between gap-4">
      <p className="text-[11px] font-bold text-slate-600">{t('home.showingTools',{shown:visibleTools.length,count:filteredTools.length})}</p>
      <div className="hidden items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm md:flex" role="group" aria-label={t('home.layoutAria')}>{viewOptions.map(({id,label,icon:Icon})=><button key={id} type="button" onClick={()=>chooseView(id)} aria-pressed={view===id} title={label} className={cn('inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-black transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500',view===id?'bg-slate-950 text-white shadow-sm':'text-slate-600 hover:bg-slate-50 hover:text-slate-950')}><Icon className="h-3.5 w-3.5"/><span>{label}</span></button>)}</div>
    </div>
    <div className={cn('grid gap-2.5 sm:gap-3',gridClass)}>{visibleTools.map((tool,index)=><ToolCard key={tool.id} tool={tool} query={query} priority={index<6} view={view}/>)}</div>
    {hasMore&&<div className="flex justify-center pt-2"><button type="button" onClick={()=>setVisibleCount((current)=>Math.min(current+VISIBLE_STEP,filteredTools.length))} className="min-h-11 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-black text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">{t('home.showMoreTools',{count:Math.min(VISIBLE_STEP,filteredTools.length-visibleTools.length)})}</button></div>}
    {filteredTools.length===0&&<div className="ajn-glass-card rounded-2xl py-12 text-center"><Search className="mx-auto h-8 w-8 text-slate-400"/><p className="mt-4 text-base font-black text-slate-800">{t('home.noMatch')}</p><p className="mt-2 text-sm text-slate-600">{t('home.noMatchHint')}</p></div>}
  </div>;
}
