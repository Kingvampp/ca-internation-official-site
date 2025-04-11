/**
 * Image Path Utilities
 * 
 * This file contains utilities for normalizing image paths and finding blur areas.
 * These functions ensure consistent image path formats across the application
 * and help prevent duplicate entries in Firebase storage.
 */

/**
 * Enhanced image path utilities for normalizing paths across the application
 */

/**
 * Aggressively normalizes image paths to ensure consistent format 
 * for matching between client and server
 */
export function enhancedNormalizeImagePath(path: string | null | undefined): string {
  if (!path) {
    console.warn('[ImageUtils] Empty path provided to normalizer');
    return '';
  }

  // Handle special URLs
  if (path.startsWith('blob:') || path.startsWith('data:')) {
    return path;
  }

  // Extract path from localhost URL if needed
  if (path.startsWith('http://') || path.startsWith('https://')) {
    if (path.includes('localhost:') || path.includes('127.0.0.1:')) {
      try {
        const parsedUrl = new URL(path);
        path = parsedUrl.pathname;
      } catch (e) {
        console.error('[ImageUtils] Failed to parse URL:', path);
      }
    } else {
      // External URLs kept as-is
      return path;
    }
  }

  // Remove query parameters and hash fragments
  path = path.split('?')[0].split('#')[0];

  // Ensure path starts with a slash
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  // FIX: Aggressively fix duplicate /images prefixes - critical for consistent matching
  const imagesPattern = /^(\/images\/?)+/i;
  if (imagesPattern.test(path)) {
    // Extract the part after all /images prefixes
    const nonPrefixPart = path.replace(imagesPattern, '');
    // Reconstruct with a single /images/ prefix
    path = `/images/${nonPrefixPart.startsWith('/') ? nonPrefixPart.substring(1) : nonPrefixPart}`;
  } else if (!path.includes('/images/')) {
    // If path doesn't have /images at all, add it
    path = `/images${path.startsWith('/') ? path : '/' + path}`;
  }

  // Normalize to lowercase for consistent matching
  path = path.toLowerCase();

  // Fix any double slashes that might have been introduced
  while (path.includes('//')) {
    path = path.replace('//', '/');
  }

  return path;
}

/**
 * Legacy normalize function - calls the enhanced version for consistency
 */
export function normalizeImagePath(path: string | null | undefined): string {
  return enhancedNormalizeImagePath(path);
}

/**
 * Finds blur areas for an image by checking multiple possible path formats
 */
