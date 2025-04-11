import { clientDb } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

// Enhanced logging
const logGallery = (message: string, data?: any) => {
  console.log(`[Gallery Service] ${message}`, data ? data : '');
};

const logGalleryWarning = (message: string, data?: any) => {
  console.warn(`[Gallery Service] ⚠️ ${message}`, data ? data : '');
};

const logGalleryError = (message: string, error?: any) => {
  console.error(`[Gallery Service] 🚨 ${message}`, error ? error : '');
};

// Define the BlurZone type
export interface BlurZone {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  blurAmount?: number;
  debug_timestamp?: number;
}

// Gallery item type definition
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

// Hardcoded fallback gallery items
const fallbackGalleryItems: GalleryItem[] = [
  {
    id: "1",
    title: "Thunderbird Classic Restoration",
    categories: ["restoration", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-rear.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/After-1-thunderbird-rear.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-side.jpg"
    ],
    mainImage: "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
    description: "Complete restoration of a classic Thunderbird, bringing back its original glory with meticulous attention to detail.",
    tags: ["Classic", "Restoration", "American", "Vintage", "Before/After"],
    translationKeys: {
      title: "gallery.items.thunderbird.title",
      description: "gallery.items.thunderbird.description"
    }
  },
  {
    id: "2",
    title: "Red Cadillac Repair",
    categories: ["bodywork", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/red-cadillac-repair/before-5-redcadillac-front.jpg",
      "/images/gallery-page/red-cadillac-repair/before-5-redcadillac-side.jpg",
      "/images/gallery-page/red-cadillac-repair/before-5-redcadillac-front(2).jpg"
    ],
    afterImages: [
      "/images/gallery-page/red-cadillac-repair/After-5-redcadillac-front.jpg",
      "/images/gallery-page/red-cadillac-repair/After-5-redcadillac-side.jpg"
    ],
    mainImage: "/images/gallery-page/red-cadillac-repair/After-5-redcadillac-front.jpg",
    description: "Precision repair and refinishing of this classic Cadillac, restoring its elegant red finish to showroom quality.",
    tags: ["Cadillac", "American", "Classic", "Paint Correction", "Before/After"],
    translationKeys: {
      title: "gallery.items.cadillac.title",
      description: "gallery.items.cadillac.description"
    }
  },
  {
    id: "3",
    title: "Porsche Detail Work",
    categories: ["detailing", "luxury"],
    beforeImages: [],
    afterImages: [
      "/images/gallery-page/porsche-detail/After-11-porschedetail-front.jpg",
      "/images/gallery-page/porsche-detail/After-11-porschedetail-side.jpg",
      "/images/gallery-page/porsche-detail/After-11-porschedetail-side(2).jpg"
    ],
    mainImage: "/images/gallery-page/porsche-detail/After-11-porschedetail-front.jpg",
    description: "Premium detailing service for this luxury Porsche, including paint correction, ceramic coating, and interior restoration.",
    tags: ["Porsche", "Detailing", "Luxury", "European"],
    translationKeys: {
      title: "gallery.items.porsche.title",
      description: "gallery.items.porsche.description"
    }
  },
  {
    id: "4",
    title: "Mercedes SL550 Repaint",
    categories: ["paint", "luxury"],
    beforeImages: [],
    afterImages: [
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-front.jpg",
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-side.jpg",
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-side(2).jpg",
      "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-rear.jpg"
    ],
    mainImage: "/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-front.jpg",
    description: "Complete repaint of this Mercedes SL550, featuring a premium metallic finish with flawless execution.",
    tags: ["Mercedes", "Paint", "Luxury", "European"],
    translationKeys: {
      title: "gallery.items.mercedes.title",
      description: "gallery.items.mercedes.description"
    }
  },
  {
    id: "5",
    title: "Green Mercedes Repair",
    categories: ["paint", "bf"],
    beforeImages: [
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-front.jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(2).jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-rear.jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(3).jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side.jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(4).jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(6).jpg",
      "/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(5).jpg"
    ],
    afterImages: [
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front.jpg",
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-side.jpg",
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front(2).jpg",
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-side(2).jpg",
      "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front(3).jpg"
    ],
    mainImage: "/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front.jpg",
    description: "Precision repair and refinishing of this luxury Mercedes-Benz, restoring its elegant green finish to showroom quality.",
    tags: ["Mercedes", "Paint", "Luxury", "European", "Before/After"],
    translationKeys: {
      title: "gallery.items.greenmercedes.title",
      description: "gallery.items.greenmercedes.description"
    }
  },
  {
    id: "6",
    title: "Blue Alfa Romeo Repair",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/blue-alfa-repair/before-3-bluealfa-front.jpg",
      "/images/gallery-page/blue-alfa-repair/before-3-bluealfa-front(2).jpg"
    ],
    afterImages: [
      "/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg"
    ],
    mainImage: "/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg",
    description: "Front-end collision repair on this Italian sports car, perfectly matching the distinctive blue finish.",
    tags: ["Italian", "Sports Car", "Collision", "Color Match", "Before/After"],
    translationKeys: {
      title: "gallery.items.bluealfa.title",
      description: "gallery.items.bluealfa.description"
    }
  },
  {
    id: "7",
    title: "BMW E90 Complete Restoration",
    categories: ["restoration", "collision", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-front.jpg",
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-side.jpg",
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-interior.jpg"
    ],
    afterImages: [
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-side(2).jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-interior.jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front(3).jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-interior(2).jpg"
    ],
    mainImage: "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg",
    description: "Comprehensive restoration of a BMW E90, including exterior repair, interior refurbishment, and mechanical overhaul.",
    tags: ["German", "Luxury", "Complete Restoration", "Interior", "Before/After"],
    translationKeys: {
      title: "gallery.items.bmwe90.title",
      description: "gallery.items.bmwe90.description"
    }
  },
  {
    id: "8",
    title: "Blue Mustang Performance Car Repair",
    categories: ["restoration", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/blue-mustang-repair/before-8-bluemustang-side.jpg",
      "/images/gallery-page/blue-mustang-repair/Before-8-bluemustang-side(2).jpg"
    ],
    afterImages: [
      "/images/gallery-page/blue-mustang-repair/after-8-bluemustang-side.jpg",
      "/images/gallery-page/blue-mustang-repair/After-8-bluemustang-front.jpg"
    ],
    mainImage: "/images/gallery-page/blue-mustang-repair/After-8-bluemustang-front.jpg",
    description: "Restoration of this iconic American muscle car, featuring precise bodywork and a flawless blue finish.",
    tags: ["American", "Muscle Car", "Performance", "Iconic", "Before/After"],
    translationKeys: {
      title: "gallery.items.bluemustang.title",
      description: "gallery.items.bluemustang.description"
    }
  },
  {
    id: "9",
    title: "Blue Honda Accord Repair",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side.jpg",
      "/images/gallery-page/blue-accord-repair/before-9-blueaccord-side(2).jpg",
      "/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side(3).jpg",
      "/images/gallery-page/blue-accord-repair/before-9-blueaccord-side(4).jpg"
    ],
    afterImages: [
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg",
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-side.jpg",
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-side(2).jpg",
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-side(3).jpg"
    ],
    mainImage: "/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg",
    description: "Comprehensive accident repair returning this family sedan to pre-accident condition with perfect panel alignment.",
    tags: ["Japanese", "Sedan", "Accident", "Family Car", "Before/After"],
    translationKeys: {
      title: "gallery.items.blueaccord.title",
      description: "gallery.items.blueaccord.description"
    }
  },
  {
    id: "10",
    title: "Classic Mustang Complete Rebuild",
    categories: ["restoration", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/mustang-rebuild/before-12mustangrebuild-front.jpg",
      "/images/gallery-page/mustang-rebuild/before-12-mustangrebuild-side.jpg",
      "/images/gallery-page/mustang-rebuild/before-12-mustangrebuild-side(2).jpg"
    ],
    afterImages: [
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front.jpg",
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front(3).jpg",
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front(4).jpg",
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side.jpg",
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side(2).jpg",
      "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side(3).jpg"
    ],
    mainImage: "/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front.jpg",
    description: "Frame-off restoration of this American classic, including mechanical rebuilding and authentic detailing.",
    tags: ["American", "Classic", "Rebuild", "Restoration", "Before/After"],
    translationKeys: {
      title: "gallery.items.mustangrebuild.title",
      description: "gallery.items.mustangrebuild.description"
    }
  },
  {
    id: "11",
    title: "Jaguar Exotic Car Repaint",
    categories: ["paint", "luxury", "bf"],
    beforeImages: [
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front.jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(2).jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(3).jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(4).jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(5).jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-side.jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-side(2).jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-back.jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-back(2).jpg",
      "/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-back(3).jpg"
    ],
    afterImages: [
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front.jpg",
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-side.jpg",
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front(2).jpg",
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-side(2).jpg",
      "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front(3).jpg"
    ],
    mainImage: "/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front.jpg",
    description: "Complete repaint of this exotic Jaguar, restoring its pristine finish with meticulous attention to detail.",
    tags: ["Jaguar", "Exotic", "Paint", "Luxury", "Before/After"],
    translationKeys: {
      title: "gallery.items.jaguarrepaint.title",
      description: "gallery.items.jaguarrepaint.description"
    }
  },
  {
    id: "12",
    title: "Honda Accord Repair",
    categories: ["collision", "bodywork", "bf"],
    beforeImages: [
      "/images/gallery-page/honda-accord-repair/before-7-hondaaccord-front.jpg"
    ],
    afterImages: [
      "/images/gallery-page/honda-accord-repair/After-7-hondaaccord-front.jpg"
    ],
    mainImage: "/images/gallery-page/honda-accord-repair/After-7-hondaaccord-front.jpg",
    description: "Precision repair and refinishing of this Honda Accord, restoring it to pre-accident condition.",
    tags: ["Honda", "Sedan", "Collision", "Japanese", "Before/After"],
    translationKeys: {
      title: "gallery.items.hondaaccord.title",
      description: "gallery.items.hondaaccord.description"
    }
  }
];

