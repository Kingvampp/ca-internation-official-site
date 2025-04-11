'use client';

import React, { useState, useEffect } from 'react';

export default function TestButton() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log('TestButton component mounted');
  }, []);

  if (!mounted) return null;

  return (
    <button 
      onClick={() => alert('Test button clicked!')}
      className="fixed bottom-20 right-6 bg-green-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-[9999]"
      style={{ zIndex: 9999 }}
    >
      Test
    </button>
  );
} 