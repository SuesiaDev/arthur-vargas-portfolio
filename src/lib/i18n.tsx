'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { L, Lang } from '@/data/types';

const STORAGE_KEY = 'av.lang';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (value: L) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function readStoredLang(): Lang | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === 'pt' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt');

  useEffect(() => {
    const stored = readStoredLang();
    // Hydrate the preference after mount; SSR always renders the default (pt).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && stored !== 'pt') setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable — preference lasts for this visit only */
    }
  }, []);

  const value = useMemo<LangContextValue>(() => ({ lang, setLang, t: (v: L) => v[lang] }), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}
