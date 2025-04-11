'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../utils/LanguageContext';
import { usePathname } from 'next/navigation';

export default function TranslationDebuggingControls() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useLanguage();
  const [isDebugActive, setIsDebugActive] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleDebug = () => {
    setIsDebugActive(!isDebugActive);
    
    if (!isDebugActive) {
      // Add initial logs when activating
      addLog(`Debug mode activated`);
      addLog(`Current language: ${language}`);
      addLog(`Current path: ${pathname}`);
      addLog(`i18n language: ${i18n.language}`);
      addLog(`i18n initialized: ${i18n.isInitialized}`);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    setLanguage(newLang);
    addLog(`Language switched to: ${newLang}`);
  };

  const addLog = (message: string) => {
    setLogs(prev => [message, ...prev].slice(0, 50)); // Keep most recent 50 logs
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared');
  };

  const checkTranslationKey = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const key = formData.get('key') as string;
    
    if (key) {
      const translation = t(key);
      addLog(`[${key}] => "${translation}"`);
      
      if (key === translation) {
        addLog(`WARNING: Key "${key}" might be missing a translation`);
      }
      
      form.reset();
    }
  };

  // Don't render anything - feature removed
  return null;
} 