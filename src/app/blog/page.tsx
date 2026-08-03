import { Metadata } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';
import { NightSky } from '@/components/dashboard/night-sky';
import { LogoAnimation } from '@/components/landing/logo-animation';
import { Button } from '@/components/ui/button';
import { MainFooter } from '@/components/landing/main-footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Clock, 
  ArrowRight, 
  Zap,
  BookOpen,
  Calendar,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

/**
 * AJN Blog Hub - Production Edition v15.5
 * Server-rendered for maximum crawlability and SEO indexing.
 */

export const metadata: Metadata = {
  title: 'Insights & Guides | AJN Studio - Free Private PDF Tools',
  description: 'Professional guides on PDF optimization, security, and document engineering. Learn how to work with your files safely and efficiently.',
  alternates: {
    canonical: 'https://ajnpdf.com/blog',
  },
  openGraph: {
    title: 'AJN Studio Insights - Professional Document Engineering',
    description: '10+ comprehensive guides on PDF management, privacy, and digital productivity.',
    url: 'https://ajnpdf.com/blog',
    type: 'website',
    siteName: 'AJN Studio',
  }
};

export default function BlogHubPage() {
  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 uppercase h-9">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-24 md:pt-32 pb-32 max-w-7xl mx-auto px-6 md:px-8">
        <section className="space-y-16">
          <div className="text-center space-y-4">
            <div className="flex justify-center mb-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-widest rounded-full">
                AJN Intelligence
              </Badge>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-slate-900 uppercase leading-none italic">
              Platform <span className="text-primary/40">Insights</span>
            </h1>
            <p className="text-sm md:text-lg font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
              Professional guidance on document management, privacy, and local engineering.
            </p>
          </div>

          {/* ARTICLE GRID - Pure HTML for Bot Discovery */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {BLOG_POSTS.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`}>
                <Card className="h-full bg-white/40 border-black/5 hover:border-primary/20 transition-all rounded-[2.5rem] shadow-xl backdrop-blur-xl group overflow-hidden border-2">
                  <CardContent className="p-8 md:p-10 space-y-6 flex flex-col h-full">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase px-2 h-5 tracking-widest">
                        {article.tag}
                      </Badge>
                      <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase">
                        <Calendar className="w-3 h-3" /> {article.date}
                      </div>
                    </div>
                    
                    <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner border border-primary/5">
                      <article.icon className="w-6 h-6" />
                    </div>

                    <div className="space-y-3 flex-1">
                      <h3 className="text-xl font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors italic">
                        {article.title}
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed line-clamp-4 opacity-80">
                        {article.desc}
                      </p>
                    </div>
                    
                    <div className="pt-6 border-t border-black/5 flex items-center justify-between text-primary">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">{article.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2 font-black uppercase text-[10px] tracking-widest group-hover:underline">
                        Read Guide <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* LOWER CTA */}
          <div className="p-12 md:p-20 bg-primary/5 border border-primary/10 rounded-[4rem] text-center space-y-8 shadow-inner relative overflow-hidden">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
               <BookOpen size={400} />
             </div>
             <div className="space-y-4 relative z-10">
               <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Weekly Protocols</h2>
               <p className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                 We publish fresh document engineering guides every Tuesday. Check back for the latest safety protocols and local productivity units.
               </p>
               <div className="flex items-center justify-center gap-3 pt-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">All Content Verified Accurate</span>
               </div>
             </div>
          </div>
        </section>
      </main>

      <MainFooter />
    </div>
  );
}
