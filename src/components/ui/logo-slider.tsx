"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface LogoSliderProps {
  logos: React.ReactNode[];
  speed?: number;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * AJN Logo Slider - Cinematic Slow Motion
 * Hardware-accelerated infinite flow with ultra-slow crawl for professional feel.
 */
export function LogoSlider({ 
  logos, 
  speed = 180, 
  direction = 'left',
  pauseOnHover = true,
  className 
}: LogoSliderProps) {
  // Triple logos to ensure a truly seamless infinite loop
  const duplicatedLogos = [...logos, ...logos, ...logos];

  return (
    <div className={cn(
      "relative w-full overflow-hidden py-4 select-none",
      className
    )}>
      {/* High-Fidelity Edge Masks */}
      <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-[#e1b9fa] via-[#e1b9fa]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-[#b8e1fc] via-[#b8e1fc]/80 to-transparent z-20 pointer-events-none" />

      <div 
        className={cn(
          "flex items-center gap-12 w-max animate-marquee whitespace-nowrap will-change-transform",
          direction === 'right' && "animate-marquee-reverse",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
        style={{ 
          animationDuration: `${speed}s`,
        }}
      >
        {duplicatedLogos.map((logo, index) => (
          <div 
            key={index} 
            className="flex-shrink-0 flex items-center justify-center transition-all duration-1000 hover:scale-105"
          >
            {logo}
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.33%, 0, 0); }
        }
        @keyframes marquee-reverse {
          0% { transform: translate3d(-33.33%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse linear infinite;
        }
      `}</style>
    </div>
  );
}
