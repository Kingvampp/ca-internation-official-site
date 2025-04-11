"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../utils/LanguageContext';
import { GalleryItem } from '../../utils/galleryService';
import BlurredLicensePlateImage from '../BlurredLicensePlateImage';

type TranslatableGalleryCardProps = {
  item: GalleryItem;
  className?: string;
};

export default function TranslatableGalleryCard({ item, className = '' }: TranslatableGalleryCardProps) {
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'before' | 'after'>('after');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // For debugging - log the item ID and whether it has blur areas
  React.useEffect(() => {
    if (item.id) {
      console.log(`[GalleryCard] Item ${item.id} has blur areas:`, 
        item.blurAreas ? `Yes (${Object.keys(item.blurAreas).length} entries)` : 'No');
    }
  }, [item.id, item.blurAreas]);
  
  // Make sure we have arrays for before/after images
  const beforeImages = item.beforeImages || [];
  const afterImages = item.afterImages || [];
  
  // Function to get translated content
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
  
  // Get translated title and description
  const title = getTranslatedContent(
    item.title, 
    item.translationKeys?.title
  );
  
  const description = getTranslatedContent(
    item.description, 
    item.translationKeys?.description
  );

  const openModal = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = 'auto'; // Restore scrolling
  };
  
  // Determine which image to use for the card thumbnail
  const thumbnailImage = item.mainImage || (afterImages.length > 0 ? afterImages[0] : (beforeImages.length > 0 ? beforeImages[0] : ''));
  
  // Fallback image if the main image fails to load
  const handleImageError = () => {
    console.error(`Failed to load image: ${thumbnailImage}`);
    setImageError(true);
  };
  
  const hasBefore = beforeImages.length > 0;
  const hasAfter = afterImages.length > 0;
  const hasBeforeAfter = hasBefore && hasAfter;
  
  // Get current displayed image based on view and index
  const currentImages = currentView === 'before' ? beforeImages : afterImages;
  const currentImage = currentImages.length > 0 ? currentImages[currentImageIndex] : thumbnailImage;

  // Function to handle thumbnail click
  const handleThumbnailClick = (view: 'before' | 'after', index: number) => {
    setCurrentView(view);
    setCurrentImageIndex(index);
  };

  // Get service categories
  const serviceCategories = item.categories ? item.categories.map(category => {
    const displayName = category.charAt(0).toUpperCase() + category.slice(1);
    return displayName.replace('-', ' ');
  }).join(', ') : '';
  
  // Add this function near the top of the file
  const normalizeImagePath = (path: string): string => {
    if (!path) return '';
    
    console.log(`[TranslatableGalleryCard] Normalizing image path: ${path}`);
    
    // Remove any query parameters and hash fragments
    let normalizedPath = path.split('?')[0].split('#')[0];
    
    // Ensure the path starts with a slash if it doesn't already
    if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('http')) {
      normalizedPath = '/' + normalizedPath;
      console.log(`[TranslatableGalleryCard] Added leading slash: ${normalizedPath}`);
    }
    
    // Check if the path should be in the gallery-page directory
    if (normalizedPath.includes('/images/') && 
        !normalizedPath.includes('/gallery-page/') && 
        normalizedPath.match(/before-|after-/i)) {
      // Extract the filename
      const filename = normalizedPath.split('/').pop();
      if (filename) {
        // Try to determine the correct directory based on the filename
        let directory = '';
        
        if (filename.includes('thunderbird')) {
          directory = 'thunderbird-restoration';
        } else if (filename.includes('cadillac')) {
          directory = 'red-cadillac-repair';
        } else if (filename.includes('porsche')) {
          directory = 'porsche-detail';
        } else if (filename.includes('mustang')) {
          directory = 'mustang-rebuild';
        } else if (filename.includes('mercedes')) {
          directory = 'mercedes-repaint';
        } else if (filename.includes('jaguar')) {
          directory = 'jaguar-repaint';
        } else if (filename.includes('honda') || filename.includes('accord')) {
          directory = 'honda-accord-repair';
        } else if (filename.includes('bmw')) {
          directory = 'bmw-e90-repair';
        }
        
        if (directory) {
          const newPath = `/images/gallery-page/${directory}/${filename}`;
          console.log(`[TranslatableGalleryCard] Corrected path to gallery-page directory: ${newPath}`);
          return newPath;
        }
      }
    }
    
    console.log(`[TranslatableGalleryCard] Final normalized path: ${normalizedPath}`);
    return normalizedPath;
  };

  return (
    <>
      <div 
        className={`group relative overflow-hidden bg-navy-800 shadow-lg hover:shadow-2xl transition-all rounded-lg ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={openModal}
      >
        <div className="aspect-[4/3] w-full relative overflow-hidden">
          {imageError ? (
            <div className="w-full h-full flex items-center justify-center bg-navy-700 text-gray-400">
              <span className="text-sm">{language === 'es' ? 'Imagen no disponible' : 'Image not available'}</span>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <Image 
                src={normalizeImagePath(thumbnailImage)}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={handleImageError}
              />
            </div>
          )}
          
          {/* Category pills */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {item.categories && item.categories.map((category, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs font-medium bg-blue-600 bg-opacity-90 text-white rounded"
              >
                {language === 'es' && category === 'bf' ? 'Antes/Después' :
                 language === 'es' && category === 'collision' ? 'Colisión' :
                 language === 'es' && category === 'paint' ? 'Pintura' :
                 language === 'es' && category === 'restoration' ? 'Restauración' :
                 language === 'es' && category === 'detailing' ? 'Detallado' :
                 language === 'es' && category === 'bodywork' ? 'Carrocería' :
                 category}
              </span>
            ))}
          </div>
          
          {/* Before/After indicator if available */}
          {hasBeforeAfter && (
            <div className="absolute bottom-2 right-2">
              <span className="px-2 py-1 text-xs font-medium bg-black bg-opacity-70 text-white rounded">
                {language === 'es' ? 'Antes/Después' : 'Before/After'}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
          <p className="text-sm text-gray-300 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-90" onClick={closeModal}>
          <div className="relative w-full max-w-5xl bg-navy-800 rounded-lg shadow-2xl overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
            {/* Title bar */}
            <div className="bg-navy-900 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{title}</h2>
              <button onClick={closeModal} className="text-gray-300 hover:text-white" aria-label="Close">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Main image display */}
            <div className="relative">
              <div className="relative h-[500px] w-full bg-black">
                <Image
                  src={currentImage}
                  alt={`${title} - ${currentView === 'before' ? (language === 'es' ? 'Antes' : 'Before') : (language === 'es' ? 'Después' : 'After')}`}
                  fill
                  className="object-contain"
                  onError={handleImageError}
                />
                
                {/* BEFORE/AFTER label */}
                <div className="absolute top-4 left-4 bg-blue-600 text-white font-bold px-3 py-1 rounded shadow-lg">
                  {currentView === 'before' ? (language === 'es' ? 'ANTES' : 'BEFORE') : (language === 'es' ? 'DESPUÉS' : 'AFTER')}
                </div>
              </div>
              
              {/* Before/After image thumbnails */}
              <div className="p-4 bg-navy-700">
                {hasBefore && (
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-white mb-2 bg-black bg-opacity-75 rounded py-1 px-2 inline-block">
                      {language === 'es' ? 'Imágenes de Antes' : 'Before Images'}
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {beforeImages.map((image, index) => (
                        <button
                          key={`before-${index}`}
                          onClick={() => handleThumbnailClick('before', index)}
                          className={`flex-shrink-0 relative h-16 w-24 rounded overflow-hidden border-2 ${
                            currentView === 'before' && currentImageIndex === index
                              ? 'border-blue-600'
                              : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${title} - Before ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-1 rounded">
                              {language === 'es' ? 'Antes' : 'Before'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {hasAfter && (
                  <div>
                    <h3 className="text-sm font-bold text-white mb-2 bg-black bg-opacity-75 rounded py-1 px-2 inline-block">
                      {language === 'es' ? 'Imágenes de Después' : 'After Images'}
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {afterImages.map((image, index) => (
                        <button
                          key={`after-${index}`}
                          onClick={() => handleThumbnailClick('after', index)}
                          className={`flex-shrink-0 relative h-16 w-24 rounded overflow-hidden border-2 ${
                            currentView === 'after' && currentImageIndex === index
                              ? 'border-blue-600'
                              : 'border-transparent'
                          }`}
                        >
                          <Image
                            src={image}
                            alt={`${title} - After ${index + 1}`}
                            fill
                            className="object-cover"
                            onError={handleImageError}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                            <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-1 rounded">
                              {language === 'es' ? 'Después' : 'After'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description and details */}
            <div className="p-4 text-white">
              <p className="text-gray-300 mb-4">{description}</p>
              
              {/* Categories */}
              {serviceCategories && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold mb-1 text-gray-300">
                    {language === 'es' ? 'Categorías:' : 'Categories:'}
                  </h3>
                  <p className="text-white">{serviceCategories}</p>
                </div>
              )}
              
              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-1 text-gray-300">
                    {language === 'es' ? 'Etiquetas:' : 'Tags:'}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 text-xs bg-navy-700 text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 