'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

interface LanguageToggleProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  className = '',
  variant = 'default'
}) => {
  const { language, changeLanguage, isClient, isReady } = useLanguage();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    if (!isClient || !isReady) return;
    const newLanguage = language === 'en' ? 'es' : 'en';
    changeLanguage(newLanguage);
  };

  // Don't render anything during SSR or before mounting to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleLanguage}
        className={`px-3 py-1 bg-black text-white rounded-full hover:bg-[#333] transition-colors duration-300 text-sm ${className}`}
        aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
      >
        {language === 'en' ? 'Español' : 'English'}
      </button>
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className={`px-4 py-2 bg-black text-white rounded-full hover:bg-[#333] transition-colors duration-300 flex items-center space-x-2 ${className}`}
      aria-label={`Switch to ${language === 'en' ? 'Spanish' : 'English'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
      <span>{language === 'en' ? 'Español' : 'English'}</span>
    </button>
  );
};

export default LanguageToggle; 