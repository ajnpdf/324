'use client';

import { motion } from 'framer-motion';
import { NightSky } from '../../components/dashboard/night-sky';
import { LogoAnimation } from '../../components/landing/logo-animation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Send, Mail, Globe, ShieldCheck, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '../../hooks/use-toast';
import SocialFlipButton from "@/components/ui/social-flip-button";
import { useEffect, useState } from 'react';

/**
 * AJN Contact Page - Production Stabilized v15.15
 * Corrected: Verified proper nesting of all layout nodes and hydration safety.
 */
export default function ContactPage() {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      variant: "success",
      title: "Message sent",
      description: "Our team will respond to your request shortly.",
    });
  };

  if (!mounted) return <div className="min-h-screen bg-[#c3d9fa]" />;

  return (
    <div className="min-h-screen text-slate-950 font-sans relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/60 backdrop-blur-xl border-b border-black/5 z-[60] px-4 md:px-8 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <div className="flex items-center gap-4">
          <nav className="hidden lg:flex items-center gap-8 mr-8">
            <Link href="/" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Home</Link>
            <Link href="/pdf-tools" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Tools</Link>
            <Link href="/security" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Security</Link>
            <Link href="/about" className="text-[10px] font-bold text-slate-400 hover:text-primary uppercase tracking-[0.2em]">Our Story</Link>
          </nav>
          <Link href="/">
            <Button variant="ghost" size="sm" className="font-bold text-[10px] tracking-wider gap-2 uppercase h-9">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-32 max-w-6xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          <section className="lg:col-span-5 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-7 uppercase tracking-widest rounded-full mb-2">Help & Support</Badge>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 uppercase leading-none">
                Contact <span className="text-primary/40">Us</span>
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                Connect with our team for technical help, feedback, or general inquiries.
              </p>
            </motion.div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white border border-black/5 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Email Address</p>
                  <p className="text-lg font-black select-all text-slate-950">ajnpdf1@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-white border border-black/5 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Location</p>
                  <p className="text-lg font-black text-slate-950">India • Global Support</p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-[3rem] space-y-4">
              <div className="flex items-center gap-3 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
                <p className="text-[11px] font-black uppercase tracking-widest">Privacy Guarantee</p>
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest text-left">
                We never share your messages or personal details. Your privacy is our priority.
              </p>
            </div>
          </section>

          <section className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/60 border-black/5 rounded-[3.5rem] shadow-2xl p-10 backdrop-blur-xl relative overflow-hidden">
                <CardContent className="p-0 space-y-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Send us a message</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Your Name</Label>
                        <Input required placeholder="Full Name" className="h-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Email Address</Label>
                        <Input required type="email" placeholder="your@email.com" className="h-12 bg-white/5 border-black/5 rounded-xl font-bold shadow-sm focus:ring-primary/20" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message</Label>
                      <Textarea required placeholder="Write your message here..." className="min-h-[180px] bg-white/5 border-black/5 rounded-[2rem] font-bold p-6 shadow-sm focus:ring-primary/20" />
                    </div>

                    <Button className="w-full h-16 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl shadow-xl hover:scale-[1.02] transition-all gap-3 border-2 border-white/10">
                      Send Message <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </div>

        <div className="mt-24">
          <div className="relative flex h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-[3rem] bg-white/40 backdrop-blur-xl border border-black/5 mx-auto max-w-6xl shadow-xl">
              <div className="mb-8 text-center space-y-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black px-4 h-6 uppercase tracking-widest rounded-full">Community</Badge>
                <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-950">Join our <span className="text-primary/40">Network</span></h2>
              </div>
              <SocialFlipButton />
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-black/5 flex flex-col items-center gap-6 bg-white/60 backdrop-blur-xl">
        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] text-center">
          © 2026 AJN (ANJAN) STUDIO. All rights reserved.
        </p>
        <div className="flex items-center gap-3 px-6 py-2.5 bg-white border border-black/5 rounded-full shadow-lg hover:scale-105 transition-all duration-500">
          <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest flex items-center">
            Made in India
            <span className="animate-heart-beat ml-2 text-red-500 text-4xl leading-none inline-block">❤️</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
