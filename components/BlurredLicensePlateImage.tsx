"use client";

import React, { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

export interface BlurZone {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage of total width
  height: number; // percentage of total height
  rotation?: number; // rotation angle in degrees
  blurAmount?: number; // blur intensity
}

interface BlurredLicensePlateImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  licensePlatePosition?: BlurZone;
  blurIntensity?: number;
  blurAreas?: BlurZone[] | Record<string, BlurZone[]>;
}

/**
 * A component that displays an image with blurred areas for license plates or other sensitive information.
 * Uses CSS to apply a blur filter to specific areas of the image.
 */
export default function BlurredLicensePlateImage({
  src,
  alt,
  licensePlatePosition,
  blurIntensity = 8,
  blurAreas,
  ...props
}: BlurredLicensePlateImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [normalizedSrc, setNormalizedSrc] = useState('');
  const [activeBlurAreas, setActiveBlurAreas] = useState<BlurZone[]>([]);
  
  // Function to normalize image paths for consistent comparison
  const normalizeImagePath = (path: string): string => {
    if (!path) return '';
    
    console.log(`[BlurredLicensePlateImage] Normalizing path: ${path}`);
    
    // Remove domain from HTTP URLs
    if (path.startsWith('http')) {
      try {
        const url = new URL(path);
        path = url.pathname;
        console.log(`[BlurredLicensePlateImage] Extracted path from URL: ${path}`);
      } catch (e) {
        console.error(`[BlurredLicensePlateImage] Error parsing URL: ${path}`);
      }
    }
    
    // Remove any query parameters and hash fragments
    let normalizedPath = path.split('?')[0].split('#')[0];
    
    // Ensure it starts with a slash
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
      console.log(`[BlurredLicensePlateImage] Added leading slash: ${normalizedPath}`);
    }
    
    console.log(`[BlurredLicensePlateImage] Final normalized path: ${normalizedPath}`);
    return normalizedPath;
  };
  
  // Function to check if two image paths refer to the same image
  const isPathMatch = (path1: string, path2: string): boolean => {
    // Perform a case-insensitive comparison of the normalized paths
    const norm1 = normalizeImagePath(path1).toLowerCase();
    const norm2 = normalizeImagePath(path2).toLowerCase();
    
    // Exact match
    if (norm1 === norm2) {
      console.log(`[BlurredLicensePlateImage] Exact path match: ${norm1} === ${norm2}`);
      return true;
    }
    
    // Extract filenames and compare
    const filename1 = norm1.split('/').pop() || '';
    const filename2 = norm2.split('/').pop() || '';
    
    // If filenames match, it's likely the same image
    if (filename1 && filename1 === filename2) {
      console.log(`[BlurredLicensePlateImage] Filename match: ${filename1} === ${filename2}`);
      return true;
    }
    
    return false;
  };
  
  // Normalize the image src and determine which blur areas apply
  useEffect(() => {
    console.log(`[BlurredLicensePlateImage] Rendering image: ${src}`);
    
    // Check if the image path is valid
    if (!src) {
      console.error('[BlurredLicensePlateImage] Empty image source provided');
      setImageError(true);
      return;
    }
    
    // Check if the image path starts with a slash
    if (!src.startsWith('/') && !src.startsWith('http')) {
      console.warn(`[BlurredLicensePlateImage] Image path doesn't start with slash: ${src}`);
    }
    
    // Normalize the src for consistent comparison with blur area keys
    const normalized = normalizeImagePath(src);
    setNormalizedSrc(normalized);
    
    // Reset states when src changes
    setImageError(false);
    setImageLoaded(false);
    
    // Determine which blur areas to apply for this image
    if (blurAreas) {
      console.log(`[BlurredLicensePlateImage] Checking for blur areas for: ${normalized}`);
      
      if (Array.isArray(blurAreas)) {
        // If blurAreas is an array, use it directly
        console.log(`[BlurredLicensePlateImage] Using array of ${blurAreas.length} blur areas`);
        setActiveBlurAreas(blurAreas);
      } else {
        // If blurAreas is a record, find matching areas for this image
        console.log('[BlurredLicensePlateImage] BlurAreas is a Record with keys:', Object.keys(blurAreas));
        
        // Initialize empty array for active blur areas
        let foundAreas: BlurZone[] = [];
        let matchFound = false;
        
        // Check all keys (image paths) in the blurAreas record
        for (const key in blurAreas) {
          console.log(`[BlurredLicensePlateImage] Checking if ${normalized} matches ${key}`);
          if (isPathMatch(key, normalized)) {
            foundAreas = blurAreas[key];
            matchFound = true;
            console.log(`[BlurredLicensePlateImage] Match found! ${key} has ${foundAreas.length} blur areas`);
            break;
          }
        }
        
        if (!matchFound) {
          console.log('[BlurredLicensePlateImage] No matching blur areas found for this image');
        }
        
        setActiveBlurAreas(foundAreas);
      }
    } else if (licensePlatePosition) {
      // Legacy support for licensePlatePosition prop
      console.log('[BlurredLicensePlateImage] Using legacy licensePlatePosition');
      setActiveBlurAreas([{
        ...licensePlatePosition,
        blurAmount: blurIntensity
      }]);
    } else {
      console.log('[BlurredLicensePlateImage] No blur areas provided');
      setActiveBlurAreas([]);
    }
  }, [src, blurAreas, licensePlatePosition, blurIntensity]);
  
  // Log active blur areas whenever they change
  useEffect(() => {
    console.log(`[BlurredLicensePlateImage] Active blur areas updated: ${activeBlurAreas.length} areas`);
    if (activeBlurAreas.length > 0) {
      console.log('[BlurredLicensePlateImage] First blur area:', JSON.stringify(activeBlurAreas[0]));
    }
  }, [activeBlurAreas]);
  
  // Handle image load success
  const handleImageLoad = () => {
    console.log(`[BlurredLicensePlateImage] Image loaded successfully: ${src}`);
    setImageLoaded(true);
    setImageError(false);
    
    // Call the original onLoad handler if provided
    if (props.onLoad) {
      props.onLoad(null as any);
    }
  };
  
  // Handle image load error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`[BlurredLicensePlateImage] Failed to load image: ${src}`);
    setImageError(true);
    setImageLoaded(false);
    
    // Call the original onError handler if provided
    if (props.onError) {
      props.onError(e);
    }
  };
  
  // If there's an error, show a fallback
  if (imageError) {
    return (
      <div className="relative w-full h-full bg-gray-200 flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-gray-500 text-sm">Image unavailable</p>
          <p className="text-gray-400 text-xs mt-1">{src}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Actual image */}
      <Image 
        src={src} 
        alt={alt}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props} 
      />
      
      {/* Blur overlays */}
      {imageLoaded && activeBlurAreas.length > 0 && activeBlurAreas.map((area, index) => (
        <div
          key={`blur-area-${index}`}
          className="absolute pointer-events-none"
          style={{
            left: `${area.x}%`,
            top: `${area.y}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            backdropFilter: `blur(${area.blurAmount || blurIntensity}px)`,
            WebkitBackdropFilter: `blur(${area.blurAmount || blurIntensity}px)`,
            backgroundColor: 'rgba(255,255,255,0.2)',
            transform: area.rotation ? `rotate(${area.rotation}deg)` : 'none',
            transformOrigin: 'center center',
            zIndex: 10
          }}
        />
      ))}
    </div>
  );
} 