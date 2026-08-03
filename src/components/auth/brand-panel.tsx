"use client";

import { Network, Zap, Shield, HardDrive, FileText, ImageIcon, Video, Music, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

const icons = [FileText, ImageIcon, Video, Music];

export function BrandPanel() {
  const [activeIconIdx, setActiveIconIdx] = useState(0);
  const [counter, setCounter] = useState(1998432);

  useEffect(() => {
    const iconInterval = setInterval(() => {
      setActiveIconIdx((prev) => (prev + 1) % icons.length);
    }, 2000);

    const counterInterval = setInterval(() => {
      setCounter((prev) => prev + Math.floor(Math.random() * 5));
    }, 3000);

    return () => {
      clearInterval(iconInterval);
      clearInterval(counterInterval);
    };
  }, []);

  const ActiveIcon = icons[activeIconIdx];

  return (
    <section className="hidden md:flex w-2/5 bg-white/[0.02] backdrop-blur-3xl border-r border-white/5 flex flex-col p-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-white rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="flex items-center gap-3 mb-16 z-10">
        <div className="p-2.5 bg-white rounded-xl shadow-2xl">
          <Network className="w-8 h-8 text-black" />
        </div>
        <span className="font-black text-3xl tracking-tighter text-white">AJN</span>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-12 z-10">
        <div className="space-y-4">
          <h2 className="text-4xl font-black leading-[1.1] tracking-tight text-white uppercase">
            AJN — The All-in-One <br />
            Junction Network
          </h2>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-white/40 animate-pulse" />
            <p className="text-[9px] font-bold tracking-[0.2em] text-white/60 uppercase">
              Every file. One network. Free.
            </p>
          </div>
          <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
            The ultimate real-time intelligent file operating system for modern professional networks.
          </p>
        </div>

        <div className="relative h-32 flex items-center">
          <div className="absolute inset-0 bg-white/5 rounded-3xl border border-white/10 blur-xl"></div>
          <div className="relative flex items-center gap-8 px-8">
            <div className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center animate-bounce">
              <ActiveIcon className="w-8 h-8 text-white transition-all duration-500" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-2 w-32 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white/40 animate-[shimmer_2s_infinite]"></div>
              </div>
              <div className="h-2 w-24 bg-white/5 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white/5 rounded-lg text-white">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white/90">Process in Seconds</p>
              <p className="text-xs text-muted-foreground">Faster than desktop software for any size.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white/5 rounded-lg text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white/90">Bank-Level Security</p>
              <p className="text-xs text-muted-foreground">End-to-end 256-bit encryption for every user.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 p-2 bg-white/5 rounded-lg text-white">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-white/90">Secure Network Vault</p>
              <p className="text-xs text-muted-foreground">Access your files securely from any authorized node.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 mt-auto border-t border-white/5 z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
          Join the Junction
        </p>
        <p className="text-lg font-black tracking-tight text-white/90">
          {counter.toLocaleString()} users trusted us today
        </p>
      </div>
    </section>
  );
}