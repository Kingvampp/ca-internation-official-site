"use client";

import { useEffect, useState } from 'react';

/**
 * Mobile Style Injector Component
 * 
 * This component safely injects mobile optimization styles
 * without disrupting the existing website.
 */
export default function MobileStyleInjector() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Check if we're in a browser and it's a mobile device
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      // Check on mount
      checkMobile();
      
      // Listen for window resize
      window.addEventListener('resize', checkMobile);
      
      // Inject mobile styles
      const styleSheets = [
        { id: 'mobile-optimization-styles', href: '/styles/mobile-optimizations.css' },
        { id: 'responsive-images-styles', href: '/styles/responsive-images.css' },
        { id: 'mobile-forms-styles', href: '/styles/mobile-forms.css' },
        { id: 'performance-optimizations-styles', href: '/styles/performance-optimizations.css' }
      ];
      
      // Add each stylesheet
      styleSheets.forEach(sheet => {
        const existingStyle = document.getElementById(sheet.id);
        if (!existingStyle) {
          const styleEl = document.createElement('link');
          styleEl.rel = 'stylesheet';
          styleEl.href = sheet.href;
          styleEl.id = sheet.id;
          document.head.appendChild(styleEl);
        }
      });
      
      // Add mobile-enhanced class to body
      if (window.innerWidth < 768) {
        document.documentElement.classList.add('mobile-enhanced');
        
        // Add development mode indicator if in development
        if (process.env.NODE_ENV === 'development') {
          document.documentElement.classList.add('dev-mode');
          console.log('%c[CA-DEV-INFO] Mobile enhancements enabled', 'color: #3b82f6; font-weight: bold;');
        }
      }
      
      return () => {
        window.removeEventListener('resize', checkMobile);
        styleSheets.forEach(sheet => {
          const injectedStyle = document.getElementById(sheet.id);
          if (injectedStyle) {
            injectedStyle.remove();
          }
        });
        document.documentElement.classList.remove('mobile-enhanced', 'dev-mode');
      };
    }
  }, []);
  
  // This component doesn't render anything visible
  return null;
} 