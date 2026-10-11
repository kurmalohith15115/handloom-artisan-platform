import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import te from '../locales/te.json';

const LanguageContext = createContext(null);

const dictionaries = { en, te };

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('handloom_language') || 'en';
  });

  const setLanguage = (lang) => {
    if (dictionaries[lang]) {
      setLanguageState(lang);
      localStorage.setItem('handloom_language', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Helper function to retrieve nested translated keys
   * e.g. t('nav.home')
   */
  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = dictionaries[language] || dictionaries.en;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary
        let fallbackCurrent = dictionaries.en;
        for (const fbKey of keys) {
          if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbKey in fallbackCurrent) {
            fallbackCurrent = fallbackCurrent[fbKey];
          } else {
            return fallback || path;
          }
        }
        return fallbackCurrent;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
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
