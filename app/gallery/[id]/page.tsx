'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GalleryItem } from '../../../utils/galleryService';
import { useLanguage } from '../../../utils/LanguageContext';
import BlurredLicensePlateImage from '../../../components/BlurredLicensePlateImage';

interface GalleryDetailProps {
  params: {
    id: string;
  };
}

export default function GalleryDetail({ params }: GalleryDetailProps) {
  const { id } = params;
  const router = useRouter();
  const { t } = useLanguage();
  
  const [galleryItem, setGalleryItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Image gallery state
  const [selectedImageType, setSelectedImageType] = useState<'main' | 'before' | 'after'>('main');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Fetch gallery item
  useEffect(() => {
    const fetchGalleryItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/gallery/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Gallery item not found');
          }
          throw new Error('Failed to fetch gallery item');
        }
        
        const data = await response.json();
        setGalleryItem(data.item);
      } catch (err) {
        console.error('Error fetching gallery item:', err);
        setError(t('gallery.errorLoading'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchGalleryItem();
  }, [id, t]);
  
  // Get translated content
  const getTranslatedContent = (content: string, translationKey?: string) => {
    if (translationKey) {
      // First try to get the content from translations
      const translated = t(translationKey);
      
      // If the translation key returns the key itself (missing translation),
      // fall back to the original content
      if (translated !== translationKey) {
        return translated;
      }
    }
    
    // Fallback to original content
    return content;
  };
  
  // Handle image selection
  const handleImageSelect = (type: 'main' | 'before' | 'after', index: number = 0) => {
    setSelectedImageType(type);
    setSelectedImageIndex(index);
  };
  
  // Get current selected image URL
  const getCurrentImage = (): string => {
    if (!galleryItem) return '';
    
    if (selectedImageType === 'main') {
      return galleryItem.mainImage;
    } else if (selectedImageType === 'before' && galleryItem.beforeImages && galleryItem.beforeImages.length > 0) {
      return galleryItem.beforeImages[selectedImageIndex];
    } else if (selectedImageType === 'after' && galleryItem.afterImages && galleryItem.afterImages.length > 0) {
      return galleryItem.afterImages[selectedImageIndex];
    }
    
    return galleryItem.mainImage;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-lg">{t('gallery.loading')}</p>
        </div>
      </div>
    );
  }
  
  if (error || !galleryItem) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error || t('gallery.itemNotFound')}</p>
        </div>
        <div className="mt-4">
          <Link href="/gallery" className="text-blue-600 hover:text-blue-800">
            ← {t('gallery.backToGallery')}
          </Link>
        </div>
      </div>
    );
  }
  
  // Get translated title and description
  const title = getTranslatedContent(
    galleryItem.title, 
    galleryItem.translationKeys?.title
  );
  
  const description = getTranslatedContent(
    galleryItem.description, 
    galleryItem.translationKeys?.description
  );
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link href="/gallery"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t('gallery.backToGallery')}
        </Link>
      </div>
      
      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          {/* Main Display Image */}
          <div className="relative aspect-[4/3] w-full bg-gray-100 rounded-lg overflow-hidden shadow-md mb-6">
            <BlurredLicensePlateImage
              src={getCurrentImage()}
              alt={`${t(`gallery.${selectedImageType}View`)} ${title}`}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              {t(`gallery.${selectedImageType}View`)}
            </div>
          </div>
          
          {/* Image Type Selection */}
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => handleImageSelect('main')}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedImageType === 'main'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              {t('gallery.mainView')}
            </button>
            {galleryItem.beforeImages && galleryItem.beforeImages.length > 0 && (
              <button
                onClick={() => handleImageSelect('before')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedImageType === 'before'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t('gallery.beforeView')} ({galleryItem.beforeImages.length})
              </button>
            )}
            {galleryItem.afterImages && galleryItem.afterImages.length > 0 && (
              <button
                onClick={() => handleImageSelect('after')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedImageType === 'after'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {t('gallery.afterView')} ({galleryItem.afterImages.length})
              </button>
            )}
          </div>
          
          {/* Thumbnails based on selected type */}
          {selectedImageType === 'before' && galleryItem.beforeImages && galleryItem.beforeImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryItem.beforeImages.map((image, index) => (
                <div
                  key={`before-${index}`}
                  className={`relative aspect-square cursor-pointer overflow-hidden rounded-md ${
                    selectedImageIndex === index ? 'ring-2 ring-blue-600' : ''
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <BlurredLicensePlateImage
                    src={image}
                    alt={`${t('gallery.beforeImage')} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          
          {selectedImageType === 'after' && galleryItem.afterImages && galleryItem.afterImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryItem.afterImages.map((image, index) => (
                <div
                  key={`after-${index}`}
                  className={`relative aspect-square cursor-pointer overflow-hidden rounded-md ${
                    selectedImageIndex === index ? 'ring-2 ring-blue-600' : ''
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <BlurredLicensePlateImage
                    src={image}
                    alt={`${t('gallery.afterImage')} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{title}</h1>
          
          <div className="mb-8">
            <p className="text-gray-700 whitespace-pre-line">{description}</p>
          </div>
          
          {/* Categories */}
          {galleryItem.categories && galleryItem.categories.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('gallery.categories')}</h2>
              <div className="flex flex-wrap gap-2">
                {galleryItem.categories.map((category, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Tags */}
          {galleryItem.tags && galleryItem.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{t('gallery.tags')}</h2>
              <div className="flex flex-wrap gap-2">
                {galleryItem.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Timestamps if available */}
          {galleryItem.createdAt && (
            <div className="text-sm text-gray-500 mt-8">
              {t('gallery.addedOn')} {new Date(galleryItem.createdAt).toLocaleDateString()}
              {galleryItem.updatedAt && galleryItem.updatedAt !== galleryItem.createdAt && (
                <span> · {t('gallery.updatedOn')} {new Date(galleryItem.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 