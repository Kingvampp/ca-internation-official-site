"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaEdit, FaTrash, FaCheck, FaBan, FaSpinner } from 'react-icons/fa';
import { useLanguage } from '@/utils/LanguageContext';
import { Testimonial } from '@/utils/testimonialService';

export default function AdminTestimonials() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  // Filter testimonials based on active tab
  const filteredTestimonials = testimonials.filter(testimonial => {
    if (activeTab === 'all') return true;
    return testimonial.status === activeTab;
  });

  useEffect(() => {
    // Check if user is authenticated
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth');
        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
          // Redirect to login if not authenticated
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Fetch testimonials
    async function fetchTestimonials() {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await fetch('/api/testimonials?admin=true');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            setTestimonials(data.data);
          } else {
            setError('Failed to load testimonials.');
          }
        } else {
          setError('Failed to connect to testimonials API.');
        }
      } catch (error) {
        console.error('Error fetching testimonials:', error);
        setError('An unexpected error occurred while fetching testimonials.');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchTestimonials();
    }
  }, [user]);

  // Handle testimonial status update
  async function updateTestimonialStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    setError(null);
    setSuccessMessage(null);
    setStatusUpdating(id);
    
    try {
      const response = await fetch('/api/testimonials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          status,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the local state with the new status
        setTestimonials(prevTestimonials => 
          prevTestimonials.map(testimonial => 
            testimonial.id === id ? { ...testimonial, status } : testimonial
          )
        );
        
        setSuccessMessage(`Testimonial ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully.`);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(data.error || 'Failed to update testimonial status.');
      }
    } catch (error) {
      console.error('Error updating testimonial status:', error);
      setError('An unexpected error occurred while updating testimonial status.');
    } finally {
      setStatusUpdating(null);
    }
  }

  // Handle testimonial deletion
  async function deleteTestimonial(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      return;
    }
    
    setError(null);
    setSuccessMessage(null);
    setStatusUpdating(id);
    
    try {
      const response = await fetch(`/api/testimonials?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove the deleted testimonial from local state
        setTestimonials(prevTestimonials => 
          prevTestimonials.filter(testimonial => testimonial.id !== id)
        );
        
        setSuccessMessage('Testimonial deleted successfully.');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setError(data.error || 'Failed to delete testimonial.');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      setError('An unexpected error occurred while deleting testimonial.');
    } finally {
      setStatusUpdating(null);
    }
  }

  // Format date for display
  function formatDate(date: any) {
    if (!date) return 'Unknown Date';
    
    try {
      // If it's a Firestore timestamp or has toDate method
      if (typeof date.toDate === 'function') {
        date = date.toDate();
      }
      
      // If it's a string, try to convert it
      if (typeof date === 'string') {
        date = new Date(date);
      }
      
      return new Intl.DateTimeFormat('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return 'Invalid Date';
    }
  }

  // Render star ratings
  function renderStars(rating: number) {
    return Array.from({ length: 5 }).map((_, index) => {
      const starColor = index < rating ? "text-amber-400" : "text-gray-300";
      
      return (
        <span key={`star-${index}`} className={starColor}>
          <FaStar size={16} />
        </span>
      );
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/images/logo/ca-logo.png"
                alt="CA International Automotive"
                width={50}
                height={50}
                className="rounded-full shadow-sm"
              />
            </Link>
            <h1 className="ml-4 text-xl font-bold text-gray-900">Testimonial Management</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
            <Link 
              href="/admin/dashboard"
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link 
              href="/admin/dashboard" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              Dashboard</Link>
            <Link 
              href="/admin/gallery" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              Gallery Management</Link>
            <Link 
              href="/admin/appointments" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              Appointments</Link>
            <Link 
              href="/admin/testimonials" 
              className="px-3 py-4 text-sm font-medium bg-blue-900 rounded-t"
            >
              Testimonials</Link>
            <Link 
              href="/admin/translations" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              Translations</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Testimonials</h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All ({testimonials.length})
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending ({testimonials.filter(t => t.status === 'pending').length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Approved ({testimonials.filter(t => t.status === 'approved').length})
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Rejected ({testimonials.filter(t => t.status === 'rejected').length})
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p>{successMessage}</p>
          </div>
        )}

        {/* Testimonials List */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <span className="text-blue-600 mr-2 inline-block animate-spin">
              <FaSpinner size={24} />
            </span>
            <span>Loading testimonials...</span>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-500">No testimonials found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id} 
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  testimonial.status === 'pending' ? 'border-amber-500' :
                  testimonial.status === 'approved' ? 'border-green-500' :
                  'border-red-500'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                      {testimonial.email && (
                        <span className="ml-3 text-sm text-gray-500">
                          ({testimonial.email})
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {renderStars(testimonial.rating)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {testimonial.car && `${testimonial.car} • `}
                        {testimonial.service && testimonial.service}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      Submitted on {formatDate(testimonial.date)}
                    </div>
                    
                    <p className="text-gray-700">{testimonial.message}</p>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[150px]">
                    <div className="flex gap-2">
                      <button
                        disabled={statusUpdating === testimonial.id || testimonial.status === 'approved'}
                        onClick={() => updateTestimonialStatus(testimonial.id!, 'approved')}
                        className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded
                          ${testimonial.status === 'approved'
                            ? 'bg-green-100 text-green-700 cursor-default'
                            : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                      >
                        <span className="mr-1">
                          {statusUpdating === testimonial.id ? (
                            <span className="animate-spin inline-block">
                              <FaSpinner />
                            </span>
                          ) : (
                            <FaCheck />
                          )}
                        </span>
                        Approve
                      </button>
                      
                      <button
                        disabled={statusUpdating === testimonial.id || testimonial.status === 'rejected'}
                        onClick={() => updateTestimonialStatus(testimonial.id!, 'rejected')}
                        className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded
                          ${testimonial.status === 'rejected'
                            ? 'bg-red-100 text-red-700 cursor-default'
                            : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                      >
                        <span className="mr-1">
                          {statusUpdating === testimonial.id ? (
                            <span className="animate-spin inline-block">
                              <FaSpinner />
                            </span>
                          ) : (
                            <FaBan />
                          )}
                        </span>
                        Reject
                      </button>
                    </div>
                    
                    {testimonial.status === 'rejected' && (
                      <button
                        disabled={statusUpdating === testimonial.id}
                        onClick={() => updateTestimonialStatus(testimonial.id!, 'pending')}
                        className="flex items-center justify-center px-4 py-2 text-sm font-medium bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="mr-1">
                          {statusUpdating === testimonial.id ? (
                            <span className="animate-spin inline-block">
                              <FaSpinner />
                            </span>
                          ) : (
                            <FaEdit />
                          )}
                        </span>
                        Move to Pending
                      </button>
                    )}
                    
                    <button
                      disabled={statusUpdating === testimonial.id}
                      onClick={() => deleteTestimonial(testimonial.id!)}
                      className="flex items-center justify-center px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-1">
                        {statusUpdating === testimonial.id ? (
                          <span className="animate-spin inline-block">
                            <FaSpinner />
                          </span>
                        ) : (
                          <FaTrash />
                        )}
                      </span>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 