'use client';

import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, Globe2, Server, ShieldCheck } from 'lucide-react';
import { BackendStatus } from '@/components/junction/backend-status';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';

const cards = [
  {
    icon: Globe2,
    title: 'Website experience',
    body: 'Core pages, navigation and public tool routes are available in the current session.',
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: ShieldCheck,
    title: 'Processing workspace',
    body: 'Supported document actions are prepared in the active workspace with clear progress and result states.',
    accent: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: Server,
    title: 'Conversion services',
    body: 'Advanced conversions, OCR and security tools connect to the processing service when their workflow requires it.',
    accent: 'text-red-600 bg-red-50',
  },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-50/70 via-blue-50/35 to-transparent" />
          <svg className="absolute inset-x-0 top-16 h-64 w-full opacity-55" viewBox="0 0 1440 300" preserveAspectRatio="none"><path d="M-80 190C180 46 390 274 705 140C970 28 1200 76 1520 188" fill="none" stroke="url(#status-wave)" strokeWidth="28" strokeLinecap="round" opacity=".16"/><defs><linearGradient id="status-wave" x1="0" y1="0" x2="1440" y2="0"><stop stopColor="#7C3AED"/><stop offset=".5" stopColor="#2563EB"/><stop offset="1" stopColor="#059669"/></linearGradient></defs></svg>
        </div>

        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold text-emerald-700">
              <Activity className="h-4 w-4" /> Live service check
            </span>
            <h1 className="mt-7 text-4xl font-black tracking-tight text-foreground md:text-7xl">AJN PDF system status</h1>
            <p className="mt-6 text-base font-medium leading-8 text-muted-foreground md:text-lg">
              Check website and processing availability for the tools you use, with clear current-state information.
            </p>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {cards.map((card) => (
              <section key={card.title} className="ajn-tool-card p-7">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.accent}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <h2 className="mt-6 text-xl font-black tracking-tight">{card.title}</h2>
                <p className="mt-3 text-sm font-medium leading-7 text-muted-foreground">{card.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-6 overflow-hidden rounded-[2rem] border border-border bg-card p-7 shadow-[0_24px_70px_rgba(15,23,42,.10)] md:p-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white"><Server className="h-5 w-5" /></span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">Conversion service</h2>
                    <p className="mt-1 text-sm font-medium text-muted-foreground">The page checks whether file conversion is ready before enabling supported actions.</p>
                  </div>
                </div>
                <div className="mt-6"><BackendStatus /></div>
              </div>
              <Link href="/transparency" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700">
                File processing policy <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold leading-6 text-emerald-900">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            Availability on this page reflects the current service check. Refresh when you need the latest processing status.
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
