'use client';

import * as i18nModule from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

// Use any type to avoid TypeScript errors
const i18n = i18nModule.default || (i18nModule as any);

// Only initialize in browser environment
if (typeof window !== 'undefined' && !i18n.isInitialized) {
  console.log('Initializing i18n client from i18n.client.ts');
  
  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      ns: ['common'],
      defaultNS: 'common',
      backend: {
        // Use absolute path for backend
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
      // Add fallback resources for when API fails
      resources: {
        en: {
          common: {
            // Minimal fallback translations
            'home.welcome': 'Welcome to CA International Autobody',
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.services': 'Services',
            'nav.gallery': 'Gallery',
            'nav.testimonials': 'Testimonials',
            'nav.faq': 'FAQ',
            'nav.contact': 'Contact',
            'nav.booking': 'Book Now'
          }
        },
        es: {
          common: {
            // Spanish fallback translations
            'home.welcome': 'Bienvenido a CA International Autobody',
            'nav.home': 'Inicio',
            'nav.about': 'Nosotros',
            'nav.services': 'Servicios',
            'nav.gallery': 'Galería',
            'nav.testimonials': 'Testimonios',
            'nav.faq': 'Preguntas',
            'nav.contact': 'Contacto',
            'nav.booking': 'Reservar'
          }
        }
      }
    })
    .then(() => {
      console.log('i18n client initialized successfully with language:', i18n.language);
      
      // Set HTML lang attribute based on detected language
      const detectedLanguage = i18n.language || Cookies.get('i18next') || 'en';
      document.documentElement.lang = detectedLanguage;
    })
    .catch((error) => {
      console.error('Error initializing i18n client:', error);
    });
}

export default i18n as any; 