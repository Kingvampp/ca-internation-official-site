import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import { 
  getAllGalleryItemsAdmin, 
  getGalleryItemByIdAdmin,
  createGalleryItemAdmin, 
  updateGalleryItemAdmin, 
  deleteGalleryItemAdmin,
  normalizeImagePath,
  GalleryItem,
  BlurZone
} from '../../../utils/galleryService-admin';
import { checkAdminAuth } from '../../../utils/authMiddleware';
import { adminInitialized, reloadFirebaseAdmin } from '../../../utils/firebase-admin';

// Import the enhanced normalize function from imagePathUtils
import { enhancedNormalizeImagePath } from '../../../utils/imagePathUtils';

// Enhanced logging for API routes
const logApi = (message: string, data?: any) => {
  console.log(`[API Gallery] ${message}`, data ? data : '');
};

const logApiWarning = (message: string, data?: any) => {
  console.warn(`[API Gallery] ⚠️ ${message}`, data ? data : '');
};

const logApiError = (message: string, error?: any) => {
  console.error(`[API Gallery] 🚨 ${message}`, error ? error : '');
};

// Add a custom interface for our extended BlurZone array with __debug_timestamp
interface BlurZoneArray extends Array<BlurZone> {
  __debug_timestamp?: number;
}

// Helper function to ensure valid image path
function ensureValidImagePath(path: string | null | undefined): string {
  if (!path) {
    logApiWarning('ensureValidImagePath - Empty path, returning empty string');
    return '';
  }
  
  // Use the enhanced normalize function from imagePathUtils for consistency
  const normalizedPath = enhancedNormalizeImagePath(path);
  logApi(`ensureValidImagePath - Normalized: "${path}" -> "${normalizedPath}"`);
  
  return normalizedPath;
}

