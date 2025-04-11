'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboardError({ 
  error, 
  reset 
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We're sorry, but there was an error in the admin dashboard.
          </p>
        </div>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded overflow-auto">
            <p>Error: {error.message || 'Unknown error occurred'}</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => reset()}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
            
            <div className="flex items-center justify-center">
              <div className="text-sm">
                <Link
                  href="/admin-dashboard"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Return to dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 