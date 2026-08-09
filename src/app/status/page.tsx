'use client';

import Link from 'next/link';
import { Activity, ArrowRight, CheckCircle2, Globe2, Server, ShieldCheck } from 'lucide-react';
import { BackendStatus } from '@/components/junction/backend-status';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';

const cards = [
  {
    icon: Globe2,
    title: 'Public website',
    body: 'This page is being served successfully in your current browser session.',
    accent: 'text-blue-600 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-300',
  },
  {
    icon: ShieldCheck,
    title: 'Browser processing tools',
    body: 'Local-first tools are available when supported by your browser, memory and device resources.',
    accent: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300',
  },
  {
    icon: Server,
    title: 'Server-assisted processing',
    body: 'OCR, Office and eBook conversions, advanced formats, Protect, Unlock and Repair depend on the Python service and installed capabilities shown below.',
    accent: 'text-red-600 bg-red-50 dark:bg-red-500/15 dark:text-red-300',
  },
];

export default function StatusPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden">
          <div className="absolute -left-24 top-8 h-80 w-80 rounded-full bg-red-100/70 blur-3xl" />
          <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-blue-100/80 blur-3xl" />
          <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
        </div>

        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold text-emerald-700">
              <Activity className="h-4 w-4" /> Live checks, not historical uptime claims
            </span>
            <h1 className="mt-7 text-4xl font-black tracking-tight text-foreground md:text-7xl">AJN PDF service status</h1>
            <p className="mt-6 text-base font-medium leading-8 text-muted-foreground md:text-lg">
              See which parts of AJN PDF are reachable now. We do not publish invented uptime percentages or server locations.
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

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold leading-6 text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-100">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            The production deployment should connect this page to external uptime monitoring later. Until then, this page reports only immediate browser and backend availability.
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
