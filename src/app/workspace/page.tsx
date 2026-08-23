import type { Metadata } from 'next';
import { ShieldCheck, Workflow } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';
import { WorkspaceClient } from '@/components/workspace/workspace-client';

export const metadata: Metadata = {
  title: { absolute: 'AJN Workspace — Private Multi-Step PDF Workflows | AJN PDF' },
  description: 'Upload PDFs once and run local Merge, Rotate, Watermark and Page Number steps in one private browser workspace.',
  alternates: { canonical: '/workspace' },
};

export default function WorkspacePage() {
  return <div className="min-h-screen bg-slate-50"><Navbar/><main className="pt-[96px] md:pt-[112px]"><section className="mx-auto max-w-7xl px-4 pb-10 md:px-8"><div className="overflow-hidden rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8 md:p-10"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-violet-800"><Workflow className="h-3.5 w-3.5"/>AJN Workspace R25</span><span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-800"><ShieldCheck className="h-3.5 w-3.5"/>Local processing</span></div><h1 className="mt-5 max-w-5xl text-balance text-[clamp(2.6rem,7vw,5.4rem)] font-black leading-[.96] tracking-[-.06em] text-slate-950">One upload. Several PDF actions. One final result.</h1><p className="mt-5 max-w-3xl text-sm font-medium leading-7 text-slate-600 md:text-base">AJN Workspace keeps selected PDFs in this browser tab and applies supported steps against one in-memory result. The first release supports real local Merge, Rotate, Watermark and Page Number operations—without pretending server-only tools are local.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/80 bg-white/80 p-4"><p className="text-xs font-black text-slate-950">No repeated uploads</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-600">Reuse the same selected PDF data across supported local steps.</p></div><div className="rounded-2xl border border-white/80 bg-white/80 p-4"><p className="text-xs font-black text-slate-950">Private Session</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-600">History metadata is off by default and PDF bytes are never stored in history.</p></div><div className="rounded-2xl border border-white/80 bg-white/80 p-4"><p className="text-xs font-black text-slate-950">Correct processing boundary</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-600">Protect, Unlock and Repair remain on their disclosed temporary-server workflows.</p></div></div></div></section><WorkspaceClient/></main><MainFooter/></div>;
}
