'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the ChatBot component to ensure it only loads on the client
const ChatBot = dynamic(() => import('./ChatBot'), {
  ssr: false,
  loading: () => null,
});

export default function ChatBotWrapper() {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  // Only mount the component on the client side
  useEffect(() => {
    setMounted(true);
    
    // Add error boundary for the chatbot
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('ChatBot')) {
        setError(true);
        event.preventDefault();
      }
    });

    return () => {
      window.removeEventListener('error', () => {});
    };
  }, []);

  // Don't render anything on the server
  if (!mounted) return null;
  
  // Show nothing if there's an error
  if (error) return null;

  return (
    <Suspense fallback={null}>
      <ChatBot />
    </Suspense>
  );
} 