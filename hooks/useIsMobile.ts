'use client';

import { useState, useEffect } from 'react';

export default function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only execute on client-side
    if (typeof window === 'undefined') return;

    // Initialize based on current window width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Check on mount
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', checkMobile);
  }, [breakpoint]);

  return isMobile;
} 