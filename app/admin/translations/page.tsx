"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from "../../../utils/LanguageContext";

// Define translation edit modal component
function TranslationEditModal({ 
  isOpen, 
  onClose, 
  translationKey, 
  value, 
  language, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  translationKey: string; 
  value: string; 
  language: string; 
  onSave: (key: string, value: string) => Promise<void>;
}) {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!editValue.trim()) {
      setError('Translation cannot be empty');
      return;
    }

    setError('');
    setIsSaving(true);
    try {
      await onSave(translationKey, editValue);
      onClose();
    } catch (err) {
      setError('Failed to save translation');
      console.error('Error saving translation:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Edit Translation
              </h3>
              <div className="mt-2">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Key
                  </label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md">
                    {translationKey}
                  </div>
                </div>
                <div className="mb-4">
                  <label htmlFor="translation-value" className="block text-sm font-medium text-gray-700">
                    {language === 'en' ? 'English' : 'Spanish'} Translation
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="translation-value"
                      rows={4}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  </div>
                </div>
                {error && (
                  <div className="mb-4 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={isSaving}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={handleSave}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main translation management component
export default function TranslationsManagement() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [translations, setTranslations] = useState<any>(null);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [selectedSection, setSelectedSection] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEditKey, setCurrentEditKey] = useState('');
  const [currentEditValue, setCurrentEditValue] = useState('');
  const [missingTranslations, setMissingTranslations] = useState<string[]>([]);
  const [translationStats, setTranslationStats] = useState<{
    enKeyCount: number;
    esKeyCount: number;
    completeness: string;
  }>({ enKeyCount: 0, esKeyCount: 0, completeness: '0%' });
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

  // Fetch translations
  useEffect(() => {
    async function fetchTranslations() {
      try {
        setError('');
        const response = await fetch(`/api/translations?lang=${activeLanguage}`);
        
        if (response.ok) {
          const data = await response.json();
          setTranslations(data);
          
          // Fetch translation stats
          const statsResponse = await fetch('/api/translations/stats');
          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            setTranslationStats({
              enKeyCount: statsData.enKeyCount,
              esKeyCount: statsData.esKeyCount,
              completeness: statsData.completeness
            });
            
            // If Spanish is active, set missing translations
            if (activeLanguage === 'es' && statsData.missingKeys) {
              setMissingTranslations(statsData.missingKeys);
            }
          }
          
          // If Spanish is active and no stats available, check for missing translations
          if (activeLanguage === 'es' && missingTranslations.length === 0) {
            const enResponse = await fetch('/api/translations?lang=en');
            if (enResponse.ok) {
              const enData = await enResponse.json();
              const missing = findMissingTranslations(enData, data);
              setMissingTranslations(missing);
            }
          } else if (activeLanguage === 'en') {
            setMissingTranslations([]);
          }
        } else {
          setError('Failed to load translations');
        }
      } catch (err) {
        console.error('Error fetching translations:', err);
        setError('An error occurred while loading translations');
      }
    }

    if (!loading) {
      fetchTranslations();
    }
  }, [loading, activeLanguage]);

  // Find missing translations
  function findMissingTranslations(enObj: Record<string, any>, esObj: Record<string, any>, path = ''): string[] {
    let missing: string[] = [];
    
    for (const [key, value] of Object.entries(enObj)) {
      const currentPath = path ? `${path}.${key}` : key;
      
      if (typeof value === 'object' && value !== null) {
        // Check nested objects
        const nestedMissing = findMissingTranslations(
          value,
          esObj[key] && typeof esObj[key] === 'object' ? esObj[key] : {},
          currentPath
        );
        missing = [...missing, ...nestedMissing];
      } else if (typeof value === 'string') {
        // Check if the key exists in the Spanish translations
        const keyExists = getNestedValue(esObj, currentPath) !== undefined;
        if (!keyExists) {
          missing.push(currentPath);
        }
      }
    }
    
    return missing;
  }

  // Get a nested value from an object using a path string
  function getNestedValue(obj: Record<string, any>, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }

  // Handle language change
  function handleLanguageChange(lang: string) {
    setActiveLanguage(lang);
    setSearchQuery('');
  }

  // Handle section change
  function handleSectionChange(section: string) {
    setSelectedSection(section);
    setSearchQuery('');
  }

  // Handle edit button click
  function handleEditClick(key: string, value: string) {
    setCurrentEditKey(key);
    setCurrentEditValue(value);
    setIsModalOpen(true);
  }

  // Handle saving a translation
  async function handleSaveTranslation(key: string, value: string) {
    try {
      const response = await fetch('/api/translations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lang: activeLanguage,
          key,
          value
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save translation');
      }
      
      // Update local state with the new translation
      const newTranslations = { ...translations };
      const keys = key.split('.');
      let current = newTranslations;
      
      // Navigate to the nested object containing the key
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      // Update the value
      current[keys[keys.length - 1]] = value;
      
      setTranslations(newTranslations);
    } catch (err) {
      console.error('Error saving translation:', err);
      throw err;
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      await fetch('/api/auth', { method: 'DELETE' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Flatten nested object into key-value pairs with dot notation paths
  function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
    return Object.keys(obj).reduce((acc: Record<string, string>, k) => {
      const pre = prefix.length ? `${prefix}.${k}` : k;
      
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        Object.assign(acc, flattenObject(obj[k], pre));
      } else if (typeof obj[k] === 'string') {
        acc[pre] = obj[k];
      }
      
      return acc;
    }, {});
  }

  // Filter and prepare translations for display
  const prepareTranslationsForDisplay = () => {
    if (!translations) return {};
    
    // Flatten the translations object
    const flatTranslations = flattenObject(translations);
    
    // Filter based on search query and selected section
    const filtered = Object.entries(flatTranslations)
      .filter(([key, value]) => {
        const matchesSection = !selectedSection || key.startsWith(selectedSection);
        const matchesSearch = !searchQuery || 
          key.toLowerCase().includes(searchQuery.toLowerCase()) || 
          value.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSection && matchesSearch;
      })
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
    
    return filtered;
  };

  const displayTranslations = prepareTranslationsForDisplay();

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
              {t('admin.logout')}
            </button>
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
              href="/admin/translations" 
              className="px-3 py-4 text-sm font-medium bg-blue-900 rounded-t"
            >
              {t('admin.translations.management')}</Link>
          </div>
        </div>
      </nav>

      {/* Translations Management Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.translations.management')}</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeLanguage === 'en' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleLanguageChange('es')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeLanguage === 'es' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Español
            </button>
          </div>
        </div>

        {/* Translation Statistics */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Translation Statistics
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-700">English Keys</p>
                <p className="mt-1 text-3xl font-semibold text-blue-900">{translationStats.enKeyCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Spanish Keys</p>
                <p className="mt-1 text-3xl font-semibold text-green-900">{translationStats.esKeyCount}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-700">Completeness</p>
                <p className="mt-1 text-3xl font-semibold text-yellow-900">{translationStats.completeness}</p>
              </div>
            </div>
            {activeLanguage === 'es' && missingTranslations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-red-600">
                  Missing translations: {missingTranslations.length}
                </p>
                <button
                  onClick={() => setSearchQuery('missing')}
                  className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Show Missing Translations
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
                <label htmlFor="search" className="sr-only">Search translations</label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-4 pr-10 py-2 sm:text-sm border-gray-300 rounded-md"
                    placeholder="Search translations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <label htmlFor="section" className="sr-only">Filter by section</label>
                <select
                  id="section"
                  name="section"
                  className="focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none sm:text-sm"
                  value={selectedSection}
                  onChange={(e) => handleSectionChange(e.target.value)}
                >
                  <option value="">All Sections</option>
                  <option value="common">Common</option>
                  <option value="navigation">Navigation</option>
                  <option value="hero">Hero</option>
                  <option value="about">About</option>
                  <option value="services">Services</option>
                  <option value="gallery">Gallery</option>
                  <option value="contact">Contact</option>
                  <option value="admin">Admin</option>
                  <option value="testimonials">Testimonials</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Translations Display */}
          <div className="px-4 py-5 sm:p-6">
            {translations ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Translation ({activeLanguage})
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(displayTranslations).map(([key, value]) => (
                      <tr key={key} className={missingTranslations.includes(key) ? 'bg-red-50' : undefined}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-sm truncate">
                          {key}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md break-words">
                          {value}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button 
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleEditClick(key, value)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {Object.keys(displayTranslations).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm text-gray-500 text-center">
                          No translations found{searchQuery ? ' matching your search' : ''}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">Loading translations...</p>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <TranslationEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        translationKey={currentEditKey}
        value={currentEditValue}
        language={activeLanguage}
        onSave={handleSaveTranslation}
      />
    </div>
  );
} 