// Helper function to check if Firebase is initialized
function isFirebaseInitialized() {
  try {
    // Check if clientDb is defined
    if (!clientDb) {
      logGalleryWarning('Firebase client is not defined');
      return false;
    }

    // Check if the collection function exists (ensures proper initialization)
    const hasCollection = typeof clientDb.collection === 'function';
    
    // Check for browser online status if we're in a browser environment
    let isOnline = true;
    if (typeof window !== 'undefined' && window.navigator) {
      isOnline = window.navigator.onLine;
      if (!isOnline) {
        logGalleryWarning('Browser appears to be offline, using fallback items');
      }
    }
    
    const isInitialized = hasCollection && isOnline;
    logGallery(`Firebase client initialization check: ${isInitialized ? 'Initialized' : 'Not initialized'}`);
    
    return isInitialized;
  } catch (error) {
    logGalleryError('Error checking Firebase initialization:', error);
    return false;
  }
}

// Get all gallery items
export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  try {
    logGallery('Getting all gallery items...');
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logGalleryWarning("Firebase not initialized, returning fallback gallery items");
      return fallbackGalleryItems;
    }
    
    logGallery(`Creating query for '${COLLECTION_NAME}' ordered by 'createdAt'`);
    const galleryRef = collection(clientDb, COLLECTION_NAME);
    const q = query(galleryRef, orderBy('createdAt', 'desc'));
    
    try {
      logGallery('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot || !querySnapshot.docs) {
        logGalleryWarning('Invalid query snapshot, returning fallback items');
        return fallbackGalleryItems;
      }
      
      logGallery(`Query successful, processing ${querySnapshot.docs.length} documents`);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as GalleryItem
      }));
      
      // Always return Firebase items if we got here successfully, even if empty
      logGallery(`Found ${items.length} gallery items in Firebase`);
      return items;
    } catch (fetchError) {
      logGalleryError('Error fetching from Firestore:', fetchError);
      return fallbackGalleryItems;
    }
  } catch (error) {
    logGalleryError('Error getting gallery items:', error);
    // Return fallback items on error
    return fallbackGalleryItems;
  }
}

