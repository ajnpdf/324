import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, FileStack, Gauge, HardDrive, Monitor, Server, ShieldCheck, Timer } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';
import { SERVER_LIMIT_DEFAULTS } from '@/lib/tool-limits';

export const metadata: Metadata = {
  title: 'File Size, Page & Processing Limits',
  description: 'See AJN PDF file-size, page, image, output and processing limits, plus how local and temporary-server tools handle files.',
  alternates: { canonical: '/limits' },
};

const serverLimits = [
  { icon: HardDrive, label: 'Per file', value: `${SERVER_LIMIT_DEFAULTS.maxFileSizeMb} MB`, note: 'Server default; individual tool policy can be lower.' },
  { icon: Gauge, label: 'Combined upload', value: `${SERVER_LIMIT_DEFAULTS.maxTotalSizeMb} MB`, note: 'Maximum combined upload for one server request.' },
  { icon: FileStack, label: 'PDF pages', value: `${SERVER_LIMIT_DEFAULTS.maxPdfPages}`, note: 'Maximum PDF pages for server workflows that read PDFs.' },
  { icon: Gauge, label: 'Image pixels', value: `${SERVER_LIMIT_DEFAULTS.maxImageMegapixels} MP`, note: 'Maximum decoded pixels for one server-side image.' },
  { icon: HardDrive, label: 'Generated output', value: `${SERVER_LIMIT_DEFAULTS.maxOutputMb} MB`, note: 'Maximum generated output size before delivery.' },
  { icon: Timer, label: 'Processing time', value: `${SERVER_LIMIT_DEFAULTS.processingTimeoutSeconds}s`, note: 'Default server job timeout.' },
];

export default function LimitsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-8 md:pt-36">
        <section className="max-w-3xl">
          <span className="ajn-section-kicker">Processing policy</span>
          <h1 className="mt-5 text-4xl font-black tracking-[-.045em] md:text-6xl">Clear file and processing limits.</h1>
          <p className="mt-5 text-base font-medium leading-8 text-slate-600">AJN PDF shows the relevant limit on each tool screen. Browser tools use their own file policy; server tools also follow the processing-service ceilings below. A deployment can enforce a lower live file or total-upload limit, and the live tool screen takes precedence when the service reports one.</p>
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-labelledby="server-limits-title">
          <h2 id="server-limits-title" className="sr-only">Server processing limits</h2>
          {serverLimits.map(({ icon: Icon, label, value, note }) => (
            <article key={label} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"><Icon className="h-4 w-4" /></span>
              <h3 className="mt-4 text-xs font-black uppercase tracking-[.09em] text-slate-600">{label}</h3>
              <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
              <p className="mt-2 text-xs font-medium leading-5 text-slate-600">{note}</p>
            </article>
          ))}
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-blue-50/55 p-6">
            <div className="flex items-center gap-3"><Monitor className="h-5 w-5 text-blue-700" /><h2 className="text-xl font-black">On-device tools</h2></div>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-700">Local tools keep supported files in the active browser session. Their visible per-file and file-count limits come from the same AJN PDF tool policy used by the interface. Browser memory and device capability can still become the practical ceiling for unusually complex files.</p>
          </article>
          <article className="rounded-2xl border border-emerald-100 bg-emerald-50/55 p-6">
            <div className="flex items-center gap-3"><Server className="h-5 w-5 text-emerald-700" /><h2 className="text-xl font-black">Processing-service tools</h2></div>
            <p className="mt-4 text-sm font-medium leading-7 text-slate-700">Server workflows use selected files only for the active request. Temporary job data is cleaned after the response. The tool screen checks the service and displays live file/total-upload/time limits when the readiness endpoint reports them.</p>
          </article>
        </section>

        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-amber-800" /><h2 className="text-lg font-black text-amber-950">Fair-use and abuse protection</h2></div>
          <p className="mt-3 text-sm font-medium leading-7 text-amber-950/80">AJN PDF may temporarily limit unusually high automated request volumes or reject workloads that exceed safety ceilings. This protects processing capacity for normal interactive use without publishing security-sensitive abuse thresholds.</p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/file-processing-policy" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-950 px-5 text-xs font-black text-white">File processing policy <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/status" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-xs font-black text-slate-800">Live service status <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </main>
      <MainFooter />
    </div>
  );
}
