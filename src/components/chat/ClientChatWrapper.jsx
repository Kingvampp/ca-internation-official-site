'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the ChatContainer with no SSR
const ChatContainer = dynamic(() => import('./ChatContainer'), {
  ssr: false, // Disable server-side rendering completely
});

export default function ClientChatWrapper() {
  const [error, setError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only try to render on client side
    setMounted(true);

    // Add global error handler for chat component errors
    const errorHandler = (event) => {
      // Only catch errors from our chat components
      if (
        event.message &&
        (event.message.includes('chat') || 
         event.message.includes('Chat') ||
         event.message.includes('Cannot read properties of undefined'))
      ) {
        console.log('Chat error caught:', event.message);
        setError(true);
        // Prevent the error from bubbling up
        event.preventDefault();
      }
    };

    window.addEventListener('error', errorHandler);
    
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);

  // Don't render anything on server or if there's an error
  if (!mounted || error) return null;

  // Wrap the chat container in an error boundary
  try {
    return <ChatContainer />;
  } catch (err) {
    console.error('Failed to render chat container:', err);
    return null;
  }
} 