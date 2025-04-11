'use client';

import React, { useState, useRef } from 'react';
import { FaExclamationCircle } from 'react-icons/fa';
import Image from 'next/image';
import LoadingSpinner from '../common/LoadingSpinner';
import BlurOverlay from './BlurOverlay';

/**
 * Enhanced image display component that handles loading states, errors, and displays images
 * with proper dimensions for the gallery admin area.
 */
export default function ImageDisplay({ 
  src, 
  alt = "Image", 
  className = "", 
  style = {}, 
  onClick = () => {}, 
  width,
  height,
  priority = false,
  unoptimized = false,
  blurAreas,
  onBlurClick,
  showBlurControls = false,
  ...props 
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const imageRef = useRef(null);
  
  // Determine if we should use Next.js Image or regular img tag
  // Regular img is more reliable for local dynamic images and blob URLs
  const isSimpleUrl = 
    !src || 
    src.startsWith('blob:') || 
    src.startsWith('data:') || 
    src.startsWith('/') || 
    !src.startsWith('http');
  
  // Process the image source using our utility function
  const imageSrc = src ? processImageSrc(src) : null;
  
  if (!imageSrc) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded">
        <div className="text-center p-4">
          <div className="text-red-500 text-3xl mb-2">⚠️</div>
          <p className="text-sm text-gray-500">No image source provided</p>
        </div>
      </div>
    );
  }
  
  const handleLoad = () => {
    setIsLoading(false);
    setIsError(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setIsError(true);
    console.error(`[ImageDisplay] Failed to load image: ${imageSrc}`);
  };
  
  const handleClick = (e) => {
    if (onClick) {
      // Pass the image reference along with the event
      onClick(e, imageRef);
    }
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={handleClick}
    >
      {isLoading && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <LoadingSpinner size="md" color="#9ca3af" />
        </div>
      )}
      
      {isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="text-red-500 text-3xl mb-2">⚠️</div>
            <p className="text-sm text-gray-500">Error loading image</p>
          </div>
        </div>
      )}
      
      {isSimpleUrl ? (
        <img
          ref={imageRef}
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: 'opacity 0.2s' }}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <Image
          ref={imageRef}
          src={imageSrc}
          alt={alt}
          fill={!width || !height}
          width={width}
          height={height}
          className={`object-cover ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          style={{ transition: 'opacity 0.2s' }}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          unoptimized={unoptimized || imageSrc.includes('gallery-page')}
        />
      )}
      
      {/* Add the BlurOverlay component for blur areas */}
      {blurAreas && !isLoading && !isError && (
        <BlurOverlay 
          imageUrl={imageSrc}
          blurAreas={blurAreas}
          onBlurClick={onBlurClick}
          showControls={showBlurControls}
        />
      )}
    </div>
  );
}

// Process image source to ensure it loads correctly
const processImageSrc = (src) => {
  if (!src) {
    console.warn('[ImageDisplay] Empty image path provided');
    return null;
  }
  
  console.log(`[ImageDisplay] Processing image path: ${src}`);
  
  // Handle blob and data URLs - return as is
  if (src.startsWith('blob:') || src.startsWith('data:')) {
    console.log('[ImageDisplay] Using blob/data URL as is');
    return src;
  }
  
  // Handle absolute URLs - extract path from localhost URLs
  if (src.startsWith('http://') || src.startsWith('https://')) {
    if (src.includes('localhost:3000')) {
      const parsedUrl = new URL(src);
      const path = parsedUrl.pathname;
      console.log(`[ImageDisplay] Extracted path from localhost URL: ${path}`);
      return processImageSrc(path); // Process the extracted path
    } else {
      console.log('[ImageDisplay] Using absolute URL as is');
      return src;
    }
  }
  
  // Remove query parameters and hash fragments
  let processedSrc = src.split('?')[0].split('#')[0];
  
  // Ensure path starts with a slash
  if (!processedSrc.startsWith('/')) {
    processedSrc = '/' + processedSrc;
  }
  
  // Check if the path already includes the gallery prefix
  if (processedSrc.includes('/images/gallery-page/')) {
    console.log(`[ImageDisplay] Path already has gallery prefix: ${processedSrc}`);
    return processedSrc;
  }
  
  // If it's an image file based on extension, try to determine correct path
  if (processedSrc.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    const filename = processedSrc.split('/').pop();
    if (filename) {
      // Try to extract car name from filename pattern (after-1-carname-view or before-1-carname-view)
      const carMatch = filename.match(/(?:before|after)-\d+[-_]([a-z0-9]+)/i);
      if (carMatch && carMatch[1]) {
        const carName = carMatch[1].toLowerCase();
        
        // Map of car names to their directories
        const carDirectories = {
          'blackjeep': 'black-jeep-repair',
          'thunderbird': 'thunderbird-restoration',
          'cadillac': 'red-cadillac-repair',
          'redcadillac': 'red-cadillac-repair',
          'porsche': 'porsche-detail',
          'porschedetail': 'porsche-detail',
          'mustang': 'mustang-rebuild',
          'mustangrebuild': 'mustang-rebuild',
          'mercedes': 'mercedes-sl550-repaint',
          'mercedesrepaint': 'mercedes-sl550-repaint',
          'mercedessls': 'mercedes-sl550-repaint',
          'mercedessl550': 'mercedes-sl550-repaint',
          'sl550': 'mercedes-sl550-repaint',
          'greenmercedes': 'green-mercedes-repair',
          'jaguar': 'jaguar-repaint',
          'jaguarrepaint': 'jaguar-repaint',
          'honda': 'honda-accord-repair',
          'accord': 'honda-accord-repair',
          'hondaaccord': 'honda-accord-repair',
          'bmw': 'bmw-e90-repair',
          'bmwe90': 'bmw-e90-repair',
          'alfa': 'blue-alfa-repair',
          'bluealfa': 'blue-alfa-repair',
          'bluemustang': 'blue-mustang-repair',
          'blueaccord': 'blue-accord-repair'
        };
        
        const directory = carDirectories[carName];
        if (directory) {
          processedSrc = `/images/gallery-page/${directory}/${filename}`;
          console.log(`[ImageDisplay] Mapped to gallery directory: ${processedSrc}`);
          return processedSrc;
        }
      }
      
      // If no match by pattern, check if any car name is contained in the filename
      for (const [pattern, directory] of Object.entries(carDirectories)) {
        if (filename.toLowerCase().includes(pattern.toLowerCase())) {
          processedSrc = `/images/gallery-page/${directory}/${filename}`;
          console.log(`[ImageDisplay] Matched car name in filename: ${pattern} -> ${processedSrc}`);
          return processedSrc;
        }
      }
      
      // Check if we're in the edit page and can extract the car ID from URL
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin-dashboard/gallery/edit/')) {
          const carId = currentPath.split('/admin-dashboard/gallery/edit/')[1];
          if (carId) {
            processedSrc = `/images/gallery-page/${carId}/${filename}`;
            console.log(`[ImageDisplay] Used ID from URL path as directory: ${processedSrc}`);
            return processedSrc;
          }
        }
      }
    }
    
    // If we couldn't determine the specific gallery path,
    // make sure the image at least has the /images prefix
    if (!processedSrc.includes('/images/')) {
      processedSrc = `/images${processedSrc}`;
      console.log(`[ImageDisplay] Added /images prefix: ${processedSrc}`);
    }
  }
  
  console.log(`[ImageDisplay] Final processed path: ${processedSrc}`);
  return processedSrc;
}; 