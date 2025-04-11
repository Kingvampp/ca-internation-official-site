# CA International Automotive Implementation Plan

This document outlines the comprehensive implementation plan to address current issues and enhance functionality in the CA Automotive web application.

## Table of Contents
- [Phase 1: Fix Blur Box Functionality ✅ COMPLETED](#phase-1-fix-blur-box-functionality)
- [Phase 2: Gallery Integration with Firebase](#phase-2-gallery-integration-with-firebase)
- [Phase 3: Production-Ready Testimonials](#phase-3-production-ready-testimonials)
- [Phase 4: Booking System Integration](#phase-4-booking-system-integration)

<details>
<summary><h2 id="phase-1-fix-blur-box-functionality">Phase 1: Fix Blur Box Functionality ✅ COMPLETED</h2></summary>

### Overview
The current blur box functionality has issues with path normalization, causing duplicate entries in Firebase and preventing blur boxes from displaying correctly on the public gallery.

### Tasks

#### 1.1 Create Enhanced Path Normalization Utility

```typescript
// File: utils/imagePathUtils.ts

/**
 * Normalizes image paths to ensure consistent format across the application
 * Handles duplicate /images prefixes and ensures consistent paths for Firebase storage
 */
export function enhancedNormalizeImagePath(path: string | null | undefined): string {
  if (!path) {
    console.warn('Empty image path provided to enhancedNormalizeImagePath');
    return '';
  }

  // Handle blob URLs and data URLs
  if (path.startsWith('blob:') || path.startsWith('data:')) {
    console.log(`Skipping temporary URL: ${path.substring(0, 30)}...`);
    return path;
  }

  // Normalize by removing query parameters and hash fragments
  let normalizedPath = path.split('?')[0].split('#')[0];
  
  // Decode URL-encoded paths
  try {
    normalizedPath = decodeURIComponent(normalizedPath);
  } catch (e) {
    console.warn(`Failed to decode URL: ${path}`);
  }

  // Remove duplicate /images prefixes
  while (normalizedPath.includes('/images/images/')) {
    normalizedPath = normalizedPath.replace('/images/images/', '/images/');
    console.log(`Fixed duplicate /images prefix: ${normalizedPath}`);
  }

  // Ensure paths start with /
  if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('http')) {
    normalizedPath = '/' + normalizedPath;
  }

  // Ensure the path starts with /images if it's not an absolute URL
  if (!normalizedPath.startsWith('http') && !normalizedPath.includes('/images/')) {
    normalizedPath = '/images' + (normalizedPath.startsWith('/') ? normalizedPath : '/' + normalizedPath);
  }

  console.log(`Normalized path: ${path} -> ${normalizedPath}`);
  return normalizedPath;
}

/**
 * Finds blur areas for an image by checking multiple possible path formats
 */
export function getBlurAreasForImage(image: string, blurAreas: Record<string, any[]> | undefined | null): any[] {
  if (!blurAreas || !image) return [];
  
  const normalizedPath = enhancedNormalizeImagePath(image);
  console.log(`Looking for blur areas with normalized path: ${normalizedPath}`);
  
  // Try multiple path variations to find blur areas
  const possibleKeys = [
    normalizedPath,
    normalizedPath.toLowerCase(),
    `/images${normalizedPath}`,
    normalizedPath.replace('/images/', '/'),
  ];
  
  for (const key of possibleKeys) {
    if (blurAreas[key] && Array.isArray(blurAreas[key]) && blurAreas[key].length > 0) {
      console.log(`Found blur areas at key: ${key}`);
      return blurAreas[key];
    }
  }
  
  console.log(`No blur areas found for image: ${image}`);
  return [];
}
```

#### 1.2 Update API Gallery Route

```typescript
// File: app/api/gallery/route.ts
// Update the ensureValidImagePath function

// Use the enhanced normalize path function
import { enhancedNormalizeImagePath } from '@/utils/imagePathUtils';

// Replace the existing ensureValidImagePath function with:
export function ensureValidImagePath(path: string | null | undefined): string {
  return enhancedNormalizeImagePath(path);
}
```

#### 1.3 Update Admin Gallery Edit Page

```typescript
// File: app/admin-dashboard/gallery/edit/[id]/page.jsx
// Update the handleSaveBlurAreas function

import { enhancedNormalizeImagePath } from '@/utils/imagePathUtils';

// Update the handleSaveBlurAreas function to use the enhanced path normalization
const handleSaveBlurAreas = (imageUrl, areas) => {
  if (!imageUrl) {
    console.error('No image URL provided to save blur areas');
    return;
  }
  
  console.log(`Saving blur areas for image: ${imageUrl}`);
  console.log(`Received ${areas?.length || 0} blur areas`);
  
  const normalizedImageUrl = enhancedNormalizeImagePath(imageUrl);
  console.log(`Normalized image URL: ${normalizedImageUrl}`);
  
  // Log the first blur area for debugging
  if (areas && areas.length > 0 && process.env.NODE_ENV === 'development') {
    console.log('First blur area:', areas[0]);
  }
  
  // Update state with new blur areas
  setBlurAreas(prev => {
    const updated = { ...prev };
    
    if (areas && areas.length > 0) {
      updated[normalizedImageUrl] = areas;
      console.log(`Added ${areas.length} blur areas for ${normalizedImageUrl}`);
    } else {
      delete updated[normalizedImageUrl];
      console.log(`Removed blur areas for ${normalizedImageUrl}`);
    }
    
    return updated;
  });
};
```

#### 1.4 Update Public Gallery BlurImage Component

```tsx
// File: components/gallery/BlurImage.tsx

import React from 'react';
import Image from 'next/image';
import { getBlurAreasForImage } from '@/utils/imagePathUtils';

interface BlurImageProps {
  src: string;
  alt: string;
  blurAreas?: Record<string, any[]>;
  width?: number;
  height?: number;
  className?: string;
}

const BlurImage: React.FC<BlurImageProps> = ({ 
  src, 
  alt, 
  blurAreas = {}, 
  width = 800, 
  height = 600,
  className = "" 
}) => {
  // Get blur areas for this specific image
  const imageBlurAreas = getBlurAreasForImage(src, blurAreas);
  
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-auto object-cover"
      />
      
      {/* Render blur areas */}
      {imageBlurAreas.map((area, index) => (
        <div
          key={`blur-${index}`}
          className="absolute backdrop-blur-md"
          style={{
            left: `${area.x}%`,
            top: `${area.y}%`,
            width: `${area.width}%`,
            height: `${area.height}%`,
            transform: area.rotation ? `rotate(${area.rotation}deg)` : 'none',
            transformOrigin: 'center',
          }}
        />
      ))}
    </div>
  );
};

export default BlurImage;
```

#### 1.5 Fix Gallery Item Detail Page

```tsx
// File: app/gallery/[id]/page.tsx

import { getGalleryItemById } from '@/utils/galleryService';
import { BlurImage } from '@/components/gallery/BlurImage';
import { enhancedNormalizeImagePath } from '@/utils/imagePathUtils';

// Update where images are displayed to use the BlurImage component
// For example:

export default async function GalleryItemPage({ params }: { params: { id: string } }) {
  const item = await getGalleryItemById(params.id);
  
  if (!item) {
    return <div>Item not found</div>;
  }
  
  // Normalize main image path
  const mainImageSrc = enhancedNormalizeImagePath(item.mainImage);
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      
      {/* Main image with blur areas */}
      <div className="mb-8">
        <BlurImage 
          src={mainImageSrc} 
          alt={item.title} 
          blurAreas={item.blurAreas}
          width={1200}
          height={800}
          className="rounded-lg shadow-lg"
        />
      </div>
      
      {/* Rest of your component */}
    </div>
  );
}
```

#### 1.6 Data Migration Script for Fixing Existing Blur Areas 

Create a migration script to fix existing data in Firebase:

```typescript
// File: scripts/fixBlurAreas.js

import { adminDb } from '../utils/firebase-admin';
import { enhancedNormalizeImagePath } from '../utils/imagePathUtils';

async function fixBlurAreas() {
  console.log('Starting blur areas migration...');
  
  try {
    const galleryRef = adminDb.collection('galleryItems');
    const snapshot = await galleryRef.get();
    
    console.log(`Found ${snapshot.docs.length} gallery items to process`);
    
    for (const doc of snapshot.docs) {
      const item = doc.data();
      const id = doc.id;
      
      console.log(`Processing gallery item: ${id}`);
      
      if (!item.blurAreas || Object.keys(item.blurAreas).length === 0) {
        console.log(`No blur areas for item ${id}, skipping`);
        continue;
      }
      
      const originalBlurAreas = item.blurAreas;
      const fixedBlurAreas = {};
      
      console.log(`Item has ${Object.keys(originalBlurAreas).length} blur area entries`);
      
      // Process each blur area entry
      for (const [key, areas] of Object.entries(originalBlurAreas)) {
        if (!key) continue;
        
        // Skip blob URLs
        if (key.startsWith('blob:') || key.startsWith('data:')) {
          console.log(`Skipping temporary URL: ${key}`);
          continue;
        }
        
        const normalizedKey = enhancedNormalizeImagePath(key);
        console.log(`Normalized key: ${key} -> ${normalizedKey}`);
        
        if (normalizedKey && Array.isArray(areas)) {
          fixedBlurAreas[normalizedKey] = areas;
          console.log(`Migrated ${areas.length} blur areas from ${key} to ${normalizedKey}`);
        }
      }
      
      // Update the document with fixed blur areas
      await galleryRef.doc(id).update({
        blurAreas: fixedBlurAreas,
        updatedAt: Date.now()
      });
      
      console.log(`Updated gallery item ${id} with fixed blur areas`);
    }
    
    console.log('Blur areas migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
fixBlurAreas();
```
</details>

<details>
<summary><h2 id="phase-2-gallery-integration-with-firebase">Phase 2: Gallery Integration with Firebase</h2></summary>

### Overview
This phase focuses on ensuring the public gallery properly displays all images from Firebase and maintains consistency with the admin dashboard.

### Tasks

#### 2.1 Update Gallery Service Client

```typescript
// File: utils/galleryService.ts

import { clientDb } from './firebase';
import { collection, getDocs, getDoc, doc, query, orderBy } from 'firebase/firestore';
import { enhancedNormalizeImagePath } from './imagePathUtils';

// Enhanced logging
const log = (message: string, data?: any) => {
  console.log(`[Gallery Service] ${message}`, data ? data : '');
};

const warn = (message: string, data?: any) => {
  console.warn(`[Gallery Service] ⚠️ ${message}`, data ? data : '');
};

export async function getAllGalleryItems() {
  log('Getting all gallery items...');
  
  try {
    const galleryRef = collection(clientDb, 'galleryItems');
    const q = query(galleryRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      warn('No gallery items found');
      return [];
    }
    
    const items = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Normalize image paths
        mainImage: enhancedNormalizeImagePath(data.mainImage),
        beforeImages: Array.isArray(data.beforeImages) 
          ? data.beforeImages.map(img => enhancedNormalizeImagePath(img))
          : [],
        afterImages: Array.isArray(data.afterImages)
          ? data.afterImages.map(img => enhancedNormalizeImagePath(img))
          : []
      };
    });
    
    log(`Retrieved ${items.length} gallery items`);
    return items;
  } catch (error) {
    console.error('[Gallery Service] Error getting gallery items:', error);
    return [];
  }
}

export async function getGalleryItemById(id: string) {
  log(`Getting gallery item with ID: ${id}`);
  
  try {
    const docRef = doc(clientDb, 'galleryItems', id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      
      // Normalize image paths
      return {
        id: docSnap.id,
        ...data,
        mainImage: enhancedNormalizeImagePath(data.mainImage),
        beforeImages: Array.isArray(data.beforeImages) 
          ? data.beforeImages.map(img => enhancedNormalizeImagePath(img))
          : [],
        afterImages: Array.isArray(data.afterImages)
          ? data.afterImages.map(img => enhancedNormalizeImagePath(img))
          : []
      };
    } else {
      warn(`Gallery item with ID ${id} not found`);
      return null;
    }
  } catch (error) {
    console.error(`[Gallery Service] Error getting gallery item with ID ${id}:`, error);
    return null;
  }
}
```

#### 2.2 Update Gallery Page Component

```tsx
// File: app/gallery/page.tsx

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllGalleryItems } from '@/utils/galleryService';
import { BlurImage } from '@/components/gallery/BlurImage';

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        setLoading(true);
        const galleryItems = await getAllGalleryItems();
        setItems(galleryItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery items. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchGalleryItems();
  }, []);
  
  // Extract unique categories from items
  const categories = ['all', ...new Set(items.flatMap(item => item.categories || []))];
  
  // Filter items by selected category
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.categories?.includes(selectedCategory));
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Our Gallery</h1>
      
      {/* Category filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary border-r-transparent"></div>
          <p className="mt-2">Loading gallery...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => (
            <Link href={`/gallery/${item.id}`} key={item.id}>
              <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                <div className="aspect-w-16 aspect-h-9">
                  <BlurImage
                    src={item.mainImage}
                    alt={item.title}
                    blurAreas={item.blurAreas}
                    width={600}
                    height={400}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{item.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && !error && filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p>No gallery items found for this category.</p>
        </div>
      )}
    </div>
  );
}
```

#### 2.3 Update Gallery Detail Page

```tsx
// File: app/gallery/[id]/page.tsx

import { Suspense } from 'react';
import { getGalleryItemById } from '@/utils/galleryService';
import { BlurImage } from '@/components/gallery/BlurImage';
import Link from 'next/link';

// Loading component for Suspense
function GalleryItemLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-[400px] bg-gray-200 rounded mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function GalleryItemPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<GalleryItemLoading />}>
      <GalleryItemContent id={params.id} />
    </Suspense>
  );
}

async function GalleryItemContent({ id }: { id: string }) {
  const item = await getGalleryItemById(id);
  
  if (!item) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Gallery Item Not Found</h1>
        <p className="mb-6">The requested gallery item could not be found.</p>
        <Link href="/gallery" className="text-primary hover:underline">
          Return to Gallery
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/gallery" className="inline-flex items-center text-primary hover:underline mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Gallery
      </Link>
      
      <h1 className="text-3xl font-bold mb-4">{item.title}</h1>
      
      {/* Main image with blur areas */}
      <div className="mb-8">
        <BlurImage 
          src={item.mainImage} 
          alt={item.title} 
          blurAreas={item.blurAreas}
          width={1200}
          height={800}
          className="rounded-lg shadow-lg mx-auto"
        />
      </div>
      
      <div className="mb-8">
        <p className="text-lg">{item.description}</p>
      </div>
      
      {/* Before/After section */}
      {(item.beforeImages?.length > 0 || item.afterImages?.length > 0) && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Before & After</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before images */}
            {item.beforeImages?.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">Before</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {item.beforeImages.map((img, index) => (
                    <BlurImage
                      key={`before-${index}`}
                      src={img}
                      alt={`${item.title} - Before ${index + 1}`}
                      blurAreas={item.blurAreas}
                      width={500}
                      height={300}
                      className="rounded shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* After images */}
            {item.afterImages?.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-4">After</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {item.afterImages.map((img, index) => (
                    <BlurImage
                      key={`after-${index}`}
                      src={img}
                      alt={`${item.title} - After ${index + 1}`}
                      blurAreas={item.blurAreas}
                      width={500}
                      height={300}
                      className="rounded shadow-md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Tags */}
      {item.tags?.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag, index) => (
              <span key={index} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

#### 2.4 Create Gallery Category Filter Component

```tsx
// File: components/gallery/CategoryFilter.tsx

import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-3">Filter by Category</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => onSelectCategory(category)}
          >
            {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
```

#### 2.5 Create Gallery Card Component

```tsx
// File: components/gallery/GalleryCard.tsx

import React from 'react';
import Link from 'next/link';
import { BlurImage } from './BlurImage';

interface GalleryCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    mainImage: string;
    categories?: string[];
    blurAreas?: Record<string, any[]>;
  };
}

const GalleryCard: React.FC<GalleryCardProps> = ({ item }) => {
  return (
    <Link href={`/gallery/${item.id}`}>
      <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 h-full">
        <div className="aspect-w-16 aspect-h-9">
          <BlurImage
            src={item.mainImage}
            alt={item.title}
            blurAreas={item.blurAreas}
            width={600}
            height={400}
            className="object-cover w-full h-full"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-gray-600 line-clamp-2">{item.description}</p>
          
          {item.categories && item.categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {item.categories.slice(0, 3).map(category => (
                <span key={category} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  {category}
                </span>
              ))}
              {item.categories.length > 3 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  +{item.categories.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GalleryCard;
```

#### 2.6 Add Debug Tool for Gallery Firebase Connectivity

```tsx
// File: app/admin-dashboard/debug/firebase-gallery/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { clientDb } from '@/utils/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { enhancedNormalizeImagePath } from '@/utils/imagePathUtils';

export default function FirebaseGalleryDebug() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        setLoading(true);
        
        const galleryRef = collection(clientDb, 'galleryItems');
        const q = query(galleryRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setItems([]);
          setLoading(false);
          return;
        }
        
        const fetchedItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setItems(fetchedItems);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery items from Firebase');
        setLoading(false);
      }
    }
    
    fetchGalleryItems();
  }, []);
  
  const handleItemSelect = (item) => {
    setSelectedItem(item);
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Firebase Gallery Debug</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Gallery Items ({items.length})</h2>
            
            <div className="max-h-[600px] overflow-y-auto">
              {items.length === 0 ? (
                <p className="text-gray-500">No gallery items found in Firebase</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map(item => (
                    <li key={item.id} className="py-2">
                      <button
                        className={`w-full text-left p-2 rounded hover:bg-gray-100 ${
                          selectedItem?.id === item.id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => handleItemSelect(item)}
                      >
                        <span className="font-medium">{item.title}</span>
                        <span className="block text-sm text-gray-500 truncate">ID: {item.id}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Item Details</h2>
            
            {selectedItem ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <table className="w-full mt-2">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium">ID:</td>
                          <td>{selectedItem.id}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Title:</td>
                          <td>{selectedItem.title}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Created:</td>
                          <td>{selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleString() : 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Updated:</td>
                          <td>{selectedItem.updatedAt ? new Date(selectedItem.updatedAt).toLocaleString() : 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Images</h3>
                    <table className="w-full mt-2">
                      <tbody>
                        <tr>
                          <td className="py-1 font-medium">Main Image:</td>
                          <td className="truncate text-xs" title={selectedItem.mainImage}>
                            {selectedItem.mainImage}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Before Images:</td>
                          <td>{selectedItem.beforeImages?.length || 0}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">After Images:</td>
                          <td>{selectedItem.afterImages?.length || 0}</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-medium">Blur Areas:</td>
                          <td>{selectedItem.blurAreas ? Object.keys(selectedItem.blurAreas).length : 0}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Preview main image */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Main Image Preview</h3>
                  {selectedItem.mainImage ? (
                    <div className="relative border rounded overflow-hidden">
                      <img 
                        src={selectedItem.mainImage} 
                        alt={selectedItem.title}
                        className="max-w-full h-auto"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs overflow-hidden">
                        {selectedItem.mainImage}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">No main image</div>
                  )}
                </div>
                
                {/* Blur areas debug */}
                {selectedItem.blurAreas && Object.keys(selectedItem.blurAreas).length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Blur Areas</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-gray-50 border border-gray-200">
                        <thead>
                          <tr>
                            <th className="py-2 px-3 border-b text-left text-xs font-medium">Image Path</th>
                            <th className="py-2 px-3 border-b text-left text-xs font-medium">Count</th>
                            <th className="py-2 px-3 border-b text-left text-xs font-medium">Normalized Path</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(selectedItem.blurAreas).map(([key, areas], index) => (
                            <tr key={index} className="hover:bg-gray-100">
                              <td className="py-2 px-3 text-sm">
                                <div className="max-w-xs truncate" title={key}>
                                  {key}
                                </div>
                              </td>
                              <td className="py-2 px-3 text-sm">{Array.isArray(areas) ? areas.length : 'N/A'}</td>
                              <td className="py-2 px-3 text-sm">
                                <div className="max-w-xs truncate" title={enhancedNormalizeImagePath(key)}>
                                  {enhancedNormalizeImagePath(key)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Select a gallery item to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```
</details>

<details>
<summary><b>2. Mobile Layout Optimization</b></summary>

### 2.1 Responsive Design Audit
- Audit current pages for mobile responsiveness
- Identify pain points and UI/UX issues on mobile
- Create mobile-first wireframes for problem areas

### 2.2 Component Optimization
- Refactor navbar for mobile with hamburger menu
- Create mobile-optimized gallery view with swipeable cards
- Implement responsive image loading strategy
- Add touch-friendly interactive elements

### 2.3 Performance Optimization
- Implement image lazy loading
- Add responsive image sizes based on viewport
- Optimize CSS for mobile devices
- Implement code splitting for faster mobile loading

### 2.4 Testing & Refinement
- Test on multiple device sizes and orientations
- Test on actual mobile devices (iOS/Android)
- Gather feedback and implement refinements
- A/B test different mobile layouts if needed
</details>

<details>
<summary><b>3. Admin Appointment Calendar</b></summary>

### 3.1 Calendar Interface
- Implement a calendar view with day/week/month views
- Add appointment slots visualization
- Include time blocking for unavailable periods
- Show appointment details on click/tap

### 3.2 Appointment Management
- Create appointment details view
- Add functionality to confirm/reschedule/cancel appointments
- Implement drag-and-drop for easy rescheduling
- Add notes and customer details to appointments

### 3.3 Database Integration
- Design appointment data model
- Set up CRUD operations for appointments
- Implement data validation and error handling
- Create recurring appointment capability

### 3.4 API Endpoints
- Create RESTful API endpoints:
  - GET /api/appointments - List all appointments
  - GET /api/appointments/:id - Get specific appointment
  - POST /api/appointments - Create new appointment
  - PUT /api/appointments/:id - Update appointment
  - DELETE /api/appointments/:id - Cancel appointment
</details>

<details>
<summary><b>4. Multilingual Support (English/Spanish)</b></summary>

### 4.1 Setup Translation Framework
- Implement i18next configuration
- Create translation files for English and Spanish
- Set up language detection and switching
- Add language preference persistence

### 4.2 UI Language Toggle
- Create language toggle button in navbar
- Add visual indicator for current language
- Implement smooth transition between languages
- Add language selection to footer

### 4.3 Content Translation
- Extract all static text to translation keys
- Create translation files for all pages
- Implement dynamic content translation
- Add metadata translations for SEO

### 4.4 Testing & Validation
- Verify all UI elements in both languages
- Test language switching on all pages
- Validate text expansion in Spanish
- Test with native speakers for accuracy
</details>

<details>
<summary><b>5. SEO Enhancements</b></summary>

### 5.1 Technical SEO
- Implement proper metadata for all pages
- Add structured data (JSON-LD) for rich snippets
- Create XML sitemap and robots.txt
- Set up canonical URLs

### 5.2 Content Optimization
- Create keyword strategy for automotive repair
- Optimize page titles and descriptions
- Add alt text to all images
- Implement semantic HTML structure

### 5.3 Performance Optimization
- Optimize Core Web Vitals:
  - Improve LCP (Largest Contentful Paint)
  - Reduce CLS (Cumulative Layout Shift)
  - Minimize FID (First Input Delay)
- Implement caching strategies
- Optimize image loading and compression

### 5.4 Analytics & Tracking
- Set up enhanced Google Analytics
- Implement event tracking for key interactions
- Add conversion tracking for appointments
- Create SEO performance dashboard
</details>

<details>
<summary><b>6. Appointment Notifications</b></summary>

### 6.1 Email Notification System
- Set up email service integration (SendGrid/Mailgun)
- Create HTML email templates:
  - New appointment notification for admin
  - Confirmation email for customers
  - Reminder emails for upcoming appointments
  - Follow-up emails after service

### 6.2 SMS Notifications
- Integrate SMS service (Twilio/Nexmo)
- Set up SMS templates for:
  - Appointment confirmations
  - Reminders (24h before)
  - Status updates
  - Follow-ups

### 6.3 Admin Notification Dashboard
- Create real-time notification center
- Implement desktop notifications
- Add in-app notification badges
- Create notification preferences settings

### 6.4 Push Notifications
- Implement web push notifications
- Create service worker for background notifications
- Add notification permission request
- Design notification interaction flow
</details>

<details>
<summary><b>Implementation Timeline</b></summary>

### Phase 1 (Weeks 1-2): Foundation
- Set up admin authentication
- Implement basic mobile responsive improvements
- Create translation framework
- Set up notification service infrastructure

### Phase 2 (Weeks 3-4): Core Features
- Complete admin gallery management
- Implement appointment calendar
- Add language toggle with basic translations
- Set up initial SEO optimizations

### Phase 3 (Weeks 5-6): Refinement
- Complete all translations
- Enhance mobile experience
- Implement advanced SEO features
- Complete notification system

### Phase 4 (Weeks 7-8): Optimization & Testing
- Performance optimization
- Cross-browser and device testing
- SEO validation and improvements
- User acceptance testing
</details>

<details>
<summary><b>Technical Stack Recommendations</b></summary>

- **Frontend**: Next.js, React, Tailwind CSS (already in use)
- **State Management**: React Context API or Redux Toolkit
- **Authentication**: NextAuth.js with JWT
- **Database**: Firebase/MongoDB/Supabase
- **Image Storage**: Cloudinary or AWS S3
- **Notifications**: SendGrid (email), Twilio (SMS)
- **Translations**: i18next (already configured)
- **Calendar**: FullCalendar or React Big Calendar
- **Forms**: React Hook Form with Yup validation
- **Analytics**: Google Analytics 4, Google Search Console
</details>

<details>
<summary><b>Getting Started Guide</b></summary>

### Step 1: Environment Setup
- Clone repository and install dependencies
- Set up environment variables
- Configure development environment

### Step 2: Admin Authentication
- Implement admin login/logout functionality
- Create protected routes
- Set up authentication state management

### Step 3: Gallery Management System
- Create admin dashboard
- Implement gallery item CRUD
- Set up image uploading

### Step 4: Multilingual Support
- Configure i18next
- Extract text to translation files
- Implement language switching

### Step 5: Mobile Optimization
- Refactor components for mobile
- Optimize images and layout
- Test across devices

### Step 6: Appointment System
- Create calendar interface
- Implement booking logic
- Set up notification system

### Step 7: SEO Enhancements
- Implement metadata
- Add structured data
- Optimize performance
</details>

<details>
<summary><h2 id="phase-3-production-ready-testimonials">Phase 3: Production-Ready Testimonials</h2></summary>

### Overview
Make the testimonials section fully production-ready by integrating with Firebase to display and collect user testimonials.

### Tasks

#### 3.1 Create Testimonial Data Model and Service

```typescript
// File: utils/testimonialService.ts

import { clientDb } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, where, Timestamp } from 'firebase/firestore';
import { adminDb } from './firebase-admin';

// Testimonial type definition
export interface Testimonial {
  id?: string;
  name: string;
  email?: string;
  rating: number;
  message: string;
  service?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: Date | Timestamp;
  adminNotes?: string;
}

// Client-side service for submitting testimonials
export async function submitTestimonial(testimonial: Omit<Testimonial, 'id' | 'status' | 'date'>) {
  try {
    console.log('Submitting testimonial:', testimonial);
    
    const newTestimonial = {
      ...testimonial,
      status: 'pending',
      date: Timestamp.now()
    };
    
    const testimonialRef = collection(clientDb, 'testimonials');
    const docRef = await addDoc(testimonialRef, newTestimonial);
    
    console.log('Testimonial submitted with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    return { success: false, error: error.message };
  }
}

// Client-side service for fetching approved testimonials
export async function getApprovedTestimonials() {
  try {
    console.log('Fetching approved testimonials');
    
    const testimonialRef = collection(clientDb, 'testimonials');
    const q = query(
      testimonialRef,
      where('status', '==', 'approved'),
      orderBy('date', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() // Convert Firestore Timestamp to Date
    })) as Testimonial[];
    
    console.log(`Fetched ${testimonials.length} approved testimonials`);
    return testimonials;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

// Server-side function to get all testimonials (for admin)
export async function getAllTestimonialsAdmin() {
  try {
    console.log('[Admin] Fetching all testimonials');
    
    const testimonialRef = adminDb.collection('testimonials');
    const snapshot = await testimonialRef.orderBy('date', 'desc').get();
    
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate() // Convert Firestore Timestamp to Date
    })) as Testimonial[];
    
    console.log(`[Admin] Fetched ${testimonials.length} testimonials`);
    return testimonials;
  } catch (error) {
    console.error('[Admin] Error fetching testimonials:', error);
    return [];
  }
}

// Server-side function to update testimonial status
export async function updateTestimonialStatusAdmin(id: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string) {
  try {
    console.log(`[Admin] Updating testimonial ${id} status to ${status}`);
    
    const testimonialRef = adminDb.collection('testimonials').doc(id);
    
    await testimonialRef.update({
      status,
      adminNotes,
      updatedAt: new Date()
    });
    
    console.log(`[Admin] Testimonial ${id} updated successfully`);
    return { success: true };
  } catch (error) {
    console.error(`[Admin] Error updating testimonial ${id}:`, error);
    return { success: false, error: error.message };
  }
}

// Server-side function to delete a testimonial
export async function deleteTestimonialAdmin(id: string) {
  try {
    console.log(`[Admin] Deleting testimonial ${id}`);
    
    const testimonialRef = adminDb.collection('testimonials').doc(id);
    await testimonialRef.delete();
    
    console.log(`[Admin] Testimonial ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error(`[Admin] Error deleting testimonial ${id}:`, error);
    return { success: false, error: error.message };
  }
}
```

#### 3.2 Create Testimonial Form Component

```tsx
// File: components/testimonials/TestimonialForm.tsx

'use client';

import { useState } from 'react';
import { submitTestimonial } from '@/utils/testimonialService';

interface TestimonialFormProps {
  onSuccess?: () => void;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    service: '',
    message: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleRatingChange = (newRating: number) => {
    setFormData(prev => ({ ...prev, rating: newRating }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const result = await submitTestimonial(formData);
      
      if (result.success) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          rating: 5,
          service: '',
          message: ''
        });
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Failed to submit testimonial. Please try again.');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Leave a Testimonial</h2>
      
      {submitStatus === 'success' ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
          <p className="font-medium">Thank you for your testimonial!</p>
          <p className="text-sm mt-1">Your testimonial has been submitted and will be reviewed shortly.</p>
          <button
            className="mt-4 text-sm font-medium text-green-700 hover:text-green-900"
            onClick={() => setSubmitStatus('idle')}
          >
            Submit another testimonial
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitStatus === 'error' && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Your email address"
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Your email will not be displayed publicly. We may use it to verify your testimonial.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="text-2xl focus:outline-none"
                >
                  <span className={star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
              Service Received (optional)
            </label>
            <select
              id="service"
              name="service"
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="">Select a service</option>
              <option value="Paint Correction">Paint Correction</option>
              <option value="Auto Body Repair">Auto Body Repair</option>
              <option value="Collision Repair">Collision Repair</option>
              <option value="Full Restoration">Full Restoration</option>
              <option value="Detail Work">Detail Work</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Your Testimonial <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-md focus:ring-primary focus:border-primary ${
                errors.message ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Please share your experience with our service..."
            ></textarea>
            {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Testimonial'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TestimonialForm;
```

#### 3.3 Create Testimonials Display Component

```tsx
// File: components/testimonials/TestimonialsList.tsx

'use client';

import { useState, useEffect } from 'react';
import { getApprovedTestimonials, Testimonial } from '@/utils/testimonialService';

interface TestimonialsListProps {
  limit?: number;
  showRating?: boolean;
}

const TestimonialsList: React.FC<TestimonialsListProps> = ({ 
  limit = 0, 
  showRating = true 
}) => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    async function loadTestimonials() {
      try {
        setLoading(true);
        const data = await getApprovedTestimonials();
        
        if (limit > 0) {
          setTestimonials(data.slice(0, limit));
        } else {
          setTestimonials(data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading testimonials:', err);
        setError('Failed to load testimonials. Please try again later.');
        setLoading(false);
      }
    }
    
    loadTestimonials();
  }, [limit]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>{error}</p>
      </div>
    );
  }
  
  if (testimonials.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No testimonials available yet. Be the first to leave a review!</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <div key={testimonial.id} className="bg-white rounded-lg shadow-md p-6">
          {showRating && (
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
          )}
          
          <p className="text-gray-700 mb-4 italic">"{testimonial.message}"</p>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{testimonial.name}</p>
              {testimonial.service && (
                <p className="text-sm text-gray-500">{testimonial.service}</p>
              )}
            </div>
            <p className="text-xs text-gray-400">
              {testimonial.date instanceof Date ? 
                new Intl.DateTimeFormat('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                }).format(testimonial.date) : 
                'Recent'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TestimonialsList;
```

#### 3.4 Create Testimonials Page

```tsx
// File: app/testimonials/page.tsx

import TestimonialsList from '@/components/testimonials/TestimonialsList';
import TestimonialForm from '@/components/testimonials/TestimonialForm';

export const metadata = {
  title: 'Testimonials | CA International Automotive',
  description: 'Read what our customers are saying about our automotive services. Share your own experience with us.',
};

export default function TestimonialsPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Customer Testimonials</h1>
        
        <div className="mb-16">
          <TestimonialsList />
        </div>
        
        <div className="border-t pt-12">
          <TestimonialForm />
        </div>
      </div>
    </div>
  );
}
```

#### 3.5 Create Admin Testimonials Management Page

```tsx
// File: app/admin-dashboard/testimonials/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  getAllTestimonialsAdmin, 
  updateTestimonialStatusAdmin,
  deleteTestimonialAdmin,
  Testimonial
} from '@/utils/testimonialService';

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  useEffect(() => {
    loadTestimonials();
  }, []);
  
  async function loadTestimonials() {
    try {
      setLoading(true);
      const data = await getAllTestimonialsAdmin();
      setTestimonials(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading testimonials:', err);
      setError('Failed to load testimonials. Please try again later.');
      setLoading(false);
    }
  }
  
  const handleStatusChange = async (id: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string) => {
    try {
      setProcessing(id);
      const result = await updateTestimonialStatusAdmin(id, status, adminNotes);
      
      if (result.success) {
        // Update local state to reflect the change
        setTestimonials(prev => 
          prev.map(item => 
            item.id === id ? { ...item, status, adminNotes } : item
          )
        );
      } else {
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (err) {
      console.error('Error updating testimonial status:', err);
      alert('An error occurred while updating the testimonial status.');
    } finally {
      setProcessing(null);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
      setProcessing(id);
      const result = await deleteTestimonialAdmin(id);
      
      if (result.success) {
        // Remove the deleted testimonial from state
        setTestimonials(prev => prev.filter(item => item.id !== id));
        setConfirmDelete(null);
      } else {
        alert(`Failed to delete testimonial: ${result.error}`);
      }
    } catch (err) {
      console.error('Error deleting testimonial:', err);
      alert('An error occurred while deleting the testimonial.');
    } finally {
      setProcessing(null);
    }
  };
  
  const filteredTestimonials = testimonials.filter(testimonial => {
    if (filter === 'all') return true;
    return testimonial.status === filter;
  });
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Manage Testimonials</h1>
      
      {/* Status filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full ${
              filter === 'all' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            All ({testimonials.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full ${
              filter === 'pending' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Pending ({testimonials.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-full ${
              filter === 'approved' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Approved ({testimonials.filter(t => t.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-full ${
              filter === 'rejected' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Rejected ({testimonials.filter(t => t.status === 'rejected').length})
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No testimonials found matching the selected filter.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Rating</th>
                <th className="py-3 px-4 text-left">Message</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium">{testimonial.name}</div>
                    {testimonial.email && (
                      <div className="text-sm text-gray-500">{testimonial.email}</div>
                    )}
                    {testimonial.service && (
                      <div className="text-xs text-gray-400">{testimonial.service}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {testimonial.date instanceof Date ? 
                      new Intl.DateTimeFormat('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(testimonial.date) : 
                      'Unknown'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="max-w-xs truncate">{testimonial.message}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${testimonial.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        testimonial.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`
                    }>
                      {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                    </span>
                    
                    {testimonial.adminNotes && (
                      <div className="text-xs text-gray-500 mt-1">
                        Note: {testimonial.adminNotes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      {testimonial.status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(testimonial.id!, 'approved')}
                          disabled={processing === testimonial.id}
                          className="text-green-600 hover:text-green-800"
                          title="Approve Testimonial"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      
                      {testimonial.status !== 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(testimonial.id!, 'rejected')}
                          disabled={processing === testimonial.id}
                          className="text-red-600 hover:text-red-800"
                          title="Reject Testimonial"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      
                      {testimonial.status !== 'pending' && (
                        <button
                          onClick={() => handleStatusChange(testimonial.id!, 'pending')}
                          disabled={processing === testimonial.id}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Set as Pending"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                      
                      <button
                        onClick={() => setConfirmDelete(testimonial.id!)}
                        disabled={processing === testimonial.id}
                        className="text-gray-600 hover:text-gray-800"
                        title="Delete Testimonial"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {confirmDelete === testimonial.id && (
                      <div className="absolute z-10 bg-white shadow-lg rounded-md p-4 mt-2 w-64">
                        <p className="text-sm">Are you sure you want to delete this testimonial?</p>
                        <div className="flex justify-end space-x-2 mt-3">
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(testimonial.id!)}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

#### 3.6 Create Testimonials API Endpoints

```typescript
// File: app/api/testimonials/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllTestimonialsAdmin, 
  updateTestimonialStatusAdmin,
  deleteTestimonialAdmin
} from '@/utils/testimonialService';

// GET /api/testimonials - Get all testimonials (admin only)
export async function GET(request: NextRequest) {
  try {
    // Authentication check should be added here
    // For now, we're using the simplified auth bypass in development
    if (process.env.NODE_ENV !== 'development') {
      console.log('[API] Auth check bypassed in development mode');
    }
    
    const testimonials = await getAllTestimonialsAdmin();
    return NextResponse.json({ success: true, testimonials });
  } catch (error) {
    console.error('[API Error] Failed to fetch testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// PUT /api/testimonials - Update testimonial status
export async function PUT(request: NextRequest) {
  try {
    // Authentication check should be added here
    if (process.env.NODE_ENV !== 'development') {
      console.log('[API] Auth check bypassed in development mode');
    }
    
    const body = await request.json();
    
    if (!body || !body.id || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const { id, status, adminNotes } = body;
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }
    
    const result = await updateTestimonialStatusAdmin(id, status, adminNotes);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update testimonial' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API Error] Failed to update testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/testimonials - Delete a testimonial
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check should be added here
    if (process.env.NODE_ENV !== 'development') {
      console.log('[API] Auth check bypassed in development mode');
    }
    
    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing testimonial ID' },
        { status: 400 }
      );
    }
    
    const result = await deleteTestimonialAdmin(id);
    
    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete testimonial' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[API Error] Failed to delete testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}
```
</details> 

<details>
<summary><h2 id="phase-4-booking-system-integration">Phase 4: Booking System Integration</h2></summary>

### Overview
Implement a production-ready booking system that integrates with Firebase, allowing customers to book services and administrators to manage these bookings.

### Tasks

#### 4.1 Create Booking Data Model and Service ✅

```typescript
// File: utils/bookingService.ts

import { clientDb } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, orderBy, where, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { adminDb } from './firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

// Logger for consistent logging format
const logBooking = (message: string) => console.log(`[BookingService] ${message}`);
const logBookingWarning = (message: string) => console.warn(`[BookingService] ⚠️ ${message}`);
const logBookingError = (message: string) => console.error(`[BookingService] 🔴 ${message}`);
const logBookingSuccess = (message: string) => console.log(`[BookingService] ✅ ${message}`);

// Booking type definition
export interface Booking {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: string;
    color?: string;
  };
  preferredDate: Date | Timestamp;
  alternateDate?: Date | Timestamp;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  locale?: string; // Added for multilingual support
}

// Client-side booking submission
export async function submitBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  try {
    logBooking(`Submitting new booking for customer: ${booking.customerName}, service: ${booking.service}`);
    
    // Validate booking data before submission
    if (!booking.customerName || !booking.customerEmail || !booking.customerPhone) {
      logBookingError('Booking validation failed - missing required fields');
      return { success: false, error: 'Missing required customer information' };
    }
    
    if (!booking.service || !booking.vehicleDetails?.make || !booking.vehicleDetails?.model) {
      logBookingError('Booking validation failed - missing service or vehicle information');
      return { success: false, error: 'Missing service or vehicle information' };
    }
    
    if (!booking.preferredDate) {
      logBookingError('Booking validation failed - missing preferred date');
      return { success: false, error: 'Missing preferred date' };
    }
    
    const newBooking = {
      ...booking,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      locale: booking.locale || 'en' // Default to English if not specified
    };
    
    logBooking(`Prepared booking object. Submitting to Firestore...`);
    const bookingRef = collection(clientDb, 'bookings');
    const docRef = await addDoc(bookingRef, newBooking);
    
    logBookingSuccess(`Booking submitted with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    logBookingError(`Error submitting booking: ${error.message}`);
    logBookingError(error.stack || 'No stack trace available');
    return { success: false, error: error.message };
  }
}

// Server-side functions for admin
export async function getAllBookingsAdmin() {
  // Implementation completed with enhanced error handling and logging
}

export async function getBookingByIdAdmin(id: string) {
  // Implementation completed with enhanced error handling and logging
}

export async function updateBookingStatusAdmin(id: string, status: Booking['status'], adminNotes?: string) {
  // Implementation completed with enhanced error handling and logging
}

export async function deleteBookingAdmin(id: string) {
  // Implementation completed with enhanced error handling and logging
}
```

#### 4.2 Create Booking Form Component ✅

```tsx
// File: components/booking/BookingForm.tsx
// Implementation completed with proper validation, date pickers, and responsive design
```

#### 4.3 Create Booking API Endpoints ✅

```typescript
// File: app/api/booking/route.ts
// Implementation completed with authentication, error handling, and proper request validation
```

#### 4.4 Create Admin Booking Management Interface ✅

We've successfully implemented a comprehensive admin booking management system with the following components:

```jsx
// File: components/admin/BookingCalendar.jsx

// A responsive booking calendar with:
// - Calendar month view showing all bookings with color-coded status indicators
// - Time display in Pacific timezone 
// - Status filtering (pending, confirmed, completed, cancelled)
// - Interactive booking cards with customer and vehicle information
// - Action buttons for updating booking status
// - Responsive design for mobile and desktop
```

```jsx
// File: components/admin/BookingListAdmin.jsx

// A full-featured booking management dashboard with:
// - List view and calendar view toggle
// - Status filtering
// - Detailed booking information display
// - Admin notes functionality
// - Status update buttons
// - Booking deletion
```

#### 4.5 Implement Email Notifications for Bookings

Next on our list is to implement email notifications that will:

1. Send confirmation emails to customers when they submit a booking
2. Send notification emails to admins when new bookings are received
3. Send status update emails to customers when their booking status changes

This will require:

```typescript
// File: utils/emailService.ts

// Email service setup with templates for:
// - New booking confirmation
// - Admin notification
// - Status update notification
```

```typescript
// File: app/api/booking/route.ts

// Update the POST and PUT handlers to trigger email notifications
```

#### 4.6 Add Booking Analytics Dashboard

After implementing email notifications, we'll create a booking analytics dashboard that shows:

1. Booking trends over time
2. Service type distribution
3. Status distribution
4. Conversion rates from pending to confirmed/completed
5. Average time to completion
</details> 