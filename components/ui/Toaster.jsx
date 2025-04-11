'use client';

import { Toaster as HotToaster } from 'react-hot-toast';

export default function Toaster() {
  return (
    <HotToaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
        },
        
        // Default options for specific types of toasts
        success: {
          duration: 3000,
          style: {
            background: '#f0fff4',
            border: '1px solid #c6f6d5',
            color: '#2f855a',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#fff5f5',
            border: '1px solid #fed7d7',
            color: '#c53030',
          },
        },
      }}
    />
  );
} 