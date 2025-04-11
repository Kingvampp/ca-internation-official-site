'use server';

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  // Get the image path from the query parameter
  const { searchParams } = new URL(request.url);
  let imagePath = searchParams.get('path');
  
  if (!imagePath) {
    return NextResponse.json({ 
      error: 'No image path provided',
      exists: false 
    }, { status: 400 });
  }
  
  console.log(`[API CheckImage] Checking image path: ${imagePath}`);
  
  // Create path variations to check
  const pathVariations = generatePathVariations(imagePath);
  const results = {};
  
  // Check each path variation to see if it exists
  for (const variation of pathVariations) {
    try {
      // Convert URL path to filesystem path
      let fsPath = variation;
      
      // Remove leading slash
      if (fsPath.startsWith('/')) {
        fsPath = fsPath.substring(1);
      }
      
      // Check in public directory
      const fullPath = path.join(process.cwd(), 'public', fsPath);
      const exists = fs.existsSync(fullPath);
      
      results[variation] = {
        exists,
        fsPath: fullPath
      };
      
      if (exists) {
        console.log(`[API CheckImage] ✅ Found image at path: ${fullPath}`);
      }
    } catch (error) {
      console.error(`[API CheckImage] Error checking path ${variation}:`, error.message);
      results[variation] = { exists: false, error: error.message };
    }
  }
  
  // Find the first path that exists, if any
  const firstWorkingPath = Object.keys(results).find(key => results[key].exists);
  
  return NextResponse.json({
    originalPath: imagePath,
    variations: results,
    workingPath: firstWorkingPath || null,
    exists: !!firstWorkingPath
  });
}

// Generate different path variations to check
function generatePathVariations(imagePath) {
  const variations = [
    // Original path
    imagePath,
  ];
  
  // Normalize the path (remove query params, etc.)
  let normalized = imagePath.split('?')[0].split('#')[0];
  variations.push(normalized);
  
  // Try with and without leading slash
  if (normalized.startsWith('/')) {
    variations.push(normalized.substring(1));
  } else {
    variations.push(`/${normalized}`);
  }
  
  // Try with and without /images/ prefix
  if (normalized.includes('/images/')) {
    variations.push(normalized.replace('/images/', '/'));
  } else if (!normalized.startsWith('http') && !normalized.includes('/images/')) {
    variations.push(`/images${normalized.startsWith('/') ? normalized : `/${normalized}`}`);
  }
  
  // Try with gallery-page path pattern
  const filename = normalized.split('/').pop();
  variations.push(`/images/gallery-page/${filename}`);
  
  // Try in other common directories
  variations.push(`/images/${filename}`);
  variations.push(`/gallery/${filename}`);
  
  // Return unique variations
  return [...new Set(variations)];
} 