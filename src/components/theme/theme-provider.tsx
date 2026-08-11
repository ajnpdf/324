'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  mounted: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'ajn_theme';

function forceLightTheme() {
  const root = document.documentElement;
  root.classList.remove('dark');
  root.dataset.theme = 'light';
  root.style.colorScheme = 'light';
}

/** R6 is intentionally light-only. Kept as a provider for API compatibility. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    forceLightTheme();
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: 'light',
    mounted: true,
    setTheme: () => forceLightTheme(),
    toggleTheme: () => forceLightTheme(),
  }), []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider.');
  return value;
}
