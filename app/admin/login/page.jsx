'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { setAdminAuthenticated, isAdminAuthenticated, logAuthState } from '@/app/admin-auth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  // Check if already authenticated
  useEffect(() => {
    // Log current auth state for debugging
    logAuthState();
    
    // Check authentication status
    if (isAdminAuthenticated()) {
      console.log('Already authenticated, redirecting to admin dashboard');
      router.push('/admin-dashboard');
    }
  }, [router]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Attempting login with admin password');
    
    try {
      // First try the API endpoint
      const response = await fetch('/api/admin-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('Login successful via API');
        setAdminAuthenticated(true);
        
        // Verify authentication was set properly
        setTimeout(() => {
          logAuthState();
          router.push('/admin-dashboard');
        }, 500);
      } else {
        // Fallback to client-side validation
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '83742';
        
        if (password === correctPassword) {
          console.log('Login successful via client-side check');
          setAdminAuthenticated(true);
          
          // Verify authentication was set properly
          setTimeout(() => {
            logAuthState();
            router.push('/admin-dashboard');
          }, 500);
        } else {
          console.log('Login failed: Invalid password');
          setError('Invalid password');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Fallback to client-side validation on API error
      try {
        const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '83742';
        
        if (password === correctPassword) {
          console.log('Login successful via fallback client-side check');
          setAdminAuthenticated(true);
          
          // Verify authentication was set properly
          setTimeout(() => {
            logAuthState();
            router.push('/admin-dashboard');
          }, 500);
        } else {
          setError('Invalid password');
          setLoading(false);
        }
      } catch (fallbackErr) {
        console.error('Fallback login error:', fallbackErr);
        setError('An error occurred during login. Please try again.');
        setLoading(false);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Image
            src="/images/logo/ca-logo.png"
            alt="CA Automotive"
            width={80}
            height={80}
            className="mx-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Access
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Admin Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Admin Login'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="text-sm text-center">
              <a href="/" className="font-medium text-blue-600 hover:text-blue-500">
                Return to website
              </a>
            </div>
          </div>
          
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
              Default password: 83742
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 