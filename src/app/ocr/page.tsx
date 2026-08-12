import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileSearch, Languages, ScanLine, ShieldCheck } from 'lucide-react';
import { Navbar } from '@/components/landing/navbar';
import { MainFooter } from '@/components/landing/main-footer';
import { OCR_LANGUAGE_CODES, OCR_LANGUAGE_LABELS } from '@/lib/tool-limits';

export const metadata: Metadata = {
  title: 'OCR Languages & Scanned PDF Guide',
  description: 'Learn which OCR languages AJN PDF supports, how scanned PDF and image OCR works, and what affects text-recognition quality.',
  alternates: { canonical: '/ocr' },
};

const workflows = [
  ['Scanned PDF → Text', '/tools/scanned-pdf-to-text'],
  ['Scanned PDF → Word', '/tools/scanned-pdf-to-word'],
  ['Scanned PDF → Searchable PDF', '/tools/scanned-pdf-to-searchable-pdf'],
  ['Image → Text', '/tools/image-to-text'],
  ['Image → Word', '/tools/image-to-word'],
  ['Handwriting Image → Text', '/tools/handwriting-image-to-text'],
] as const;

export default function OcrGuidePage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 md:px-8 md:pt-36">
        <section className="max-w-3xl">
          <span className="ajn-section-kicker"><ScanLine className="h-3.5 w-3.5" /> OCR guide</span>
          <h1 className="mt-5 text-4xl font-black tracking-[-.045em] md:text-6xl">OCR for scans, images and searchable PDFs.</h1>
          <p className="mt-5 text-base font-medium leading-8 text-slate-600">OCR recognizes visible characters from image-based documents. It is useful when a PDF has no selectable text, but recognition quality depends on the source image, language, layout and handwriting.</p>
        </section>

        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
          <div className="flex items-center gap-3"><Languages className="h-5 w-5 text-blue-700" /><h2 className="text-xl font-black">Supported OCR languages</h2></div>
          <div className="mt-5 flex flex-wrap gap-2">
            {OCR_LANGUAGE_CODES.map((code) => <span key={code} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-800">{OCR_LANGUAGE_LABELS[code]}</span>)}
          </div>
          <p className="mt-4 text-xs font-medium leading-6 text-slate-600">The processing service exposes the languages installed for the current deployment. A tool can show a smaller list if a language pack is unavailable at runtime.</p>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-blue-100 bg-blue-50/55 p-6">
            <h2 className="flex items-center gap-3 text-xl font-black"><FileSearch className="h-5 w-5 text-blue-700" /> Better OCR input</h2>
            <ul className="mt-5 space-y-3 text-sm font-medium leading-6 text-slate-700">
              {['Use a sharp, high-contrast scan.', 'Choose the language that matches most of the page.', 'Keep pages upright; deskew or rotate obvious orientation problems first.', 'Around 200–300 DPI is usually a sensible document-scanning range.', 'Review tables, columns, small print and handwriting after recognition.'].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-blue-700" />{item}</li>)}
            </ul>
          </article>
          <article className="rounded-2xl border border-amber-100 bg-amber-50/65 p-6">
            <h2 className="flex items-center gap-3 text-xl font-black"><ShieldCheck className="h-5 w-5 text-amber-800" /> Accuracy expectations</h2>
            <p className="mt-5 text-sm font-medium leading-7 text-slate-700">AJN PDF does not publish an unsupported universal accuracy percentage. Faint scans, handwriting, decorative fonts, mixed-language pages, complex tables, skew, blur and low resolution can reduce recognition quality. Always review important extracted text before relying on it.</p>
          </article>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black tracking-[-.03em]">OCR workflows</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workflows.map(([label, href]) => <Link key={href} href={href} className="flex min-h-14 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-800 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800">{label}<ArrowRight className="h-4 w-4" /></Link>)}
          </div>
        </section>
      </main>
      <MainFooter />
    </div>
  );
}
