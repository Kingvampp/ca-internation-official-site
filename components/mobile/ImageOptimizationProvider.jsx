"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the image optimizer to prevent SSR issues
import { useLanguage } from "../../utils/LanguageContext";
const ImageOptimizer = dynamic(() => import('../../utils/imageOptimizer'), {
  ssr: false,
});

/**
 * Image Optimization Provider
 * 
 * This component initializes image optimizations for mobile devices
 * without affecting existing image components.
 */
export default function ImageOptimizationProvider() {
  const { t } = useLanguage();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Initialize image optimizations after page load
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setIsLoaded(true);
        
        // Initialize image optimizer
        if (typeof ImageOptimizer?.init === 'function') {
          ImageOptimizer.init();
          
          // Run image analysis in development
          if (process.env.NODE_ENV === 'development' && typeof ImageOptimizer?.analyzeImages === 'function') {
            ImageOptimizer.analyzeImages();
          }
        }
      }
    }, 1000); // Wait for images to start loading
    
    return () => clearTimeout(timer);
  }, []);
  
  // Add responsive image breakpoints
  useEffect(() => {
    if (typeof window === 'undefined' || !isLoaded) return;
    
    // Add viewport meta tag for responsive images (if missing)
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0';
      document.head.appendChild(meta);
    }
    
    // Add media query breakpoint hints for resource prioritization
    const links = [
      { rel: 'preconnect', href: window.location.origin },
      { 
        rel: 'preload', 
        as: 'image', 
        href: '/images/logo/ca-logo.png', 
        imagesrcset: '/images/logo/ca-logo.png'
      }
    ];
    
    links.forEach(linkData => {
      const link = document.createElement('link');
      Object.entries(linkData).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      document.head.appendChild(link);
    });
  }, [isLoaded]);
  
  // This component doesn't render anything visible
  return null;
} 