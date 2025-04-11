// SERVER-SIDE ONLY GALLERY SERVICE
// This file should only be imported in server components or API routes

import { adminDb, adminInitialized } from './firebase-admin';
import { BlurZone as ClientBlurZone } from './galleryService';

// Extend the BlurZone interface to include metadata
export interface BlurZone extends ClientBlurZone {
  _metadata?: {
    imageWidth?: number;
    imageHeight?: number;
    timestamp?: number;
  } | {
    timestamp: number;
  };
}

// Enhanced logging for server-side
const logGalleryAdmin = (message: string, data?: any) => {
  console.log(`[Gallery Admin Service] ${message}`, data ? data : '');
};

const logGalleryAdminWarning = (message: string, data?: any) => {
  console.warn(`[Gallery Admin Service] ⚠️ ${message}`, data ? data : '');
};

const logGalleryAdminError = (message: string, error?: any) => {
  console.error(`[Gallery Admin Service] 🚨 ${message}`, error ? error : '');
};

// Gallery item type definition - same as client-side
export type GalleryItem = {
  id?: string;
  title: string;
  description: string;
  categories: string[];
  mainImage: string;
  beforeImages: string[];
  afterImages: string[];
  tags: string[];
  createdAt?: number;
  updatedAt?: number;
  translationKeys?: {
    title: string;
    description: string;
  };
  blurAreas?: Record<string, BlurZone[]>; // Map of image URLs to array of blur zones
};

const COLLECTION_NAME = 'galleryItems';

// The same fallback items as client-side for development
const fallbackGalleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Thunderbird Classic Restoration",
    categories: ["restoration", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-rear.jpg"
    ],
    afterImages: [
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-rear.jpg"
    ],
    mainImage: "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
    description: "Complete restoration of a classic Thunderbird, bringing back its original glory with meticulous attention to detail.",
    tags: ["Classic", "Restoration", "American", "Vintage", "Before/After"],
    translationKeys: {
      title: "gallery.items.thunderbird.title",
      description: "gallery.items.thunderbird.description"
    }
  },
  // Add more fallback items if needed
];

// Helper function to check if Firebase Admin is initialized
function isFirebaseAdminInitialized() {
  // First check the exported flag
  if (adminInitialized === false) {
    logGalleryAdmin('Firebase Admin initialization check: Not initialized (from flag)');
    return false;
  }
  
  // Also verify the DB is accessible as a fallback check
  const isInitialized = adminDb && typeof adminDb.collection === 'function';
  logGalleryAdmin(`Firebase Admin initialization check: ${isInitialized ? 'Initialized' : 'Not initialized'}`);
  return isInitialized;
}

// Get all gallery items - server-side version
export async function getAllGalleryItemsAdmin(): Promise<GalleryItem[]> {
  try {
    logGalleryAdmin('Getting all gallery items from admin service...');
    
    // Check if Firebase Admin is properly initialized
    if (!isFirebaseAdminInitialized()) {
      logGalleryAdminWarning("Firebase Admin not initialized, returning fallback gallery items");
      return fallbackGalleryItems;
    }
    
    try {
      logGalleryAdmin(`Accessing collection '${COLLECTION_NAME}' ordered by 'createdAt'`);
      const galleryRef = adminDb.collection(COLLECTION_NAME);
      
      logGalleryAdmin('Executing Firestore Admin query...');
      const snapshot = await galleryRef.orderBy('createdAt', 'desc').get();
      
      if (!snapshot || !snapshot.docs) {
        logGalleryAdminWarning('Invalid query snapshot, returning fallback items');
        return fallbackGalleryItems;
      }
      
      logGalleryAdmin(`Query successful, processing ${snapshot.docs.length} documents`);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as GalleryItem
      }));
      
      // Always return the Firebase items, even if empty
      logGalleryAdmin(`Found ${items.length} gallery items in Firebase Admin`);
      
      // Log the first few items for debugging
      if (items.length > 0) {
        items.slice(0, 3).forEach((item, index) => {
          logGalleryAdmin(`Item ${index + 1}:`, {
            id: item.id,
            title: item.title,
            categories: item.categories
          });
        });
      } else {
        logGalleryAdminWarning('No gallery items found in Firebase Admin. Consider adding some items.');
      }
      
      return items;
    } catch (fetchError) {
      logGalleryAdminError('Error fetching from Firestore Admin:', fetchError);
      return fallbackGalleryItems;
    }
  } catch (error) {
    logGalleryAdminError('Error getting gallery items from admin:', error);
    return fallbackGalleryItems;
  }
}

