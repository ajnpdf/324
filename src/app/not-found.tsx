"use client";

import Link from 'next/link';
import { useState, Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { NightSky } from '@/components/dashboard/night-sky';
import { Home, Search as SearchIcon, FileText, Scissors, Shrink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LogoAnimation } from '@/components/landing/logo-animation';

/**
 * AJN Production 404 Node - Hardened v15.6
 * Fixed: Safely handles hydration guards for Next.js 15 stability.
 */
function NotFoundContent() {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const goSearch = () => {
    if (search.trim()) {
      router.push(`/pdf-tools?q=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/pdf-tools');
    }
  };

  const quickTools = [
    { name: 'Merge PDF', href: '/tools/merge-pdf', icon: FileText },
    { name: 'Split PDF', href: '/tools/split-pdf', icon: Scissors },
    { name: 'Compress PDF', href: '/tools/compress-pdf', icon: Shrink },
    { name: 'Word to PDF', href: '/tools/word-pdf', icon: FileText },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#c3d9fa] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-32 h-16 bg-white/20 rounded-2xl" />
          <div className="w-48 h-4 bg-white/10 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-950 font-sans flex flex-col relative overflow-x-hidden bg-transparent">
      <NightSky />
      
      <nav className="px-6 md:px-10 py-4 border-b border-black/5 bg-white/40 backdrop-blur-xl flex items-center justify-between shrink-0 z-50 shadow-sm">
        <Link href="/" className="flex items-center group">
          <LogoAnimation className="w-16 h-8 md:w-20 md:h-10" showGlow={false} />
        </Link>
        <div className="hidden sm:flex gap-8">
          <Link href="/pdf-tools" className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">Tools</Link>
          <Link href="/security" className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">Security</Link>
          <Link href="/about" className="text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">Our Story</Link>
        </div>
      </nav>

      <main className="flex-1 relative flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none text-[clamp(160px,28vw,300px)] font-black tracking-[-0.06em] text-primary/5 z-0 leading-none uppercase italic">
          404
        </div>

        <div className="relative z-10 space-y-8 max-w-[560px] w-full flex flex-col items-center">
          <div className="space-y-4">
            <span className="text-[11px] font-black tracking-[0.2em] text-primary bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full uppercase">
              Page Not Found
            </span>

            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-slate-900 uppercase italic">
              Access <br /><span className="text-primary/40">Denied</span>
            </h1>

            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[380px] mx-auto opacity-80">
              The page you are looking for does not exist or has been moved within the network.
            </p>
          </div>

          <div className="w-full max-w-[420px] relative group">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goSearch()}
              className="w-full bg-white/60 border border-black/5 rounded-2xl py-4 pl-12 pr-24 text-slate-950 text-sm font-bold outline-none focus:border-primary/40 transition-all shadow-xl backdrop-blur-xl"
            />
            <button 
              onClick={goSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Search
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full max-w-[500px] mt-4">
            {quickTools.map((tool) => (
              <Link 
                key={tool.name} 
                href={tool.href}
                className="bg-white/40 border border-black/5 rounded-2xl p-4 text-left hover:border-primary/40 hover:bg-white/60 transition-all flex flex-col gap-1 shadow-sm group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] text-slate-400 font-black tracking-widest uppercase group-hover:text-primary transition-colors">Popular Unit</span>
                  <tool.icon className="w-3.5 h-3.5 text-primary opacity-40 group-hover:opacity-100" />
                </div>
                <span className="text-[11px] text-slate-950 font-black uppercase tracking-tight">{tool.name}</span>
              </Link>
            ))}
          </div>

          <Link href="/">
            <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest gap-2 text-slate-500 hover:text-primary transition-all">
              <Home className="w-3.5 h-3.5" /> Return Home
            </Button>
          </Link>
        </div>
      </main>

      <footer className="px-10 py-8 border-t border-black/5 bg-white/40 backdrop-blur-xl flex flex-col items-center gap-4 shrink-0 z-50">
        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">
          AJN Core &bull; 2026
        </span>
      </footer>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#c3d9fa]" />}>
      <NotFoundContent />
    </Suspense>
  );
}
