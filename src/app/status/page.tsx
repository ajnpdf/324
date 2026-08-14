'use client';

import Link from 'next/link';
import { Activity, ArrowRight, Globe2, Server, ShieldCheck } from 'lucide-react';
import { BackendStatus } from '@/components/junction/backend-status';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';

const cards = [
  {
    icon: Globe2,
    title: 'Website experience',
    body: 'Core pages, navigation and public tool routes remain available independently of temporary conversion-service issues.',
  },
  {
    icon: ShieldCheck,
    title: 'Browser-local tools',
    body: 'Tools that run in the browser remain usable even if the optional processing service is temporarily unavailable.',
  },
  {
    icon: Server,
    title: 'Conversion services',
    body: 'Advanced conversions, OCR and security workflows report live availability before processing begins.',
  },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative pt-24 md:pt-28">
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-5 md:px-8 md:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-extrabold text-blue-700">
              <Activity className="h-4 w-4" /> Live service check
            </span>
            <h1 className="mt-6 text-balance text-[clamp(2.25rem,7vw,4.4rem)] font-black leading-[1.02] tracking-[-.045em] text-foreground">AJN PDF system status</h1>
            <p className="mx-auto mt-5 max-w-2xl text-sm font-medium leading-7 text-muted-foreground md:text-lg md:leading-8">
              Check current website and processing availability. Browser-local workflows stay separate from server-assisted conversion status.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-5">
            {cards.map((card) => (
              <section key={card.title} className="ajn-tool-card p-6 md:p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                  <card.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-xl font-black tracking-tight">{card.title}</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">{card.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-5 overflow-hidden rounded-[1.6rem] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(15,23,42,.08)] sm:p-7 md:p-9">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white"><Server className="h-5 w-5" /></span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Conversion service</h2>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">Live readiness, limits and capability counts refresh every 30 seconds.</p>
                  </div>
                </div>
                <div className="mt-6"><BackendStatus autoRefreshMs={30000} /></div>
              </div>
              <Link href="/transparency" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-100 transition-colors duration-150 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 focus-visible:outline-offset-2">
                File processing policy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm font-semibold leading-6 text-slate-700">
            A degraded state means the processing service is reachable but one or more optional conversion dependencies are unavailable. An unavailable service does not disable browser-local tools.
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
