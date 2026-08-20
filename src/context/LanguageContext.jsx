import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import esTranslations from '../translations/es.json';
import enTranslations from '../translations/en.json';
import { ExecutionService } from '../services/execution/ExecutionService.js';
import I18nRuntime from '../services/execution/i18nRuntime.js';

const LanguageContext = createContext();

const TRANSLATIONS = {
  es: esTranslations,
  en: enTranslations
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    let initialLang = 'es';
    try {
      const saved = localStorage.getItem('mycode_language');
      if (saved === 'es' || saved === 'en') {
        initialLang = saved;
      } else {
        // Auto-detect browser language if available
        const navLang = navigator.language?.slice(0, 2);
        initialLang = navLang === 'en' ? 'en' : 'es';
      }
    } catch (e) {
      initialLang = 'es';
    }
    I18nRuntime.setLocale(initialLang);
    return initialLang;
  });

  const setLanguage = useCallback((lang) => {
    if (lang === 'es' || lang === 'en') {
      I18nRuntime.setLocale(lang);
      setLanguageState(lang);
      // Sincronizar runtime de ejecución con el idioma activo (i18nRuntime singleton)
      ExecutionService.setLocale(lang);
      try {
        localStorage.setItem('mycode_language', lang);
      } catch (e) {
        console.error('Failed to save language preference:', e);
      }
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'es' ? 'en' : 'es');
  }, [language, setLanguage]);

  // Translation lookup function supporting nested keys (e.g. 'nav.courses') and placeholders (e.g. '{name}')
  const t = useCallback((path, params = {}) => {
    if (!path) return '';
    const dict = TRANSLATIONS[language] || TRANSLATIONS.es;
    const keys = path.split('.');
    let current = dict;

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Spanish if key missing in English
        let fallback = TRANSLATIONS.es;
        for (const fKey of keys) {
          if (fallback && typeof fallback === 'object' && fKey in fallback) {
            fallback = fallback[fKey];
          } else {
            fallback = null;
            break;
          }
        }
        current = fallback || path;
        break;
      }
    }

    if (typeof current !== 'string') {
      return path;
    }

    // Replace {placeholder} with corresponding param
    let result = current;
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([paramKey, val]) => {
        result = result.replaceAll(`{${paramKey}}`, String(val ?? ''));
      });
    }

    return result;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, isSpanish: language === 'es', isEnglish: language === 'en' }}>
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

export const useTranslation = useLanguage;
