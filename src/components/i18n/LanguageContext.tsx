// src/components/i18n/LanguageContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, TranslationKey } from './translations';
// In LanguageContext.tsx, add:
export type Language = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'pa';

interface LanguageContextType {
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<'en' | 'hi'>(() => {
    // Get saved language from localStorage or default to 'en'
    const saved = localStorage.getItem('language');
    return (saved === 'hi' ? 'hi' : 'en') as 'en' | 'hi';
  });

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}