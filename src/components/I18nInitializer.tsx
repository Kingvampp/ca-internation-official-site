'use client';

import React, { useEffect, useState } from 'react';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

// Create a separate i18n instance to prevent conflicts
const i18nInstance = i18next.createInstance();

// Initialize i18n only if it's not already initialized
let isInitializing = false;

const initializeI18nInstance = () => {
  // Skip if already initializing or initialized
  if (isInitializing || i18nInstance.isInitialized) {
    console.log('i18nInstance is already initialized or initializing, skipping');
    return i18nInstance;
  }

  isInitializing = true;
  console.log('Initializing i18nInstance in I18nInitializer');

  i18nInstance
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      ns: ['common'],
      defaultNS: 'common',
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
      detection: {
        order: ['cookie', 'localStorage', 'navigator'],
        caches: ['cookie'],
        cookieName: 'i18next',
      },
      react: {
        useSuspense: false,
      },
      interpolation: {
        escapeValue: false,
      },
      supportedLngs: ['en', 'es'],
    })
    .then(() => {
      console.log('i18nInstance initialized successfully with language:', i18nInstance.language);
      isInitializing = false;
    })
    .catch((error) => {
      console.error('Error initializing i18nInstance:', error);
      isInitializing = false;
    });

  return i18nInstance;
};

// Export the initialized instance for use elsewhere
export const i18nInstance1 = i18nInstance;

const I18nInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // On client-side, update HTML lang attribute
    if (typeof window !== 'undefined') {
      // Initialize i18n if not already initialized
      if (!i18nInstance.isInitialized && !isInitializing) {
        initializeI18nInstance();
      }
      
      const savedLanguage = Cookies.get('i18next') || 'en';
      document.documentElement.lang = savedLanguage;
      setIsInitialized(true);
      
      console.log('I18nInitializer mounted with language:', i18nInstance.language);
    } else {
      setIsInitialized(true); // Skip on server
    }
  }, []);

  // Always render on server, conditionally render on client based on init state
  if (typeof window === 'undefined' || isInitialized) {
    // Since I18nextProvider isn't exported by react-i18next (TypeScript error),
    // we'll just pass the i18n instance directly through context
    return (
      <>
        {/* Make sure i18n instance is available in the React context */}
        {typeof window !== 'undefined' && 
          <script 
            dangerouslySetInnerHTML={{ 
              __html: `window.i18nextInstance = ${JSON.stringify({
                language: i18nInstance.language,
                isInitialized: true
              })};` 
            }} 
          />
        }
        {children}
      </>
    );
  }
  
  return null; // Or a loading indicator
};

export default I18nInitializer; 