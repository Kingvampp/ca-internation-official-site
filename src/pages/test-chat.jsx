'use client';

import React from 'react';
import ChatButton from '../components/ChatButton';
import { useEffect } from 'react';

export default function TestChatPage() {
  
  useEffect(() => {
    console.log('Test Chat Page mounted');
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-4">Chat Test Page</h1>
      <p className="mb-8">This page is for testing the chat button functionality.</p>

      <ChatButton />
    </div>
  );
} 