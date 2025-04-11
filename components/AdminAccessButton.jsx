'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminAccessButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const openModal = () => {
    setIsOpen(true);
    setPassword('');
    setError('');
  };

  const closeModal = () => {
    setIsOpen(false);
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (data.success) {
        // Store authentication in sessionStorage
        sessionStorage.setItem('adminAuthenticated', 'true');
        
        // Redirect to admin dashboard
        router.push(data.redirectUrl);
      } else {
        setError(data.message || 'Authentication failed');
        setLoading(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Lock Icon Button */}
      <button 
        onClick={openModal}
        className="fixed bottom-4 right-4 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
        aria-label="Admin Access"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* Modal Content */}
          <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="mx-auto bg-blue-100 rounded-full p-3 inline-block">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mt-2">Admin Access</h2>
              <p className="text-gray-600 mt-1">Enter admin password to continue</p>
            </div>
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
              >
                {loading ? 'Authenticating...' : 'Admin Login'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAccessButton; 