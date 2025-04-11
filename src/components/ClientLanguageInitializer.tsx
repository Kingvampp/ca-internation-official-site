'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

/**
 * This component ensures that i18n is properly initialized on the client side
 * and handles language synchronization between i18n and the HTML document.
 * It doesn't render anything visible.
 */
const ClientLanguageInitializer = () => {
  const { language, isClient, isReady } = useLanguage();
  const { i18n } = useTranslation();
  const [initialized, setInitialized] = useState(false);

  // Initialize i18n on client side
  useEffect(() => {
    if (isClient && !initialized) {
      // Ensure i18n is using the same language as our context
      if (i18n.language !== language) {
        i18n.changeLanguage(language).then(() => {
          console.log('i18n language synchronized with context:', language);
          setInitialized(true);
        });
      } else {
        setInitialized(true);
      }
    }
  }, [i18n, language, isClient, initialized]);

  // Update HTML lang attribute when language changes
  useEffect(() => {
    if (isClient && isReady) {
      document.documentElement.lang = language;
      console.log('HTML lang attribute updated to:', language);
    }
  }, [language, isClient, isReady]);

  return null; // This component doesn't render anything
};

export default ClientLanguageInitializer; 