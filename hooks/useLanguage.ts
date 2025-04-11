'use client';

import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };
  
  return {
    t,
    changeLanguage,
    currentLanguage: i18n.language,
  };
} 