// Get a single gallery item by ID - server-side version
export async function getGalleryItemByIdAdmin(id: string): Promise<GalleryItem | null> {
  try {
    logGalleryAdmin(`Getting gallery item with ID: ${id} from admin`);
    
    // Check if Firebase Admin is properly initialized
    if (!isFirebaseAdminInitialized()) {
      logGalleryAdminWarning("Firebase Admin not initialized, returning fallback gallery item");
      const fallbackItem = fallbackGalleryItems.find(item => item.id === id);
      if (fallbackItem) {
        logGalleryAdmin('Found matching fallback item');
      } else {
        logGalleryAdminWarning(`No matching fallback item found for ID: ${id}`);
      }
      return fallbackItem || null;
    }
    
    try {
      logGalleryAdmin(`Accessing document '${COLLECTION_NAME}/${id}'`);
      const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
      
      logGalleryAdmin(`Fetching document with ID: ${id}`);
      const docSnapshot = await docRef.get();
      
      if (docSnapshot.exists) {
        logGalleryAdmin(`Document exists, returning data for ID: ${id}`);
        return {
          id: docSnapshot.id,
          ...docSnapshot.data() as GalleryItem
        };
      } else {
        logGalleryAdminWarning(`Document with ID: ${id} does not exist`);
      }
    } catch (fetchError) {
      logGalleryAdminError(`Error fetching document with ID ${id} from admin:`, fetchError);
    }
    
    // If item not found in Firebase, check fallback items
    logGalleryAdmin(`Checking fallback items for ID: ${id}`);
    const fallbackItem = fallbackGalleryItems.find(item => item.id === id);
    if (fallbackItem) {
      logGalleryAdmin('Found matching fallback item');
    } else {
      logGalleryAdminWarning(`No matching fallback item found for ID: ${id}`);
    }
    return fallbackItem || null;
  } catch (error) {
    logGalleryAdminError(`Error getting gallery item with ID ${id} from admin:`, error);
    const fallbackItem = fallbackGalleryItems.find(item => item.id === id);
    return fallbackItem || null;
  }
}

