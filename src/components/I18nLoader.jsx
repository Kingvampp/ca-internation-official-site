'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * I18nLoader - A component that ensures i18n is initialized before rendering its children.
 */
const I18nLoader = ({ children }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [error, setError] = useState(null);
  
  // Safely access useTranslation - wrapped in try-catch to prevent errors
  let translationData = { ready: false };
  try {
    translationData = useTranslation() || { ready: false };
  } catch (err) {
    console.error('Error initializing translations:', err);
    setError(err.message);
  }
  
  const { ready } = translationData;
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAttempts, setLoadingAttempts] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Check if translations are ready
    if (ready) {
      setIsLoading(false);
    } else {
      // Set a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        setLoadingAttempts(prev => prev + 1);
        if (loadingAttempts >= 2) {
          // After 3 attempts, just render the content anyway
          setIsLoading(false);
          console.warn('Failed to load translations after multiple attempts, rendering with fallbacks');
        }
      }, 1000); // Wait 1 second between attempts
      
      return () => clearTimeout(timeout);
    }
  }, [ready, loadingAttempts]);

  // Don't render anything on server
  if (!isMounted) {
    return null;
  }
  
  // Show error message if useTranslation() threw an error
  if (error) {
    console.warn('Rendering without translations due to error:', error);
    return <>{children}</>;
  }

  // Show loading state while i18n initializes, but only for a short time
  if (isLoading && !ready && loadingAttempts < 3) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading translations...</p>
          <p className="text-sm text-gray-500 mt-2">Attempt {loadingAttempts + 1}/3</p>
        </div>
      </div>
    );
  }

  // Force render after timeout even if translations aren't ready
  return <>{children}</>;
};

export default I18nLoader; 