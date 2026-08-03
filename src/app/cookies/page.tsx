
"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Cookie, 
  Info, 
  ShieldCheck, 
  ArrowLeft,
  Zap,
  CreditCard,
  Lock,
  Search,
  Mail,
  Activity,
  MousePointer2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainFooter } from '@/components/landing/main-footer';
import { NightSky } from '@/components/dashboard/night-sky';

/**
 * AJN COOKIE POLICY — Tracking Transparency Node v5.0
 * Expanded: Categories, AdSense logic, and opt-out flows.
 */
export default function CookiePolicyPage() {
  const categories = [
    {
      title: "Essential System Cookies",
      icon: Zap,
      content: "These allow the AJN platform to maintain your tool configuration and processing state locally. They are strictly required for the functioning of the browser-native engine and session synchronization."
    },
    {
      title: "Preference & Functional",
      icon: MousePointer2,
      content: "Used to remember your UI choices, such as selected language or recently used tools, across sessions without requiring a user account registration."
    },
    {
      title: "Analytics Tracking",
      icon: Activity,
      content: "Anonymous cookies that help us understand how users interact with the tool directory, allowing us to fix processing errors and optimize binary speed."
    },
    {
      title: "Advertising (Google AdSense)",
      icon: CreditCard,
      content: "Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites. Google’s use of advertising cookies enables it and its partners to serve ads based on your visits to our site."
    }
  ];

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-primary/30 relative overflow-x-hidden">
      <NightSky />
      <header className="sticky top-0 z-[100] h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <span className="text-2xl font-black tracking-tighter text-primary italic">AJN<span className="text-slate-950">Studio</span></span>
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-950 font-black text-[10px] uppercase tracking-widest gap-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Back Home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-32">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-[10px] font-black px-4 h-7 uppercase tracking-[0.2em] rounded-full mb-6">Transparency Node</Badge>
          <h1 className="text-5xl md:text-8xl font-black text-slate-950 tracking-tighter uppercase leading-[0.9] mb-6 italic">
            Cookie <br /><span className="text-primary/40">Logic</span>
          </h1>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.3em] pb-12 border-b border-black/5">
            Updated: February 21, 2026 &nbsp;·&nbsp; Study Connect Solutions Pvt Ltd
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {categories.map((c, i) => (
            <Card key={i} className="bg-white/40 backdrop-blur-xl border-black/5 p-10 rounded-[3rem] shadow-xl group hover:border-primary/20 transition-all border-2">
              <CardContent className="p-0 space-y-6">
                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                  <c.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950 uppercase tracking-tight">{c.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium uppercase tracking-widest">{c.content}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-12">
          <div className="p-10 bg-white border-2 border-black/5 rounded-[3.5rem] shadow-2xl space-y-8">
            <h3 className="text-2xl font-black text-slate-950 uppercase tracking-tighter flex items-center gap-4">
              <Lock className="w-6 h-6 text-primary" /> Personalized Ads Control
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium uppercase tracking-widest">
              You can opt out of personalized advertising by visiting Google Ads Settings. Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the Network Advertising Initiative opt-out page.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="https://www.google.com/settings/ads" target="_blank">
                <Button className="h-12 px-8 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg">Google Ads Settings</Button>
              </Link>
              <Link href="https://www.aboutads.info" target="_blank">
                <Button variant="outline" className="h-12 px-8 border-black/5 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-sm">AboutAds.info</Button>
              </Link>
            </div>
          </div>

          <div className="p-10 bg-slate-950 border border-white/5 rounded-[3.5rem] space-y-6 text-white text-center">
            <h3 className="text-xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
              <Activity className="w-5 h-5 text-primary" /> Browser Governance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium uppercase tracking-[0.2em] max-w-2xl mx-auto">
              You can configure your browser to block or alert you about these cookies, but some parts of the AJN secure processing buffer may not work correctly without them.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-primary">
                <Mail className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase select-all">ajnpdf1@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MainFooter />
    </div>
  );
}
