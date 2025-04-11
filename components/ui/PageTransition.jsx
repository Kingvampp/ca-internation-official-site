'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageTransition component adds smooth fade transitions when navigating between pages
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The page content to be wrapped
 * @returns {JSX.Element}
 */
const PageTransition = ({ children }) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Hide content immediately when path changes
    setIsVisible(false);
    
    // Show content after a small delay to create the transition effect
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pathname]);
  
  return (
    <div 
      className={`transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 transform-none' : 'opacity-0 transform translate-y-4'
      }`}
    >
      {children}
    </div>
  );
};

export default PageTransition; 