// Create a new gallery item - server-side version
export async function createGalleryItemAdmin(item: GalleryItem): Promise<string> {
  try {
    logGalleryAdmin('Creating new gallery item with admin:', { title: item.title });
    
    // Check if Firebase Admin is properly initialized
    if (!isFirebaseAdminInitialized()) {
      logGalleryAdminWarning("Firebase Admin not initialized, cannot create gallery item");
      throw new Error("Firebase Admin not properly initialized");
    }
    
    const timestamp = Date.now();
    logGalleryAdmin('Adding timestamps to gallery item');
    const itemWithTimestamps = {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Generate translation keys if not provided
    if (!itemWithTimestamps.translationKeys) {
      logGalleryAdmin('No translation keys provided, will set temporary ones');
      // The actual keys will be set after creation when we know the document ID
      itemWithTimestamps.translationKeys = {
        title: '',
        description: ''
      };
    }
    
    logGalleryAdmin(`Adding document to collection '${COLLECTION_NAME}'`);
    const docRef = await adminDb.collection(COLLECTION_NAME).add(itemWithTimestamps);
    
    // Now that we have the ID, update the translation keys
    const id = docRef.id;
    logGalleryAdmin(`Document added with ID: ${id}`);
    
    const translationKeys = {
      title: `gallery.items.${id}.title`,
      description: `gallery.items.${id}.description`
    };
    
    logGalleryAdmin(`Updating document with translation keys`, translationKeys);
    await docRef.update({ translationKeys });
    logGalleryAdmin(`Translation keys updated for document ID: ${id}`);
    
    return id;
  } catch (error) {
    logGalleryAdminError('Error creating gallery item with admin:', error);
    throw error;
  }
}

// Function to normalize image path for consistent lookup
export const normalizeImagePath = (path: string): string => {
  if (!path) {
    logGalleryAdminWarning('Empty image path provided for normalization');
    return '';
  }
  
  logGalleryAdmin(`Normalizing image path: ${path}`);
  
  // Handle blob URLs by returning empty string - these should not be used as keys
  if (path.startsWith('blob:') || path.startsWith('data:')) {
    logGalleryAdminWarning(`Skipping temporary URL: ${path}`);
    return '';
  }
  
  // Remove domain from HTTP URLs
  let normalizedPath = path;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const urlObj = new URL(path);
      normalizedPath = urlObj.pathname;
      logGalleryAdmin(`Extracted path from URL: ${normalizedPath}`);
    } catch (e) {
      logGalleryAdminError(`Error parsing URL: ${path}`, e);
    }
  }
  
  // Ensure the path starts with a slash
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Remove any query parameters and hash fragments
  normalizedPath = normalizedPath.split('?')[0].split('#')[0];
  
  // Normalize path by making sure it uses lowercase for consistent matching
  // This is critical for case-insensitive matching between client and server
  normalizedPath = normalizedPath.toLowerCase();
  logGalleryAdmin(`Path after lowercase normalization: ${normalizedPath}`);
  
  // Map of common path variations to their canonical forms
  const pathAliases: Record<string, string> = {
    '/images/gallery/': '/images/gallery-page/',
    '/gallery/': '/images/gallery-page/',
    '/gallery-page/': '/images/gallery-page/',
  };
  
  // Apply path aliases for consistent directory structure
  for (const [alias, canonical] of Object.entries(pathAliases)) {
    if (normalizedPath.includes(alias)) {
      normalizedPath = normalizedPath.replace(alias, canonical);
      logGalleryAdmin(`Replaced path alias ${alias} with ${canonical}`);
      break;
    }
  }
  
  // Ensure gallery paths are correctly formatted
  // This is critical for matching when retrieving blur areas
  if (normalizedPath.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    // Extract filename from path
    const filename = normalizedPath.split('/').pop() || '';
    logGalleryAdmin(`Extracted filename: ${filename}`);
    
    // Try to match car name from filename pattern (e.g., before-9-blueaccord-front.jpg)
    const carMatch = filename.match(/(?:before|after)-\d+-([a-z0-9]+)/i);
    
    // If car name found in filename
    if (carMatch && carMatch[1]) {
      const carName = carMatch[1].toLowerCase();
      logGalleryAdmin(`Extracted car name from filename: ${carName}`);
      
      // Map of car names to their directories - must match what's used in the frontend
      const carDirectories: Record<string, string> = {
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
      
      // If we found a matching car directory
      const directory = carDirectories[carName];
      if (directory) {
        // Check if the path already contains the correct directory
        const correctDirectoryPattern = `/images/gallery-page/${directory}/`;
        if (!normalizedPath.includes(correctDirectoryPattern)) {
          const newPath = `/images/gallery-page/${directory}/${filename}`;
          logGalleryAdmin(`Corrected path to gallery directory: ${normalizedPath} -> ${newPath}`);
          normalizedPath = newPath;
        } else {
          logGalleryAdmin(`Path already contains correct directory: ${correctDirectoryPattern}`);
        }
      } else {
        logGalleryAdmin(`No matching directory found for car name: ${carName}`);
      }
    } else {
      logGalleryAdmin(`Couldn't extract car name from filename: ${filename}`);
      
      // If we couldn't extract a car name, but we're sure it's an image file
      // Check if the path contains any of the known car names
      for (const [carName, directory] of Object.entries({
        'thunderbird': 'thunderbird-restoration',
        'cadillac': 'red-cadillac-repair',
        'porsche': 'porsche-detail',
        'mustang': 'mustang-rebuild',
        'mercedes': 'mercedes-sl550-repaint',
        'greenmercedes': 'green-mercedes-repair',
        'jaguar': 'jaguar-repaint',
        'honda': 'honda-accord-repair',
        'bmw': 'bmw-e90-repair',
        'alfa': 'blue-alfa-repair',
        'bluemustang': 'blue-mustang-repair',
        'blueaccord': 'blue-accord-repair'
      })) {
        if (normalizedPath.includes(carName) && !normalizedPath.includes(directory)) {
          const newPath = `/images/gallery-page/${directory}/${filename}`;
          logGalleryAdmin(`Found car name '${carName}' in path, correcting to: ${newPath}`);
          normalizedPath = newPath;
          break;
        }
      }
    }
  }
  
  // Make sure all image paths start with /images if they're not already absolute URLs
  if (!normalizedPath.startsWith('http') && !normalizedPath.includes('/images/')) {
    normalizedPath = `/images${normalizedPath}`;
    logGalleryAdmin(`Added /images prefix to path: ${normalizedPath}`);
  }
  
  logGalleryAdmin(`Final normalized path: ${normalizedPath}`);
  return normalizedPath;
};

