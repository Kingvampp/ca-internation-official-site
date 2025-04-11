'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Cookies from 'js-cookie';

/**
 * This component is responsible for detecting the language on the client side
 * and updating the HTML lang attribute accordingly.
 * It doesn't render anything visible.
 */
const ClientLanguageDetector = () => {
  const { language, isClient } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    // Update the HTML lang attribute when the language changes
    if (isClient && mounted) {
      document.documentElement.lang = language;
      
      // Log for debugging
      console.log('Language set to:', language);
    }
  }, [language, isClient, mounted]);

  return null; // This component doesn't render anything
};

export default ClientLanguageDetector; 