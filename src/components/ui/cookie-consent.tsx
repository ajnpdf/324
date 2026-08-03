"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, X, Settings2, Check } from "lucide-react";
import { Button } from "./button";
import { Switch } from "./switch";
import { Badge } from "./badge";
import { cn } from "@/lib/utils";

/**
 * AJN Cookie Consent System - CMP v4.0
 * Compliant: GDPR/AdSense ready with Accept/Reject/Preferences controls.
 * Mechanism: Strictly blocks ad execution until 'advertising' consent is true.
 */

export type ConsentState = {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
};

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  advertising: false,
};

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSettingsMode, setIsSettingsMode] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("ajn_consent_v1");
    if (!saved) {
      // Delay showing to allow page to feel stable
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    } else {
      try {
        setConsent(JSON.parse(saved));
      } catch {
        setConsent(DEFAULT_CONSENT);
      }
    }
  }, []);

  const saveConsent = (newState: ConsentState) => {
    localStorage.setItem("ajn_consent_v1", JSON.stringify(newState));
    setConsent(newState);
    setShow(false);
    
    // Reload to ensure all ad scripts and analytics re-initialize with correct consent
    window.location.reload();
  };

  const handleAcceptAll = () => {
    saveConsent({ necessary: true, analytics: true, advertising: true });
  };

  const handleRejectAll = () => {
    saveConsent({ necessary: true, analytics: false, advertising: false });
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:max-w-md z-[1000]"
        >
          <div className="bg-white/95 backdrop-blur-3xl border border-black/5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] overflow-hidden">
            {!isSettingsMode ? (
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0 border border-primary/10">
                    <Cookie className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black uppercase tracking-tighter text-slate-950">Privacy Check</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                      We use cookies to make tools fast and safe. Your files stay private on your device.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline"
                      onClick={handleRejectAll}
                      className="flex-1 h-10 border-black/5 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-red-50 hover:text-red-500"
                    >
                      Reject
                    </Button>
                    <Button 
                      onClick={handleAcceptAll}
                      className="flex-1 h-10 bg-slate-950 text-white font-black text-[9px] uppercase tracking-widest rounded-xl shadow-lg hover:bg-black transition-all"
                    >
                      Accept All
                    </Button>
                  </div>
                  <button 
                    onClick={() => setIsSettingsMode(true)}
                    className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 hover:text-slate-950 uppercase tracking-widest transition-all p-2"
                  >
                    <Settings2 className="w-3.5 h-3.5" /> Options
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-black uppercase tracking-tighter text-slate-950">Cookie Logic</h3>
                  </div>
                  <button onClick={() => setIsSettingsMode(false)} className="text-slate-400 hover:text-slate-950"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-3">
                  {[
                    { id: 'necessary', label: 'Essential System', desc: 'Required for local processing', mandatory: true },
                    { id: 'analytics', label: 'Analytics', desc: 'Help us improve tools', mandatory: false },
                    { id: 'advertising', label: 'Advertising', desc: 'Personalized ads for you', mandatory: false },
                  ].map((cat) => (
                    <div key={cat.id} className="p-4 bg-slate-50/50 rounded-2xl border border-black/5 flex items-center justify-between gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">{cat.label}</span>
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tight">{cat.desc}</span>
                      </div>
                      {cat.mandatory ? (
                        <Badge className="bg-emerald-500 text-white border-none text-[7px] font-black px-2 h-4 uppercase">Always On</Badge>
                      ) : (
                        <Switch 
                          className="scale-75 origin-right"
                          checked={consent[cat.id as keyof ConsentState]} 
                          onCheckedChange={(val) => setConsent({...consent, [cat.id]: val})} 
                        />
                      )}
                    </div>
                  ))}
                </div>

                <Button onClick={() => saveConsent(consent)} className="w-full h-12 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg border-2 border-white/10">
                  Save Preferences
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Global helper to check for consent before executing tracking or ads.
 */
export function hasConsent(category: keyof ConsentState): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const saved = localStorage.getItem("ajn_consent_v1");
    if (!saved) return false;
    const consent = JSON.parse(saved);
    return !!consent[category];
  } catch {
    return false;
  }
}
