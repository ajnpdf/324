import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileImage, FileText, RefreshCcw, Search } from 'lucide-react';
import { MainFooter } from './main-footer';
import { ToolArtwork } from '@/components/ajn/tool-artwork';
import { Navbar } from './navbar';
import { getPublicToolCategory, type PublicToolCategory } from '@/lib/tools-data';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';

const icons = { conversion: RefreshCcw, image: FileImage, pdf: FileText };
const titles = {
  conversion: 'Online file conversion tools',
  image: 'Online image tools and image conversions',
  pdf: 'PDF editing, security and utility tools',
};
const descriptions = {
  conversion: 'Convert scanned documents, images, PDFs, office files, eBooks, email files and structured data through focused conversion workflows.',
  image: 'Convert images to PDF, export PDF pages as images, scan document photos and prepare image files for sharing.',
  pdf: 'Merge, split, organize, edit, sign, protect, unlock, repair and optimize PDF documents with clear limitations.',
};

const intentContent = {
  conversion: {
    primary: 'file converter online',
    outcomes: ['Convert PDF to editable office formats', 'Create PDFs from documents and structured data', 'Run OCR on scans and document photos'],
    workflows: [
      { href: '/tools/pdf-to-docx', label: 'PDF to Word' },
      { href: '/tools/docx-to-pdf', label: 'Word to PDF' },
      { href: '/tools/scanned-pdf-to-text', label: 'Scanned PDF to Text' },
      { href: '/tools/pdf-to-xlsx', label: 'PDF to Excel' },
    ],
  },
  image: {
    primary: 'image converter and image to PDF tools',
    outcomes: ['Combine images into a PDF', 'Export PDF pages into image files', 'Prepare scans, receipts and searchable documents'],
    workflows: [
      { href: '/tools/jpg-to-pdf', label: 'JPG to PDF' },
      { href: '/tools/png-to-pdf', label: 'PNG to PDF' },
      { href: '/tools/pdf-to-png', label: 'PDF to PNG' },
      { href: '/tools/image-to-text', label: 'Image to Text OCR' },
    ],
  },
  pdf: {
    primary: 'online PDF editor and PDF utility tools',
    outcomes: ['Combine, split and organize pages', 'Protect, unlock and repair authorized files', 'Compress, crop, rotate and prepare documents'],
    workflows: [
      { href: '/tools/merge-pdf', label: 'Merge PDF' },
      { href: '/tools/split-pdf', label: 'Split PDF' },
      { href: '/tools/compress-pdf', label: 'Compress PDF' },
      { href: '/tools/protect-pdf', label: 'Protect PDF' },
    ],
  },
} as const;

export function CategoryDirectory({ category }: { category: PublicToolCategory }) {
  const tools = BUILD_PUBLIC_TOOLS.filter((tool) => getPublicToolCategory(tool) === category);
  const Icon = icons[category];
  const intent = intentContent[category];
  return (
    <div className="ajn-page-shell">
      <Navbar />
      <main className="relative z-10 pb-24 pt-28 md:pt-36">
        <section className="mx-auto w-full max-w-7xl px-4 md:px-6 xl:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600"><Icon className="h-7 w-7" /></div>
            <h1 className="mt-6 text-[clamp(2.5rem,6vw,4.8rem)] font-black leading-[.98] tracking-[-.05em] text-foreground">{titles[category]}</h1>
            <p className="mx-auto mt-5 max-w-3xl text-base font-medium leading-7 text-muted-foreground">{descriptions[category]}</p>
            <p className="mt-4 text-xs font-black uppercase tracking-[.14em] text-blue-600">{tools.length} public tools</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
            {intent.outcomes.map((outcome) => <div key={outcome} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><CheckCircle2 className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-sm font-black leading-6 text-card-foreground">{outcome}</p></div>)}
          </div>

          <div className="mt-12 grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <Link key={tool.id} href={`/tools/${tool.id}`} className="ajn-tool-card ajn-horizontal-tool-card group block">
                <div className="relative z-10 flex min-h-[86px] items-center gap-3 p-3">
                  <ToolArtwork toolId={tool.id} toolName={tool.name} className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2"><span className="ajn-card-brand-badge">AJN</span><ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600 " /></div>
                    <h2 className="mt-2 line-clamp-1 text-[15px] font-black tracking-tight text-foreground">{tool.name}</h2>
                    <p className="mt-1 line-clamp-2 text-[11.5px] font-medium leading-[1.08rem] text-muted-foreground">{tool.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <section className="mt-16 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-[.12em] text-blue-700 "><Search className="h-4 w-4" />Search intent guide</div>
                <h2 className="mt-5 text-3xl font-black tracking-tight text-foreground">Choose the right workflow, not just a file extension.</h2>
                <p className="mt-4 text-sm font-medium leading-7 text-muted-foreground">This directory targets the practical search topic “{intent.primary}.” Each tool page explains supported input, processing mode, options, output format and known limitations before the advertisement section.</p>
                <p className="mt-4 text-sm font-medium leading-7 text-muted-foreground">For important documents, open the downloaded result in its destination application and compare pages, text, tables, images and permissions with the source.</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/45 p-6">
                <h3 className="text-lg font-black text-foreground">Popular workflows</h3>
                <div className="mt-4 space-y-3">
                  {intent.workflows.map((workflow) => <Link key={workflow.href} href={workflow.href} className="group flex items-center justify-between rounded-2xl bg-card px-4 py-3 text-sm font-black text-card-foreground shadow-sm transition hover:text-blue-700"><span>{workflow.label}</span><ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></Link>)}
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
