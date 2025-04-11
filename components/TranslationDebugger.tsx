'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../utils/LanguageContext';

const TranslationDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [translationKeys, setTranslationKeys] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();

  // Test keys - common keys that should exist
  const testKeys = [
    'common.hello',
    'common.welcome',
    'navigation.home',
    'navigation.about',
    'services.title',
    'contact.title',
    'footer.copyright'
  ];

  useEffect(() => {
    // Log the current language state
    addLog(`Current language: ${language}`);
    addLog(`i18n language: ${i18n.language}`);
    addLog(`i18n initialized: ${i18n.isInitialized}`);
    
    // Try to load resources
    const resources = i18n.getResourceBundle(language, 'common');
    if (resources) {
      addLog('Translation resources loaded successfully');
      // Extract some keys for display
      const keys = Object.keys(flattenObject(resources)).slice(0, 20);
      setTranslationKeys(keys);
    } else {
      addLog('ERROR: Failed to load translation resources');
    }

    // Test translation function
    testKeys.forEach(key => {
      const translation = t(key);
      if (translation === key) {
        addLog(`ERROR: Missing translation for ${key}`);
      } else {
        addLog(`Translation for ${key}: ${translation}`);
      }
    });
  }, [language, i18n, t]);

  // Helper function to flatten nested objects
  const flattenObject = (obj: any, prefix = '') => {
    return Object.keys(obj).reduce((acc: {[key: string]: string}, k) => {
      const pre = prefix.length ? prefix + '.' : '';
      if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
        Object.assign(acc, flattenObject(obj[k], pre + k));
      } else {
        acc[pre + k] = obj[k];
      }
      return acc;
    }, {});
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    addLog(`Switching language to ${newLang}`);
  };

  const toggleDebugger = () => {
    setIsOpen(!isOpen);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={toggleDebugger}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Open Translation Debugger"
      >
        🌐
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-1/3 h-1/2 bg-gray-900 text-white z-50 overflow-hidden rounded-t-lg shadow-xl">
      <div className="flex justify-between items-center p-2 bg-gray-800">
        <h3 className="text-lg font-bold">Translation Debugger</h3>
        <div className="flex gap-2">
          <button 
            onClick={toggleLanguage}
            className="bg-blue-600 px-3 py-1 rounded text-sm"
          >
            Switch to {language === 'en' ? 'Spanish' : 'English'}
          </button>
          <button 
            onClick={clearLogs}
            className="bg-red-600 px-3 py-1 rounded text-sm"
          >
            Clear Logs
          </button>
          <button 
            onClick={toggleDebugger}
            className="bg-gray-600 px-3 py-1 rounded text-sm"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="flex h-full">
        <div className="w-1/2 overflow-auto p-2 border-r border-gray-700">
          <h4 className="font-bold mb-2">Logs:</h4>
          <div className="text-xs font-mono">
            {logs.map((log, i) => (
              <div key={i} className="mb-1">
                {log.includes('ERROR') ? 
                  <span className="text-red-400">{log}</span> : 
                  <span>{log}</span>
                }
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-1/2 overflow-auto p-2">
          <h4 className="font-bold mb-2">Translation Keys:</h4>
          <div className="text-xs font-mono">
            {translationKeys.map((key, i) => (
              <div key={i} className="mb-1">
                <strong>{key}:</strong> {t(key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationDebugger; 