// Get a single gallery item by ID
export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  try {
    logGallery(`Getting gallery item with ID: ${id}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logGalleryWarning("Firebase not initialized, returning fallback gallery item");
      const fallbackItem = fallbackGalleryItems.find(item => item.id === id);
      if (fallbackItem) {
        logGallery('Found matching fallback item');
      } else {
        logGalleryWarning(`No matching fallback item found for ID: ${id}`);
      }
      return fallbackItem || null;
    }
    
    try {
      logGallery(`Fetching document from '${COLLECTION_NAME}/${id}'`);
      const docRef = doc(clientDb, COLLECTION_NAME, id);
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        logGallery(`Document found for ID: ${id}`);
        return {
          id: docSnapshot.id,
          ...docSnapshot.data() as GalleryItem
        };
      } else {
        logGalleryWarning(`No document found for ID: ${id}`);
      }
    } catch (fetchError) {
      logGalleryError(`Error fetching document with ID ${id}:`, fetchError);
    }
    
    // If item not found in Firebase, check fallback items
    logGallery(`Checking fallback items for ID: ${id}`);
    const fallbackItem = fallbackGalleryItems.find(item => item.id === id);
    if (fallbackItem) {
      logGallery('Found matching fallback item');
    } else {
      logGalleryWarning(`No matching fallback item found for ID: ${id}`);
    }
    return fallbackItem || null;
  } catch (error) {
    logGalleryError(`Error getting gallery item with ID ${id}:`, error);
    // Return fallback item on error
    const fallbackItem = fallbackGalleryItems.find(item => item.id === id);
    return fallbackItem || null;
  }
}

// Create a new gallery item
export async function createGalleryItem(item: GalleryItem): Promise<string> {
  try {
    logGallery('Creating new gallery item:', { title: item.title });
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logGalleryWarning("Firebase not initialized, cannot create gallery item");
      throw new Error("Firebase not properly initialized");
    }
    
    const timestamp = Date.now();
    logGallery('Adding timestamps to gallery item');
    const itemWithTimestamps = {
      ...item,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Generate translation keys if not provided
    if (!itemWithTimestamps.translationKeys) {
      logGallery('No translation keys provided, will be set after creation');
      // The actual keys will be set after creation when we know the document ID
      itemWithTimestamps.translationKeys = {
        title: '',
        description: ''
      };
    }
    
    logGallery(`Adding document to collection '${COLLECTION_NAME}'`);
    const docRef = await addDoc(collection(clientDb, COLLECTION_NAME), itemWithTimestamps);
    logGallery(`Document added with ID: ${docRef.id}`);
    
    // Now that we have the ID, update the translation keys
    const id = docRef.id;
    const translationKeys = {
      title: `gallery.items.${id}.title`,
      description: `gallery.items.${id}.description`
    };
    
    logGallery(`Updating document with translation keys`, translationKeys);
    await updateDoc(docRef, { translationKeys });
    logGallery(`Translation keys updated for document ID: ${id}`);
    
    return id;
  } catch (error) {
    logGalleryError('Error creating gallery item:', error);
    throw error;
  }
}

// Update an existing gallery item
export async function updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<void> {
  try {
    logGallery(`Updating gallery item with ID: ${id}`, { fields: Object.keys(item) });
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logGalleryWarning("Firebase not initialized, cannot update gallery item");
      throw new Error("Firebase not properly initialized");
    }
    
    logGallery(`Getting document reference for '${COLLECTION_NAME}/${id}'`);
    const docRef = doc(clientDb, COLLECTION_NAME, id);
    const timestamp = Date.now();
    
    logGallery('Updating document with new data and timestamp');
    await updateDoc(docRef, {
      ...item,
      updatedAt: timestamp
    });
    logGallery(`Document with ID: ${id} updated successfully`);
  } catch (error) {
    logGalleryError('Error updating gallery item:', error);
    throw error;
  }
}

// Delete a gallery item
export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    logGallery(`Deleting gallery item with ID: ${id}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logGalleryWarning("Firebase not initialized, cannot delete gallery item");
      throw new Error("Firebase not properly initialized");
    }
    
    logGallery(`Getting document reference for '${COLLECTION_NAME}/${id}'`);
    const docRef = doc(clientDb, COLLECTION_NAME, id);
    
    logGallery('Executing delete operation');
    await deleteDoc(docRef);
    logGallery(`Document with ID: ${id} deleted successfully`);
  } catch (error) {
    logGalleryError('Error deleting gallery item:', error);
    throw error;
  }
}

