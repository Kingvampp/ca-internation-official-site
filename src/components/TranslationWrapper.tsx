'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

interface TranslationWrapperProps {
  children: (t: (key: string, fallback?: string, options?: any) => React.ReactNode) => React.ReactElement;
}

/**
 * A wrapper component that provides translation functionality to any component
 * without requiring direct use of the useLanguage hook.
 */
const TranslationWrapper: React.FC<TranslationWrapperProps> = ({ children }) => {
  const { t } = useLanguage();
  
  // Enhanced translation function with fallback and debugging support
  const enhancedT = (key: string, fallback?: string, options?: any): React.ReactNode => {
    const translation = t(key, options);
    
    // In development, show keys for missing translations to help debugging
    if (process.env.NODE_ENV === 'development' && 
        (translation === key || !translation)) {
      return (
        <span className="missing-translation" title={`Missing translation: ${key}`} style={{ 
          textDecoration: 'underline', 
          textDecorationStyle: 'dotted',
          color: '#ff6b6b' 
        }}>
          {fallback || key}
        </span>
      );
    }
    
    return translation || fallback || key;
  };
  
  return <>{children(enhancedT)}</>;
};

export default TranslationWrapper; 
