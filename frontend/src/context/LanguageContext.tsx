'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '@/i18n/translations';
import { useAuth } from '@/context/AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // 1. Initial language resolution from localStorage
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang === 'en' || savedLang === 'am') {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    // 2. If user profile has user.settings.preferred_language, sync it
    if (user?.settings?.preferred_language) {
      const userLang = user.settings.preferred_language as Language;
      if ((userLang === 'en' || userLang === 'am') && userLang !== language) {
        setLanguageState(userLang);
        localStorage.setItem('app_language', userLang);
      }
    }
  }, [user?.settings?.preferred_language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback ?? key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