// Generate translation keys for a gallery item
export function generateGalleryTranslationKeys(id: string): { title: string, description: string } {
  logGallery(`Generating translation keys for ID: ${id}`);
  return {
    title: `gallery.items.${id}.title`,
    description: `gallery.items.${id}.description`
  };
}

// Enhanced image path normalization function
export function normalizeImagePath(path: string): string {
  if (!path) {
    console.warn('[Gallery Service] Empty image path provided to normalizeImagePath');
    return '';
  }
  
  console.log(`[Gallery Service] Normalizing image path: ${path}`);
  
  // Handle blob URLs and data URLs
  if (path.startsWith('blob:') || path.startsWith('data:')) {
    console.log(`[Gallery Service] Found temporary URL (blob/data), keeping as is: ${path.substring(0, 30)}...`);
    return path;
  }
  
  // Handle absolute URLs
  if (path.startsWith('http')) {
    // If it's a localhost URL, extract just the path
    if (path.includes('localhost:3000')) {
      const parsedUrl = new URL(path);
      path = parsedUrl.pathname;
      console.log(`[Gallery Service] Extracted path from localhost URL: ${path}`);
    } else {
      // External URLs should be kept as-is
      console.log('[Gallery Service] Using original external URL:', path);
      return path;
    }
  }
  
  // Remove any query parameters and hash fragments
  let normalizedPath = path.split('?')[0].split('#')[0];
  
  // Check for URL encoded paths and decode them
  if (normalizedPath.includes('%20') || normalizedPath.includes('%2F')) {
    try {
      normalizedPath = decodeURIComponent(normalizedPath);
      console.log(`[Gallery Service] Decoded URL encoded path: ${normalizedPath}`);
    } catch (e) {
      console.error(`[Gallery Service] Failed to decode URL encoded path: ${normalizedPath}`, e);
    }
  }
  
  // Ensure paths start with /
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  
  // Fix case sensitivity for After/Before in paths
  // This handles both in-path (e.g., /After-/) and filename (e.g., After-1-) scenarios
  const pathParts = normalizedPath.split('/');
  const lastPart = pathParts[pathParts.length - 1];
  
  // Handle capitalization in the filename itself
  if (lastPart.startsWith('After-') || lastPart.startsWith('AFTER-')) {
    pathParts[pathParts.length - 1] = lastPart.replace(/^After-|^AFTER-/, 'after-');
    console.log(`[Gallery Service] Fixed 'After-' case in filename: ${lastPart} → ${pathParts[pathParts.length - 1]}`);
  }
  else if (lastPart.startsWith('Before-') || lastPart.startsWith('BEFORE-')) {
    pathParts[pathParts.length - 1] = lastPart.replace(/^Before-|^BEFORE-/, 'before-');
    console.log(`[Gallery Service] Fixed 'Before-' case in filename: ${lastPart} → ${pathParts[pathParts.length - 1]}`);
  }
  
  // Reconstruct path with fixed case
  normalizedPath = pathParts.join('/');
  
  // If already in gallery-page directory, return as is
  if (normalizedPath.includes('/gallery-page/')) {
    console.log(`[Gallery Service] Path already in gallery-page directory: ${normalizedPath}`);
    return normalizedPath;
  }
  
  // Extract filename
  const filename = normalizedPath.split('/').pop();
  if (!filename) {
    console.warn('[Gallery Service] Could not extract filename from path');
    return normalizedPath;
  }
  
  // Extract car name from filename using multiple patterns
  let carIdentifier = '';
  
  // Pattern 1: before/after-number-carname
  const beforeAfterMatch = /(?:before|after)-(\d+)-([a-z0-9]+)/i.exec(filename);
  
  // Pattern 2: front-number-carname
  const frontMatch = /front-(\d+)-([a-z0-9]+)/i.exec(filename);
  
  // Pattern 3: carname-number
  const carNumberMatch = /([a-z]+)-(\d+)/i.exec(filename);
  
  // Pattern 4: just try to find the car name
  const carNameMatch = /(mercedes(?:sls)?|bmw|porsche|mustang|thunderbird|cadillac|jaguar|honda|accord|alfa|blackjeep)/i.exec(filename);
  
  if (beforeAfterMatch) {
    carIdentifier = beforeAfterMatch[2].toLowerCase();
    console.log(`[Gallery Service] Extracted car name from before/after pattern: ${carIdentifier}`);
  } else if (frontMatch) {
    carIdentifier = frontMatch[2].toLowerCase();
    console.log(`[Gallery Service] Extracted car name from front pattern: ${carIdentifier}`);
  } else if (carNumberMatch) {
    carIdentifier = carNumberMatch[1].toLowerCase();
    console.log(`[Gallery Service] Extracted car name from car-number pattern: ${carIdentifier}`);
  } else if (carNameMatch) {
    carIdentifier = carNameMatch[1].toLowerCase();
    console.log(`[Gallery Service] Extracted car name from simple match: ${carIdentifier}`);
  }
  
  // Map of car names to their directories
  const carDirectories: { [key: string]: string } = {
    'thunderbird': 'thunderbird-restoration',
    'cadillac': 'red-cadillac-repair',
    'redcadillac': 'red-cadillac-repair',
    'porsche': 'porsche-detail',
    'porschedetail': 'porsche-detail',
    'mustangrebuild': 'mustang-rebuild',
    'mercedes': 'mercedes-sl550-repaint',
    'mercedesrepaint': 'mercedes-sl550-repaint',
    'mercedessls': 'mercedes-sl550-repaint',
    'mercedessl550': 'mercedes-sl550-repaint',
    'sl550': 'mercedes-sl550-repaint',
    'merc': 'mercedes-sl550-repaint',
    'greenmercedes': 'green-mercedes-repair',
    'jaguar': 'jaguar-repaint',
    'jaguarrepaint': 'jaguar-repaint',
    'honda': 'honda-accord-repair',
    'hondaaccord': 'honda-accord-repair',
    'bmw': 'bmw-e90-repair',
    'bmwe90': 'bmw-e90-repair',
    'bluealfa': 'blue-alfa-repair',
    'alfa': 'blue-alfa-repair',
    'bluemustang': 'blue-mustang-repair',
    'blueaccord': 'blue-accord-repair'
  };
  
  // Try to find the directory
  let directory = carDirectories[carIdentifier];
  
  // If no direct match, try partial matches
  if (!directory) {
    const carKeys = Object.keys(carDirectories);
    for (const key of carKeys) {
      if (filename.toLowerCase().includes(key)) {
        directory = carDirectories[key];
        console.log(`[Gallery Service] Found directory through partial match: ${directory}`);
        break;
      }
    }
  }
  
  if (directory) {
    const newPath = `/images/gallery-page/${directory}/${filename}`;
    console.log(`[Gallery Service] Created gallery path: ${newPath}`);
    return newPath;
  }
  
  // If we can't determine the directory but it's an image in the images folder,
  // try to put it in the gallery-page directory
  if (normalizedPath.includes('/images/') && !normalizedPath.includes('/gallery-page/')) {
    const newPath = `/images/gallery-page/${filename}`;
    console.log(`[Gallery Service] Moving image to gallery-page root: ${newPath}`);
    return newPath;
  }
  
  // If all else fails, use the original path
  console.log(`[Gallery Service] Using original path: ${normalizedPath}`);
  return normalizedPath;
}

