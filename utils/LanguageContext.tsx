'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, componentName?: string) => string;
  translationStats: {
    loaded: boolean;
    count: number;
    missing: string[];
    lastUpdated: string;
    componentLog: Record<string, string[]>;
  };
  debugMode: boolean;
  toggleDebugMode: () => void;
}

const defaultValue: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
  translationStats: {
    loaded: false,
    count: 0,
    missing: [],
    lastUpdated: '',
    componentLog: {},
  },
  debugMode: false,
  toggleDebugMode: () => {},
};

const LanguageContext = createContext<LanguageContextType>(defaultValue);

export const useLanguage = () => useContext(LanguageContext);

interface LanguageProviderProps {
  children: ReactNode;
}

// Create a separate debug component to fix the type issue
const DebugOverlay: React.FC<{ language: Language, keyCount: number, missingCount: number }> = ({ 
  language, 
  keyCount, 
  missingCount 
}) => {
  return (
    <div 
      style={{ 
        position: 'fixed', 
        bottom: '10px', 
        right: '10px', 
        background: 'rgba(0,0,0,0.7)', 
        color: 'white', 
        padding: '8px 12px', 
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}
    >
      🌎 Translation Debug: {language} | Keys: {keyCount} | Missing: {missingCount}
    </div>
  );
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  const [componentLogs, setComponentLogs] = useState<Record<string, string[]>>({});
  const [debugMode, setDebugMode] = useState(false);
  const [stats, setStats] = useState({
    loaded: false,
    count: 0,
    missing: [] as string[],
    lastUpdated: new Date().toISOString(),
    componentLog: {} as Record<string, string[]>,
  });

  // Toggle debug mode for translations
  const toggleDebugMode = () => {
    setDebugMode(prev => !prev);
    console.log(`🌎 [LanguageContext] Debug mode ${!debugMode ? 'enabled' : 'disabled'}`);
  };

  // Load translations for current language
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        console.log(`🌎 [LanguageContext] Loading translations for "${language}"`);
        setIsLoading(true);
        setMissingKeys([]);
        
        const translationUrl = `/locales/${language}/common.json`;
        console.log(`🌎 [LanguageContext] Fetching from: ${translationUrl}`);
        
        const startTime = performance.now();
        const translationData = await fetch(translationUrl);
        const fetchTime = performance.now() - startTime;
        
        console.log(`🌎 [LanguageContext] Fetch completed in ${fetchTime.toFixed(2)}ms`);
        
        if (!translationData.ok) {
          console.error(`🌎 [LanguageContext] Failed to fetch translations: ${translationData.status} ${translationData.statusText}`);
          throw new Error(`HTTP error! status: ${translationData.status}`);
        }
        
        const parseStartTime = performance.now();
        const translationJson = await translationData.json();
        const parseTime = performance.now() - parseStartTime;
        
        console.log(`🌎 [LanguageContext] JSON parsing completed in ${parseTime.toFixed(2)}ms`);
        console.log(`🌎 [LanguageContext] Successfully loaded translations with ${Object.keys(translationJson).length} top-level keys`);
        
        // Calculate total keys, including nested ones
        const totalKeyCount = countTranslationKeys(translationJson);
        console.log(`🌎 [LanguageContext] Total translation keys (including nested): ${totalKeyCount}`);
        
        // Debug: log the structure overview for top-level keys
        console.log(`🌎 [LanguageContext] Translation structure overview:`, 
          Object.keys(translationJson).map(key => {
            const value = translationJson[key];
            const type = typeof value === 'object' ? 'object' : typeof value;
            const count = typeof value === 'object' ? countTranslationKeys(value) : 1;
            return { key, type, keyCount: count };
          })
        );
        
        setTranslations(translationJson);
        setStats({
          loaded: true,
          count: totalKeyCount,
          missing: missingKeys,
          lastUpdated: new Date().toISOString(),
          componentLog: componentLogs,
        });
      } catch (error) {
        console.error('🌎 [LanguageContext] Failed to load translations:', error);
        // Fallback to empty translations but don't block the UI
        setTranslations({});
        setStats({
          loaded: false,
          count: 0,
          missing: ['Failed to load translations'],
          lastUpdated: new Date().toISOString(),
          componentLog: {},
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  // Count total translation keys including nested ones
  const countTranslationKeys = (obj: Record<string, any>, prefix = ''): number => {
    let count = 0;
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        count += countTranslationKeys(value, fullKey);
      } else {
        count++;
      }
    });
    
    return count;
  };

  // Initialize language from localStorage or browser preference
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    try {
      console.log('🌎 [LanguageContext] Initializing language preference');
      
      // Check if we should enable debug mode
      const debugParam = new URLSearchParams(window.location.search).get('debug_translations');
      if (debugParam === 'true') {
        setDebugMode(true);
        console.log('🌎 [LanguageContext] Debug mode enabled via URL parameter');
      }
      
      const savedLanguage = localStorage.getItem('language') as Language;
      
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
        console.log(`🌎 [LanguageContext] Using saved language preference: ${savedLanguage}`);
        setLanguageState(savedLanguage);
      } else {
        // Use browser language preference if available
        const browserLanguage = window.navigator.language.split('-')[0];
        console.log(`🌎 [LanguageContext] Detected browser language: ${browserLanguage}`);
        
        if (browserLanguage === 'es') {
          console.log('🌎 [LanguageContext] Setting language to Spanish based on browser preference');
          setLanguageState('es');
        } else {
          console.log('🌎 [LanguageContext] Defaulting to English');
          setLanguageState('en');
        }
      }
    } catch (error) {
      console.error('🌎 [LanguageContext] Error initializing language:', error);
      // Default to English if there's an error
      setLanguageState('en');
    }
  }, []);

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    console.log(`🌎 [LanguageContext] Changing language to "${lang}"`);
    setLanguageState(lang);
    
    try {
      localStorage.setItem('language', lang);
      console.log('🌎 [LanguageContext] Saved language preference to localStorage');
      
      // Removing URL redirection - No longer changing the URL when switching languages
      console.log('🌎 [LanguageContext] Language switched without URL redirection');
      
      // Reset missing keys when language changes
      setMissingKeys([]);
      setComponentLogs({});
      
      // Log the change to help with debugging
      console.log(`🌎 [LanguageContext] Current language is now: ${lang}`);
      document.documentElement.lang = lang; // Update the html lang attribute
      document.documentElement.dir = 'ltr'; // All current languages are LTR
      
      // Log all translation keys to aid debugging
      if (debugMode) {
        console.log('🌎 [LanguageContext] Debug Mode - Missing keys reset after language change');
      }
    } catch (error) {
      console.error('🌎 [LanguageContext] Error saving language preference:', error);
    }
  };

  // Translation function with enhanced logging
  const t = (key: string, componentName?: string): string => {
    // Track component usage if component name is provided
    if (componentName && debugMode) {
      setComponentLogs(prev => {
        const updatedLogs = { ...prev };
        if (!updatedLogs[componentName]) {
          updatedLogs[componentName] = [];
        }
        if (!updatedLogs[componentName].includes(key)) {
          updatedLogs[componentName] = [...updatedLogs[componentName], key];
        }
        return updatedLogs;
      });
    }
    
    if (isLoading) {
      console.log(`🌎 [LanguageContext] Translation requested while loading: ${key}${componentName ? ` from ${componentName}` : ''}`);
      return key;
    }

    const keys = key.split('.');
    let value = translations;
    let found = true;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        found = false;
        // Only log each missing key once to avoid console spam
        if (!missingKeys.includes(key)) {
          console.warn(`🌎 [LanguageContext] Translation key not found: ${key} (language: ${language})${componentName ? ` in component: ${componentName}` : ''}`);
          setMissingKeys(prev => [...prev, key]);
          setStats(prev => ({
            ...prev,
            missing: [...prev.missing, key],
            lastUpdated: new Date().toISOString(),
            componentLog: componentLogs,
          }));
        }
        return key;
      }
    }

    if (typeof value !== 'string') {
      console.warn(`🌎 [LanguageContext] Translation value for key "${key}" is not a string:`, value);
      return key;
    }

    // In debug mode, always log successful translations
    if (debugMode) {
      const valueStr = value as string;
      console.log(`🌎 [LanguageContext] Translation found for "${key}": "${valueStr.substring(0, 30)}${valueStr.length > 30 ? '...' : ''}"${componentName ? ` in component: ${componentName}` : ''}`);
    } 
    // In normal mode, log periodically (every 20th translation) to avoid flooding console
    else if (Math.random() < 0.05) {
      const valueStr = value as string;
      console.log(`🌎 [LanguageContext] Translation found for "${key}": "${valueStr.substring(0, 30)}${valueStr.length > 30 ? '...' : ''}"`);
    }

    return value;
  };

  // Make translation stats available for all pages
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add translation stats to window for debugging
      (window as any).__translationStats = {
        language,
        stats,
        debugMode,
        lastMissingKeys: missingKeys.slice(-10), // Last 10 missing keys
        allMissingKeys: missingKeys,
        componentUsage: componentLogs,
        checkTranslation: (key: string) => t(key),
        toggleDebug: toggleDebugMode,
      };
      
      console.log(`🌎 [LanguageContext] Translation stats updated. Access with window.__translationStats`);
      
      // Add global keyboard shortcut for toggling debug mode
      const handleKeyDown = (e: KeyboardEvent) => {
        // Alt+Shift+T to toggle debug mode
        if (e.altKey && e.shiftKey && e.key === 'T') {
          toggleDebugMode();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [stats, language, missingKeys, componentLogs, debugMode]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      translationStats: {
        ...stats,
        componentLog: componentLogs
      },
      debugMode,
      toggleDebugMode
    }}>
      <>
        {debugMode && (
          <DebugOverlay 
            language={language} 
            keyCount={stats.count} 
            missingCount={missingKeys.length} 
          />
        )}
        {children}
      </>
    </LanguageContext.Provider>
  );
}; 