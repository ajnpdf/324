import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BookOpen, Clock, FileText, ScanText, ShieldCheck, Shrink } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';

export const metadata: Metadata = {
  title: 'Practical PDF Guides',
  description: 'Practical AJN PDF guides for safer PDF workflows, document protection, OCR, editing and everyday file tasks.',
  alternates: { canonical: '/blog' },
};

const articles = [
  {
    href: '/blog/how-to-merge-pdfs-online-safely',
    title: 'How to merge PDFs online safely',
    desc: 'A practical workflow for checking page order, processing mode, downloaded output and document privacy.',
    tag: 'Workflow', readTime: '5 min', icon: FileText, accent: 'bg-red-50 text-red-600',
  },
  {
    href: '/blog/browser-native-architecture',
    title: 'How browser-native PDF tools work',
    desc: 'Understand local-first processing, memory limits, browser compatibility and when a native server engine is necessary.',
    tag: 'Architecture', readTime: '6 min', icon: BookOpen, accent: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/blog/document-security-aes256',
    title: 'PDF passwords and AES-256 explained',
    desc: 'Learn the difference between open and owner passwords, document permissions and authorised password removal.',
    tag: 'Security', readTime: '7 min', icon: ShieldCheck, accent: 'bg-emerald-50 text-emerald-600',
  },
  {
    href: '/blog/ocr-digital-archiving',
    title: 'OCR for scanned documents and archives',
    desc: 'Improve scan quality, choose a language and review extracted text before using OCR output in important workflows.',
    tag: 'OCR', readTime: '6 min', icon: ScanText, accent: 'bg-blue-50 text-blue-600',
  },
  {
    href: '/blog/best-free-pdf-editor',
    title: 'How to evaluate a free PDF editor',
    desc: 'Compare real output, privacy labels, limitations, download quality and misleading claims before trusting a PDF tool.',
    tag: 'Guide', readTime: '5 min', icon: Shrink, accent: 'bg-red-50 text-red-600',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navbar />
      <main className="relative pt-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-50/60 via-blue-50/30 to-transparent" />
          <svg className="absolute inset-x-0 top-12 h-72 w-full opacity-55" viewBox="0 0 1440 320" preserveAspectRatio="none"><path d="M-90 208C180 70 420 286 706 154C970 32 1220 82 1530 206" fill="none" stroke="url(#blog-wave)" strokeWidth="28" strokeLinecap="round" opacity=".15"/><defs><linearGradient id="blog-wave" x1="0" y1="0" x2="1440" y2="0"><stop stopColor="#E9233F"/><stop offset=".5" stopColor="#2563EB"/><stop offset="1" stopColor="#059669"/></linearGradient></defs></svg>
        </div>

        <section className="mx-auto max-w-6xl px-5 pb-24 pt-12 md:px-8 md:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-extrabold text-blue-700"><BookOpen className="h-4 w-4" /> AJN PDF guides</span>
            <h1 className="mt-7 text-4xl font-black tracking-tight md:text-7xl">Practical guides for better document workflows</h1>
            <p className="mt-6 text-base font-medium leading-8 text-muted-foreground md:text-lg">Clear, practical guidance for PDF, OCR, document security and everyday file workflows.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <Link key={article.href} href={article.href} className={`group block ${index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
                <article className="ajn-tool-card flex h-full flex-col p-7 md:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${article.accent}`}><article.icon className="h-5 w-5" /></span>
                    <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground"><Clock className="h-3.5 w-3.5" /> {article.readTime}</span>
                  </div>
                  <div className="mt-7 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-[.18em] text-blue-600">{article.tag}</span>
                    <h2 className="mt-3 text-2xl font-black leading-tight tracking-tight transition group-hover:text-blue-600">{article.title}</h2>
                    <p className="mt-4 text-sm font-medium leading-7 text-muted-foreground">{article.desc}</p>
                  </div>
                  <div className="mt-7 flex items-center justify-between border-t border-border pt-5 text-sm font-extrabold text-foreground">
                    Read guide <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
