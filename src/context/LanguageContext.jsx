'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../lib/i18n';
import Cookies from 'js-cookie';

// Create context with default values
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  isLanguageLoaded: false,
});

export const LanguageProvider = ({ children }) => {
  // Initialize with default language to avoid hydration mismatch
  const [language, setLanguageState] = useState('en');
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Initialize on client side only
  useEffect(() => {
    try {
      // Get the current language from i18n or cookie
      const currentLang = i18n.language || Cookies.get('i18next') || 'en';
      
      // Only update state if different from default to avoid unnecessary re-renders
      if (currentLang !== language) {
        setLanguageState(currentLang);
      }
      
      // Mark as loaded
      setIsLanguageLoaded(true);
      
      // Set language attribute on html element
      document.documentElement.setAttribute('lang', currentLang);
      document.documentElement.setAttribute('data-language', currentLang);
    } catch (err) {
      console.error("Error initializing language context:", err);
      setError(err.message);
      // Mark as loaded anyway to prevent blocking
      setIsLanguageLoaded(true);
    }
  }, [language]);

  // Function to change language
  const setLanguage = (lang) => {
    if (lang === language) return;
    
    try {
      // Add transition class to body
      if (document && document.documentElement) {
        document.documentElement.classList.add('language-transition');
      }
      
      i18n.changeLanguage(lang).then(() => {
        Cookies.set('i18next', lang, { expires: 30 });
        setLanguageState(lang);
        
        // Update HTML attributes
        if (document && document.documentElement) {
          document.documentElement.setAttribute('lang', lang);
          document.documentElement.setAttribute('data-language', lang);
          
          // Remove transition class after animation completes
          setTimeout(() => {
            document.documentElement.classList.remove('language-transition');
          }, 800);
        }
      }).catch(err => {
        console.error("Error changing language:", err);
        if (document && document.documentElement) {
          document.documentElement.classList.remove('language-transition');
        }
      });
    } catch (err) {
      console.error('Error setting language:', err);
      if (document && document.documentElement) {
        document.documentElement.classList.remove('language-transition');
      }
    }
  };
  
  const contextValue = {
    language, 
    setLanguage, 
    isLanguageLoaded,
    error
  };
  
  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;