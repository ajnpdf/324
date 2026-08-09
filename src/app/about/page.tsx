import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Eye, FileText, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';
import { BUILD_PUBLIC_TOOLS } from '@/lib/build-public-tools';
import { getToolPolicy } from '@/lib/tool-policy';
import { AJN_BRAND } from '@/lib/brand';
import { CapabilitySummary } from '@/components/about/capability-summary';

const principles = [
  {
    icon: Eye,
    title: 'Honest processing labels',
    text: 'AJN PDF explains whether a workflow runs in the browser or uses temporary server processing before the user starts it.',
    tone: 'blue',
  },
  {
    icon: FileText,
    title: 'Focused public tools',
    text: 'Only production-policy tools appear in the public directory. Missing-dependency and unvalidated tools are excluded from public indexing.',
    tone: 'red',
  },
  {
    icon: ShieldCheck,
    title: 'Responsible security workflows',
    text: 'Protect PDF uses AES-256 through pikepdf. Unlock PDF requires the current password and user authorization. Password guessing is not part of the product.',
    tone: 'green',
  },
];

export default function AboutPage() {
  const browserCount = BUILD_PUBLIC_TOOLS.filter((tool) => getToolPolicy(tool.id).processingMode === 'browser').length;
  return (
    <div className="ajn-page-shell">
      <Navbar />
      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-32 md:px-8 md:pt-40">
        <section className="grid items-center gap-12 lg:grid-cols-[1fr_.9fr]">
          <div>
            <span className="ajn-section-kicker">About AJN PDF</span>
            <h1 className="mt-6 text-5xl font-black tracking-[-.05em] text-foreground md:text-7xl">A practical document toolkit built around clarity.</h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-muted-foreground">AJN PDF is a web product from India that combines browser-based PDF and image workflows with a Python processing service for OCR, document conversion and PDF operations that need native engines.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/pdf-tools" className="ajn-primary-button">Explore public tools <ArrowRight className="h-4 w-4" /></Link>
              <Link href="/transparency" className="ajn-secondary-button">How files are processed</Link>
            </div>
          </div>

          <div className="relative rounded-[2.2rem] border border-border bg-card p-7 text-card-foreground shadow-[0_35px_90px_rgba(15,23,42,.12)] dark:shadow-[0_35px_90px_rgba(0,0,0,.35)]">
            <CapabilitySummary browserCount={browserCount} />
          </div>
        </section>

        <section className="mt-24">
          <div className="max-w-3xl"><span className="ajn-section-kicker">Product principles</span><h2 className="mt-5 text-4xl font-black tracking-[-.04em] text-foreground md:text-6xl">What the public product should prove.</h2></div>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {principles.map(({ icon: Icon, title, text, tone }) => <article key={title} className="ajn-glass-card rounded-3xl p-7"><span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300' : tone === 'green' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300'}`}><Icon className="h-5 w-5" /></span><h3 className="mt-6 text-xl font-black text-foreground">{title}</h3><p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{text}</p></article>)}
          </div>
        </section>

        <section className="ajn-theme-surface mt-24 overflow-hidden rounded-[2rem] p-7 md:p-10">
          <div className="grid items-center gap-8 md:grid-cols-[220px_1fr]">
            <Image src={AJN_BRAND.developerImageThumb} alt="Anjan Kumar, developer of AJN PDF" width={480} height={480} className="aspect-square w-full rounded-3xl object-cover" />
            <div>
              <span className="ajn-section-kicker">Developer</span>
              <h2 className="mt-5 text-3xl font-black tracking-[-.04em] text-foreground md:text-5xl">Built by Anjan Kumar under AJN Studio.</h2>
              <p className="mt-4 max-w-3xl text-sm font-medium leading-7 text-muted-foreground">{AJN_BRAND.developerBio}</p>
              <div className="mt-6 flex flex-wrap gap-3"><Link href="/developer" className="ajn-primary-button">Developer profile <ArrowRight className="h-4 w-4" /></Link><Link href="/discover" className="ajn-secondary-button">AJN Discover</Link></div>
            </div>
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
