'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

// Error fallback UI component
const ErrorFallback: React.FC<{ 
  error?: Error | null; 
  errorInfo?: React.ErrorInfo | null;
  resetError: () => void;
  errorCount: number;
}> = ({ 
  error, 
  errorInfo,
  resetError,
  errorCount
}) => {
  // Use a try-catch to handle potential i18n errors
  let errorTitle = 'Something went wrong';
  let errorMessage = 'We\'re sorry, but there was an error loading this page. Please try refreshing the page or come back later.';
  let refreshText = 'Refresh Page';
  let goHomeText = 'Go to Homepage';
  let showDetailsText = 'Show Technical Details';
  let hideDetailsText = 'Hide Technical Details';
  
  try {
    const { t } = useTranslation();
    errorTitle = t('error.title', 'Something went wrong');
    errorMessage = t('error.message', 'We\'re sorry, but there was an error loading this page. Please try refreshing the page or come back later.');
    refreshText = t('error.refresh', 'Refresh Page');
    goHomeText = t('error.goHome', 'Go to Homepage');
    showDetailsText = t('error.showDetails', 'Show Technical Details');
    hideDetailsText = t('error.hideDetails', 'Hide Technical Details');
  } catch (e) {
    console.error('Translation error in ErrorFallback:', e);
  }

  const [showDetails, setShowDetails] = React.useState(false);
  
  // Check if this is likely a hydration error
  const isHydrationError = error?.message?.includes('Hydration') || 
                          error?.message?.includes('hydration') ||
                          error?.message?.includes('Text content') ||
                          error?.message?.includes('did not match') ||
                          error?.stack?.includes('react-dom') ||
                          error?.stack?.includes('react-server-dom-webpack');
  
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
        
        {isHydrationError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
            <p className="font-medium">This appears to be a hydration error.</p>
            <p>This usually happens when the server and client renders don't match. Try refreshing the page or clearing your browser cache.</p>
          </div>
        )}
        
        {errorCount > 1 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            <p className="font-medium">Multiple errors detected ({errorCount}).</p>
            <p>This may indicate a persistent issue. Please try clearing your browser cache or using a different browser.</p>
          </div>
        )}
        
        <div className="mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            {showDetails ? hideDetailsText : showDetailsText}
          </button>
          
          {showDetails && error && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto max-h-60 text-sm">
              <p className="text-red-600 font-mono whitespace-pre-wrap">{error.toString()}</p>
              {errorInfo && (
                <div className="mt-4">
                  <p className="font-medium text-gray-700 mb-2">Component Stack:</p>
                  <pre className="text-xs overflow-auto p-2 bg-gray-200 rounded">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              resetError();
              window.location.reload();
            }}
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
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Update error info state
    this.setState(prevState => ({
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));
    
    // Log the error to console
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Check for hydration errors specifically
    if (
      error.message?.includes('Hydration') ||
      error.message?.includes('hydration') ||
      error.message?.includes('Text content') ||
      error.message?.includes('did not match')
    ) {
      console.warn('Hydration error detected. This usually happens when the server and client renders don\'t match.');
      console.warn('Check components that use useState, useEffect, or browser-only APIs.');
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
          errorCount={this.state.errorCount}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 