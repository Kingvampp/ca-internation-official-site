'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../utils/LanguageContext';

export default function TranslationMonitor() {
  const { language, setLanguage, t, translationStats } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isDev, setIsDev] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    // Only show in development mode
    setIsDev(process.env.NODE_ENV === 'development');
    
    // Test critical translations to ensure they're working
    const criticalKeys = [
      'navigation.home',
      'navigation.about',
      'navigation.services',
      'navigation.gallery',
      'navigation.testimonials',
      'navigation.contact',
      'navigation.book.now',
      'hero.title',
      'hero.subtitle',
      'services.ourServices',
      'footer.copyright',
      'contact.send.message',
      'contact.us',
      'contact.have.questions.re',
      'contact.send.us.a.message',
      'contact.google.maps.location',
      'contact.map.showing.the.loca',
      'contact.1330.egbert.s',
      'booking.book.appointment'
    ];
    
    const results: Record<string, boolean> = {};
    criticalKeys.forEach(key => {
      const translated = t(key);
      results[key] = translated !== key;
    });
    
    setTestResults(results);
    
    console.log('🔍 [TranslationMonitor] Translation test results:', 
      Object.entries(results).reduce((acc, [key, success]) => ({
        ...acc,
        [key]: success ? '✅' : '❌'
      }), {})
    );
    
    // Check if we have missing translations
    if (translationStats.missing.length > 0) {
      console.warn(`🔍 [TranslationMonitor] Missing ${translationStats.missing.length} translations`);
    }
  }, [language, t, translationStats]);
  
  // Don't render anything in production
  if (!isDev) {
    return null;
  }
  
  // Calculate success percentage
  const totalTests = Object.keys(testResults).length;
  const successfulTests = Object.values(testResults).filter(Boolean).length;
  const successRate = totalTests ? Math.round((successfulTests / totalTests) * 100) : 0;
  
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md shadow-lg text-white ${
          successRate === 100 ? 'bg-green-600' : successRate > 70 ? 'bg-yellow-500' : 'bg-red-600'
        }`}
      >
        <span>{successRate}% 🌐</span>
      </button>
      
      {isOpen && (
        <div className="absolute bottom-12 left-0 bg-white rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold">Translation Monitor</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          
          <div className="mb-3">
            <p className="text-sm">Current language: <strong>{language}</strong></p>
            <p className="text-sm">Loaded keys: <strong>{translationStats.count}</strong></p>
            <p className="text-sm">Missing keys: <strong>{translationStats.missing.length}</strong></p>
          </div>
          
          <div className="border-t border-gray-200 pt-2">
            <h4 className="font-semibold text-sm mb-1">Critical Translations:</h4>
            <ul className="text-xs space-y-1">
              {Object.entries(testResults).map(([key, success]) => (
                <li key={key} className="flex items-start">
                  <span className={`mr-1 ${success ? 'text-green-500' : 'text-red-500'}`}>
                    {success ? '✓' : '✗'}
                  </span>
                  <span className="font-mono">{key}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-t border-gray-200 mt-2 pt-2">
            <h4 className="font-semibold text-sm mb-1">Quick Language:</h4>
            <div className="flex space-x-2">
              <button 
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs rounded ${language === 'en' ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 text-xs rounded ${language === 'es' ? 'bg-blue-100' : 'bg-gray-100'}`}
              >
                Español
              </button>
            </div>
          </div>
          
          {translationStats.missing.length > 0 && (
            <div className="border-t border-gray-200 mt-2 pt-2">
              <h4 className="font-semibold text-sm mb-1">Recent Missing Keys:</h4>
              <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {translationStats.missing.slice(-10).map((key, index) => (
                  <li key={index} className="font-mono text-red-500">{key}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 