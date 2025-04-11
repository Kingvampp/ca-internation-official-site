'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

// Error fallback UI component
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => {
  // Use a try-catch to handle potential i18n errors
  let errorTitle = 'Something went wrong';
  let errorMessage = 'We\'re sorry, but there was an error loading this page. Please try refreshing the page or come back later.';
  let refreshText = 'Try Again';
  let goHomeText = 'Go to Homepage';
  
  try {
    const { t } = useTranslation();
    errorTitle = t('error.title', 'Something went wrong');
    errorMessage = t('error.message', 'We\'re sorry, but there was an error loading this page. Please try refreshing the page or come back later.');
    refreshText = t('error.refresh', 'Try Again');
    goHomeText = t('error.goHome', 'Go to Homepage');
  } catch (e) {
    console.error('Translation error in ErrorFallback:', e);
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{errorTitle}</h2>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        
        <div className="mb-6 p-4 bg-gray-100 rounded text-left overflow-auto max-h-32 text-sm">
          <p className="text-red-600 font-mono">{error.toString()}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetError}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {refreshText}
          </button>
          <Link href="/" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">
            {goHomeText}
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * ClientErrorBoundary - A functional component that catches errors
 */
const ClientErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  // Only run client-side code after mounting
  useEffect(() => {
    setIsMounted(true);
    
    // Error handler function
    const handleError = (event: ErrorEvent) => {
      console.error('[ClientErrorBoundary] Error caught:', event.error);
      setError(event.error);
      setHasError(true);
      // Prevent the error from bubbling up
      event.preventDefault();
    };
    
    // Add global error handler
    window.addEventListener('error', handleError);
    
    // Also handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('[ClientErrorBoundary] Promise rejection:', event.reason);
      setError(new Error(event.reason?.toString() || 'Promise rejected'));
      setHasError(true);
      // Prevent the rejection from bubbling up
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleRejection);
    
    console.log('[ClientErrorBoundary] Mounted and listening for errors');
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      console.log('[ClientErrorBoundary] Unmounted');
    };
  }, []);
  
  // Reset error state
  const resetError = () => {
    console.log('[ClientErrorBoundary] Resetting error state');
    setHasError(false);
    setError(null);
    window.location.reload();
  };
  
  // If not mounted yet, render children without error handling
  if (!isMounted) {
    return <>{children}</>;
  }
  
  // If there's an error, show the error UI
  if (hasError && error) {
    return <ErrorFallback error={error} resetError={resetError} />;
  }
  
  // If there's no error, render the children
  return <>{children}</>;
};

export default ClientErrorBoundary; 