export function getBlurAreasForImage(image: string, blurAreas: Record<string, any[]> | undefined | null): any[] {
  if (!blurAreas || !image) return [];
  
  const normalizedPath = enhancedNormalizeImagePath(image);
  console.log(`[BLUR DEBUG] Looking for blur areas for: ${normalizedPath}`);
  console.log(`[BLUR DEBUG] Available blur area keys:`, Object.keys(blurAreas));
  
  // Try a simple direct match first
  if (blurAreas[normalizedPath] && Array.isArray(blurAreas[normalizedPath]) && blurAreas[normalizedPath].length > 0) {
    console.log(`[BLUR DEBUG] Found ${blurAreas[normalizedPath].length} blur areas with exact match`);
    return ensureValidBlurAreas(blurAreas[normalizedPath]);
  }
  
  // Create a map of normalized keys to their original keys
  const normalizedKeysMap = new Map<string, string>();
  Object.keys(blurAreas).forEach(key => {
    const normalized = enhancedNormalizeImagePath(key);
    normalizedKeysMap.set(normalized, key);
    console.log(`[BLUR DEBUG] Normalized blurArea key: "${key}" -> "${normalized}"`);
    
    // Check for duplicate /images prefixes which might cause matching issues
    if (normalized.includes('/images/images/')) {
      console.warn(`[BLUR DEBUG] Warning: Detected duplicate /images prefix in "${normalized}" - this should not happen after normalization`);
    }
  });
  
  // Check if our normalized path exists in the map
  if (normalizedKeysMap.has(normalizedPath)) {
    const originalKey = normalizedKeysMap.get(normalizedPath)!;
    console.log(`[BLUR DEBUG] Found match by normalized path: "${normalizedPath}" matches key "${originalKey}"`);
    return ensureValidBlurAreas(blurAreas[originalKey]);
  }
  
  // ENHANCED MATCHING: Try alternative path formats by adding/removing /images prefix
  const altPath1 = normalizedPath.replace('/images/', '/');
  const altPath2 = normalizedPath.startsWith('/images/') ? normalizedPath : `/images${normalizedPath}`;
  
  console.log(`[BLUR DEBUG] Trying alternative path formats:`);
  console.log(`[BLUR DEBUG] - Original: "${normalizedPath}"`);
  console.log(`[BLUR DEBUG] - Alt 1 (remove /images/): "${altPath1}"`);
  console.log(`[BLUR DEBUG] - Alt 2 (ensure /images/ prefix): "${altPath2}"`);
  
  for (const [normKey, origKey] of normalizedKeysMap.entries()) {
    if (normKey === altPath1 || normKey === altPath2) {
      console.log(`[BLUR DEBUG] Found match with alternative path format: "${normKey}" matches key "${origKey}"`);
      return ensureValidBlurAreas(blurAreas[origKey]);
    }
  }
  
  // Get the filename only and try matching by that
  const filename = normalizedPath.split('/').pop()?.toLowerCase() || '';
  if (filename) {
    console.log(`[BLUR DEBUG] Trying to match by filename: "${filename}"`);
    
    // Check all normalized keys for ones that end with our filename
    for (const [normalizedKey, originalKey] of normalizedKeysMap.entries()) {
      const keyFilename = normalizedKey.split('/').pop()?.toLowerCase() || '';
      if (keyFilename === filename) {
        console.log(`[BLUR DEBUG] Found match by filename: "${filename}" matches key "${originalKey}"`);
        return ensureValidBlurAreas(blurAreas[originalKey]);
      }
    }
    
    // Check all keys for ones that contain our filename
    for (const [normalizedKey, originalKey] of normalizedKeysMap.entries()) {
      if (normalizedKey.includes(filename)) {
        console.log(`[BLUR DEBUG] Found match by filename contained in key: "${filename}" is in "${originalKey}"`);
        return ensureValidBlurAreas(blurAreas[originalKey]);
      }
    }
  }
  
  // Try to match by partial paths - find the best match by longest common substring
  const findBestMatch = () => {
    let bestMatchLength = 0;
    let bestMatchKey = '';
    
    for (const [normKey, origKey] of normalizedKeysMap.entries()) {
      // Compare path segments (folders) for better matching
      const pathSegments = normalizedPath.split('/').filter(Boolean);
      const keySegments = normKey.split('/').filter(Boolean);
      
      // Count matching segments
      const matchingSegments = pathSegments.filter(segment => keySegments.includes(segment));
      
      if (matchingSegments.length > 0 && (bestMatchKey === '' || matchingSegments.length > bestMatchLength)) {
        bestMatchLength = matchingSegments.length;
        bestMatchKey = origKey;
      }
    }
    
    if (bestMatchKey) {
      console.log(`[BLUR DEBUG] Found best partial match: "${bestMatchKey}" with ${bestMatchLength} matching segments`);
      return blurAreas[bestMatchKey];
    }
    
    return null;
  };
  
  const bestMatch = findBestMatch();
  if (bestMatch) {
    return ensureValidBlurAreas(bestMatch);
  }
  
  // Last-ditch effort: try to match by car name/id from URL
  const match = normalizedPath.match(/gallery-page\/([^\/]+)/i);
  if (match && match[1]) {
    const carId = match[1].toLowerCase();
    console.log(`[BLUR DEBUG] Trying to match by car ID: "${carId}"`);
    
    for (const [normalizedKey, originalKey] of normalizedKeysMap.entries()) {
      if (normalizedKey.includes(carId)) {
        console.log(`[BLUR DEBUG] Found match by car ID: "${carId}" is in "${originalKey}"`);
        return ensureValidBlurAreas(blurAreas[originalKey]);
      }
    }
  }
  
  // No matches found
  console.log(`[BLUR DEBUG] No blur areas found for image after trying all matching methods`);
  return [];
}

/**
 * Ensures that blur areas have all necessary properties with valid values
 */
function ensureValidBlurAreas(areas: any[]): any[] {
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