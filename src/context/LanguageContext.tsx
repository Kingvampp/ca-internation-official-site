'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';
import '../lib/i18n'; // Import i18n configuration

export type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  isClient: boolean;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with a default value that will be overridden on client
  const [language, setLanguage] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const { i18n, t } = useTranslation();

  // Effect to initialize language on client-side
  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    // Get language from cookie or default to English
    const savedLanguage = Cookies.get('i18next') as Language;
    const initialLanguage = savedLanguage || navigator.language?.substring(0, 2) as Language || 'en';
    
    // Validate language (only support 'en' and 'es')
    const validLanguage = ['en', 'es'].includes(initialLanguage) ? initialLanguage : 'en';
    
    // Set the language state
    setLanguage(validLanguage);
    
    // Ensure i18next is using the same language
    if (i18n.language !== validLanguage) {
      i18n.changeLanguage(validLanguage).then(() => {
        // Update HTML lang attribute
        document.documentElement.lang = validLanguage;
        // Mark context as ready
        setIsReady(true);
        console.log('Language initialized to:', validLanguage);
      });
    } else {
      // Mark context as ready
      setIsReady(true);
      console.log('Language already set to:', validLanguage);
    }
  }, [i18n]);

  // Memoized changeLanguage function to prevent unnecessary re-renders
  const changeLanguage = useCallback((lang: Language) => {
    if (!isClient) return; // Only execute on client side
    
    console.log('Changing language to:', lang);
    setLanguage(lang);
    
    // Change language in i18next
    i18n.changeLanguage(lang).then(() => {
      // Store language preference in cookie
      Cookies.set('i18next', lang, { expires: 30 });
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
      
      // Add a class to trigger transition effects
      document.body.classList.add('language-transition');
      setTimeout(() => {
        document.body.classList.remove('language-transition');
      }, 500);
    });
  }, [i18n, isClient]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    language,
    changeLanguage,
    isClient,
    isReady
  }), [language, changeLanguage, isClient, isReady]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 