
"use client";

import Link from 'next/link';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  CircleCheck, 
  Send, 
  Mail, 
  ShieldCheck, 
  Globe, 
  Youtube,
  ArrowRight,
  ChevronRight,
  Lock as LockIcon,
  Search,
  BookOpen,
  Info,
  Zap,
  Heart
} from 'lucide-react';
import { LogoAnimation } from './logo-animation';
import { useLanguage } from '../../lib/i18n/language-context';
import { cn } from '../../lib/utils';
import { ALL_TOOLS } from '../../lib/tools-data';

/**
 * AJN Master Footer - Production Standard v22.0
 * Corrected: Removed restricted strings for AdSense compliance.
 */
export function MainFooter() {
  const { t } = useLanguage();
  
  const coreTools = [
    { name: "Merge PDF", href: "/merge-pdf-online" },
    { name: "Split PDF", href: "/split-pdf-online" },
    { name: "Compress PDF", href: "/compress-pdf-online" },
    { name: "Organize PDF", href: "/organize-pdf-online" },
    { name: "Word to PDF", href: "/word-to-pdf-online" },
    { name: "Excel to PDF", href: "/excel-to-pdf-online" },
    { name: "PDF to ZIP", href: "/pdf-to-zip-online" },
  ];

  const trustBadges = [
    { text: "Safe Browsing Verified", icon: Globe, color: "text-blue-500" },
    { text: "Securely Encrypted", icon: LockIcon, color: "text-slate-900" },
    { text: "Privacy-First Node", icon: ShieldCheck, color: "text-emerald-600" },
    { text: "Standard Compliant", icon: CircleCheck, color: "text-blue-600" }
  ];

  const socials = [
    { icon: Twitter, href: "https://x.com/ajnpdf16800" },
    { icon: Facebook, href: "https://www.facebook.com/share/1XJC6U1m7w/" },
    { icon: Instagram, href: "https://www.instagram.com/ajnpdf.in" },
    { icon: Youtube, href: "https://www.youtube.com/channel/UC67g5gmuht1iNXpwn0zlIPg" },
    { icon: Send, href: "https://t.me/AJNPDF" },
    { icon: Mail, href: "mailto:ajnpdf1@gmail.com" }
  ];

  return (
    <footer className="pt-16 md:pt-24 pb-10 border-t border-black/5 flex flex-col items-center gap-12 md:gap-16 bg-white/60 backdrop-blur-xl rounded-t-[2.5rem] md:rounded-t-[3.5rem] mt-12 relative overflow-hidden text-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(30,58,138,0.03)_0%,transparent_50%)] pointer-events-none" />

      <div className="max-w-7xl w-full px-6 md:px-8 flex flex-wrap justify-center gap-3 md:gap-4 relative z-10">
        {trustBadges.map((badge, i) => (
          <div 
            key={i} 
            className="px-4 py-2 bg-white border border-black/5 rounded-full shadow-sm flex items-center gap-2.5 group hover:border-primary/20 transition-all cursor-default"
          >
            <badge.icon className={cn("w-3 h-3 md:w-3.5 md:h-3.5", badge.color)} />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-700">{badge.text}</span>
          </div>
        ))}
      </div>

      <div className="max-w-7xl w-full px-6 md:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left relative z-10">
        <div className="space-y-6">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
            AJN Studio provides {ALL_TOOLS.length} professional tools designed for speed and privacy. We are committed to a safe, fast, and free document network.
          </p>
          <div className="space-y-4">
            <p className="text-[8px] font-black uppercase text-primary tracking-widest">Connect with us</p>
            <div className="flex flex-wrap gap-2">
              {socials.map((s, i) => (
                <Link key={i} href={s.href} target="_blank" className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center cursor-pointer hover:bg-primary hover:text-white transition-all">
                  <s.icon className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 border-b border-black/5 pb-2">Common Tools</h4>
          <nav className="flex flex-col gap-3">
            {coreTools.map(t => (
              <Link key={t.name} href={t.href} className="text-[9px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group">
                <ChevronRight className="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" /> {t.name}
              </Link>
            ))}
            <Link href="/pdf-tools" className="text-[9px] font-black text-primary uppercase tracking-widest pt-2 flex items-center gap-2 group">
              View All {ALL_TOOLS.length} Tools <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </nav>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 border-b border-black/5 pb-2">Platform</h4>
          <nav className="flex flex-col gap-3">
            {[
              { n: "Pricing", h: "/pricing", i: Zap },
              { n: "Security", h: "/security", i: LockIcon },
              { n: "Transparency", h: "/transparency", i: Search },
              { n: "Help Center", h: "/faq", i: Info },
              { n: "Insights", h: "/blog", i: BookOpen },
              { n: "Our Story", h: "/about", i: Heart }
            ].map(l => (
              <Link key={l.n} href={l.h} className="text-[9px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group">
                <l.i className="w-3 h-3 opacity-20 group-hover:opacity-100" /> {l.n}
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 border-b border-black/5 pb-2">Legal Node</h4>
          <nav className="flex flex-col gap-3">
            {[
              { n: "Privacy Policy", h: "/privacy" },
              { n: "Terms & Conditions", h: "/terms" },
              { n: "Cookie Policy", h: "/cookies" },
              { n: "Legal Disclaimer", h: "/disclaimer" },
              { n: "DMCA Directive", h: "/dmca" },
              { n: "Contact Support", h: "/contact" }
            ].map(l => (
              <Link key={l.n} href={l.h} className="text-[9px] font-bold text-slate-500 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-2 group">
                <ShieldCheck className="w-2.5 h-2.5 opacity-20 group-hover:opacity-100" /> {l.n}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl w-full px-6 md:px-8 border-t border-black/5 pt-8 relative z-10 flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/5 px-6 py-2 rounded-full border border-emerald-500/10 text-center shadow-sm">
          <LockIcon className="w-3.5 h-3.5 shrink-0" />
          Most tools run on your device. Server-assisted tools use temporary secure processing.
        </div>
        <div className="text-center space-y-1">
          <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">© 2026 AJN STUDIO</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">Study Connect Solutions Pvt Ltd &bull; Made in India with ❤️</p>
        </div>
      </div>
    </footer>
  );
}
