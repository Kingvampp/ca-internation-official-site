'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AppointmentsError({ 
  error, 
  reset 
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Appointments Error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-red-50 p-6 border-b border-red-100">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">
              Something went wrong
            </h2>
          </div>
          <p className="mt-3 text-red-600 text-sm">
            {error.message || 'An unexpected error occurred while loading appointments.'}
          </p>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            We encountered an error while trying to load the appointments data. This could be due to a network issue or a problem with our servers.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={() => reset()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
            
            <Link
              href="/admin-dashboard"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 