import { ToolWorkspaceClient } from '@/components/junction/tool-workspace-client';
import { ALL_TOOLS } from '@/lib/tools-data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { CheckCircle2, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Script from 'next/script';
import Link from 'next/link';
import { AdSenseUnit } from '@/components/adsense-unit';
import { AdsMultiplex } from '@/components/ads-multiplex';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    slug: tool.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = ALL_TOOLS.find(t => t.id === slug);
  
  if (!tool) return { title: 'Tool Not Found' };

  const baseUrl = 'https://www.ajnpdf.com';
  const url = `${baseUrl}/${slug}`;

  return {
    title: `${tool.name} Online Free | Private & Fast - AJN Studio`,
    description: tool.longDesc.slice(0, 160),
    alternates: { canonical: url },
    keywords: tool.keywords.join(', '),
    openGraph: {
      title: `${tool.name} | AJN Studio Document Node`,
      description: tool.longDesc.slice(0, 160),
      url: url,
      type: 'website',
      siteName: 'AJN Studio',
    },
    twitter: {
      card: 'summary_large_image',
      title: tool.name,
      description: tool.desc,
    },
  };
}

export default async function DynamicToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = ALL_TOOLS.find(t => t.id === slug);
  
  if (!tool) {
    notFound();
  }

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "operatingSystem": "All",
    "applicationCategory": "MultimediaApplication",
    "description": tool.longDesc.slice(0, 200),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": tool.faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.a
      }
    }))
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-slate-950 bg-transparent">
      <Script 
        id="tool-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Script 
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <section className="bg-transparent relative z-10">
        <ToolWorkspaceClient id={slug} />
      </section>

      <main className="max-w-4xl mx-auto px-6 md:px-8 py-10 md:py-16 space-y-20">
        
        <section id="overview" className="space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">Overview</Badge>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none italic text-slate-900">
              About <span className="text-primary/40">{tool.name}</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 prose prose-slate max-w-none space-y-6">
              <p className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                {tool.longDesc}
              </p>
              
              <div className="flex items-center gap-3 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl shadow-sm">
                <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Privacy Verified</p>
                  <p className="text-[8px] font-bold uppercase text-slate-400 leading-tight">
                    Tools run locally in your browser.
                  </p>
                </div>
              </div>
            </div>

            <Card className="lg:col-span-5 bg-white border-black/5 rounded-[2rem] shadow-xl overflow-hidden group border-2">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-black uppercase tracking-tight">Key Benefits</h3>
                </div>
                <ul className="space-y-4">
                  {tool.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-md shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" strokeWidth={4} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{b}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <div className="py-2">
          <AdSenseUnit />
        </div>

        <section id="workflow" className="space-y-10 bg-white/40 backdrop-blur-xl border border-black/5 rounded-[3rem] p-10 md:p-14 shadow-xl border-2">
           <div className="text-center space-y-3">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">Step-by-Step</Badge>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">How to use <span className="text-primary/40">{tool.name}</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tool.instructions.map((step, i) => (
              <div key={i} className="space-y-3 text-center group">
                 <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto font-black text-[10px] shadow-lg group-hover:bg-primary transition-all">
                    {i + 1}
                 </div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-900 leading-relaxed px-2">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="space-y-10 bg-slate-950 rounded-[2.5rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
          <div className="text-center space-y-3 relative z-10 mb-8">
            <Badge className="bg-primary text-white border-none text-[9px] font-black px-3 h-6 uppercase tracking-widest rounded-full">FAQ Center</Badge>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter italic">Common <span className="text-primary">Questions</span></h2>
          </div>

          <Accordion type="single" collapsible className="w-full max-w-2xl mx-auto space-y-3 relative z-10">
            {tool.faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border-none rounded-xl bg-white/5 px-6 shadow-sm overflow-hidden backdrop-blur-md">
                <AccordionTrigger className="hover:no-underline py-5">
                  <span className="text-left text-[10px] font-black uppercase tracking-[0.15em] text-white/90">{faq.q}</span>
                </AccordionTrigger>
                <AccordionContent className="pb-6">
                  <p className="text-[9px] font-bold text-white/50 uppercase tracking-[0.15em] leading-relaxed italic">
                    {faq.a}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <div className="pt-4">
          <AdsMultiplex />
        </div>

        <section className="text-center space-y-8 pt-10 pb-20">
          <div className="space-y-3">
             <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-tight italic text-slate-900">
              Ready to work <br /><span className="text-primary/40">privately?</span>
            </h3>
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">AJN STUDIO — NO ACCOUNTS • NO COST</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pdf-tools">
              <Button className="h-14 px-12 bg-slate-950 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-xl hover:scale-105 transition-all gap-2 border-2 border-white/10">
                Explore All {ALL_TOOLS.length} Tools <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
