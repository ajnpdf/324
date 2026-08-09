'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLocalizedTool } from './tool-translations';
import { LanguageCode, TranslationVars, languages, translateKey, translateVisibleText, translations } from './translations';

const STORAGE_KEY = 'ajn-language';

interface LanguageContextType {
  language: LanguageCode;
  languages: typeof languages;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, vars?: TranslationVars) => string;
  text: (value: string) => string;
  tool: (id: string, fallbackName: string, fallbackDesc: string, fallbackKeywords?: string[]) => { name: string; desc: string; aliases: string[] };
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
    const browser = window.navigator.language.split('-')[0] as LanguageCode;
    const target = saved && translations[saved] ? saved : translations[browser] ? browser : 'en';
    setLanguageState(target);
    document.documentElement.lang = target;
    document.documentElement.dataset.language = target;
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    if (!translations[lang]) return;
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dataset.language = lang;
    window.dispatchEvent(new CustomEvent('ajn-language-changed', { detail: { language: lang } }));
  }, []);

  const t = useCallback((key: string, vars?: TranslationVars) => translateKey(language, key, vars), [language]);
  const text = useCallback((value: string) => translateVisibleText(language, value), [language]);
  const tool = useCallback((id: string, fallbackName: string, fallbackDesc: string, fallbackKeywords: string[] = []) => getLocalizedTool(language, id, fallbackName, fallbackDesc, fallbackKeywords), [language]);

  const value = useMemo(() => ({ language, languages, setLanguage, t, text, tool }), [language, setLanguage, t, text, tool]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
