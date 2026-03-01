'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, Translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ivt_lang';

/**
 * Get initial language from localStorage (client-side only)
 * Returns 'de' as default if localStorage is not available (SSR)
 */
function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'de'; // SSR default
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'de' || stored === 'en') {
      return stored as Language;
    }
  } catch (error) {
    // localStorage might be disabled or unavailable
    console.warn('[IVT][i18n] Failed to read language from localStorage:', error);
  }

  return 'de';
}

/**
 * Save language to localStorage (client-side only)
 */
function saveLanguage(lang: Language): void {
  if (typeof window === 'undefined') {
    return; // SSR - skip
  }

  try {
    localStorage.setItem(STORAGE_KEY, lang);
    // Update html lang attribute
    document.documentElement.lang = lang;
  } catch (error) {
    console.warn('[IVT][i18n] Failed to save language to localStorage:', error);
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with default 'de', will be updated on mount if localStorage has a value
  const [language, setLanguageState] = useState<Language>('de');

  // On mount, read from localStorage and update state
  useEffect(() => {
    const initialLang = getInitialLanguage();
    setLanguageState(initialLang);
    // Set html lang attribute on mount
    if (typeof document !== 'undefined') {
      document.documentElement.lang = initialLang;
    }
  }, []);

  // Wrapper for setLanguage that also persists to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language] as Translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
