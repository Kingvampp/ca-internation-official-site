"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "../../../utils/LanguageContext";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryStats, setGalleryStats] = useState({ total: 0 });
  const [testimonialStats, setTestimonialStats] = useState({ 
    total: 0,
    pending: 0,
    approved: 0
  });
  const [translationStats, setTranslationStats] = useState<{
    enKeyCount: number;
    esKeyCount: number;
    completeness: string;
    missingCount: number;
  }>({ enKeyCount: 0, esKeyCount: 0, completeness: '0%', missingCount: 0 });
  const router = useRouter();

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
    // Fetch gallery stats
    async function fetchGalleryStats() {
      try {
        const response = await fetch('/api/gallery?count=true');
        if (response.ok) {
          const data = await response.json();
          setGalleryStats(data);
        }
      } catch (error) {
        console.error('Error fetching gallery stats:', error);
      }
    }
    
    // Fetch testimonial stats
    async function fetchTestimonialStats() {
      try {
        const response = await fetch('/api/testimonials?admin=true');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.data)) {
            const testimonials = data.data;
            const pending = testimonials.filter(t => t.status === 'pending').length;
            const approved = testimonials.filter(t => t.status === 'approved').length;
            setTestimonialStats({
              total: testimonials.length,
              pending,
              approved
            });
          }
        }
      } catch (error) {
        console.error('Error fetching testimonial stats:', error);
      }
    }
    
    // Fetch translation stats
    async function fetchTranslationStats() {
      try {
        const response = await fetch('/api/translations/stats');
        if (response.ok) {
          const data = await response.json();
          setTranslationStats({
            enKeyCount: data.enKeyCount,
            esKeyCount: data.esKeyCount,
            completeness: data.completeness,
            missingCount: data.missingCount || 0
          });
        }
      } catch (error) {
        console.error('Error fetching translation stats:', error);
      }
    }

    if (!loading && user) {
      fetchGalleryStats();
      fetchTestimonialStats();
      fetchTranslationStats();
    }
  }, [loading, user]);

  async function handleLogout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
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
                alt={t('admin.ca.international.aut')}
                width={50}
                height={50}
                className="rounded-full shadow-sm"
              />
            </Link>
            <h1 className="ml-4 text-xl font-bold text-gray-900">{t('admin.admin.dashboard')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              {t('admin.logout')}</button>
          </div>
        </div>
      </header>

      {/* Admin Navigation */}
      <nav className="bg-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link 
              href="/admin/dashboard" 
              className="px-3 py-4 text-sm font-medium bg-blue-900 rounded-t"
            >
              {t('admin.dashboard')}</Link>
            <Link 
              href="/admin/gallery" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              {t('admin.gallery.management')}</Link>
            <Link 
              href="/admin/appointments" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              {t('admin.appointments')}</Link>
            <Link 
              href="/admin/testimonials" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              Testimonials</Link>
            <Link 
              href="/admin/translations" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              {t('admin.translations.management')}</Link>
          </div>
        </div>
      </nav>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.admin.dashboard')}</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Gallery Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('admin.gallery.items')}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{galleryStats.total}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/gallery" className="font-medium text-blue-700 hover:text-blue-900">
                  {t('admin.view.all')}
                </Link>
              </div>
            </div>
          </div>

          {/* Testimonials Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Testimonials</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{testimonialStats.total}</div>
                      {testimonialStats.pending > 0 && (
                        <div className="text-sm text-amber-500">
                          {testimonialStats.pending} pending review
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/testimonials" className="font-medium text-blue-700 hover:text-blue-900">
                  Manage testimonials
                </Link>
              </div>
            </div>
          </div>

          {/* Translations Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{t('admin.translations')}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{translationStats.completeness}</div>
                      <div className="text-sm text-gray-500">
                        {translationStats.esKeyCount}/{translationStats.enKeyCount} keys
                        {translationStats.missingCount > 0 && (
                          <span className="text-red-500 ml-2">
                            ({translationStats.missingCount} missing)
                          </span>
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link href="/admin/translations" className="font-medium text-blue-700 hover:text-blue-900">
                  {t('admin.manage.translations')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Section */}
        <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">{t('admin.quick.actions')}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link 
            href="/admin/gallery/add" 
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">{t('admin.add.gallery.item')}</p>
              <p className="text-sm text-gray-500 truncate">{t('admin.add.new.work')}</p>
            </div>
          </Link>

          <Link 
            href="/admin/testimonials" 
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">Manage Testimonials</p>
              <p className="text-sm text-gray-500 truncate">Review and approve customer feedback</p>
            </div>
          </Link>

          <Link 
            href="/admin/translations" 
            className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
          >
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <span className="absolute inset-0" aria-hidden="true" />
              <p className="text-sm font-medium text-gray-900">{t('admin.manage.translations')}</p>
              <p className="text-sm text-gray-500 truncate">{t('admin.update.translations')}</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
} 