'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher({
  variant = 'dropdown',
  className = '',
}) {
  const { language, setLanguage, isClient } = useLanguage();
  const { t, ready } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    setIsMounted(true);
    
    if (!isClient) return;
    
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClient]);

  // Don't render anything on server
  if (!isMounted || !isClient || !ready) {
    return <div className={`h-10 ${className}`} />;
  }

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'es' : 'en';
    switchLanguage(newLanguage);
  };

  const switchLanguage = (newLanguage) => {
    if (newLanguage === language || isTransitioning) return;

    setIsTransitioning(true);
    
    // Add transition class to body
    document.documentElement.classList.add('language-transition');
    
    // Update context
    setLanguage(newLanguage);
    
    // Set a timeout to remove the transition class
    setTimeout(() => {
      setIsTransitioning(false);
      document.documentElement.classList.remove('language-transition');
    }, 800); // Match this with the CSS transition duration
    
    // Close dropdown if open
    setIsOpen(false);
  };

  // Simple version (text only)
  if (variant === 'simple') {
    return (
      <button 
        onClick={toggleLanguage}
        disabled={isTransitioning}
        className={`flex items-center text-sm font-medium text-white hover:text-[var(--accent)] transition-colors ${
          isTransitioning ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
        aria-label={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
      >
        {language === 'en' ? 'ES' : 'EN'}
        <svg 
          className="ml-1 w-4 h-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    );
  }

  // Minimal version (just flags or toggle)
  if (variant === 'minimal') {
    return (
      <button 
        onClick={toggleLanguage}
        disabled={isTransitioning}
        className={`relative flex items-center justify-center rounded-full h-10 w-10 transition-colors ${
          isTransitioning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'
        } ${className}`}
        aria-label={language === 'en' ? 'Cambiar a Español' : 'Switch to English'}
      >
        <span className="text-xl">
          {language === 'en' ? '🇪🇸' : '🇺🇸'}
        </span>
        {isTransitioning && (
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-white/40"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </button>
    );
  }

  // Flags version
  if (variant === 'flags') {
    return (
      <div className={`flex items-center space-x-2 ${className}`} ref={dropdownRef}>
        <button
          onClick={() => switchLanguage('en')}
          disabled={language === 'en' || isTransitioning}
          className={`relative rounded-full h-8 w-8 overflow-hidden transition-all ${
            language === 'en' 
              ? 'ring-2 ring-blue-500 scale-110'
              : 'opacity-60 hover:opacity-100'
          } ${isTransitioning ? 'cursor-not-allowed' : ''}`}
          aria-label="Switch to English"
        >
          <span className="text-xl flex items-center justify-center">🇺🇸</span>
        </button>
        <button
          onClick={() => switchLanguage('es')}
          disabled={language === 'es' || isTransitioning}
          className={`relative rounded-full h-8 w-8 overflow-hidden transition-all ${
            language === 'es' 
              ? 'ring-2 ring-blue-500 scale-110'
              : 'opacity-60 hover:opacity-100'
          } ${isTransitioning ? 'cursor-not-allowed' : ''}`}
          aria-label="Cambiar a Español"
        >
          <span className="text-xl flex items-center justify-center">🇪🇸</span>
        </button>
        {isTransitioning && (
          <motion.div 
            className="h-2 w-2 bg-blue-500 rounded-full ml-2"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    );
  }

  // Default dropdown version
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isTransitioning}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
          isTransitioning ? 'opacity-60 cursor-not-allowed' : 'hover:bg-white/10'
        }`}
        aria-expanded={isOpen}
      >
        <span className="w-5 h-5 text-lg flex items-center justify-center">
          {language === 'en' ? '🇺🇸' : '🇪🇸'}
        </span>
        <span className="font-medium capitalize">
          {language === 'en' ? 'English' : 'Español'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        
        {isTransitioning && (
          <motion.div 
            className="absolute right-0 top-0 h-2 w-2 bg-blue-500 rounded-full"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-gray-800 rounded-md shadow-lg overflow-hidden z-50 border border-gray-700">
          <button
            onClick={() => switchLanguage('en')}
            disabled={language === 'en' || isTransitioning}
            className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
              language === 'en' ? 'bg-blue-900' : 'hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">🇺🇸</span>
            <span>English</span>
            {language === 'en' && (
              <svg
                className="ml-auto h-4 w-4 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
          <button
            onClick={() => switchLanguage('es')}
            disabled={language === 'es' || isTransitioning}
            className={`w-full text-left px-4 py-3 flex items-center space-x-3 transition-colors ${
              language === 'es' ? 'bg-blue-900' : 'hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">🇪🇸</span>
            <span>Español</span>
            {language === 'es' && (
              <svg
                className="ml-auto h-4 w-4 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
} 