// Map of old paths to new paths
const pathMappings: Record<string, string> = {
    // Blue Mustang
    'before-bluemustang-side.jpg': 'before-8-bluemustang-side.jpg',
    'Before-bluemustang-side.jpg': 'Before-8-bluemustang-side(2).jpg',
    'after-bluemustang-side.jpg': 'after-8-bluemustang-side.jpg',
    'after-bluemustang-front.jpg': 'After-8-bluemustang-front.jpg',
    
    // Mercedes SL550
    'before-mercedes-front.jpg': 'before-13-mercedessl550repaint-front.jpg',
    'before-mercedes-side.jpg': 'before-13-mercedessl550repaint-side.jpg',
    'after-mercedes-front.jpg': 'After-13-mercedessl550repaint-front.jpg',
    'after-mercedes-side.jpg': 'After-13-mercedessl550repaint-side.jpg',
    'mercedes-sl550.jpg': 'After-13-mercedessl550repaint-front.jpg',
    
    // Red Cadillac
    'before-cadillac-front.jpg': 'before-5-redcadillac-front.jpg',
    'before-cadillac-side.jpg': 'before-5-redcadillac-side.jpg',
    'after-cadillac-front.jpg': 'After-5-redcadillac-front.jpg',
    'after-cadillac-side.jpg': 'After-5-redcadillac-side.jpg',
    
    // Jaguar
    'jaguar.jpg': 'after-14-Jaguarrepaint-front.jpg',
    'before-jaguar-front.jpg': 'before-14-Jaguarrepaint-front.jpg',
    'after-jaguar-front.jpg': 'after-14-Jaguarrepaint-front.jpg',
    
    // Honda Accord
    'honda-accord.jpg': 'After-7-hondaaccord-front.jpg',
    'before-honda-front.jpg': 'before-7-hondaaccord-front.jpg',
    'after-honda-front.jpg': 'After-7-hondaaccord-front.jpg',
    
    // Classic Mustang Rebuild
    'before-mustangrebuild-front.jpg': 'before-12mustangrebuild-front.jpg',
    'before-mustang-side.jpg': 'before-12-mustangrebuild-side.jpg',
    'after-mustangrebuild-front.jpg': 'after-12-mustangrebuild-front.jpg',
    'after-mustang-side.jpg': 'after-12-mustangrebuild-side.jpg',
    
    // BMW E90
    'before-bmw-front.jpg': 'before-4-BmwE90-front.jpg',
    'before-bmw-side.jpg': 'before-4-BmwE90-side.jpg',
    'after-bmw-front.jpg': 'After-4-BmwE90-front.jpg',
    'after-bmw-side.jpg': 'After-4-BmwE90-side(2).jpg',
    
    // Blue Alfa
    'before-alfa-front.jpg': 'before-3-bluealfa-front.jpg',
    'after-alfa-front.jpg': 'after-3-bluealfa-front.jpg',
    
    // Blue Accord
    'before-blueaccord-side.jpg': 'Before-9-blueaccord-side.jpg',
    'after-blueaccord-front.jpg': 'after-9-blueaccord-front.jpg',
    'after-blueaccord-side.jpg': 'after-9-blueaccord-side.jpg',
    
    // Thunderbird
    'before-thunderbird-front.jpg': 'before-1-thunderbird-front.jpg',
    'before-thunderbird-side.jpg': 'before-1-thunderbird-side.jpg',
    'after-thunderbird-front.jpg': 'after-1-thunderbird-front.jpg',
    'after-thunderbird-side.jpg': 'after-1-thunderbird-side.jpg',
    
    // Porsche
    'porsche-detail.jpg': 'After-11-porschedetail-front.jpg',
    'porsche-side.jpg': 'After-11-porschedetail-side.jpg'
}; 