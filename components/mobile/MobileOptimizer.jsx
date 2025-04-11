"use client";

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the mobile enhancer to prevent SSR issues
const MobileEnhancer = dynamic(() => import('../../utils/mobileEnhancer'), {
  ssr: false,
});

/**
 * Mobile Optimizer Component
 * 
 * This component initializes mobile optimizations without affecting
 * existing functionality. It runs only on the client-side and 
 * applies enhancements after the page has loaded.
 */
export default function MobileOptimizer() {
  useEffect(() => {
    // Initialize mobile enhancements after a short delay
    // to ensure the page is fully loaded
    const timer = setTimeout(() => {
      if (typeof MobileEnhancer?.init === 'function') {
        MobileEnhancer.init();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 