"use client";

import dynamic from 'next/dynamic';

// Dynamically import MobileOptimizationProvider
const MobileOptimizationProvider = dynamic(() => import('./MobileOptimizationProvider'), {
  ssr: false,
});

// Dynamically import ImageOptimizationProvider
const ImageOptimizationProvider = dynamic(() => import('./ImageOptimizationProvider'), {
  ssr: false,
});

// Dynamically import FormOptimizationProvider
const FormOptimizationProvider = dynamic(() => import('./FormOptimizationProvider'), {
  ssr: false,
});

/**
 * Client Providers Component
 * 
 * This component wraps client-side only providers
 * to avoid SSR issues and keep them separate from
 * the main application layout.
 */
export default function ClientProviders() {
  return (
    <>
      <MobileOptimizationProvider />
      <ImageOptimizationProvider />
      <FormOptimizationProvider />
    </>
  );
} 