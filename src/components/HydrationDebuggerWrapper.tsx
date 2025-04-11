'use client';

import dynamic from 'next/dynamic';

// Import HydrationDebugger with no SSR (only for development)
const HydrationDebugger = dynamic(() => import('./HydrationDebugger'), {
  ssr: false,
});

export default function HydrationDebuggerWrapper() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <HydrationDebugger />;
} 