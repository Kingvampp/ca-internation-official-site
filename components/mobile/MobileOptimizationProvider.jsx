"use client";

import { useEffect, useState } from 'react';
import MobileOptimizer from './MobileOptimizer';
import MobileStyleInjector from './MobileStyleInjector';

/**
 * Mobile Optimization Provider
 * 
 * This component combines all mobile optimization features.
 * It's designed to work without modifying existing components.
 */
export default function MobileOptimizationProvider() {
  const [isEnabled, setIsEnabled] = useState(false);
  
  useEffect(() => {
    // Only enable mobile optimizations on client side
    setIsEnabled(true);
    
    // Save a flag in local storage to track that optimizations were applied
    if (typeof window !== 'undefined') {
      localStorage.setItem('mobileOptimizationsEnabled', 'true');
      
      // Log to console in development mode
      if (process.env.NODE_ENV === 'development') {
        console.log('%c[CA-DEV-INFO] Mobile Optimization Provider initialized', 'color: #10b981; font-weight: bold;');
      }
    }
  }, []);
  
  // Only render optimization components on client side
  if (!isEnabled) return null;
  
  return (
    <>
      <MobileStyleInjector />
      <MobileOptimizer />
    </>
  );
} 