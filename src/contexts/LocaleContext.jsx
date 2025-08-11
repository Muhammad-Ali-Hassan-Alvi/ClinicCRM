import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '@/locales/en/index.js';
import { ar } from '@/locales/ar/index.js';

const LocaleContext = createContext();

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

export const LocaleProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');
  const [translations, setTranslations] = useState(en);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') || 'en';
    setLocale(savedLocale);
    setTranslations(savedLocale === 'ar' ? ar : en);
  }, []);

  const changeLocale = (newLocale) => {
    setLocale(newLocale);
    setTranslations(newLocale === 'ar' ? ar : en);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key, options = {}) => {
    try {
      const keys = key.split('.');
      let value = translations;
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          // Return the default value or the key itself if translation is missing
          return options.defaultValue || key;
        }
      }
      
      // Ensure we return a string, not an object
      if (typeof value === 'string') {
        return value;
      } else if (typeof value === 'object' && value !== null) {
        // If it's an object, return the default value or key
        return options.defaultValue || key;
      }
      
      return String(value);
    } catch (error) {
      console.warn(`Translation error for key "${key}":`, error);
      return options.defaultValue || key;
    }
  };

  const value = {
    locale,
    changeLocale,
    t,
    isRTL: locale === 'ar'
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
};