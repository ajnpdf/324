
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, LanguageCode } from './translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');

  useEffect(() => {
    const saved = localStorage.getItem('selectedLanguage') as LanguageCode;
    if (saved && translations[saved]) {
      setLanguageState(saved);
      document.documentElement.lang = saved;
    } else {
      const browserLang = navigator.language.split('-')[0] as LanguageCode;
      const target = translations[browserLang] ? browserLang : 'en';
      setLanguageState(target);
      document.documentElement.lang = target;
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem('selectedLanguage', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  const t = useCallback((key: string): string => {
    const translation = translations[language]?.[key];
    if (translation) return translation;
    const fallback = translations['en']?.[key];
    if (fallback) return fallback;
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
