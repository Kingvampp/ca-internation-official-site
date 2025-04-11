'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  isAdminAuthenticated, 
  setAdminAuthenticated,
  logAuthState, 
  forceAuthentication
} from '@/app/admin-auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export default function SimpleAuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking admin authentication status');
      try {
        const isAuth = isAdminAuthenticated();
        setAuthenticated(isAuth);
        
        if (!isAuth) {
          console.log('User not authenticated, redirecting to login');
          // Set timeout to avoid immediate redirect that can cause issues
          setTimeout(() => {
            router.push('/admin/login');
          }, 100);
        } else {
          console.log('User is authenticated, continuing');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    
    // Debug authentication state
    logAuthState();
    
    // Force auth in development mode if enabled
    if (process.env.NEXT_PUBLIC_FORCE_ADMIN_AUTH === 'true' && process.env.NODE_ENV === 'development') {
      console.log('DEVELOPMENT MODE: Forcing admin authentication');
      forceAuthentication();
      setAuthenticated(true);
      setLoading(false);
    }
  }, [router]);

  // Login function - simplified to just check password
  const login = (password) => {
    console.log('Attempting login with admin password');
    
    // Simple authentication check (replace with actual auth in production)
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      console.log('Login successful');
      setAdminAuthenticated(true);
      setAuthenticated(true);
      return true;
    }
    
    console.log('Login failed: Invalid password');
    return false;
  };

  // Logout function
  const logout = () => {
    console.log('Logging out user');
    setAdminAuthenticated(false);
    setAuthenticated(false);
    router.push('/');
  };

  // Debug authentication state in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Authentication Provider State:', { authenticated, loading });
    }
  }, [authenticated, loading]);

  const value = {
    authenticated,
    loading,
    login,
    logout
  };

  // If not authenticated and not loading, show an empty div - the redirect will happen
  if (!authenticated && !loading) {
    return null; // Return null to avoid showing content while redirecting
  }

  // If loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 