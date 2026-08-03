"use client";

import React from 'react';
import { Badge } from '../../components/ui/badge';
import { ExternalLink, Zap } from 'lucide-react';
import { AD_CONFIG } from '../../lib/ad-config';

/**
 * AJN Sponsored Engineering Unit
 * High-fidelity advertisement slot matching the platform aesthetic.
 */
export function SponsoredUnit() {
  return (
    <div className="mt-auto px-3 py-6 border-t border-black/5 bg-white/10">
      <div 
        className="p-4 rounded-[1.5rem] bg-white/40 border border-black/5 backdrop-blur-xl shadow-sm space-y-3 group cursor-pointer hover:border-primary/20 transition-all"
        onClick={() => window.open('https://ajn.io/pro', '_blank')}
      >
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-[7px] font-black tracking-widest uppercase border-black/10 text-slate-950/40 px-2 h-4">
            Sponsored Unit
          </Badge>
          <ExternalLink className="w-3 h-3 text-slate-950/20 group-hover:text-primary transition-colors" />
        </div>
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-tighter text-slate-950">
              Fast Optimization
            </p>
          </div>
          <p className="text-[9px] font-bold text-slate-950/40 uppercase leading-tight tracking-wide">
            Accelerate your workflow with AJN Pro mastery.
          </p>
        </div>

        {/* AdMob Mapping Data */}
        <span className="hidden" data-ad-unit={AD_CONFIG.units.banner}></span>
        <span className="hidden" data-app-id={AD_CONFIG.appId}></span>
      </div>
    </div>
  );
}