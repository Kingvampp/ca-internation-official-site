'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t, translationStats } = useLanguage();
  const [mounted, setMounted] = useState(false);

  // Only show the language toggle after the component has mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true);
    console.log(`🔤 [LanguageToggle] Component mounted with language: ${language}`);
    
    // Log translation status
    if (translationStats.loaded) {
      console.log(`🔤 [LanguageToggle] Translations loaded: ${translationStats.count} keys`);
      if (translationStats.missing.length > 0) {
        console.warn(`🔤 [LanguageToggle] ${translationStats.missing.length} missing translations detected`);
      }
    } else {
      console.warn('🔤 [LanguageToggle] Translations not loaded yet');
    }
  }, [language, translationStats]);

  // Add a translation test effect that runs when language changes
  useEffect(() => {
    if (!mounted) return;
    
    // Test common translation keys to verify they're working
    const testKeys = [
      'common.en',
      'common.es',
      'navigation.home',
      'navigation.services',
      'navigation.book.now'
    ];
    
    console.log(`🔤 [LanguageToggle] Testing translations for ${language}:`);
    testKeys.forEach(key => {
      const translated = t(key);
      const success = translated !== key;
      console.log(`🔤 [LanguageToggle] - ${key}: ${success ? '✅' : '❌'} "${translated}"`);
    });
  }, [language, mounted, t]);

  const handleLanguageChange = (lang: 'en' | 'es') => {
    console.log(`🔤 [LanguageToggle] Language button clicked: ${lang}`);
    if (lang === language) {
      console.log(`🔤 [LanguageToggle] Already using ${lang}, no change needed`);
      return;
    }
    setLanguage(lang);
  };

  if (!mounted) {
    // Skeleton loader while component is not yet mounted
    return (
      <div className="flex items-center space-x-1">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
          language === 'en'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } transition-colors`}
        aria-label={t('common.switch.to.english')}
        data-testid="language-toggle-en"
      >
        <span className="text-lg">🇺🇸</span>
        <span className="text-sm font-medium">{t('common.en')}</span>
      </button>
      <button
        onClick={() => handleLanguageChange('es')}
        className={`flex items-center space-x-1 px-2 py-1 rounded-md ${
          language === 'es'
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } transition-colors`}
        aria-label={t('common.switch.to.spanish')}
        data-testid="language-toggle-es"
      >
        <span className="text-lg">🇸🇻</span>
        <span className="text-sm font-medium">{t('common.es')}</span>
      </button>
    </div>
  );
} 