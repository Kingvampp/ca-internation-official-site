'use client';

import { useState, useEffect } from 'react';

/**
 * ClientOnly - A component that only renders its children on the client side
 * to prevent hydration mismatches with components that rely on browser APIs.
 */
export default function ClientOnly({ children, fallback = null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Cleanup function
    return () => {
      setIsMounted(false);
    };
  }, []);

  if (!isMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 