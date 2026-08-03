"use client";

import React from 'react';
import { cn } from '../../lib/utils';

/**
 * AJN Tools Logo - Production Standard
 * This component handles the high-fidelity SVG path animation 
 * and hover states for the AJN Studio brand identity.
 */
export function LogoAnimation({ className, showGlow = false }: { className?: string, showGlow?: boolean }) {
  return (
    <div className={cn("relative flex justify-center items-center select-none group", className)}>
      {showGlow && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-[radial-gradient(circle,#1e3a8a_0%,transparent_70%)] opacity-[0.08] blur-3xl" />
        </div>
      )}
      
      <svg 
        viewBox="0 0 300 120" 
        className="w-full h-full transition-all duration-500 cursor-pointer hover:scale-105 active:scale-95 z-10"
      >
        <defs>
          <linearGradient id="ajn-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#000080" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>

        <g className="logo-paths">
          {/* Path for 'A' */}
          <path d="M20 100 L55 20 L90 100" className="logo-path" />
          {/* Path for 'J' */}
          <path d="M140 20 L140 80 Q140 105 115 100" className="logo-path" />
          {/* Path for 'N' */}
          <path d="M190 100 L190 20 L250 100 L250 20" className="logo-path" />
        </g>
      </svg>

      <style jsx>{`
        .logo-path {
          fill: none;
          stroke: url(#ajn-grad);
          stroke-width: 6;
          stroke-linecap: round;
          stroke-linejoin: round;
          filter: drop-shadow(0 0 6px rgba(30, 58, 138, 0.35));
          transition: stroke-width 0.4s, filter 0.4s;
        }

        svg:hover .logo-path {
          stroke-width: 7;
          filter: drop-shadow(0 0 18px rgba(30, 58, 138, 0.9));
        }
      `}</style>
    </div>
  );
}
