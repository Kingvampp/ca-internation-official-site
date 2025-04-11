'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function AdminDashboardClient({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      if (adminAuth === 'true') {
        setIsAuthenticated(true);
      } else {
        // Redirect to login page
        window.location.href = '/admin-login';
      }
      setLoading(false);
    };
    
    checkAuth();
    
    // Listen for storage events (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'adminAuthenticated') {
        if (e.newValue !== 'true') {
          // User logged out in another tab
          window.location.href = '/admin-login';
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // This will never render because we redirect in the useEffect
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
} 