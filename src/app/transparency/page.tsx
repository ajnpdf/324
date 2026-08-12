import Link from 'next/link';
import { ArrowRight, Eye, Monitor, Server, ShieldCheck, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';

const modes = [
  {
    icon: Monitor,
    title: 'Session-based tools',
    tag: 'Active workspace',
    accent: 'bg-blue-50 text-blue-600 border-blue-100',
    body: 'Many everyday PDF and image actions work inside the active session. The tool page shows practical handling details and limits before you begin.',
  },
  {
    icon: Server,
    title: 'Service-assisted tools',
    tag: 'When required',
    accent: 'bg-red-50 text-red-600 border-red-100',
    body: 'Advanced conversion, OCR and security workflows can use the processing service for the requested action. Request workspace data is cleaned after delivery or an error.',
  },
];

export default function TransparencyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-blue-50/65 via-violet-50/35 to-transparent" />
        </div>

        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-extrabold text-blue-700"><Eye className="h-4 w-4" /> Clear file handling</span>
            <h1 className="mt-7 text-4xl font-black tracking-tight md:text-7xl">Clear file handling, from start to finish</h1>
            <p className="mt-6 text-base font-medium leading-8 text-muted-foreground md:text-lg">AJN PDF explains practical file handling, limits and cleanup behavior so you can choose the right workflow with confidence.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {modes.map((mode) => (
              <section key={mode.title} className="ajn-tool-card p-8 md:p-10">
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${mode.accent}`}><mode.icon className="h-6 w-6" /></span>
                  <span className="rounded-lg border border-border bg-card px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{mode.tag}</span>
                </div>
                <h2 className="mt-7 text-2xl font-black tracking-tight">{mode.title}</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-muted-foreground">{mode.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-7 rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-slate-950 shadow-[0_24px_70px_rgba(37,62,113,.10)] backdrop-blur md:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <ShieldCheck className="h-7 w-7 text-blue-600" />
                <h2 className="mt-5 text-xl font-black">Verify the request</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">When you want to verify a session-based workflow, the browser Network panel can show whether the selected document is transferred during that action.</p>
              </div>
              <div>
                <Trash2 className="h-7 w-7 text-emerald-600" />
                <h2 className="mt-5 text-xl font-black">Temporary cleanup</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Server jobs use request-specific temporary directories and schedule cleanup after delivery.</p>
              </div>
              <div>
                <Server className="h-7 w-7 text-red-600" />
                <h2 className="mt-5 text-xl font-black">Backend status</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Security tools check service availability and show an unavailable state instead of fake success.</p>
              </div>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/file-processing-policy" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold transition hover:bg-blue-500">File processing policy <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/security" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-extrabold transition hover:bg-slate-100">Security controls</Link>
            </div>
          </section>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
