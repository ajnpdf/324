"use client";

import Link from 'next/link';
import { ArrowUpRight, Search } from 'lucide-react';
import { useMemo } from 'react';
import { BUILD_PUBLIC_TOOLS } from '../../lib/build-public-tools';
import { useLanguage } from '@/lib/i18n/language-context';
import { ToolArtwork } from '@/components/ajn/tool-artwork';
import { toolPath } from '@/lib/tool-routes';

interface ServicesGridProps { query: string; category: string; }
type PublicTool = (typeof BUILD_PUBLIC_TOOLS)[number];

const GROUPS = [
  { id: 'core', title: 'Popular PDF Tools', description: 'Fast everyday tools for combining, reducing and preparing PDF files.', ids: ['merge-pdf','compress-pdf','split-pdf','rotate-pdf'] },
  { id: 'organize', title: 'Organize PDF', description: 'Reorder, remove, crop, number and flatten PDF pages.', ids: ['delete-pdf-pages','organize-pdf','crop-pdf','page-number','flatten-pdf'] },
  { id: 'edit', title: 'Edit & Sign PDF', description: 'Add content, compare documents, inspect metadata, extract assets and sign.', ids: ['add-text','add-image-to-pdf','watermark-pdf','compare-pdf','pdf-metadata','extract-images','sign-pdf','pdf-zip-extract'] },
  { id: 'security', title: 'PDF Security & Recovery', description: 'Protect authorized files, unlock with the current password, and repair damaged structure.', ids: ['protect-pdf','unlock-pdf','repair-pdf'] },
] as const;

const INTENT_IDS: Record<string, string[]> = {
  edit: ['add-text','add-image-to-pdf','watermark-pdf','crop-pdf','rotate-pdf','page-number','flatten-pdf','sign-pdf','pdf-metadata','compare-pdf','delete-pdf-pages','extract-images'],
  organize: ['merge-pdf','split-pdf','organize-pdf','delete-pdf-pages','rotate-pdf','crop-pdf','page-number','flatten-pdf','pdf-zip-extract'],
  security: ['protect-pdf','unlock-pdf','repair-pdf'],
};

const SEARCH_EXPANSIONS: Record<string,string[]> = {
  reduce:['compress','smaller','optimize'], smaller:['compress','reduce'], secure:['protect','lock'], password:['protect','unlock'], combine:['merge'], separate:['split'], reorder:['organize'], remove:['delete'], signature:['sign'], metadata:['properties','info'], pages:['split','organize','delete','rotate'],
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
function matchesCategory(tool:PublicTool,category:string){
  if(category==='all')return true;
  return (INTENT_IDS[category]||[]).includes(tool.id);
}
function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const q=highlight.trim(); if(!q||q.includes(' '))return <>{text}</>;
  const escaped=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const parts=text.split(new RegExp(`(${escaped})`,'gi'));
  return <>{parts.map((part,index)=>part.toLowerCase()===q.toLowerCase()?<mark key={index} className="rounded-sm bg-violet-100 px-0.5 text-violet-900">{part}</mark>:<span key={index}>{part}</span>)}</>;
}
function ToolCard({ tool, query, priority=false }:{tool:PublicTool;query:string;priority?:boolean}){
  const {tool:localizeTool}=useLanguage();
  const localized=localizeTool(tool.id,tool.name,tool.desc,tool.keywords);
  return <Link href={toolPath(tool.id)} prefetch={false} className="group block h-full rounded-[1.35rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2" aria-label={localized.name} data-analytics-id={`tool-card-${tool.id}`} data-analytics-category="pdf">
    <article className="relative flex min-h-[156px] h-full flex-col rounded-[1.35rem] border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,.035)] transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-[0_18px_42px_rgba(76,29,149,.11)] sm:min-h-[166px] sm:p-5.5">
      <div className="flex items-start justify-between gap-4">
        <ToolArtwork toolId={tool.id} toolName={localized.name} priority={priority} className="h-14 w-14 shrink-0 sm:h-16 sm:w-16"/>
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400 transition group-hover:border-violet-200 group-hover:bg-violet-50 group-hover:text-violet-700"><ArrowUpRight aria-hidden="true" className="h-4 w-4"/></span>
      </div>
      <div className="mt-4 min-w-0"><h3 className="text-[15px] font-black leading-5 tracking-[-.02em] text-slate-950 sm:text-[16px]"><Highlight text={localized.name} highlight={query}/></h3><p className="mt-1.5 line-clamp-2 text-[11.5px] font-medium leading-[1.55] text-slate-600 sm:text-[12px]"><Highlight text={localized.desc} highlight={query}/></p></div>
    </article>
  </Link>;
}

export function ServicesGrid({query,category}:ServicesGridProps){
  const {language,tool:localizeTool}=useLanguage();
  const filteredTools=useMemo(()=>{
    const normalized=query.toLocaleLowerCase(language).trim();
    return BUILD_PUBLIC_TOOLS.map((tool,index)=>{const localized=localizeTool(tool.id,tool.name,tool.desc,tool.keywords);const haystack=[localized.name,localized.desc,...localized.aliases,...tool.keywords,tool.id].join(' ');return{tool,index,score:searchScore(normalized,haystack,localized.name)};}).filter(x=>matchesCategory(x.tool,category)&&(!normalized||x.score>0)).sort((a,b)=>normalized?(b.score-a.score||a.index-b.index):a.index-b.index).map(x=>x.tool);
  },[query,category,language,localizeTool]);
  const groupedMode = !query.trim() && category === 'all';
  if(filteredTools.length===0)return <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm"><Search className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-4 text-base font-black text-slate-800">No matching PDF tool</p><p className="mt-2 text-sm font-medium text-slate-500">Try merge, compress, split, sign, protect or crop.</p></div>;
  if(groupedMode){
    const byId=new Map(BUILD_PUBLIC_TOOLS.map(tool=>[tool.id,tool]));
    return <div className="space-y-11" id="ajn-public-tool-grid">{GROUPS.map((group,groupIndex)=>{const tools=group.ids.map(id=>byId.get(id)).filter((tool):tool is PublicTool=>Boolean(tool));return <section key={group.id} aria-labelledby={`tool-group-${group.id}`}><div className="mb-5 border-b border-slate-100 pb-3"><h3 id={`tool-group-${group.id}`} className="text-xl font-black tracking-[-.03em] text-slate-950 md:text-2xl">{group.title}</h3><p className="mt-1.5 text-xs font-medium leading-5 text-slate-500 sm:text-sm">{group.description}</p></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{tools.map((tool,index)=><ToolCard key={tool.id} tool={tool} query="" priority={groupIndex===0&&index<4}/>)}</div></section>;})}</div>;
  }
  return <div className="space-y-4"><p className="text-[11px] font-bold text-slate-600" aria-live="polite">{filteredTools.length} matching {filteredTools.length===1?'tool':'tools'}</p><div id="ajn-public-tool-grid" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredTools.map((tool,index)=><ToolCard key={tool.id} tool={tool} query={query} priority={index<4}/>)}</div></div>;
}
