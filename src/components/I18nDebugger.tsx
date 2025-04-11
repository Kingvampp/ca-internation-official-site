'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

const I18nDebugger: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Test keys that are commonly used
  const testKeys = [
    'home.hero.welcome',
    'home.hero.tagline',
    'home.hero.ourServices',
    'home.hero.bookAppointment',
    'navigation.about',
    'navigation.services'
  ];

  // Only run client-side
  useEffect(() => {
    setIsMounted(true);
    
    // Get translations for test keys
    const translatedValues: Record<string, string> = {};
    testKeys.forEach(key => {
      try {
        translatedValues[key] = t(key);
      } catch (error) {
        translatedValues[key] = `Error: ${error}`;
      }
    });
    setTranslations(translatedValues);
  }, [t, language]);

  // Don't render anything on server
  if (!isMounted) {
    return null;
  }

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-md z-50"
      >
        Debug i18n
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 bg-white border border-gray-300 p-4 m-4 rounded-md shadow-lg z-50 max-w-md overflow-auto max-h-[80vh]">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold">i18n Debugger</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>
      
      <div className="mb-4">
        <p><strong>Current Language:</strong> {language}</p>
        <p><strong>i18n Language:</strong> {i18n.language}</p>
        <p><strong>i18n Initialized:</strong> {i18n.isInitialized ? 'Yes' : 'No'}</p>
        <p><strong>Available Languages:</strong> {i18n.options?.supportedLngs?.join(', ') || 'None'}</p>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Test Translations:</h4>
        <div className="bg-gray-100 p-2 rounded">
          {testKeys.map(key => (
            <div key={key} className="mb-2">
              <p className="text-sm text-gray-600">{key}:</p>
              <p className={translations[key]?.includes('missingKey') ? 'text-red-500' : ''}>
                {translations[key] || 'undefined'}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => i18n.changeLanguage('en')}
          className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
        >
          Switch to EN
        </button>
        <button 
          onClick={() => i18n.changeLanguage('es')}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Switch to ES
        </button>
      </div>
    </div>
  );
};

export default I18nDebugger; 