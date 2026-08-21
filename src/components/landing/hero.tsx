"use client";

import Link from 'next/link';
import { ArrowDown, Search } from 'lucide-react';

export default function Hero() {
  return (
    <section data-ajn-home-hero="primary" className="relative overflow-hidden px-4 pb-4 pt-[86px] md:pb-6 md:pt-[106px]">
      <div className="mx-auto w-full max-w-7xl rounded-[1.75rem] border border-violet-100 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,.09),transparent_44%),linear-gradient(135deg,#fff_0%,#fff_55%,#fdf4ff_100%)] px-5 py-9 shadow-[0_24px_70px_rgba(76,29,149,.08)] sm:px-8 md:py-12 lg:px-12">
        <div className="max-w-4xl">
          <h1 className="text-balance text-[clamp(2.5rem,8vw,4.8rem)] font-black leading-[.98] tracking-[-.055em] text-slate-950">
            Free Online <span className="bg-gradient-to-r from-red-600 via-violet-700 to-fuchsia-600 bg-clip-text text-transparent">PDF Tools</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-slate-600 sm:text-base md:text-lg md:leading-7">
            Merge, split, compress, edit, organize, sign and protect PDF files online.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="#public-tools" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-700 px-5 text-xs font-black text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">
              <Search className="h-4 w-4" /> Choose a PDF tool
            </Link>
            <Link href="/merge-pdf" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-800 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">
              Start with Merge PDF <ArrowDown className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
