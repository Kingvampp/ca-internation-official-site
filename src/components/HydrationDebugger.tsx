'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

/**
 * This component helps debug hydration issues by logging information
 * about the rendering environment and language state.
 * It can be temporarily added to pages where hydration issues occur.
 */
const HydrationDebugger = () => {
  const { language, isClient } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [htmlLang, setHtmlLang] = useState('');

  useEffect(() => {
    setMounted(true);
    setHtmlLang(document.documentElement.lang);
    
    console.group('HydrationDebugger');
    console.log('Component mounted');
    console.log('isClient:', isClient);
    console.log('language state:', language);
    console.log('HTML lang attribute:', document.documentElement.lang);
    console.log('Cookies:', document.cookie);
    console.groupEnd();
    
    // Update HTML lang attribute when it changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'lang') {
          setHtmlLang(document.documentElement.lang);
          console.log('HTML lang attribute changed to:', document.documentElement.lang);
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, [isClient, language]);

  // Don't render anything during SSR
  if (!isClient) return null;

  // Only render in development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        zIndex: 9999,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxWidth: '300px',
      }}
    >
      <h4 style={{ margin: '0 0 5px 0' }}>Hydration Debugger</h4>
      <div>Mounted: {mounted ? 'Yes' : 'No'}</div>
      <div>isClient: {isClient ? 'Yes' : 'No'}</div>
      <div>Language state: {language}</div>
      <div>HTML lang: {htmlLang}</div>
    </div>
  );
};

export default HydrationDebugger; 