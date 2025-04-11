'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import the client component with no SSR to avoid hydration issues
const ClientNotFoundContent = dynamic(
  () => import('./not-found/ClientNotFoundContent'),
  { ssr: false }
);

export default function NotFoundWrapper() {
  return <ClientNotFoundContent />;
} 