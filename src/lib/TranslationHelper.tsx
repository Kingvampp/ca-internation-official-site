'use client';

import React from 'react';

interface TranslatedTextProps {
  children: React.ReactNode;
  className?: string;
  i18nKey?: string;
  [key: string]: any;
}

// Helper component for marking text as translatable with data-i18n attribute
export const T: React.FC<TranslatedTextProps> = ({ 
  children, 
  className = '', 
  i18nKey = '',
  ...props 
}) => {
  return (
    <span 
      className={className} 
      data-i18n={i18nKey || true} 
      {...props}
    >
      {children}
    </span>
  );
}; 