// Update gallery item 
export async function updateGalleryItemAdmin(id: string, item: Partial<GalleryItem>): Promise<{success: boolean, error?: string}> {
  try {
    logGalleryAdmin(`Updating gallery item with ID: ${id}`);
    
    // Log blur areas if they exist for debugging
    if (item.blurAreas) {
      const areaKeys = Object.keys(item.blurAreas);
      logGalleryAdmin(`Item has ${areaKeys.length} blur area entries`);
      
      // TEST: Log detailed blur areas information for debugging
      logGalleryAdmin('BLUR AREA TEST - Raw input blur areas:');
      
      // Process blur areas first, even if Firebase isn't initialized
      // This ensures we have valid data to save
      // Normalize all image paths in blur areas to ensure consistency
      const normalizedBlurAreas: Record<string, BlurZone[]> = {};
      
      // Process each blur area
      areaKeys.forEach(key => {
        if (!key || key === 'undefined' || key === 'null') {
          logGalleryAdminWarning(`Skipping invalid key: ${key}`);
          return;
        }
        
        // Skip blob URLs
        if (key.startsWith('blob:') || key.startsWith('data:')) {
          logGalleryAdminWarning(`Skipping temporary blob/data URL: ${key}`);
          return;
        }
        
        // Get the normalized key
        const normalizedKey = normalizeImagePath(key);
        
        // Only add valid normalized keys
        if (normalizedKey && item.blurAreas && Array.isArray(item.blurAreas[key])) {
          // Check if the areas array has the debug timestamp and preserve it
          const hasDebugTimestamp = !!(item.blurAreas[key] as any).__debug_timestamp;
          const debugTimestamp = hasDebugTimestamp ? (item.blurAreas[key] as any).__debug_timestamp : null;
          
          if (hasDebugTimestamp) {
            logGalleryAdmin(`Found debug timestamp ${debugTimestamp} on key: ${key}`);
          }
          
          // Get the blur areas from the input
          const blurAreas = item.blurAreas[key];
          
          // Ensure we have a valid array with required properties
          const validAreas = blurAreas
            .filter(area => 
              area && 
              typeof area === 'object' && 
              typeof area.x === 'number' && 
              typeof area.y === 'number' && 
              typeof area.width === 'number' && 
              typeof area.height === 'number'
            )
            .map(area => ({
              x: area.x,
              y: area.y,
              width: area.width,
              height: area.height,
              rotation: area.rotation || 0,
              blurAmount: area.blurAmount || 8,
              // Preserve metadata if available
              _metadata: area._metadata || { timestamp: Date.now() }
            }));
          
          if (validAreas.length > 0) {
            normalizedBlurAreas[normalizedKey] = validAreas;
            
            // Preserve the metadata on the area array if needed
            if (hasDebugTimestamp) {
              (normalizedBlurAreas[normalizedKey] as any).__debug_timestamp = debugTimestamp;
              logGalleryAdmin(`Preserved debug timestamp ${debugTimestamp} on normalized key: ${normalizedKey}`);
            }
            
            logGalleryAdmin(`Normalized blur area key from "${key}" to "${normalizedKey}", with ${validAreas.length} zones`);
            
            // If the key changed during normalization, log it
            if (key !== normalizedKey) {
              logGalleryAdmin(`IMPORTANT: Key changed during normalization: "${key}" -> "${normalizedKey}"`);
            }
          } else {
            logGalleryAdminWarning(`No valid blur areas found for key: ${key}`);
          }
        } else {
          logGalleryAdminWarning(`Unable to normalize blur area for key: ${key}`);
        }
      });
      
      // Replace with normalized version
      item.blurAreas = normalizedBlurAreas;
      
      logGalleryAdmin(`Final blur areas object has ${Object.keys(normalizedBlurAreas).length} entries`);
    }
    
    // Check if Firebase Admin is properly initialized
    if (!isFirebaseAdminInitialized()) {
      // Check why Firebase Admin isn't initialized
      const serviceAccountProject = process.env.FIREBASE_PROJECT_ID ? 'available' : 'missing';
      const serviceAccountEmail = process.env.FIREBASE_CLIENT_EMAIL ? 'available' : 'missing';
      const serviceAccountKey = process.env.FIREBASE_PRIVATE_KEY ? 'available' : 'missing';
      
      logGalleryAdminWarning('Firebase Admin not initialized, cannot update gallery item');
      logGalleryAdminWarning('Firebase configuration status:', {
        projectId: serviceAccountProject,
        clientEmail: serviceAccountEmail,
        privateKey: serviceAccountKey
      });
      
      // Still process the data and save the normalized blurAreas for debugging
      return {
        success: false,
        error: `Firebase Admin not properly initialized. Configuration: projectId=${serviceAccountProject}, clientEmail=${serviceAccountEmail}, privateKey=${serviceAccountKey}`
      };
    }
    
    // Prepare update data
    const updateData = {
      ...item,
      updatedAt: Date.now()
    };
    
    logGalleryAdmin(`Updating document in '${COLLECTION_NAME}/${id}'`);
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    await docRef.update(updateData);
    
    logGalleryAdmin(`Successfully updated gallery item with ID: ${id}`);
    return { success: true };
  } catch (error) {
    logGalleryAdminError(`Error updating gallery item with ID ${id}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error updating gallery item'
    };
  }
}

// Delete a gallery item - server-side version
export async function deleteGalleryItemAdmin(id: string): Promise<void> {
  try {
    logGalleryAdmin(`Deleting gallery item with ID: ${id} using admin`);
    
    // Check if Firebase Admin is properly initialized
    if (!isFirebaseAdminInitialized()) {
      logGalleryAdminWarning("Firebase Admin not initialized, cannot delete gallery item");
      throw new Error("Firebase Admin not properly initialized");
    }
    
    logGalleryAdmin(`Accessing document '${COLLECTION_NAME}/${id}'`);
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    
    logGalleryAdmin('Executing delete operation');
    await docRef.delete();
    logGalleryAdmin(`Document with ID: ${id} deleted successfully`);
  } catch (error) {
    logGalleryAdminError('Error deleting gallery item with admin:', error);
    throw error;
  }
}

// Generate translation keys for a gallery item
export function generateGalleryTranslationKeys(id: string): { title: string, description: string } {
  logGalleryAdmin(`Generating translation keys for ID: ${id}`);
  return {
    title: `gallery.items.${id}.title`,
    description: `gallery.items.${id}.description`
  };
} 