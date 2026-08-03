"use client";

import React, { useEffect, useState } from 'react';

/**
 * AJN Skyline Ambient Backdrop
 * A clean, tech-forward background for the Skyline Modern theme.
 */
export function NightSky() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="fixed inset-0 z-[-1] bg-[#faf9ff]" />;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#faf9ff]">
      {/* Subtle Sky Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(70,122,242,0.06)_0%,transparent_70%)]" />
      
      {/* Secondary Soft Glow */}
      <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
      
      {/* Texture Layer */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] mix-blend-overlay" />
    </div>
  );
}
