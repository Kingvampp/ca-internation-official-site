'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook for handling page transitions
 * 
 * @returns {Object} Object containing:
 *   - isTransitioning: boolean - whether the page is currently in a transition state
 *   - startTransition: function - manually trigger a transition (optional)
 */
const usePageTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Handle page transitions when route changes
  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsTransitioning(true);
    };

    const handleRouteChangeComplete = () => {
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Delay to match the CSS transition duration
    };

    // Set up listeners for route changes
    window.addEventListener('beforeunload', handleRouteChangeStart);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('beforeunload', handleRouteChangeStart);
    };
  }, [router]);

  // Initial page load animation
  useEffect(() => {
    // Set transitioning to true initially
    setIsTransitioning(true);
    
    // Then set it to false after a short delay for the initial animation
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Function to manually trigger a transition animation
  const startTransition = (callback) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      if (callback && typeof callback === 'function') {
        callback();
      }
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };

  return { isTransitioning, startTransition };
};

export default usePageTransition; 