"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "../../../../../utils/LanguageContext";

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

export default function EditGalleryItem({ params }: { params: { id: string } }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadingItem, setLoadingItem] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [tags, setTags] = useState('');
  const [mainImage, setMainImage] = useState('');
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  
  // Categories options
  const categories = [
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

        if (!data.authenticated) {
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

  // Fetch gallery item data
  useEffect(() => {
    async function fetchGalleryItem() {
      try {
        setLoadingItem(true);
        // In a real app, you would have an endpoint to get a single item
        // For this implementation, we'll fetch all items and filter
        const response = await fetch('/api/gallery');
        
        if (response.ok) {
          const data = await response.json();
          const item = data.find((item: GalleryItem) => item.id === parseInt(params.id));
          
          if (item) {
            // Populate form with item data
            setTitle(item.title);
            setDescription(item.description);
            setSelectedCategories(item.categories);
            setTags(item.tags.join(', '));
            setMainImage(item.mainImage);
            setBeforeImages(item.beforeImages);
            setAfterImages(item.afterImages);
          } else {
            setNotFound(true);
          }
        } else {
          setError('Failed to load gallery item');
        }
      } catch (error) {
        console.error('Error fetching gallery item:', error);
        setError('An error occurred while loading the gallery item');
      } finally {
        setLoadingItem(false);
      }
    }

    if (!loading) {
      fetchGalleryItem();
    }
  }, [loading, params.id]);

  // Handle category selection
  function handleCategoryToggle(categoryId: string) {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    // Validate form
    if (!title) {
      setError('Title is required');
      setSubmitting(false);
      return;
    }
    
    if (!description) {
      setError('Description is required');
      setSubmitting(false);
      return;
    }
    
    if (selectedCategories.length === 0) {
      setError('At least one category is required');
      setSubmitting(false);
      return;
    }
    
    if (!mainImage) {
      setError('Main image is required');
      setSubmitting(false);
      return;
    }
    
    try {
      // Process the tags from comma-separated string to array
      const tagsArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      // Create gallery item object
      const galleryItemData = {
        id: parseInt(params.id),
        title,
        description,
        categories: selectedCategories,
        mainImage,
        beforeImages,
        afterImages,
        tags: tagsArray
      };
      
      // Submit to API
      const response = await fetch('/api/gallery', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(galleryItemData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Redirect back to gallery management page on success
        router.push('/admin/gallery');
      } else {
        setError(data.message || 'Failed to update gallery item');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred while updating the gallery item');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || loadingItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">{t('gallery.gallery.item.not.fou')}</h1>
        <p className="mb-6">{t('gallery.the.requested.galler')}</p>
        <Link 
          href="/admin/gallery" 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {t('gallery.back.to.gallery.mana')}</Link>
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
                src="/images/ca-logo-white.png"
                alt={t('gallery.ca.international.aut')}
                width={50}
                height={50}
                className="rounded-full shadow-sm"
              />
            </Link>
            <h1 className="ml-4 text-xl font-bold text-gray-900">{t('gallery.admin.dashboard')}</h1>
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

      {/* Edit Gallery Item Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('gallery.edit.gallery.item')}</h2>
          <Link 
            href="/admin/gallery" 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            {t('gallery.cancel')}</Link>
        </div>

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor={t('gallery.title')} className="block text-sm font-medium text-gray-700">
                {t('gallery.title')}</label>
              <input
                type="text"
                id={t('gallery.title')}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. Classic Car Restoration"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor={t('gallery.description')} className="block text-sm font-medium text-gray-700">
                {t('gallery.description')}</label>
              <textarea
                id={t('gallery.description')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Detailed description of the work done"
              />
            </div>

            {/* Categories */}
            <div>
              <span className="block text-sm font-medium text-gray-700 mb-2">
                {t('gallery.categories')}</span>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      selectedCategories.includes(category.id)
                        ? 'bg-blue-100 text-blue-800 border-blue-300 border'
                        : 'bg-gray-100 text-gray-800 border-gray-300 border'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label htmlFor={t('gallery.tags')} className="block text-sm font-medium text-gray-700">
                {t('gallery.tags.comma.separated')}</label>
              <input
                type="text"
                id={t('gallery.tags')}
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g. Classic, Restoration, Vintage"
              />
            </div>

            {/* Current Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('gallery.current.images')}</h3>
              
              {/* Main Image */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">{t('gallery.main.image')}</h4>
                <div className="h-40 w-40 relative">
                  <Image
                    src={mainImage}
                    alt={t('gallery.main.image')}
                    fill
                    className="object-cover rounded border border-gray-300"
                  />
                </div>
              </div>
              
              {/* Before Images */}
              {beforeImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('gallery.before.images')}</h4>
                  <div className="flex flex-wrap gap-4">
                    {beforeImages.map((image, index) => (
                      <div key={index} className="h-24 w-24 relative">
                        <Image
                          src={image}
                          alt={`Before image ${index + 1}`}
                          fill
                          className="object-cover rounded border border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* After Images */}
              {afterImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{t('gallery.after.images')}</h4>
                  <div className="flex flex-wrap gap-4">
                    {afterImages.map((image, index) => (
                      <div key={index} className="h-24 w-24 relative">
                        <Image
                          src={image}
                          alt={`After image ${index + 1}`}
                          fill
                          className="object-cover rounded border border-gray-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {/* Submit button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 