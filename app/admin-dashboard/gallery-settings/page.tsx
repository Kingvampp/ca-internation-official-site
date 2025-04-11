'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '../../../components/admin/AdminHeader';
import { useLanguage } from '../../../utils/LanguageContext';

// Define types for translations and categories
interface TranslationItem {
  key: string;
  en: string;
  es: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

export default function GallerySettings() {
  const { t } = useLanguage();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // States for gallery settings
  const [galleryTranslations, setGalleryTranslations] = useState<TranslationItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [defaultSort, setDefaultSort] = useState('newest');
  
  // States for adding new category
  const [newCategory, setNewCategory] = useState<Category>({
    id: '',
    name: '',
    slug: '',
    description: '',
    count: 0
  });
  
  // Load gallery settings
  useEffect(() => {
    const fetchGallerySettings = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would fetch from an API
        // For now, we'll use mock data
        
        // Mock gallery translations
        const mockGalleryTranslations: TranslationItem[] = [
          { key: 'gallery.title', en: 'Gallery', es: 'Galería' },
          { key: 'gallery.subtitle', en: 'Our Work', es: 'Nuestro Trabajo' },
          { key: 'gallery.viewDetails', en: 'View Details', es: 'Ver Detalles' },
          { key: 'gallery.beforeAfterLabel', en: 'Before & After', es: 'Antes y Después' },
          { key: 'gallery.before', en: 'Before', es: 'Antes' },
          { key: 'gallery.after', en: 'After', es: 'Después' },
          { key: 'gallery.noItems', en: 'No gallery items found', es: 'No se encontraron elementos en la galería' },
          { key: 'gallery.all', en: 'All Categories', es: 'Todas las Categorías' },
          { key: 'gallery.loading', en: 'Loading gallery items...', es: 'Cargando elementos de la galería...' },
        ];
        
        // Mock categories
        const mockCategories: Category[] = [
          { id: 'paint', name: 'Paint', slug: 'paint', description: 'Vehicle painting and finish work', count: 12 },
          { id: 'collision', name: 'Collision Repair', slug: 'collision', description: 'Accident damage repair', count: 8 },
          { id: 'bodywork', name: 'Bodywork', slug: 'bodywork', description: 'Body panel repair and customization', count: 10 },
          { id: 'restoration', name: 'Restoration', slug: 'restoration', description: 'Classic car restoration projects', count: 6 },
          { id: 'detailing', name: 'Detailing', slug: 'detailing', description: 'Professional detailing services', count: 5 },
          { id: 'luxury', name: 'Luxury', slug: 'luxury', description: 'Luxury vehicle services', count: 9 },
        ];
        
        setGalleryTranslations(mockGalleryTranslations);
        setCategories(mockCategories);
        
        // Mock gallery settings
        setItemsPerPage(9);
        setDefaultSort('newest');
        
      } catch (err) {
        console.error('Error loading gallery settings:', err);
        setError('Failed to load gallery settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGallerySettings();
  }, []);
  
  // Handle saving gallery settings
  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // In a real implementation, this would save to an API
      console.log('Saving gallery settings...');
      console.log('Gallery Translations:', galleryTranslations);
      console.log('Categories:', categories);
      console.log('Items Per Page:', itemsPerPage);
      console.log('Default Sort:', defaultSort);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Gallery settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err) {
      console.error('Error saving gallery settings:', err);
      setError('Failed to save gallery settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle translation change
  const handleTranslationChange = (
    index: number, 
    field: 'en' | 'es', 
    value: string
  ) => {
    const newGalleryTranslations = [...galleryTranslations];
    newGalleryTranslations[index] = {
      ...newGalleryTranslations[index],
      [field]: value
    };
    setGalleryTranslations(newGalleryTranslations);
  };
  
  // Handle category input change
  const handleCategoryChange = (
    index: number,
    field: keyof Category,
    value: string | number
  ) => {
    const newCategories = [...categories];
    newCategories[index] = {
      ...newCategories[index],
      [field]: value
    };
    setCategories(newCategories);
  };
  
  // Handle new category input change
  const handleNewCategoryChange = (
    field: keyof Category,
    value: string | number
  ) => {
    setNewCategory({
      ...newCategory,
      [field]: value
    });
    
    // Auto-generate slug if name is updated
    if (field === 'name') {
      setNewCategory({
        ...newCategory,
        name: value as string,
        slug: (value as string).toLowerCase().replace(/\s+/g, '-')
      });
    }
  };
  
  // Add new category
  const handleAddCategory = () => {
    if (!newCategory.name) {
      setError('Category name is required.');
      return;
    }
    
    const id = newCategory.slug || newCategory.name.toLowerCase().replace(/\s+/g, '-');
    
    // Check if category already exists
    if (categories.some(cat => cat.id === id || cat.slug === newCategory.slug)) {
      setError('A category with this name or slug already exists.');
      return;
    }
    
    setCategories([
      ...categories,
      {
        ...newCategory,
        id,
        count: 0
      }
    ]);
    
    // Reset new category form
    setNewCategory({
      id: '',
      name: '',
      slug: '',
      description: '',
      count: 0
    });
    
    setSuccess('New category added successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  // Remove category
  const handleRemoveCategory = (index: number) => {
    const categoryToRemove = categories[index];
    
    // Ask for confirmation, especially if category has items
    if (categoryToRemove.count && categoryToRemove.count > 0) {
      if (!window.confirm(`This category contains ${categoryToRemove.count} items. Are you sure you want to remove it?`)) {
        return;
      }
    }
    
    const newCategories = [...categories];
    newCategories.splice(index, 1);
    setCategories(newCategories);
    
    setSuccess('Category removed successfully!');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  if (loading) {
    return (
      <div className="p-8">
        <AdminHeader title="Gallery Settings" />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <AdminHeader title="Gallery Settings" subtitle="Configure your gallery display options" />
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{success}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setSuccess(null)}
          >
            <svg className="fill-current h-6 w-6 text-green-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6 sticky top-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Gallery Configuration</h3>
            <nav className="space-y-2">
              <a href="#general-settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700">
                General Settings
              </a>
              <a href="#category-settings" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                Category Settings
              </a>
              <a href="#translations" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                Text & Translations
              </a>
              <Link href="/admin-dashboard/gallery" className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900">
                ← Back to Gallery
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSaveSettings}>
            {/* General Settings */}
            <div id="general-settings" className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-1">
                    Items Per Page
                  </label>
                  <select
                    id="itemsPerPage"
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={6}>6 items</option>
                    <option value={9}>9 items</option>
                    <option value={12}>12 items</option>
                    <option value={15}>15 items</option>
                    <option value={18}>18 items</option>
                    <option value={24}>24 items</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="defaultSort" className="block text-sm font-medium text-gray-700 mb-1">
                    Default Sort Order
                  </label>
                  <select
                    id="defaultSort"
                    value={defaultSort}
                    onChange={(e) => setDefaultSort(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Category Settings */}
            <div id="category-settings" className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Category Settings</h2>
              
              {/* Add New Category */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-md font-medium text-blue-900 mb-3">Add New Category</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="newCategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      id="newCategoryName"
                      value={newCategory.name}
                      onChange={(e) => handleNewCategoryChange('name', e.target.value)}
                      placeholder="e.g. Restoration"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="newCategorySlug" className="block text-sm font-medium text-gray-700 mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      id="newCategorySlug"
                      value={newCategory.slug}
                      onChange={(e) => handleNewCategoryChange('slug', e.target.value)}
                      placeholder="e.g. restoration"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="newCategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="newCategoryDescription"
                    value={newCategory.description}
                    onChange={(e) => handleNewCategoryChange('description', e.target.value)}
                    placeholder="Brief description of this category"
                    rows={2}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add Category
                  </button>
                </div>
              </div>
              
              {/* Existing Categories */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Slug</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Items</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {categories.map((category, index) => (
                      <tr key={category.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                            className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <input
                            type="text"
                            value={category.slug}
                            onChange={(e) => handleCategoryChange(index, 'slug', e.target.value)}
                            className="block w-full border-0 p-0 text-gray-500 placeholder-gray-500 focus:ring-0 sm:text-sm"
                          />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {category.count || 0}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            onClick={() => handleRemoveCategory(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                          No categories defined. Add your first category above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Text & Translations */}
            <div id="translations" className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Text & Translations</h2>
              
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Key</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">English</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Spanish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {galleryTranslations.map((translation, index) => (
                      <tr key={translation.key}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {translation.key}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <input
                            type="text"
                            value={translation.en}
                            onChange={(e) => handleTranslationChange(index, 'en', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          <input
                            type="text"
                            value={translation.es}
                            onChange={(e) => handleTranslationChange(index, 'es', e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 