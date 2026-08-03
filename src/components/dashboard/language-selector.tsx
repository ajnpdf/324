"use client";

import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Globe, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useLanguage } from '../../lib/i18n/language-context';
import { languages } from '../../lib/i18n/translations';
import { useState, useEffect } from 'react';

/**
 * AJN Language Selector - High-Performance Switcher
 * Instant switching with native flag support.
 * Hardened: Hydration guard added for Next.js 15 stability.
 */
export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeLang = languages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 gap-2 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-black/5 rounded-xl transition-all">
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline text-slate-900">
            {mounted ? (activeLang?.native || 'Language') : '...'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-2xl border-black/5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-1">
        <div className="p-3">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Select Language</p>
        </div>
        <DropdownMenuSeparator className="bg-black/5 m-0" />
        <div className="p-1 space-y-0.5">
          {languages.map((lang) => (
            <DropdownMenuItem 
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={cn(
                "flex items-center justify-between gap-2 py-3 cursor-pointer rounded-xl px-4 transition-all",
                language === lang.code ? "bg-primary/5" : "hover:bg-black/5"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest",
                    language === lang.code ? "text-primary" : "text-slate-900"
                  )}>
                    {lang.native}
                  </span>
                  <span className="text-[8px] opacity-40 font-bold uppercase tracking-tight">{lang.name}</span>
                </div>
              </div>
              {language === lang.code && (
                <Check className="w-4 h-4 text-primary" strokeWidth={3} />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
