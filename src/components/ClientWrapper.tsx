'use client';

import React, { useState, useEffect } from 'react';
import ClientErrorBoundary from './ClientErrorBoundary';
import I18nDebugger from './I18nDebugger';

/**
 * ClientWrapper - A client component that wraps the application with error handling and debugging
 */
export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDevelopment, setIsDevelopment] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    setIsDevelopment(process.env.NODE_ENV === 'development');
  }, []);
  
  if (!isMounted) {
    return <>{children}</>;
  }
  
  return (
    <ClientErrorBoundary>
      <>
        {children}
        {isDevelopment && <I18nDebugger />}
      </>
    </ClientErrorBoundary>
  );
} 