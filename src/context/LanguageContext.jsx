import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { bn } from '../translations/bn';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('devfest_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('devfest_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLang(prev => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key) => {
    const dict = lang === 'bn' ? bn : en;
    return dict[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
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
