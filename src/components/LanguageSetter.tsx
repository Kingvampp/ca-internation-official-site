'use client';

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import Cookies from 'js-cookie';

interface LanguageSetterProps {
  language: 'en' | 'es';
}

const LanguageSetter = ({ language }: LanguageSetterProps) => {
  const { setLanguage } = useLanguage();
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set language in context
    setLanguage(language);
    
    // Set language in i18n
    i18n.changeLanguage(language);
    
    // Set cookie for future visits
    Cookies.set('NEXT_LOCALE', language, { expires: 365 });
    
    // Set data attribute on html element
    document.documentElement.setAttribute('data-language', language);
  }, [language, setLanguage, i18n]);

  // This component doesn't render anything
  return null;
};

export default LanguageSetter; 