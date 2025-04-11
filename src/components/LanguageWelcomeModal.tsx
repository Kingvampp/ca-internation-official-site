'use client';

import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

const LanguageWelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { language, changeLanguage, isClient } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    // Mark component as mounted
    setMounted(true);
    
    // Only run on client side after mounting
    if (isClient && mounted) {
      // Check if the user has visited before
      const hasVisited = Cookies.get('hasVisited');
      
      // Small delay to ensure the component mounts properly
      const timer = setTimeout(() => {
        if (!hasVisited) {
          setIsOpen(true);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isClient, mounted]);

  const handleLanguageSelect = (lang: 'en' | 'es') => {
    // Set language using the changeLanguage function
    changeLanguage(lang);
    
    // Set hasVisited cookie to true (expires in 30 days)
    Cookies.set('hasVisited', 'true', { expires: 30 });
    
    // Close the modal
    setIsOpen(false);
  };

  // Don't render during SSR or before mounting to avoid hydration mismatch
  if (!isClient || !mounted) {
    return null;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="animate-scale-in relative w-full max-w-md p-8 mx-4 bg-[var(--primary-dark)] rounded-lg shadow-2xl border border-[var(--gray-dark)]">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--primary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl notranslate">CA</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-6">
            {t('welcome.title', 'Welcome to CA International Autobody')}
          </h2>
          <p className="text-[var(--gray-light)] mb-8">
            {t('welcome.selectLanguage', "What's your preferred language?")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleLanguageSelect('en')}
              className={`btn ${language === 'en' ? 'btn-accent' : 'btn-primary'} w-full sm:w-auto`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageSelect('es')}
              className={`btn ${language === 'es' ? 'btn-accent' : 'btn-primary'} w-full sm:w-auto`}
            >
              Español
            </button>
          </div>
          
          <div className="mt-8 text-xs text-[var(--gray-light)]">
            <p>{t('welcome.changeAnytime', 'You can change your language preference anytime using the language toggle in the header.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageWelcomeModal; 