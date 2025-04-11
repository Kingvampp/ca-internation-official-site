"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the form enhancer to prevent SSR issues
const FormEnhancer = dynamic(() => import('../../utils/formEnhancer'), {
  ssr: false,
});

/**
 * Form Optimization Provider
 * 
 * This component initializes form optimizations for mobile devices
 * without affecting existing form components.
 */
export default function FormOptimizationProvider() {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Initialize form optimizations after page load
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setIsLoaded(true);
        
        // Initialize form enhancer
        if (typeof FormEnhancer?.init === 'function') {
          FormEnhancer.init();
        }
      }
    }, 1000); // Wait for forms to be rendered
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add responsive form CSS
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    
    // Add form-specific CSS
    const style = document.createElement('style');
    style.id = 'form-optimization-styles';
    style.innerHTML = `
      @media (max-width: 767px) {
        /* Better form spacing */
        .mobile-enhanced form {
          margin-bottom: 24px;
        }
        
        /* Fix common form issues */
        .mobile-enhanced form input[type="submit"],
        .mobile-enhanced form button[type="submit"] {
          -webkit-appearance: none;
          appearance: none;
          border-radius: 8px;
        }
        
        /* Prevent zoom on iOS */
        .mobile-enhanced form input,
        .mobile-enhanced form select,
        .mobile-enhanced form textarea {
          font-size: 16px;
        }
        
        /* Improve datepicker appearance */
        .mobile-enhanced form input[type="date"] {
          min-height: 44px;
          -webkit-appearance: none;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const styleEl = document.getElementById('form-optimization-styles');
      if (styleEl) {
        styleEl.remove();
      }
    };
  }, [isLoaded]);
  
  // This component doesn't render anything visible
  return null;
} 