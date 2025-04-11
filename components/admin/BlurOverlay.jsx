'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { enhancedNormalizeImagePath, getBlurAreasForImage } from '@/utils/imagePathUtils';
import { FiEye } from 'react-icons/fi';

/**
 * Helper function to ensure blur areas have all required properties
 */
function ensureValidBlurAreas(areas) {
  if (!Array.isArray(areas)) return [];
  
  return areas.map(area => ({
    x: typeof area.x === 'number' ? area.x : 0,
    y: typeof area.y === 'number' ? area.y : 0,
    width: typeof area.width === 'number' ? area.width : 10,
    height: typeof area.height === 'number' ? area.height : 10,
    rotation: area.rotation || area.rotate || 0,
    blurAmount: area.blurAmount || 8,
    _metadata: area._metadata || {
      timestamp: Date.now()
    }
  }));
}

/**
 * BlurOverlay - A component that renders blur boxes on top of an image
 * This component directly handles displaying blur areas without relying on complex path matching
 */
export default function BlurOverlay({ 
  imageUrl, 
  blurAreas, 
  containerStyle = {}, 
  onBlurClick,
  showControls = false,
  width,
  height
}) {
  const [areas, setAreas] = useState([]);
  const [normalizedPath, setNormalizedPath] = useState('');
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  // Diagnostic log for debugging
  useEffect(() => {
    if (blurAreas) {
      console.log(`[BlurOverlay] Received blur areas object with ${Object.keys(blurAreas).length} keys`);
      
      if (Object.keys(blurAreas).length > 0) {
        // Log all keys and their normalized versions for diagnosis
        console.log(`[BlurOverlay] All blur area keys:`);
        Object.keys(blurAreas).forEach(key => {
          console.log(`[BlurOverlay] - Original: "${key}"`);
          console.log(`[BlurOverlay] - Normalized: "${enhancedNormalizeImagePath(key)}"`);
          
          if (Array.isArray(blurAreas[key]) && blurAreas[key].length > 0) {
            console.log(`[BlurOverlay] - Areas: ${blurAreas[key].length}`);
          }
        });
        
        // Log important parts of the provided imageUrl for diagnosis
        const urlParts = imageUrl ? imageUrl.split('/') : [];
        console.log(`[BlurOverlay] Image URL parts:`, urlParts);
        
        // Check if any keys contain the filename (last part of URL)
        const filename = imageUrl ? imageUrl.split('/').pop() : '';
        if (filename) {
          console.log(`[BlurOverlay] Image filename: "${filename}"`);
          const matchingKeys = Object.keys(blurAreas).filter(key => 
            key.includes(filename) || enhancedNormalizeImagePath(key).includes(filename)
          );
          
          if (matchingKeys.length > 0) {
            console.log(`[BlurOverlay] Found ${matchingKeys.length} keys containing the filename:`);
            matchingKeys.forEach(key => console.log(`[BlurOverlay] - Match: "${key}"`));
          } else {
            console.log(`[BlurOverlay] No keys contain the filename "${filename}"`);
          }
        }
      }
    }
  }, [blurAreas, imageUrl]);
  
  // Effect to find and set blur areas whenever the imageUrl or blurAreas change
  useEffect(() => {
    if (!imageUrl || !blurAreas) {
      setAreas([]);
      return;
    }
    
    // Normalize the image URL for consistent key matching
    const normalizedImageUrl = enhancedNormalizeImagePath(imageUrl);
    setNormalizedPath(normalizedImageUrl);
    
    // Fix double /images prefix which can cause matching issues
    let fixedImageUrl = normalizedImageUrl;
    if (fixedImageUrl.includes('/images/images/')) {
      fixedImageUrl = fixedImageUrl.replace('/images/images/', '/images/');
      console.log(`[BlurOverlay] Fixed duplicate /images prefix: "${normalizedImageUrl}" -> "${fixedImageUrl}"`);
    }
    
    console.log(`[BlurOverlay] Looking for blur areas for image: ${imageUrl}`);
    console.log(`[BlurOverlay] Normalized path: ${fixedImageUrl}`);
    
    // Find blur areas for this image by trying multiple path variations
    const foundAreas = getBlurAreasForImage(imageUrl, blurAreas);
    
    if (foundAreas && foundAreas.length > 0) {
      console.log(`[BlurOverlay] Found ${foundAreas.length} blur areas`);
      
      // Log the details of the first blur area for debugging
      if (foundAreas.length > 0) {
        console.log(`[BlurOverlay] First blur area:`, {
          x: foundAreas[0].x,
          y: foundAreas[0].y,
          width: foundAreas[0].width,
          height: foundAreas[0].height,
          rotation: foundAreas[0].rotation || 0,
          metadata: foundAreas[0]._metadata
        });
        
        // Also log any editor information that might help with cross-referencing
        if (foundAreas[0]._metadata?.editor) {
          console.log(`[BlurOverlay] Areas were created with editor: ${foundAreas[0]._metadata.editor}`);
        }
        
        // Log source URL if available
        if (foundAreas[0]._metadata?.originalUrl) {
          console.log(`[BlurOverlay] Areas were created for original URL: ${foundAreas[0]._metadata.originalUrl}`);
        }
      }
      
      setAreas(foundAreas);
    } else {
      console.log(`[BlurOverlay] No blur areas found for this image`);
      
      // Try some simple alternative paths
      const altPaths = [
        fixedImageUrl.replace('/images/', '/'),
        fixedImageUrl.startsWith('/images/') ? fixedImageUrl : `/images${fixedImageUrl}`
      ];
      
      console.log(`[BlurOverlay] Trying alternative paths:`, altPaths);
      
      for (const altPath of altPaths) {
        const altAreas = Object.keys(blurAreas).find(key => 
          enhancedNormalizeImagePath(key) === altPath
        );
        
        if (altAreas && blurAreas[altAreas] && blurAreas[altAreas].length > 0) {
          console.log(`[BlurOverlay] Found areas using alternative path: "${altPath}"`);
          setAreas(ensureValidBlurAreas(blurAreas[altAreas]));
          return;
        }
      }
      
      // Try to diagnose why no blur areas were found
      if (Object.keys(blurAreas).length > 0) {
        console.log(`[BlurOverlay] Available blur area keys:`, Object.keys(blurAreas));
        
        // Compare the normalized path with available blur area keys
        const normalizedKeys = Object.keys(blurAreas).map(key => enhancedNormalizeImagePath(key));
        console.log(`[BlurOverlay] Normalized blur area keys:`, normalizedKeys);
        
        // Check if any normalized keys partially match our normalized path
        const matches = normalizedKeys.filter(key => 
          key.includes(fixedImageUrl) || fixedImageUrl.includes(key)
        );
        if (matches.length > 0) {
          console.log(`[BlurOverlay] Found ${matches.length} partial matches:`, matches);
          
          // FAILSAFE: If we find partial matches but getBlurAreasForImage failed,
          // try to directly use the first matching blur area
          const bestMatchKey = matches[0];
          const originalKey = Object.keys(blurAreas).find(key => 
            enhancedNormalizeImagePath(key) === bestMatchKey
          );
          
          if (originalKey && Array.isArray(blurAreas[originalKey]) && blurAreas[originalKey].length > 0) {
            console.log(`[BlurOverlay] Using FAILSAFE match from key: ${originalKey}`);
            const failsafeAreas = ensureValidBlurAreas(blurAreas[originalKey]);
            setAreas(failsafeAreas);
            return;
          }
        }
        
        // Last resort: Try matching by extracting parts from the URL
        const urlParts = fixedImageUrl.split('/');
        const carMatch = fixedImageUrl.match(/\/gallery-page\/([^\/]+)/);
        if (carMatch && carMatch[1]) {
          const carId = carMatch[1].toLowerCase();
          console.log(`[BlurOverlay] Trying car ID match: "${carId}"`);
          
          // Find any key that contains this car ID
          const carMatches = Object.keys(blurAreas).filter(key => 
            enhancedNormalizeImagePath(key).includes(carId)
          );
          
          if (carMatches.length > 0) {
            const bestKey = carMatches[0];
            console.log(`[BlurOverlay] Using FAILSAFE car ID match: "${bestKey}"`);
            
            if (Array.isArray(blurAreas[bestKey]) && blurAreas[bestKey].length > 0) {
              const failsafeAreas = ensureValidBlurAreas(blurAreas[bestKey]);
              setAreas(failsafeAreas);
              return;
            }
          }
        }
      }
      
      setAreas([]);
    }
  }, [imageUrl, blurAreas]);
  
  // When the component mounts, we need to get the image size to properly scale the blur areas
  useEffect(() => {
    if (!imageUrl) return;
    
    // Function to get image dimensions
    const getImageDimensions = () => {
      const img = new Image();
      img.onload = () => {
        setImageSize({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
        console.log(`[BlurOverlay] Image dimensions loaded: ${img.naturalWidth}x${img.naturalHeight}`);
      };
      img.onerror = () => {
        console.error(`[BlurOverlay] Failed to load image dimensions for: ${imageUrl}`);
      };
      img.src = imageUrl;
    };
    
    getImageDimensions();
  }, [imageUrl]);
  
  // Only render if we have valid blur areas
  const validBlurAreas = useMemo(() => {
    if (!Array.isArray(areas) || areas.length === 0) {
      return [];
    }
    
    // Filter out any invalid blur areas
    return areas.filter(area => {
      return area && 
        typeof area.x === 'number' && 
        typeof area.y === 'number' && 
        typeof area.width === 'number' && 
        typeof area.height === 'number';
    });
  }, [areas]);
  
  // If no valid blur areas, return null or a placeholder
  if (validBlurAreas.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none" 
      style={containerStyle}
      data-normalized-path={normalizedPath}
    >
      {validBlurAreas.map((area, index) => {
        // Calculate position and size based on the original image dimensions vs current dimensions
        // This ensures the blur area is positioned correctly regardless of display size
        const originalWidth = area._metadata?.imageWidth || imageSize.width || 0;
        const originalHeight = area._metadata?.imageHeight || imageSize.height || 0;
        
        // Calculate scaling factor (defaulting to 1 if no dimensions)
        const scaleX = originalWidth > 0 ? 100 / originalWidth : 1;
        const scaleY = originalHeight > 0 ? 100 / originalHeight : 1;
        
        // Convert absolute pixel coordinates to percentages for responsive display
        const displayX = area.x * scaleX;
        const displayY = area.y * scaleY;
        const displayWidth = area.width * scaleX;
        const displayHeight = area.height * scaleY;
        
        return (
          <div
            key={`blur-${index}-${area._metadata?.timestamp || 'unknown'}`}
            className={`absolute ${showControls ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              left: `${displayX}%`,
              top: `${displayY}%`,
              width: `${displayWidth}%`,
              height: `${displayHeight}%`,
              transform: area.rotation ? `rotate(${area.rotation}deg)` : 'none',
              transformOrigin: 'center',
              backdropFilter: `blur(${area.blurAmount || 8}px)`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: showControls ? '1px solid #e0a850' : 'none',
              cursor: showControls ? 'pointer' : 'default',
              zIndex: 10
            }}
            onClick={showControls && onBlurClick ? () => onBlurClick(normalizedPath) : undefined}
          >
            {/* No content - "Click to edit" button removed */}
          </div>
        );
      })}
    </div>
  );
} 