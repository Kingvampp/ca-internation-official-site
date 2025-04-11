'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';

// Fallback translations for when the backend fails
const fallbackResources = {
  en: {
    common: {
      "language": {
        "switchTo": "Switch language",
        "english": "English",
        "spanish": "Spanish",
        "current": "Current language"
      },
      "navigation": {
        "about": "About Us",
        "services": "Services",
        "gallery": "Gallery",
        "testimonials": "Testimonials",
        "contact": "Contact",
        "bookNow": "Book Now",
        "callUs": "Call Us Now"
      },
      "home": {
        "title": "CA International Autobody",
        "subtitle": "Professional auto body repair and painting services",
        "viewServices": "View All Services"
      },
      "services": {
        "collisionRepair": "Collision Repair",
        "collisionRepairDesc": "Expert repair services for vehicles involved in accidents, restoring them to pre-accident condition.",
        "customPaint": "Custom Paint",
        "customPaintDesc": "Premium paint services with flawless finishes, including custom colors and metallic finishes.",
        "classicRestoration": "Classic Restoration",
        "classicRestorationDesc": "Comprehensive restoration services for vintage and classic vehicles, returning them to their original glory."
      }
    }
  },
  es: {
    common: {
      "language": {
        "switchTo": "Cambiar idioma",
        "english": "Inglés",
        "spanish": "Español",
        "current": "Idioma actual"
      },
      "navigation": {
        "about": "Sobre Nosotros",
        "services": "Servicios",
        "gallery": "Galería",
        "testimonials": "Testimonios",
        "contact": "Contacto",
        "bookNow": "Reservar Ahora",
        "callUs": "Llámanos Ahora"
      },
      "home": {
        "title": "CA International Autobody",
        "subtitle": "Servicios profesionales de reparación y pintura de carrocería",
        "viewServices": "Ver Todos los Servicios"
      },
      "services": {
        "collisionRepair": "Reparación de Colisiones",
        "collisionRepairDesc": "Servicios expertos de reparación para vehículos involucrados en accidentes, restaurándolos a su condición previa al accidente.",
        "customPaint": "Pintura Personalizada",
        "customPaintDesc": "Servicios de pintura premium con acabados impecables, incluyendo colores personalizados y acabados metálicos.",
        "classicRestoration": "Restauración Clásica",
        "classicRestorationDesc": "Servicios integrales de restauración para vehículos clásicos y vintage, devolviéndolos a su gloria original."
      }
    }
  }
};

// Initialize i18n outside of any component
const initI18n = () => {
  if (i18n.isInitialized) {
    return i18n;
  }

  i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      debug: process.env.NODE_ENV === 'development',
      ns: ['common'],
      defaultNS: 'common',
      resources: fallbackResources, // Add fallback resources
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        addPath: '/locales/add/{{lng}}/{{ns}}',
        allowMultiLoading: false,
      },
      detection: {
        order: ['cookie', 'localStorage', 'navigator'],
        caches: ['cookie'],
        lookupCookie: 'i18next',
      },
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      load: 'languageOnly',
      lowerCaseLng: true,
    });

  return i18n;
};

// Initialize i18n if we're in a browser environment
if (typeof window !== 'undefined') {
  initI18n();
  
  // Set document language attribute on load
  const currentLang = i18n.language || Cookies.get('i18next') || 'en';
  if (document && document.documentElement) {
    document.documentElement.lang = currentLang;
  }
}

// Change language function
export const changeLanguage = (language) => {
  if (typeof window === 'undefined') return Promise.resolve();
  
  try {
    return i18n.changeLanguage(language)
      .then(() => {
        Cookies.set('i18next', language, { expires: 30 });
        document.documentElement.lang = language;
      })
      .catch((error) => {
        console.error(`Error changing language to ${language}:`, error);
      });
  } catch (error) {
    console.error('Error in changeLanguage:', error);
    return Promise.reject(error);
  }
};

// Get current language
export const getCurrentLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  return i18n.language || Cookies.get('i18next') || 'en';
};

// Check if namespace is loaded
export const isNamespaceLoaded = (namespace) => {
  if (typeof window === 'undefined') return false;
  
  if (typeof i18n.hasLoadedNamespace !== 'function') {
    return false;
  }
  
  return i18n.hasLoadedNamespace(namespace);
};

export default i18n;