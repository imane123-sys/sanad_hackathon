'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Locale, Direction, LOCALES, DEFAULT_LOCALE } from './config';
import arTranslations from './translations/ar.json';
import frTranslations from './translations/fr.json';

type TranslationsMap = typeof arTranslations;

const translations: Record<Locale, TranslationsMap> = {
  ar: arTranslations,
  fr: frTranslations,
};

interface I18nContextType {
  locale: Locale;
  dir: Direction;
  setLocale: (locale: Locale) => void;
  t: (path: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    // Check if saved preference exists
    const saved = localStorage.getItem('sanad_lang') as Locale | null;
    if (saved && (saved === 'ar' || saved === 'fr')) {
      setLocaleState(saved);
      document.documentElement.dir = LOCALES[saved].dir;
      document.documentElement.lang = saved;
    } else {
      document.documentElement.dir = LOCALES[DEFAULT_LOCALE].dir;
      document.documentElement.lang = DEFAULT_LOCALE;
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('sanad_lang', newLocale);
    document.documentElement.dir = LOCALES[newLocale].dir;
    document.documentElement.lang = newLocale;
  };

  const t = (path: string): string => {
    const keys = path.split('.');
    let current: unknown = translations[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = (current as Record<string, unknown>)[key];
      } else {
        // Fallback to default locale (Arabic)
        let fallback: unknown = translations[DEFAULT_LOCALE];
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = (fallback as Record<string, unknown>)[fKey];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }

    return typeof current === 'string' ? current : path;
  };

  return (
    <I18nContext.Provider
      value={{
        locale,
        dir: LOCALES[locale].dir,
        setLocale,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
