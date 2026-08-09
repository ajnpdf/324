import Link from 'next/link';
import { ArrowRight, Eye, Monitor, Server, ShieldCheck, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';

const modes = [
  {
    icon: Monitor,
    title: 'Browser processing',
    tag: 'Local-first',
    accent: 'bg-blue-50 text-blue-600 border-blue-100',
    body: 'Merge, split, rotate, page editing and many image tools run inside the browser. Those tools are designed not to upload the selected document to AJN PDF.',
  },
  {
    icon: Server,
    title: 'Temporary server processing',
    tag: 'Clearly labelled',
    accent: 'bg-red-50 text-red-600 border-red-100',
    body: 'OCR, office and eBook conversion, advanced image formats, Protect PDF, Unlock PDF and Repair PDF can use the Python service. The file is sent for the requested action, processed in a request-specific temporary directory and cleaned after the response or an error.',
  },
];

export default function TransparencyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative pt-28">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] overflow-hidden">
          <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-blue-100/70 blur-3xl" />
          <div className="absolute left-[42%] top-4 h-80 w-80 rounded-full bg-emerald-100/60 blur-3xl" />
          <div className="absolute -right-20 top-24 h-80 w-80 rounded-full bg-red-100/60 blur-3xl" />
        </div>

        <section className="mx-auto max-w-6xl px-5 pb-20 pt-12 md:px-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-extrabold text-blue-700"><Eye className="h-4 w-4" /> How files are processed</span>
            <h1 className="mt-7 text-4xl font-black tracking-tight md:text-7xl">Know where your file is processed</h1>
            <p className="mt-6 text-base font-medium leading-8 text-muted-foreground md:text-lg">Every public tool must state its processing mode, practical limits and known limitations before processing begins.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {modes.map((mode) => (
              <section key={mode.title} className="ajn-tool-card p-8 md:p-10">
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${mode.accent}`}><mode.icon className="h-6 w-6" /></span>
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{mode.tag}</span>
                </div>
                <h2 className="mt-7 text-2xl font-black tracking-tight">{mode.title}</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-muted-foreground">{mode.body}</p>
              </section>
            ))}
          </div>

          <section className="mt-7 rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_30px_90px_rgba(15,23,42,.24)] md:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <ShieldCheck className="h-7 w-7 text-blue-400" />
                <h2 className="mt-5 text-xl font-black">Verify the request</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Use the browser Network tab. Local tools should not send the selected document to the AJN backend.</p>
              </div>
              <div>
                <Trash2 className="h-7 w-7 text-emerald-400" />
                <h2 className="mt-5 text-xl font-black">Temporary cleanup</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Server jobs use request-specific temporary directories and schedule cleanup after delivery.</p>
              </div>
              <div>
                <Server className="h-7 w-7 text-red-400" />
                <h2 className="mt-5 text-xl font-black">Backend status</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Security tools check service availability and show an unavailable state instead of fake success.</p>
              </div>
            </div>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/file-processing-policy" className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold transition hover:bg-blue-500">File processing policy <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/security" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-extrabold transition hover:bg-white/10">Security controls</Link>
            </div>
          </section>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
