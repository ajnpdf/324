"use client";

import Link from 'next/link';
import { ChevronRight, Search } from 'lucide-react';
import { useMemo } from 'react';
import { getPublicToolCategory } from '../../lib/tools-data';
import { BUILD_PUBLIC_TOOLS } from '../../lib/build-public-tools';
import { useLanguage } from '@/lib/i18n/language-context';
import { ToolArtwork } from '@/components/ajn/tool-artwork';
import { toolPath } from '@/lib/tool-routes';

interface ServicesGridProps { query: string; category: string; }
type PublicTool = (typeof BUILD_PUBLIC_TOOLS)[number];

const GROUPS = [
  { id: 'core', title: 'Core PDF Tools', description: 'The everyday tools for assembling, organizing and preparing PDF files.', ids: ['merge-pdf','split-pdf','compress-pdf','rotate-pdf','delete-pdf-pages','organize-pdf','crop-pdf','watermark-pdf','page-number','flatten-pdf'] },
  { id: 'edit', title: 'Edit & Sign', description: 'Add content, inspect documents, extract assets and finish a PDF for sharing.', ids: ['add-text','add-image-to-pdf','compare-pdf','pdf-metadata','extract-images','sign-pdf','pdf-zip-extract'] },
  { id: 'security', title: 'Security & Recovery', description: 'Protect authorized documents, remove known passwords and repair damaged PDF structure.', ids: ['protect-pdf','unlock-pdf','repair-pdf'] },
  { id: 'image', title: 'Image Tools', description: 'Resize, reduce, crop, rotate, watermark, flip and convert common image formats.', ids: ['image-reducer','image-resizer','crop-image','rotate-image','watermark-image','flip-image','convert-image'] },
] as const;

const INTENT_IDS: Record<string, string[]> = {
  edit: ['add-text','add-image-to-pdf','watermark-pdf','crop-pdf','rotate-pdf','page-number','flatten-pdf','sign-pdf','pdf-metadata','compare-pdf','delete-pdf-pages','extract-images'],
  organize: ['merge-pdf','split-pdf','organize-pdf','delete-pdf-pages','rotate-pdf','crop-pdf','page-number','flatten-pdf','pdf-zip-extract'],
  security: ['protect-pdf','unlock-pdf','repair-pdf'],
};

const SEARCH_EXPANSIONS: Record<string,string[]> = {
  reduce:['compress','smaller','optimize'], smaller:['compress','reduce'], photo:['image','picture'], picture:['image','photo'], secure:['protect','lock'], password:['protect','unlock'], combine:['merge'], separate:['split'], reorder:['organize'], remove:['delete'], signature:['sign'], metadata:['properties','info'],
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
  if(category==='image')return getPublicToolCategory(tool)==='image';
  if(category==='pdf')return getPublicToolCategory(tool)!=='image';
  return (INTENT_IDS[category]||[]).includes(tool.id);
}
function Highlight({ text, highlight }: { text: string; highlight: string }) {
  const q=highlight.trim(); if(!q||q.includes(' '))return <>{text}</>;
  const escaped=q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); const parts=text.split(new RegExp(`(${escaped})`,'gi'));
  return <>{parts.map((part,index)=>part.toLowerCase()===q.toLowerCase()?<mark key={index} className="rounded-sm bg-violet-50 px-0.5 text-violet-800">{part}</mark>:<span key={index}>{part}</span>)}</>;
}
function ToolCard({ tool, query, priority=false }:{tool:PublicTool;query:string;priority?:boolean}){
  const {tool:localizeTool}=useLanguage();
  const localized=localizeTool(tool.id,tool.name,tool.desc,tool.keywords);
  const category=getPublicToolCategory(tool);
  return <Link href={toolPath(tool.id)} prefetch={false} className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2" aria-label={localized.name} data-analytics-id={`tool-card-${tool.id}`} data-analytics-category={category}>
    <article className="h-full rounded-2xl border border-slate-200 bg-white transition duration-150 hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_12px_30px_rgba(76,29,149,.08)]">
      <div className="flex min-h-[86px] items-center gap-3 px-3.5 py-3.5">
        <ToolArtwork toolId={tool.id} toolName={localized.name} priority={priority} className="h-11 w-11 shrink-0 sm:h-12 sm:w-12"/>
        <div className="min-w-0 flex-1"><h3 className="truncate text-[13.5px] font-black leading-5 tracking-[-.01em] text-slate-950 sm:text-[14px]"><Highlight text={localized.name} highlight={query}/></h3><p className="mt-0.5 line-clamp-2 text-[10.5px] font-medium leading-4 text-slate-600 sm:text-[11px]"><Highlight text={localized.desc} highlight={query}/></p></div>
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-violet-700"/>
      </div>
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
  if(filteredTools.length===0)return <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm"><Search className="mx-auto h-8 w-8 text-slate-300"/><p className="mt-4 text-base font-black text-slate-800">No matching tool</p><p className="mt-2 text-sm font-medium text-slate-500">Try merge, compress, sign, protect, crop or image.</p></div>;
  if(groupedMode){
    const byId=new Map(BUILD_PUBLIC_TOOLS.map(tool=>[tool.id,tool]));
    return <div className="space-y-10" id="ajn-public-tool-grid">{GROUPS.map((group,groupIndex)=>{const tools=group.ids.map(id=>byId.get(id)).filter((tool):tool is PublicTool=>Boolean(tool));return <section key={group.id} aria-labelledby={`tool-group-${group.id}`}><div className="mb-4 flex items-end justify-between gap-4 border-b border-slate-100 pb-3"><div><h3 id={`tool-group-${group.id}`} className="text-lg font-black tracking-[-.025em] text-slate-950 md:text-xl">{group.title}</h3><p className="mt-1 hidden text-xs font-medium leading-5 text-slate-500 sm:block">{group.description}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">{tools.length}</span></div><div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{tools.map((tool,index)=><ToolCard key={tool.id} tool={tool} query="" priority={groupIndex===0&&index<6}/>)}</div></section>;})}</div>;
  }
  return <div className="space-y-4"><div className="flex items-center justify-between"><p className="text-[11px] font-bold text-slate-600" aria-live="polite">{filteredTools.length} matching {filteredTools.length===1?'tool':'tools'}</p></div><div id="ajn-public-tool-grid" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filteredTools.map((tool,index)=><ToolCard key={tool.id} tool={tool} query={query} priority={index<6}/>)}</div></div>;
}
