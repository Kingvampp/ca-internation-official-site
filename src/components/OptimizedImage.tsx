'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  objectPosition?: string;
  fallbackSrc?: string;
}

// Default image to use when an image is not found or fails to load
const DEFAULT_FALLBACK = '/images/placeholder.jpg';

// Utility function to check if an image exists
const imageExists = async (url: string): Promise<boolean> => {
  // If it's an external URL, we can't check it
  if (url.startsWith('http')) return true;
  
  // For local images, normalize the path
  const imagePath = url.startsWith('/') ? url : `/${url}`;
  
  try {
    // If we're in development, we can't reliably check with fetch
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    
    // In production, attempt to fetch the image
    const res = await fetch(imagePath, { method: 'HEAD' });
    return res.ok;
  } catch (error) {
    console.error(`Error checking image existence: ${url}`, error);
    return false;
  }
};

/**
 * OptimizedImage component handles image loading with fallbacks and optimizations
 */
export default function OptimizedImage({
  src,
  alt,
  className = '',
  fill = false,
  width,
  height,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  quality = 80,
  objectFit = 'cover',
  objectPosition = 'center',
  fallbackSrc,
}: OptimizedImageProps) {
  // State for tracking image loading state and errors
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc || DEFAULT_FALLBACK);
  
  // Check if the source is an SVG
  const isSvg = imgSrc.toLowerCase().endsWith('.svg');
  
  // Class names for the image
  const imageClasses = `${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`;
  
  useEffect(() => {
    const defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    // Reset loading and error state when src changes
    setIsLoading(true);
    setHasError(false);
    
    // Check if the image exists
    const checkImage = async () => {
      try {
        if (!src) {
          throw new Error('No source provided');
        }
        
        // Try to validate the image
        const exists = await imageExists(src);
        
        if (exists) {
          setImgSrc(src);
          setHasError(false);
        } else {
          console.warn(`Image not found: ${src}, using fallback`);
          setImgSrc(fallbackSrc || DEFAULT_FALLBACK);
          setHasError(true);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImgSrc(fallbackSrc || DEFAULT_FALLBACK);
        setHasError(true);
      }
    };
    
    checkImage();
  }, [src, fallbackSrc]);
  
  // Handle image loading errors
  const handleError = () => {
    console.warn(`Failed to load image: ${imgSrc}`);
    setHasError(true);
    
    // Try the fallback if provided
    if (imgSrc !== DEFAULT_FALLBACK && imgSrc !== fallbackSrc) {
      if (fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setImgSrc(DEFAULT_FALLBACK);
      }
    }
  };
  
  // Simplify the rendering based on fill parameter
  const defaultSizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
  
  return (
    <div className="relative">
      {fill ? (
        <Image
          src={imgSrc || DEFAULT_FALLBACK}
          alt={alt}
          fill={true}
          sizes={sizes || defaultSizes}
          quality={isSvg ? undefined : quality}
          priority={priority}
          className={imageClasses}
          style={{ objectPosition }}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          unoptimized={isSvg} // Don't optimize SVGs
        />
      ) : (
        <Image
          src={imgSrc || DEFAULT_FALLBACK}
          alt={alt}
          width={width || 800}
          height={height || 600}
          sizes={sizes || defaultSizes}
          quality={isSvg ? undefined : quality}
          priority={priority}
          className={imageClasses}
          style={{ objectPosition, objectFit }}
          onLoad={() => setIsLoading(false)}
          onError={handleError}
          unoptimized={isSvg} // Don't optimize SVGs
        />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
          Image not found
        </div>
      )}
    </div>
  );
} 