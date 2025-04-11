'use client';

import React from 'react';

export default function ChatButton({ onClick, isOpen }) {
  return (
    <button 
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-red-500 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-red-600 transition-all duration-300 z-50 border-4 border-blue-600"
      aria-label="Chat with AI assistant"
    >
      {isOpen ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )}
    </button>
  );
} 