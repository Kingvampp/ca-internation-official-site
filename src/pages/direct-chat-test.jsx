import React from 'react';
import Head from 'next/head';

export default function DirectChatTest() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Head>
        <title>Direct Chat Test</title>
      </Head>
      
      <h1 className="text-2xl font-bold mb-4">Direct Chat Test Page</h1>
      <p className="mb-8">This page has an inline chat button that doesn't rely on dynamic imports.</p>
      
      <div
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'red',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 99999999,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={() => alert('Chat button on direct test page clicked!')}
      >
        💬
      </div>
    </div>
  );
} 