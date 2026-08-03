
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BLOG_POSTS, getPostBySlug } from '@/lib/blog-data';
import { NightSky } from '@/components/dashboard/night-sky';
import { LogoAnimation } from '@/components/landing/logo-animation';
import { Button } from '@/components/ui/button';
import { MainFooter } from '@/components/landing/main-footer';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Calendar, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: 'Post Not Found' };

  const baseUrl = 'https://ajnpdf.com';
  const url = `${baseUrl}/blog/${slug}`;

  return {
    title: `${post.title} | AJN Studio Insights`,
    description: post.desc,
    alternates: { canonical: url },
    keywords: post.keywords,
    openGraph: {
      title: post.title,
      description: post.desc,
      url: url,
      type: 'article',
      publishedTime: post.date,
      siteName: 'AJN Studio',
      images: [{ url: `${baseUrl}/og-image.jpg` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.desc,
      images: [`${baseUrl}/og-image.jpg`],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="font-black text-[10px] tracking-wider gap-2 uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-24 md:pt-32 pb-32 max-w-4xl mx-auto px-6 md:px-8">
        <article className="space-y-12">
          <header className="space-y-6 text-center md:text-left">
            <div className="flex justify-center md:justify-start">
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">
                {post.tag}
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter uppercase leading-tight text-slate-950 italic">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-y border-black/5 py-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> {post.date}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> {post.readTime}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Helpful
              </div>
            </div>
          </header>

          {/* ARTICLE CONTENT */}
          <div 
            className="prose prose-slate max-w-none 
              prose-headings:text-slate-950 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-headings:italic
              prose-p:text-slate-600 prose-p:font-medium prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base prose-p:uppercase prose-p:tracking-widest
              prose-li:text-slate-600 prose-li:font-bold prose-li:text-xs md:prose-li:text-sm prose-li:uppercase prose-li:tracking-widest
              prose-strong:text-slate-950 prose-strong:font-black
              prose-a:text-primary prose-a:font-black prose-a:no-underline hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

          {/* CALL TO ACTION */}
          <footer className="pt-16 space-y-10">
            <div className="p-10 md:p-16 bg-slate-950 rounded-[3rem] text-white text-center space-y-8 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <Zap className="w-64 h-64 text-primary" />
              </div>
              
              <div className="relative z-10 space-y-4">
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
                  Ready to work <span className="text-primary">privately?</span>
                </h3>
                <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed max-w-xl mx-auto">
                  Join thousands of users in India using AJN Studio for safe, fast, and free document tools.
                </p>
              </div>

              <Link href="/pdf-tools" className="inline-block relative z-10">
                <Button className="h-14 px-12 bg-white text-slate-950 hover:bg-slate-100 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
                  Try All Tools Now
                </Button>
              </Link>
            </div>

            <div className="flex justify-center pt-8">
              <Link href="/blog">
                <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest gap-2">
                   View More Insights <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Button>
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
