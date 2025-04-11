'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

// Flag to track initialization status
let isInitializing = false;
let isInitialized = false;

// Create a separate initialization function that will only run on the client
const initI18n = () => {
  // Skip initialization on server to prevent hydration mismatches
  if (typeof window === 'undefined') {
    console.log('Skipping i18n initialization on server');
    return i18n;
  }

  // Prevent multiple simultaneous initializations
  if (isInitializing) {
    console.log('i18n initialization already in progress');
    return i18n;
  }

  // Skip if already initialized
  if (i18n.isInitialized && isInitialized) {
    return i18n;
  }
  
  // Set flag
  isInitializing = true;

  console.log('Initializing i18n on client');
  i18n
    // Load translations from the /public/locales folder
    .use(Backend)
    // Detect user language
    .use(LanguageDetector)
    // Pass the i18n instance to react-i18next
    .use(initReactI18next)
    // Initialize i18next
    .init({
      // Default language
      fallbackLng: 'en',
      // Debug mode in development
      debug: process.env.NODE_ENV === 'development',
      // Namespace for translations
      ns: ['common'],
      defaultNS: 'common',
      // Backend configuration
      backend: {
        // Path to load translations from
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        // Add cache control headers
        requestOptions: {
          // Cache translations in browser for faster subsequent loads
          cache: 'default',
          headers: {
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        },
      },
      // Language detection options
      detection: {
        // Order of language detection
        order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
        // Cache user language
        caches: ['cookie'],
        // Cookie name to store language
        cookieName: 'i18next',
        // Cookie expiration (30 days)
        cookieExpirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        // Look for language from navigator
        lookupFromNavigator: true,
        // Automatically detect from navigator language
        lookupFromPathIndex: 0,
      },
      // React i18next options
      react: {
        // Don't wait for translations to be loaded before rendering
        useSuspense: false,
        // Enable transition between languages
        transEmptyNodeValue: '',
        // Use a span for translation items
        transSupportBasicHtmlNodes: true,
        // List of HTML tags to support in translations
        transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p', 'em', 'span', 'a', 'ul', 'li'],
      },
      // Interpolation options
      interpolation: {
        // React already escapes values
        escapeValue: false,
        // Format options
        format: (value, format) => {
          if (format === 'uppercase') return value.toUpperCase();
          if (format === 'lowercase') return value.toLowerCase();
          if (format === 'capitalize') return value.charAt(0).toUpperCase() + value.slice(1);
          return value;
        }
      },
      // Available languages
      supportedLngs: ['en', 'es'],
      // Automatically load missing translations (dev only)
      saveMissing: process.env.NODE_ENV === 'development',
      // Show missing keys as text in dev
      missingKeyHandler: (lng, ns, key) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Missing translation key: '${key}' for language: ${lng} in namespace: ${ns}`);
        }
      },
    })
    .then(() => {
      console.log('i18n initialized successfully with language:', i18n.language);
      isInitialized = true;
      isInitializing = false;
    })
    .catch((error) => {
      console.error('Error initializing i18n:', error);
      isInitializing = false;
    });
  
  return i18n;
};

// Function to change language
export const changeLanguage = (language: string) => {
  // Skip on server side
  if (typeof window === 'undefined') return;
  
  // Ensure i18n is initialized
  const i18nInstance = initI18n();
  i18nInstance.changeLanguage(language);
  
  // Set cookie on the client side
  Cookies.set('i18next', language, { expires: 30 });
  
  // Update HTML lang attribute
  document.documentElement.lang = language;
  
  console.log('Language changed to:', language);
};

// Function to get current language
export const getCurrentLanguage = (): string => {
  // Skip on server side
  if (typeof window === 'undefined') return 'en';
  
  // Ensure i18n is initialized
  const i18nInstance = initI18n();
  
  // Get language from i18n, cookie, or default to English
  return i18nInstance.language || Cookies.get('i18next') || 'en';
};

// Helper to get all available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇸🇻' }
  ];
};

// Initialize i18n automatically on import but only on client
if (typeof window !== 'undefined') {
  initI18n();
}

export default i18n; 