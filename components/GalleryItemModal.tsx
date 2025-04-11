'use client';

import React, { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../utils/LanguageContext';
import BlurredLicensePlateImage, { BlurZone } from './BlurredLicensePlateImage';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Define the GalleryItem type locally if it can't be imported
interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  images: string[];
  details?: Record<string, string>;
  year?: string;
  make?: string;
  model?: string;
  service?: string;
  categories?: string[];
  blurAreas?: Record<string, BlurZone[]>;
}

interface GalleryItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: GalleryItem | null;
}

const normalizeImagePath = (path: string): string => {
  if (!path) return '';
  
  console.log(`[GalleryItemModal] Normalizing image path: ${path}`);
  
  // Remove any query parameters and hash fragments
  let normalizedPath = path.split('?')[0].split('#')[0];
  
  // Ensure the path starts with a slash if it doesn't already
  if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('http')) {
    normalizedPath = '/' + normalizedPath;
    console.log(`[GalleryItemModal] Added leading slash: ${normalizedPath}`);
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
        directory = 'mercedes-sl550-repaint';
      } else if (filename.includes('jaguar')) {
        directory = 'jaguar-repaint';
      } else if (filename.includes('honda') || filename.includes('accord')) {
        directory = 'honda-accord-repair';
      } else if (filename.includes('bmw')) {
        directory = 'bmw-e90-repair';
      } else if (filename.includes('bluealfa')) {
        directory = 'blue-alfa-repair';
      } else if (filename.includes('blueaccord')) {
        directory = 'blue-accord-repair';
      } else if (filename.includes('bluemustang')) {
        directory = 'blue-mustang-repair';
      }
      
      if (directory) {
        const newPath = `/images/gallery-page/${directory}/${filename}`;
        console.log(`[GalleryItemModal] Corrected path to gallery-page directory: ${newPath}`);
        return newPath;
      }
    }
  }
  
  console.log(`[GalleryItemModal] Final normalized path: ${normalizedPath}`);
  return normalizedPath;
};

const GalleryItemModal: React.FC<GalleryItemModalProps> = ({ isOpen, onClose, item }) => {
  const { t } = useLanguage();
  
  // Use component name in translation calls for better debugging
  const translate = (key: string) => t(key, 'GalleryItemModal');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Reset to first image when item changes
    setCurrentImageIndex(0);
  }, [item]);

  useEffect(() => {
    // Handle ESC key press
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const handleNextImage = () => {
    if (item && item.images && currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setIsLoading(true);
    }
  };

  const handlePrevImage = () => {
    if (item && item.images && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setIsLoading(true);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  if (!item) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 z-20 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full text-gray-800 dark:text-white hover:bg-white dark:hover:bg-gray-800 transition-colors"
              onClick={onClose}
              aria-label={translate('gallery.modal.close')}
            >
              <IoClose size={24} />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
              {/* Image section */}
              <div className="relative md:w-7/12 h-[300px] md:h-auto overflow-hidden bg-gray-100 dark:bg-gray-800">
                {item.images && item.images.length > 0 && (
                  <>
                    {isLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <BlurredLicensePlateImage
                      src={normalizeImagePath(item.images[currentImageIndex])}
                      alt={`${item.title} - ${translate('gallery.modal.image')} ${currentImageIndex + 1}`}
                      fill
                      style={{ objectFit: 'contain' }}
                      className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={handleImageLoad}
                      priority
                      blurAreas={item.blurAreas}
                    />

                    {/* Navigation arrows */}
                    {item.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          disabled={currentImageIndex === 0}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={translate('gallery.modal.previous')}
                        >
                          <ChevronLeftIcon className="w-6 h-6" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          disabled={currentImageIndex === item.images.length - 1}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                          aria-label={translate('gallery.modal.next')}
                        >
                          <ChevronRightIcon className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Image counter */}
                    {item.images.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                        {currentImageIndex + 1} / {item.images.length}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Content section */}
              <div className="p-6 md:w-5/12 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h2>
                
                {item.categories && (
                  <div className="mb-4">
                    <span className="inline-block bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-primary-900 dark:text-primary-200">
                      {item.categories.join(', ')}
                    </span>
                  </div>
                )}
                
                {item.description && (
                  <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
                    <p>{item.description}</p>
                  </div>
                )}
                
                {item.details && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      {translate('gallery.modal.details')}
                    </h3>
                    <ul className="space-y-2">
                      {Object.entries(item.details).map(([key, value]) => (
                        <li key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400 capitalize">{key}</span>
                          <span className="text-gray-900 dark:text-white font-medium">{value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {item.year && (
                  <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">{translate('gallery.modal.year')}:</span>
                    <span>{item.year}</span>
                  </div>
                )}
                
                {item.make && (
                  <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">{translate('gallery.modal.make')}:</span>
                    <span>{item.make}</span>
                  </div>
                )}
                
                {item.model && (
                  <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium mr-2">{translate('gallery.modal.model')}:</span>
                    <span>{item.model}</span>
                  </div>
                )}
                
                {item.service && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {translate('gallery.modal.service')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">{item.service}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GalleryItemModal; 