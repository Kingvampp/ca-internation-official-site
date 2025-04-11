'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

const NewWelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language, changeLanguage, isClient, isReady } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    // Only run on client side after mounting
    if (isClient && mounted && isReady) {
      const hasVisited = Cookies.get('hasVisited');
      
      // Small delay to ensure proper mounting
      const timer = setTimeout(() => {
        if (!hasVisited) {
          setIsOpen(true);
          console.log('Opening welcome modal');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isClient, mounted, isReady]);

  // Debug logging for translation changes
  useEffect(() => {
    if (isReady && mounted) {
      console.log('NewWelcomeModal language:', language);
      console.log('NewWelcomeModal translation test:', t('welcome.title'));
      console.log('NewWelcomeModal translation test:', t('welcome.selectLanguage'));
    }
  }, [language, isReady, mounted, t]);

  const closeModal = () => {
    setIsOpen(false);
    Cookies.set('hasVisited', 'true', { expires: 30 });
  };

  const handleLanguageSelect = (lang: 'en' | 'es') => {
    changeLanguage(lang);
    closeModal();
  };

  // Don't render during SSR or before mounting to avoid hydration mismatch
  if (!isClient || !mounted) {
    return null;
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">{t('welcome.title', 'Welcome to CA International Autobody')}</h2>
        <p className="mb-6">{t('welcome.selectLanguage', 'Please select your preferred language:')}</p>
        
        <div className="flex space-x-4">
          <button
            onClick={() => handleLanguageSelect('en')}
            className={`px-4 py-2 rounded ${
              language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {t('language.en', 'English')}
          </button>
          <button
            onClick={() => handleLanguageSelect('es')}
            className={`px-4 py-2 rounded ${
              language === 'es' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {t('language.es', 'Español')}
          </button>
        </div>
        
        <button
          onClick={closeModal}
          className="mt-6 px-4 py-2 bg-gray-200 rounded"
        >
          {t('welcome.continue', 'Continue')}
        </button>
      </div>
    </div>
  );
};

export default NewWelcomeModal; 