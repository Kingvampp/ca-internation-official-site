"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "../../../utils/LanguageContext";

// Define gallery item type
type GalleryItem = {
  id: number;
  title: string;
  categories: string[];
  mainImage: string;
  description: string;
  tags: string[];
  beforeImages: string[];
  afterImages: string[];
};

export default function GalleryManagement() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Projects" },
    { id: "bf", name: "Before & After" },
    { id: "collision", name: "Collision Repair" },
    { id: "paint", name: "Custom Paint" },
    { id: "restoration", name: "Restoration" },
    { id: "detail", name: "Detailing" },
    { id: "bodywork", name: "Bodywork" },
  ];

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch('/api/auth');
        const data = await response.json();

        if (data.authenticated) {
          setUser(data.user);
        } else {
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

  // Load gallery items
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        setLoading(true);
        const response = await fetch('/api/gallery');
        
        if (response.ok) {
          const data = await response.json();
          // Fix: API returns { items: [...] } so we need to extract the items array
          setGalleryItems(Array.isArray(data.items) ? data.items : []);
          console.log('Gallery items loaded:', data.items ? data.items.length : 0);
        } else {
          console.error('Failed to fetch gallery items');
          setGalleryItems([]);
        }
      } catch (error) {
        console.error('Error fetching gallery items:', error);
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchGalleryItems();
  }, []);

  // Dummy function to create a new gallery item (would connect to API in real implementation)
  function handleAddItem() {
    router.push('/admin/gallery/add');
  }
  
  // Dummy function to edit an item (would connect to API in real implementation)
  function handleEditItem(item: GalleryItem) {
    router.push(`/admin/gallery/edit/${item.id}`);
  }
  
  // Delete a gallery item
  async function handleDeleteItem(item: GalleryItem) {
    if (!item || !item.id) {
      console.error('Invalid gallery item:', item);
      alert('Cannot delete this item - invalid ID');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        const response = await fetch(`/api/gallery?id=${item.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Remove item from local state
          setGalleryItems(galleryItems.filter(i => i.id !== item.id));
        } else {
          const data = await response.json();
          alert(data.message || 'Failed to delete gallery item');
        }
      } catch (error) {
        console.error('Error deleting gallery item:', error);
        alert('An error occurred while deleting the gallery item');
      }
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
                alt={t('gallery.ca.international.aut')}
                width={50}
                height={50}
                className="rounded-full shadow-sm"
              />
            </Link>
            <h1 className="ml-4 text-xl font-bold text-gray-900">{t('gallery.admin.dashboard')}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
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
              {t('gallery.dashboard')}</Link>
            <Link 
              href="/admin/gallery" 
              className="px-3 py-4 text-sm font-medium bg-blue-900 rounded-t"
            >
              {t('gallery.gallery.management')}</Link>
            <Link 
              href="/admin/appointments" 
              className="px-3 py-4 text-sm font-medium hover:bg-blue-700"
            >
              {t('gallery.appointments')}</Link>
          </div>
        </div>
      </nav>

      {/* Gallery Management Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">{t('gallery.gallery.management')}</h2>
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {t('gallery.add.new.gallery.item')}</button>
        </div>

        {/* Gallery Items Table */}
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('gallery.image')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('gallery.title')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('gallery.categories')}</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('gallery.description')}</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('gallery.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(galleryItems) && galleryItems.length > 0 ? (
                galleryItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex-shrink-0 h-20 w-20 relative">
                        <Image
                          src={item.mainImage}
                          alt={item.title}
                          fill
                          className="object-cover rounded"
                          sizes={t('gallery.80px')}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(item.categories) && item.categories.map((cat) => (
                          <span 
                            key={cat} 
                            className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800"
                          >
                            {categories.find(c => c.id === cat)?.name || cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        {t('gallery.edit')}</button>
                      <button
                        onClick={() => handleDeleteItem(item)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('gallery.delete')}</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    {t('gallery.no.items.found')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
} 