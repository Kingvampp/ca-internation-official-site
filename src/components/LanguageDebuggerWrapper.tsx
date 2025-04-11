'use client';

import dynamic from 'next/dynamic';

// Dynamically import the debugger (only in development)
const LanguageDebugger = dynamic(
  () => import('./LanguageDebugger'),
  { ssr: false }
);

export default function LanguageDebuggerWrapper() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return <LanguageDebugger show={true} />;
} 