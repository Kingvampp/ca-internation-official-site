'use client';

import dynamic from 'next/dynamic';

// Import component with no SSR to avoid hydration issues with cookies
const NewWelcomeModal = dynamic(() => import('./NewWelcomeModal'), {
  ssr: false,
});

export default function WelcomeModalWrapper() {
  return <NewWelcomeModal />;
} 