// GET /api/gallery - Get all gallery items
export async function GET(request: NextRequest): Promise<NextResponse> {
  logApi('Handling GET request to /api/gallery');
  
  try {
    // Check for ID parameter for single item request
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      console.log('[API Gallery] Getting single gallery item with ID:', id);
      const item = await getGalleryItemByIdAdmin(id);
      
      if (!item) {
        console.log('[API Gallery] ❌ Item not found for ID:', id);
        return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
      }
      
      // Sanitize the item to ensure proper image paths
      const sanitizedItem = sanitizeGalleryItem(item);
      
      // Log blur areas if they exist
      if (sanitizedItem.blurAreas) {
        const blurAreaCount = Object.keys(sanitizedItem.blurAreas).length;
        console.log(`[API Gallery] Found item with ${blurAreaCount} blur area sets:`);
        if (blurAreaCount > 0) {
          const firstKey = Object.keys(sanitizedItem.blurAreas)[0];
          const firstAreaCount = sanitizedItem.blurAreas[firstKey]?.length || 0;
          console.log(`[API Gallery] First blur area set for image: ${firstKey} has ${firstAreaCount} zones`);
        }
      } else {
        console.log('[API Gallery] Item has no blur areas defined');
      }
      
      // Validate image paths to ensure they're properly formatted
      console.log('[API Gallery] Main image path:', sanitizedItem.mainImage);
      console.log('[API Gallery] Before images count:', sanitizedItem.beforeImages.length);
      console.log('[API Gallery] After images count:', sanitizedItem.afterImages.length);
      
      console.log('[API Gallery] ✅ Successfully retrieved gallery item with ID:', id);
      return NextResponse.json(sanitizedItem);  // Return item directly for better client-side compatibility
    }
    
    // Get all gallery items
    console.log('[API Gallery] Getting all gallery items');
    const items = await getAllGalleryItemsAdmin();
    
    // Sanitize all items
    const sanitizedItems = items.map(item => sanitizeGalleryItem(item));
    
    // Log total count of items with blur areas
    const itemsWithBlurAreas = sanitizedItems.filter(item => item.blurAreas && Object.keys(item.blurAreas).length > 0);
    console.log(`[API Gallery] Retrieved ${sanitizedItems.length} items, ${itemsWithBlurAreas.length} have blur areas`);
    
    console.log('[API Gallery] ✅ Successfully retrieved', sanitizedItems.length, 'gallery items');
    return NextResponse.json({ items: sanitizedItems });
  } catch (error) {
    logApiError('Error in gallery GET route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/gallery - Create a new gallery item
export async function POST(request: NextRequest) {
  logApi('Handling POST request to /api/gallery');
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    logApi('Parsing request body');
    const item: GalleryItem = body.item;
    logApi('Request body parsed', { title: item.title, categories: item.categories });
    
    // Validate required fields
    if (!item.title || !item.description || !item.mainImage || !item.categories || item.categories.length === 0) {
      logApiWarning('Missing required fields in gallery item creation', {
        hasTitle: !!item.title,
        hasDescription: !!item.description,
        hasMainImage: !!item.mainImage,
        hasCategories: !!item.categories && item.categories.length > 0
      });
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // Create the gallery item
    logApi('Creating new gallery item');
    const id = await createGalleryItemAdmin(item);
    logApi(`Gallery item created successfully with ID: ${id}`);
    
    return NextResponse.json({ success: true, id });
  } catch (error) {
    logApiError('Error in gallery POST route:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/gallery - Update existing gallery item
export async function PUT(request: NextRequest) {
  logApi('Handling PUT request to /api/gallery');
  
  // Check admin auth
  const isAdmin = await checkAdminAuth();
  if (!isAdmin) {
    logApiWarning('PUT /api/gallery - Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Try to reload Firebase Admin if not initialized
    if (!adminInitialized) {
      console.log('Firebase Admin not initialized, trying to reload...');
      const reloaded = reloadFirebaseAdmin();
      logApi(`Firebase reload ${reloaded ? 'successful' : 'failed'}`);
    }
    
    const data = await request.json();
    
    if (!data.id) {
      logApiError('Attempted to update gallery item without ID');
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }
    
    const id = data.id;
    logApi(`PUT /api/gallery - Updating gallery item ${id}`);
    
    // Get the existing gallery item to preserve blur areas if not provided in the update
    const existingItem = await getGalleryItemByIdAdmin(id);
    
    if (!existingItem) {
      logApiError(`Gallery item ${id} not found`);
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }
    
    // Sanitize the gallery item data
    const sanitizedItem = sanitizeGalleryItem(data, existingItem);
    
    // Log the blur areas before update
    if (sanitizedItem.blurAreas) {
      logApi(`PUT /api/gallery - Updating with ${Object.keys(sanitizedItem.blurAreas).length} blur area keys`);
      
      // Log more details about the blur areas for debugging
      Object.entries(sanitizedItem.blurAreas).forEach(([key, zones]) => {
        if (Array.isArray(zones) && zones.length > 0) {
          logApi(`PUT /api/gallery - Key: "${key}" has ${zones.length} blur zones`);
        }
      });
    }
    
    // Update the gallery item
    const updatedItem = await updateGalleryItemAdmin(id, sanitizedItem);
    
    // Verify the update was successful
    if (!updatedItem) {
      logApiError(`Failed to update gallery item ${id}`);
      return NextResponse.json({ error: 'Failed to update gallery item' }, { status: 500 });
    }
    
    // Log the successful update
    logApi(`PUT /api/gallery - Successfully updated gallery item ${id}`);
    
    // Return the updated gallery item
    return NextResponse.json({ 
      success: true, 
      id: id,
      galleryItem: updatedItem
    }, { status: 200 });
    
  } catch (error: any) {
    logApiError(`Error updating gallery item: ${error.message}`);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// Helper function to sanitize gallery item data
function sanitizeGalleryItem(data: any, existingItem?: any) {
  const sanitizedItem = { ...data };
  
  // Enhanced blur area handling
  if (!sanitizedItem.blurAreas || Object.keys(sanitizedItem.blurAreas).length === 0) {
    // If no blur areas in update, preserve existing blur areas completely
    logApi('Sanitize - No blur areas in update, preserving existing blur areas');
    if (existingItem?.blurAreas && Object.keys(existingItem.blurAreas).length > 0) {
      logApi(`Sanitize - Preserving ${Object.keys(existingItem.blurAreas).length} existing blur area keys`);
      sanitizedItem.blurAreas = existingItem.blurAreas;
    } else {
      sanitizedItem.blurAreas = {};
    }
  } else {
    logApi(`Sanitize - Found ${Object.keys(sanitizedItem.blurAreas).length} blur area keys in update`);
    
    // Create a normalized version of existing blur areas for reference
    const existingNormalizedBlurAreas: Record<string, BlurZone[]> = {};
    if (existingItem?.blurAreas) {
      Object.entries(existingItem.blurAreas).forEach(([key, zones]) => {
        const normalizedKey = enhancedNormalizeImagePath(key);
        if (normalizedKey && Array.isArray(zones) && zones.length > 0) {
          existingNormalizedBlurAreas[normalizedKey] = zones as BlurZone[];
          logApi(`Sanitize - Normalized existing key: ${key} -> ${normalizedKey} with ${(zones as BlurZone[]).length} zones`);
        }
      });
    }
    
    // Process blur areas from the update
    const normalizedBlurAreas: Record<string, BlurZone[]> = {};
    
    // First, add all the new blur areas with normalized paths
    for (const [imagePath, blurZones] of Object.entries(sanitizedItem.blurAreas)) {
      const normalizedPath = enhancedNormalizeImagePath(imagePath);
      if (!normalizedPath) {
        logApiWarning(`Sanitize - Empty normalized path for "${imagePath}", skipping`);
        continue;
      }
      
      logApi(`Sanitize - Normalized update path: ${imagePath} -> ${normalizedPath}`);
      
      if (Array.isArray(blurZones) && blurZones.length > 0) {
        // Ensure each blur zone has proper metadata
        const enhancedBlurZones = (blurZones as BlurZone[]).map(zone => ({
          ...zone,
          debug_timestamp: Date.now(),
          _metadata: {
            ...(zone._metadata || {}),
            timestamp: Date.now(),
            originalPath: imagePath,
            normalizedPath: normalizedPath
          }
        }));
        
        normalizedBlurAreas[normalizedPath] = enhancedBlurZones;
        logApi(`Sanitize - Added ${enhancedBlurZones.length} zones for path ${normalizedPath}`);
      }
    }
    
    // Then, add any existing blur areas that aren't being updated
    for (const [normalizedKey, zones] of Object.entries(existingNormalizedBlurAreas)) {
      if (!normalizedBlurAreas[normalizedKey] && Array.isArray(zones) && zones.length > 0) {
        normalizedBlurAreas[normalizedKey] = zones;
        logApi(`Sanitize - Preserved ${zones.length} existing zones for path ${normalizedKey}`);
      }
    }
    
    // Use the normalized and merged blur areas
    sanitizedItem.blurAreas = normalizedBlurAreas;
    logApi(`Sanitize - Final blur areas object has ${Object.keys(normalizedBlurAreas).length} entries`);
  }
  
  // Add or update updatedAt timestamp
  sanitizedItem.updatedAt = Date.now();
  
  return sanitizedItem;
}

// DELETE /api/gallery - Delete a gallery item
export async function DELETE(request: NextRequest) {
  logApi('Handling DELETE request to /api/gallery');
  try {
    // Check admin authentication
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the ID from the request
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
    }
    
    logApi(`Deleting gallery item with ID: ${id}`);
    
    // Delete the gallery item
    try {
    await deleteGalleryItemAdmin(id);
    logApi(`Gallery item with ID: ${id} deleted successfully`);
      return NextResponse.json({ success: true });
    } catch (error: any) {
      logApiError(`Error deleting gallery item: ${error.message}`);
      return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
  } catch (error) {
    logApiError('Error in gallery DELETE route:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 