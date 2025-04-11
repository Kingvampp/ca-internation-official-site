'use client';

import React from 'react';

export default function SimpleChat() {
  // Super simple button that should definitely render
  return (
    <button 
      onClick={() => alert('Chat button clicked!')}
      className="fixed bottom-6 right-6 bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center"
      style={{ zIndex: 9999999 }}
    >
      💬
    </button>
  );
} 