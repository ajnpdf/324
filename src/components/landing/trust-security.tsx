"use client";

import Link from 'next/link';
import { FileWarning, KeyRound, Server, ShieldCheck, Trash2 } from 'lucide-react';
import { BackendStatus } from '@/components/junction/backend-status';

const controls = [
  { icon: ShieldCheck, title: 'Processing mode is visible', text: 'Tool pages distinguish browser processing from temporary server processing.' },
  { icon: FileWarning, title: 'File checks are enforced', text: 'Supported types, file signatures and size limits are validated before backend processing.' },
  { icon: KeyRound, title: 'Passwords are not guessed', text: 'Unlock PDF requires the current valid password and an authorization confirmation.' },
  { icon: Trash2, title: 'Temporary cleanup is built in', text: 'Backend jobs use unique temporary directories that are removed after delivery.' },
];

export function TrustSecurity() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
      <div className="overflow-hidden rounded-[2.2rem] border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-950 p-6 text-white shadow-[0_40px_90px_rgba(37,99,235,.22)] md:p-10 lg:p-12">
        <div className="grid gap-10 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black tracking-[.14em] text-blue-100"><ShieldCheck className="h-3.5 w-3.5" /> TRUST AND SECURITY</span>
            <h2 className="mt-5 text-4xl font-black tracking-[-.04em] md:text-6xl">Clear controls instead of unverified badges.</h2>
            <p className="mt-5 text-sm font-medium leading-7 text-blue-100/85">AJN PDF does not claim external certifications or uptime scores unless they are independently verified. The public pages explain the controls that are actually implemented.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/security" className="rounded-xl bg-white px-5 py-3 text-[11px] font-black text-slate-950 hover:bg-blue-50">Security practices</Link>
              <Link href="/file-processing-policy" className="rounded-xl border border-white/20 px-5 py-3 text-[11px] font-black text-white hover:bg-white/10">File processing policy</Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {controls.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-3xl border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
                <Icon className="h-5 w-5 text-emerald-300" />
                <h3 className="mt-4 text-sm font-black">{title}</h3>
                <p className="mt-2 text-xs font-medium leading-5 text-blue-100/75">{text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 border-t border-white/10 pt-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="rounded-3xl bg-white p-4 text-slate-900"><BackendStatus compact /></div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-100"><Server className="h-4 w-4" /> Live health reflects only the current secure-processing service check.</div>
        </div>
      </div>
    </section>
  );
}
