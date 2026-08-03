"use client";

import { motion } from 'framer-motion';
import { NightSky } from '../../../components/dashboard/night-sky';
import { LogoAnimation } from '../../../components/landing/logo-animation';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Shrink, ShieldCheck, Zap, HelpCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { MainFooter } from '../../../components/landing/main-footer';
import { Badge } from '../../../components/ui/badge';

export default function CompressBlogArticle() {
  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-24 h-12" showGlow={false} />
        </Link>
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2 uppercase">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
          </Button>
        </Link>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-4xl mx-auto px-8">
        <article className="space-y-12">
          <header className="space-y-6">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-black uppercase px-4 h-7 tracking-widest rounded-full">Practical Guide</Badge>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none text-slate-950">
              How to Compress <br />
              <span className="text-primary/40">a PDF Without</span> <br />
              Losing Quality
            </h1>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-black/5 pb-8">
              <span>Published: Feb 21, 2026</span>
              <span>•</span>
              <span>By ANJAN STUDIO</span>
              <span>•</span>
              <span className="text-emerald-600 flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> 100% Private</span>
            </div>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 font-medium leading-relaxed text-sm md:text-base uppercase tracking-widest">
            <p>
              We have all been there. You have a professional PDF document ready to send, but when you try to upload it to a government portal, college admission site, or even attach it to an email, you see that dreaded message: "File too large."
            </p>

            <p>
              In India, many important websites like the <strong>EPFO</strong>, <strong>MCA</strong>, or various university portals have strict limits—often as small as 500KB or 2MB. Getting your high-quality document down to that size without making the text unreadable can feel impossible. But it doesn't have to be.
            </p>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter pt-4">The Challenge: Quality vs. Size</h2>
            <p>
              When you compress a PDF, you are essentially asking the software to find ways to take up less space. Usually, this means making images a lower resolution or removing extra data hidden inside the file. If you over-compress, your text becomes blurry and your images look "pixelated."
            </p>

            <div className="p-10 bg-slate-950 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Zap className="w-32 h-32" />
              </div>
              <h3 className="text-2xl font-black uppercase italic mb-4 relative z-10 text-white">Why AJN is Different</h3>
              <p className="text-xs md:text-sm font-bold opacity-80 leading-relaxed relative z-10">
                Most online tools require you to upload your sensitive bank statements or personal IDs to their servers. <strong>AJN Studio works differently.</strong> Our tool runs locally in your browser. This means your file stays on your computer the entire time. It's faster, safer, and much more private.
              </p>
            </div>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter pt-4">Step-by-Step: How to Compress Safely</h2>
            <ol className="list-decimal pl-6 space-y-4">
              <li><strong>Visit the Tool:</strong> Go to the <Link href="/tools/compress-pdf" className="text-primary font-black hover:underline">Compress PDF</Link> tool on AJN Studio.</li>
              <li><strong>Add Your File:</strong> Simply drop your PDF into the box. Remember, it doesn't upload to any server!</li>
              <li><strong>Select Your Level:</strong> Choose "Recommended" for most uses. If you need a tiny file for a government portal, try "Extreme."</li>
              <li><strong>Download:</strong> Your new, smaller PDF is ready in seconds.</li>
            </ol>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter pt-4">3 Pro Tips for Perfect Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
              {[
                { title: "Avoid Extreme Early", desc: "Always start with 'Recommended' to see if it meets your size limit first." },
                { title: "Check Text Clarity", desc: "After downloading, zoom in on small text to make sure it is still readable." },
                { title: "Local is Best", desc: "Using local tools like AJN ensures your private data never transits the internet." }
              ].map((item, i) => (
                <div key={i} className="p-6 bg-white border border-black/5 rounded-2xl space-y-2 shadow-sm">
                  <h4 className="font-black text-xs text-primary uppercase tracking-tight">{item.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
            </div>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter pt-4">Common Mistakes to Avoid</h2>
            <p>
              Many users make the mistake of using "Extreme" compression for documents that contain a lot of fine print or detailed charts. If you are submitting a legal contract or a technical drawing, stick to a higher quality setting. Another common error is using untrusted websites for private documents—always look for tools that process files locally.
            </p>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter pt-4">Frequently Asked Questions</h2>
            <div className="space-y-6 pt-2">
              <div className="space-y-2">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" /> Is my data safe during compression?
                </h4>
                <p className="text-[10px] font-bold text-slate-500 pl-6">Yes. AJN Studio processes everything in your browser memory. Your files are never stored or seen by us.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" /> Will the file have a watermark?
                </h4>
                <p className="text-[10px] font-bold text-slate-500 pl-6">Never. All our tools are 100% free and do not add any watermarks to your documents.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-primary" /> Do I need to create an account?
                </h4>
                <p className="text-[10px] font-bold text-slate-500 pl-6">No signup is required. You can start compressing your files immediately.</p>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter pt-8">Conclusion</h2>
            <p>
              Managing large PDF files shouldn't be a hassle or a security risk. By using the right settings and a privacy-focused tool like AJN Studio, you can get your documents ready for any portal in seconds.
            </p>
          </div>

          <footer className="pt-12 border-t border-black/5 flex flex-col items-center gap-8">
            <Link href="/tools/compress-pdf">
              <Button className="h-16 px-12 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:scale-105 transition-all gap-3 border-2 border-white/20">
                Try Secure Compression <Shrink className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/5 rounded-full border border-emerald-500/10">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Local Processing Active</span>
            </div>
          </footer>
        </article>
      </main>

      <MainFooter />
    </div>
  );
}
