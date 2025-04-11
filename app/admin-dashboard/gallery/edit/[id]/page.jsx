'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGalleryItemById, updateGalleryItem } from '@/utils/galleryService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FaImage, FaSave, FaArrowLeft, FaExclamationTriangle, FaTrash, FaUpload, FaTags, FaSpinner, FaImages, FaArrowsAlt, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import ImageEditor from '@/components/admin/ImageEditor';
import toast, { Toaster } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import ImageDebugger from '@/components/admin/ImageDebugger';
import ImageDisplay from '@/components/admin/ImageDisplay';
import { useForm, Controller } from 'react-hook-form';
import { enhancedNormalizeImagePath } from '@/utils/imagePathUtils';

// Japanese design system colors
const colors = {
  paper: '#F7F3EE', // Warm off-white like washi paper
  ink: '#333333', // Deep charcoal
  accent: '#A0522D', // Rust red like Japanese pottery
  muted: '#8C7A6B', // Muted brown
  success: '#5B8A72', // Matcha green
  error: '#A13D2D', // Vermilion
  border: '#E5DFDA', // Light sand color
  highlight: '#F0E9DF', // Cream highlight
};

// Add a debug helper to identify broken image paths
const debugImagePath = (path, context) => {
  console.log(`[Image Debug] ${context} path: ${path}`);
  
  // Detect if path is valid
  if (!path) {
    console.warn(`[Image Debug] ${context} path is empty or undefined`);
    return;
  }
  
  // Check path format
  if (path.startsWith('http')) {
    console.log(`[Image Debug] ${context} path is absolute URL`);
  } else if (path.startsWith('/')) {
    console.log(`[Image Debug] ${context} path is relative path`);
  } else if (path.startsWith('blob:')) {
    console.log(`[Image Debug] ${context} path is blob URL`);
  } else {
    console.warn(`[Image Debug] ${context} path has unusual format`);
  }
  
  // Check for common image directories
  if (path.includes('/images/')) {
    console.log(`[Image Debug] ${context} path includes /images/ directory`);
  } 
  
  // Try alternative paths that might work
  const alternatives = [
    path.startsWith('/') ? path.substring(1) : `/${path}`,
    path.includes('/images/') ? path : `/images${path.startsWith('/') ? path : `/${path}`}`
  ];
  
  console.log(`[Image Debug] ${context} alternative paths to try:`, alternatives);
};

export default function EditGalleryItemPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [galleryItem, setGalleryItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [firebaseError, setFirebaseError] = useState(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  // Images
  const [mainImage, setMainImage] = useState('');
  const [beforeImages, setBeforeImages] = useState([]);
  const [afterImages, setAfterImages] = useState([]);
  
  // Blur areas for license plates
  const [blurAreas, setBlurAreas] = useState({});
  
  // Active tab
  const [activeTab, setActiveTab] = useState('details');
  
  // Selected image for blur editing
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageEditor, setShowImageEditor] = useState(false);

  // Add a debug toggle state
  const [showDebugger, setShowDebugger] = useState(false);
  const [debugImagePath, setDebugImagePath] = useState("");

  // Add state for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);

  // State to track drag operations
  const [dragSource, setDragSource] = useState(null);
  const [draggingOver, setDraggingOver] = useState(null);

  useEffect(() => {
    async function fetchGalleryItem() {
      setLoading(true);
      try {
        console.log(`[Gallery Edit] Fetching gallery item with ID: ${id}`);
        
        // First try API endpoint with better error handling
        try {
          console.log(`[Gallery Edit] Making API request for gallery item ID: ${id}`);
          const response = await fetch(`/api/gallery?id=${id}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed with status ${response.status}: ${errorText}`);
          }
          
          const item = await response.json();
          
          if (!item || !item.id) {
            throw new Error(`Gallery item with ID ${id} not found in API response`);
          }
          
          console.log('[Gallery Edit] Successfully loaded gallery item from API:', item);
          
          // Normalize image paths
          const normalizeImagePath = (path) => {
            if (!path) {
              console.warn('[Gallery Edit] Empty image path provided');
              return '';
            }
            
            console.log(`[Gallery Edit] Normalizing path: ${path}`);
            
            // Handle blob URLs and data URLs - always return them as is
            if (path.startsWith('blob:') || path.startsWith('data:')) {
              console.log('[Gallery Edit] Using original blob/data URL:', path);
              return path;
            }
            
            // Handle absolute URLs
            if (path.startsWith('http')) {
              // If it's a localhost URL, extract just the path
              if (path.includes('localhost:3000')) {
                const parsedUrl = new URL(path);
                path = parsedUrl.pathname;
                console.log(`[Gallery Edit] Extracted path from localhost URL: ${path}`);
          } else {
                // External URLs should be kept as-is
                console.log('[Gallery Edit] Using original external URL:', path);
                return path;
              }
            }
            
            // Remove any query parameters and hash fragments
            let normalizedPath = path.split('?')[0].split('#')[0];
            
            // Remove domain if present
            normalizedPath = normalizedPath.replace(/^(https?:\/\/[^\/]+)?/, '');
            
            // Ensure path starts with a slash
            if (!normalizedPath.startsWith('/')) {
              normalizedPath = '/' + normalizedPath;
            }
            
            // Check if the path should be in the gallery-page directory
            if (!normalizedPath.includes('/gallery-page/')) {
              const filename = normalizedPath.split('/').pop();
              if (filename) {
                // Try to determine the correct directory based on the filename
                let directory = '';
                
                // Extract the car name from the filename (e.g., "blackjeep" from "before-6-blackjeep-front.jpg")
                const carMatch = filename.match(/(?:before|after)-\d+-([a-z]+)/i);
                if (carMatch && carMatch[1]) {
                  const carName = carMatch[1].toLowerCase();
                  
                  // Map car names to their directories
                  const carDirectories = {
                    'blackjeep': 'black-jeep-repair',
                    'thunderbird': 'thunderbird-restoration',
                    'cadillac': 'red-cadillac-repair',
                    'porsche': 'porsche-detail',
                    'mustang': 'mustang-rebuild',
                    'mercedes': 'mercedes-repaint',
                    'mercedesrepaint': 'mercedes-sl550-repaint',
                    'jaguar': 'jaguar-repaint',
                    'honda': 'honda-accord-repair',
                    'accord': 'honda-accord-repair',
                    'bmw': 'bmw-e90-repair',
                    'alfa': 'blue-alfa-repair',
                    'blueaccord': 'blue-accord-repair'
                  };
                  
                  directory = carDirectories[carName];
                }
                
                if (directory) {
                  normalizedPath = `/images/gallery-page/${directory}/${filename}`;
                  console.log(`[Gallery Edit] Corrected path to gallery-page directory: ${normalizedPath}`);
                } else {
                  console.warn(`[Gallery Edit] Could not determine gallery directory for: ${filename}`);
                }
              }
            }
            
            // Do NOT add localhost prefix for development - this breaks image loading in the admin
            console.log(`[Gallery Edit] Final normalized path: ${normalizedPath}`);
            return normalizedPath;
          };
          
          // Normalize all image paths
            if (item.mainImage) {
            item.mainImage = normalizeImagePath(item.mainImage);
            console.log('[Gallery Edit] Normalized main image:', item.mainImage);
            }
            
            if (Array.isArray(item.beforeImages)) {
            item.beforeImages = item.beforeImages
              .filter(img => img && img.trim() !== '')
              .map(img => normalizeImagePath(img));
            console.log('[Gallery Edit] Normalized before images:', item.beforeImages);
            }
            
            if (Array.isArray(item.afterImages)) {
            item.afterImages = item.afterImages
              .filter(img => img && img.trim() !== '')
              .map(img => normalizeImagePath(img));
            console.log('[Gallery Edit] Normalized after images:', item.afterImages);
          }
          
          setGalleryItem(item);
          setTitle(item.title || '');
          setDescription(item.description || '');
          setCategories(item.categories || []);
          setTags(item.tags || []);
          setMainImage(item.mainImage || '');
          setBeforeImages(item.beforeImages || []);
          setAfterImages(item.afterImages || []);
            setBlurAreas(item.blurAreas || {});
          
        } catch (apiError) {
          console.error('[Gallery Edit] Error fetching from API:', apiError);
          throw apiError;
        }
      } catch (err) {
        console.error('[Gallery Edit] Error fetching gallery item:', err);
        setError(`Failed to fetch gallery item: ${err.message}`);
        // Set default/empty values to prevent undefined errors
        setGalleryItem(null);
        setTitle('');
        setDescription('');
        setCategories([]);
        setTags([]);
        setMainImage('');
        setBeforeImages([]);
        setAfterImages([]);
        setBlurAreas({});
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchGalleryItem();
    }
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    
    console.log(`[Submit] Starting submission for gallery item ${galleryItem.id}`);
    
    // Clone the current gallery item to ensure we use latest state
    const updatedGalleryItem = { ...galleryItem };
    
    // Check if blur areas exist and log details for debugging
    if (updatedGalleryItem.blurAreas) {
      console.log(`[Submit] Gallery item has blur areas with ${Object.keys(updatedGalleryItem.blurAreas).length} keys`);
      if (Object.keys(updatedGalleryItem.blurAreas).length > 0) {
        const firstKey = Object.keys(updatedGalleryItem.blurAreas)[0];
        console.log(`[Submit] First blur area key: ${firstKey}`);
        console.log(`[Submit] Sample blur area:`, updatedGalleryItem.blurAreas[firstKey][0]);
      }
    } else {
      console.log(`[Submit] Gallery item has no blur areas, initializing empty object`);
      updatedGalleryItem.blurAreas = {};
    }
    
      try {
        const response = await fetch('/api/gallery', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        body: JSON.stringify(updatedGalleryItem),
        });
        
        if (!response.ok) {
        const errorData = await response.json();
        console.error('[Submit] Error updating gallery item:', errorData);
        toast.error(`Error: ${errorData.error || 'Failed to update gallery item'}`);
        setSaving(false);
        return;
      }
      
      const result = await response.json();
      console.log(`[Submit] Gallery item updated successfully:`, result);
      
      // Use the returned gallery item if available to ensure we have the latest data
      if (result.galleryItem) {
        console.log(`[Submit] Using returned gallery item from server`);
        if (result.galleryItem.blurAreas) {
          console.log(`[Submit] Server returned blur areas with ${Object.keys(result.galleryItem.blurAreas).length} keys`);
        }
        setGalleryItem(result.galleryItem);
      }
      
      toast.success('Gallery item updated successfully!');
      setSaving(false);
      
      // Navigate back to the gallery page
      router.push('/admin-dashboard/gallery');
    } catch (error) {
      console.error('[Submit] Error updating gallery item:', error);
      toast.error('An error occurred while updating the gallery item');
      setSaving(false);
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value.trim();
    if (value && !categories.includes(value)) {
      setCategories([...categories, value]);
      e.target.value = '';
    }
  };

  const removeCategory = (category) => {
    setCategories(categories.filter(c => c !== category));
  };

  const handleTagChange = (e) => {
    const value = e.target.value.trim();
    if (value && !tags.includes(value)) {
      setTags([...tags, value]);
      e.target.value = '';
    }
  };

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Convert pixel-based blur areas to percentage-based
  const convertPixelToPercentage = (areas, imageRef) => {
    if (!imageRef || !imageRef.current || areas.length === 0) {
      console.error('[Gallery Edit] Cannot convert pixel to percentage: missing image reference or areas');
      return areas;
    }
    
    const imgWidth = imageRef.current.naturalWidth || imageRef.current.width;
    const imgHeight = imageRef.current.naturalHeight || imageRef.current.height;
    
    console.log(`[Gallery Edit] Converting pixel coordinates to percentages. Image size: ${imgWidth}x${imgHeight}px`);
    
    // If we don't have valid dimensions, return the original areas
    if (!imgWidth || !imgHeight) {
      console.error('[Gallery Edit] Invalid image dimensions for conversion');
      return areas;
    }
    
    return areas.map(area => {
      const percentArea = {
        x: (area.x / imgWidth) * 100,
        y: (area.y / imgHeight) * 100,
        width: (area.width / imgWidth) * 100,
        height: (area.height / imgHeight) * 100,
        rotation: area.rotation || 0,
        blurAmount: area.blurAmount || 8
      };
      
      console.log('[Gallery Edit] Converted area:', 
        `Pixels: (${area.x}, ${area.y}, ${area.width}x${area.height})`,
        `Percent: (${percentArea.x.toFixed(2)}%, ${percentArea.y.toFixed(2)}%, ${percentArea.width.toFixed(2)}%x${percentArea.height.toFixed(2)}%)`
      );
      
      return percentArea;
    });
  };

  // Handle clicking on an image to add blur areas
  const handleImageBlur = (imageUrl, source, index = null) => {
    console.log(`[BLUR DEBUG ${Date.now()}] ==== START IMAGE BLUR EDIT ====`);
    console.log(`[BLUR DEBUG] Editing blur for image: ${imageUrl} (source: ${source}, index: ${index !== null ? index : 'main'})`);
    
    // Use enhanced normalize function from imagePathUtils for consistent path handling
    const normalizedImageUrl = enhancedNormalizeImagePath(imageUrl);
    
    console.log(`[BLUR DEBUG] Image path normalization:`, {
      original: imageUrl,
      normalized: normalizedImageUrl
    });
    
    // Find existing blur areas across all possible keys (to address duplicate paths issue)
    let existingBlurAreasForImage = [];
    let sourceKey = null;
    
    if (blurAreas && Object.keys(blurAreas).length > 0) {
      console.log(`[BLUR DEBUG] Checking ${Object.keys(blurAreas).length} possible blur area keys`);
      
      // Check for exact match first
      if (blurAreas[normalizedImageUrl] && Array.isArray(blurAreas[normalizedImageUrl])) {
        console.log(`[BLUR DEBUG] Found exact match with ${blurAreas[normalizedImageUrl].length} areas`);
        existingBlurAreasForImage = blurAreas[normalizedImageUrl];
        sourceKey = normalizedImageUrl;
      } else {
        // Create a map of all normalized paths to their original keys
        const normalizedPaths = {};
        Object.keys(blurAreas).forEach(key => {
          const normalizedKey = enhancedNormalizeImagePath(key);
          normalizedPaths[normalizedKey] = key;
        });
        
        console.log(`[BLUR DEBUG] Normalized path map:`, normalizedPaths);
        
        // Try multiple matching approaches
        const pathsToTry = [
          normalizedImageUrl,
          normalizedImageUrl.replace('/images/', '/'),
          !normalizedImageUrl.startsWith('/images/') ? `/images${normalizedImageUrl}` : normalizedImageUrl
        ];
        
        console.log(`[BLUR DEBUG] Paths to try for matching:`, pathsToTry);
        
        // First try exact matches
        for (const pathToTry of pathsToTry) {
          if (normalizedPaths[pathToTry]) {
            const originalKey = normalizedPaths[pathToTry];
            console.log(`[BLUR DEBUG] Found match: "${pathToTry}" -> "${originalKey}"`);
            
            if (Array.isArray(blurAreas[originalKey]) && blurAreas[originalKey].length > 0) {
              existingBlurAreasForImage = blurAreas[originalKey];
              sourceKey = originalKey;
              break;
            }
          }
        }
        
        // If no exact match, try filename matching
        if (existingBlurAreasForImage.length === 0) {
          const filename = normalizedImageUrl.split('/').pop()?.toLowerCase() || '';
          if (filename) {
            console.log(`[BLUR DEBUG] Trying to match by filename: "${filename}"`);
            
            for (const key of Object.keys(blurAreas)) {
              const keyFilename = key.split('/').pop()?.toLowerCase() || '';
              if (keyFilename === filename && Array.isArray(blurAreas[key]) && blurAreas[key].length > 0) {
                console.log(`[BLUR DEBUG] Found match by filename: "${key}"`);
                existingBlurAreasForImage = blurAreas[key];
                sourceKey = key;
                break;
              }
            }
          }
        }
      }
      
      console.log(`[BLUR DEBUG] Found ${existingBlurAreasForImage.length} total existing blur areas for this image`);
      if (sourceKey) {
        console.log(`[BLUR DEBUG] Areas found under key: "${sourceKey}"`);
      }
    } else {
      console.log(`[BLUR DEBUG] No existing blur areas in state`);
    }
    
    // Set the selected image for the blur editor
    setSelectedImage({
      url: imageUrl,
      normalizedUrl: normalizedImageUrl,
      type: source,
      sourceKey: sourceKey,
      index,
      existingAreas: existingBlurAreasForImage
    });
    
    console.log(`[BLUR DEBUG] Opening image editor with:`, {
      url: imageUrl,
      normalizedPath: normalizedImageUrl,
      type: source,
      sourceKey: sourceKey,
      existingAreasCount: existingBlurAreasForImage.length
    });
    
    setShowImageEditor(true);
    console.log(`[BLUR DEBUG ${Date.now()}] ==== END IMAGE BLUR EDIT SETUP ====`);
  };
  
  // Handle saving blur areas from the ImageEditor
  const handleSaveBlurAreas = (imageUrl, areas) => {
    console.log(`[BLUR DEBUG ${Date.now()}] ==== SAVE BLUR AREAS START ====`);
    
    if (!selectedImage || !selectedImage.url) {
      console.error('[BLUR DEBUG] No selected image when saving blur areas');
      return;
    }
    
    console.log(`[BLUR DEBUG] Saving blur areas for image:`, {
      providedImageUrl: imageUrl,
      selectedImageUrl: selectedImage.url,
      selectedImageType: selectedImage.type,
      selectedImageIndex: selectedImage.index,
      sourceKey: selectedImage.sourceKey,
      areasReceived: Array.isArray(areas) ? areas.length : 'not an array'
    });
    
    // Use the normalized URL from the selectedImage if available
    // This ensures we use the same normalization as during retrieval
    const normalizedImageUrl = selectedImage.normalizedUrl || enhancedNormalizeImagePath(selectedImage.url);
    
    console.log(`[BLUR DEBUG] Path normalization for saving:`, {
      original: selectedImage.url,
      normalized: normalizedImageUrl
    });
    
    // Log incoming blur areas in detail
    if (areas && areas.length > 0) {
      console.log(`[BLUR DEBUG] Received ${areas.length} blur areas:`, 
        areas.map((area, i) => ({
          index: i,
          x: Math.round(area.x),
          y: Math.round(area.y),
          width: Math.round(area.width),
          height: Math.round(area.height),
          rotation: area.rotation || 0,
          hasMetadata: !!area._metadata
        }))
      );
    } else {
      console.log(`[BLUR DEBUG] No blur areas received or empty array`);
    }
    
    // Log existing blur areas state before update
    console.log(`[BLUR DEBUG] Current blur areas state before update:`, {
      keyCount: blurAreas ? Object.keys(blurAreas).length : 0,
      keys: blurAreas ? Object.keys(blurAreas) : [],
      hasKeyForSelectedImage: blurAreas && blurAreas[normalizedImageUrl] ? true : false,
      hasKeyForSourceKey: selectedImage.sourceKey && blurAreas ? blurAreas[selectedImage.sourceKey] !== undefined : false
    });
    
    // Add debug timestamp and metadata to each blur area
    const areasWithTimestamp = areas && Array.isArray(areas) ? areas.map(area => ({
      ...area,
      debug_timestamp: Date.now(),
      _metadata: {
        ...(area._metadata || {}),
        timestamp: Date.now(),
        sourceUrl: selectedImage.url,
        normalizedUrl: normalizedImageUrl,
        sourceType: selectedImage.type
      }
    })) : [];
    
    // Create a new normalized blur areas object
    const updatedBlurAreas = { ...blurAreas };
    
    // If we have blur areas to save
    if (areasWithTimestamp && areasWithTimestamp.length > 0) {
      console.log(`[BLUR DEBUG] Saving ${areasWithTimestamp.length} blur areas for "${normalizedImageUrl}"`);
      
      // If we found a source key during retrieval, consider updating that
      // to maintain consistency across saves
      const keyToUpdate = selectedImage.sourceKey || normalizedImageUrl;
      console.log(`[BLUR DEBUG] Using key for update: "${keyToUpdate}"`);
      
      // Update the blur areas
      updatedBlurAreas[keyToUpdate] = areasWithTimestamp;
      
      // Clean up any duplicate keys by normalizing them
      Object.keys(updatedBlurAreas).forEach(key => {
        if (key === keyToUpdate) return; // Skip the key we just updated
        
        const normKey = enhancedNormalizeImagePath(key);
        // If this is a duplicate of our target key based on normalized path, remove it
        if (normKey === enhancedNormalizeImagePath(keyToUpdate) && key !== keyToUpdate) {
          console.log(`[BLUR DEBUG] Removing duplicate key: "${key}"`);
          delete updatedBlurAreas[key];
        }
      });
    } else {
      // If no areas received, remove the entry
      console.log(`[BLUR DEBUG] No blur areas to save, removing entries`);
      
      // Remove the main key
      if (updatedBlurAreas[normalizedImageUrl]) {
        console.log(`[BLUR DEBUG] Removing entry for "${normalizedImageUrl}"`);
        delete updatedBlurAreas[normalizedImageUrl];
      }
      
      // Remove source key if it exists
      if (selectedImage.sourceKey && updatedBlurAreas[selectedImage.sourceKey]) {
        console.log(`[BLUR DEBUG] Removing entry for source key "${selectedImage.sourceKey}"`);
        delete updatedBlurAreas[selectedImage.sourceKey];
      }
      
      // Also look for similar keys to clean up
      Object.keys(updatedBlurAreas).forEach(key => {
        const normKey = enhancedNormalizeImagePath(key);
        if (normKey === normalizedImageUrl) {
          console.log(`[BLUR DEBUG] Removing similar key: "${key}"`);
          delete updatedBlurAreas[key];
        }
      });
    }
    
    // Update the blur areas state
    setBlurAreas(updatedBlurAreas);
    
    // IMPORTANT: Update the gallery item state too so changes are included in the next save
    setGalleryItem(currentItem => {
      if (!currentItem) return currentItem;
      
      console.log(`[BLUR DEBUG] Updating galleryItem state with blur areas. Keys before:`, 
        Object.keys(currentItem.blurAreas || {}).length);
      
      const newItem = {
        ...currentItem,
        blurAreas: updatedBlurAreas,
        updatedAt: Date.now()
      };
      
      console.log(`[BLUR DEBUG] galleryItem updated. Keys after:`, 
        Object.keys(newItem.blurAreas || {}).length);
      
      return newItem;
    });
    
    // Log final state
    console.log(`[BLUR DEBUG] Final blur areas state has ${Object.keys(updatedBlurAreas).length} entries. Keys:`, 
      Object.keys(updatedBlurAreas));
    
    // Close the blur editor
    setShowImageEditor(false);
    setSelectedImage(null);
    console.log(`[BLUR DEBUG ${Date.now()}] ==== SAVE BLUR AREAS END ====`);
    
    // Show a success message to the user
    toast.success(`Saved ${areasWithTimestamp.length} blur areas`);
  };
  
  // Dropzone for main image
  const onDropMainImage = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      console.log('[Gallery Edit] Adding new main image:', file.name);
      
      // Create a name to match our naming convention
      const newFilename = createConsistentFilename(file.name, 'main');
      console.log('[Gallery Edit] Created consistent filename:', newFilename);
      
      // Create blob URL for preview
      const objectUrl = URL.createObjectURL(file);
      
      // Store both the blob URL for preview and the filename for saving
      setMainImage({
        preview: objectUrl,
        file: file,
        filename: newFilename
      });
      
      toast.success('Main image selected');
    }
  }, []);
  
  const mainImageDropzone = useDropzone({
    onDrop: onDropMainImage,
    accept: {'image/*': []},
    multiple: false
  });

  // Dropzone for before images
  const onDropBeforeImages = useCallback(acceptedFiles => {
    console.log('[Gallery Edit] Adding new before images:', acceptedFiles.length);
    
    const newImages = acceptedFiles.map((file, index) => {
      // Create a name to match our naming convention
      const newFilename = createConsistentFilename(file.name, 'before', beforeImages.length + index + 1);
      console.log('[Gallery Edit] Created consistent filename:', newFilename);
      
      // Create blob URL for preview
      const objectUrl = URL.createObjectURL(file);
      
      return {
        preview: objectUrl,
        file: file,
        filename: newFilename
      };
    });
    
    setBeforeImages(prev => [...prev, ...newImages]);
    toast.success(`${acceptedFiles.length} before image(s) added`);
  }, [beforeImages.length]);
  
  const beforeImagesDropzone = useDropzone({
    onDrop: onDropBeforeImages,
    accept: {'image/*': []},
    multiple: true
  });

  // Dropzone for after images
  const onDropAfterImages = useCallback(acceptedFiles => {
    console.log('[Gallery Edit] Adding new after images:', acceptedFiles.length);
    
    const newImages = acceptedFiles.map((file, index) => {
      // Create a name to match our naming convention
      const newFilename = createConsistentFilename(file.name, 'after', afterImages.length + index + 1);
      console.log('[Gallery Edit] Created consistent filename:', newFilename);
      
      // Create blob URL for preview
      const objectUrl = URL.createObjectURL(file);
      
      return {
        preview: objectUrl,
        file: file,
        filename: newFilename
      };
    });
    
    setAfterImages(prev => [...prev, ...newImages]);
    toast.success(`${acceptedFiles.length} after image(s) added`);
  }, [afterImages.length]);
  
  const afterImagesDropzone = useDropzone({
    onDrop: onDropAfterImages,
    accept: {'image/*': []},
    multiple: true
  });

  // Remove an image from before images
  const removeBeforeImage = (index) => {
    setBeforeImages(beforeImages.filter((_, i) => i !== index));
  };

  // Remove an image from after images
  const removeAfterImage = (index) => {
    setAfterImages(afterImages.filter((_, i) => i !== index));
  };

  // Function to create consistent filenames for gallery images
  const createConsistentFilename = (originalFilename, type, index = 1) => {
    // Extract file extension
    const extension = originalFilename.split('.').pop().toLowerCase();
    
    // Get car name from gallery item ID
    const itemId = id || '';
    const carName = itemId.replace(/-/g, '');
    
    // Generate a new filename based on our convention
    // Format: before-{index}-{carname}-{view}.jpg
    // Example: before-1-blackjeep-front.jpg
    
    // Default to "front" view
    const view = 'front';
    
    return `${type}-${index}-${carName}-${view}.${extension}`;
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up main image if it's a blob URL
      if (mainImage && mainImage.preview) {
        URL.revokeObjectURL(mainImage.preview);
      } else if (typeof mainImage === 'string' && mainImage.startsWith('blob:')) {
        URL.revokeObjectURL(mainImage);
      }
      
      // Clean up before images
      beforeImages.forEach(image => {
        if (image && image.preview) {
          URL.revokeObjectURL(image.preview);
        } else if (typeof image === 'string' && image.startsWith('blob:')) {
          URL.revokeObjectURL(image);
        }
      });
      
      // Clean up after images
      afterImages.forEach(image => {
        if (image && image.preview) {
          URL.revokeObjectURL(image.preview);
        } else if (typeof image === 'string' && image.startsWith('blob:')) {
          URL.revokeObjectURL(image);
        }
      });
    };
  }, [mainImage, beforeImages, afterImages]);

  // Sync blurAreas to galleryItem whenever blurAreas change
  useEffect(() => {
    console.log(`[SYNC] Updating galleryItem with ${Object.keys(blurAreas).length} blur area entries`);
    
    if (galleryItem) {
      setGalleryItem(prevItem => ({
        ...prevItem,
        blurAreas: blurAreas
      }));
      
      console.log(`[SYNC] GalleryItem updated with current blur areas`);
    }
  }, [blurAreas]);

  // Handle setting an image as the main image
  const setImageAsMain = (image) => {
    // If the current main image is not a blob URL, we need to save it
    const oldMainImage = mainImage;
    
    // Set the selected image as the main image
    setMainImage(image);
    
    // If the image was from the before images, remove it from that array
    if (beforeImages.includes(image)) {
      setBeforeImages(beforeImages.filter(img => img !== image));
      toast.success('Before image set as main image');
    } 
    // If the image was from the after images, remove it from that array
    else if (afterImages.includes(image)) {
      setAfterImages(afterImages.filter(img => img !== image));
      toast.success('After image set as main image');
    }
    
    // If there was previously a main image, add it to the after images
    if (oldMainImage && oldMainImage !== image) {
      setAfterImages(prev => [oldMainImage, ...prev]);
    }
  };

  // Handle the start of a drag operation
  const handleDragStart = (e, source, index) => {
    // Set data to identify what's being dragged
    e.dataTransfer.setData('source', source);
    e.dataTransfer.setData('index', index);
    
    // Store the source for styling during drag
    setDragSource({ source, index });
    
    // Set a custom drag image (optional)
    if (e.target.querySelector('img')) {
      e.dataTransfer.setDragImage(e.target.querySelector('img'), 20, 20);
    }
    
    console.log(`[DragDrop] Started dragging ${source} image at index ${index}`);
  };

  // Handle dragging over a drop zone
  const handleDragOver = (e, target) => {
    // Prevent default to allow drop
    e.preventDefault();
    e.stopPropagation();
    
    // Update state to show drop is possible here
    setDraggingOver(target);
    
    // Add drop effect
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop event
  const handleDrop = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get data about what was dragged
    const source = e.dataTransfer.getData('source');
    const index = parseInt(e.dataTransfer.getData('index'), 10);
    
    console.log(`[DragDrop] Dropping from ${source} index ${index} to ${target}`);
    
    if (source === target) {
      console.log(`[DragDrop] Source and target are the same, no action needed`);
      return;
    }
    
    // Handle moving images between collections
    let imageToMove;
    
    // Get the image from the source collection
    if (source === 'main') {
      imageToMove = mainImage;
      // Reset main image if moving it somewhere else
      setMainImage(null);
    } else if (source === 'before') {
      imageToMove = beforeImages[index];
      // Remove from before images
      setBeforeImages(beforeImages.filter((_, i) => i !== index));
    } else if (source === 'after') {
      imageToMove = afterImages[index];
      // Remove from after images
      setAfterImages(afterImages.filter((_, i) => i !== index));
    }
    
    // Add the image to the target collection
    if (target === 'main') {
      // If there was already a main image, move it to after images
      if (mainImage) {
        setAfterImages(prev => [mainImage, ...prev]);
      }
      // Set as new main image
      setMainImage(imageToMove);
      toast.success(`Image set as main image`);
    } else if (target === 'before') {
      setBeforeImages(prev => [...prev, imageToMove]);
      toast.success(`Image added to before images`);
    } else if (target === 'after') {
      setAfterImages(prev => [...prev, imageToMove]);
      toast.success(`Image added to after images`);
    }
    
    // Reset drag states
    setDragSource(null);
    setDraggingOver(null);
  };

  // Handle drag end (cleanup)
  const handleDragEnd = () => {
    setDragSource(null);
    setDraggingOver(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.paper }}>
        <LoadingSpinner size="lg" color={colors.accent} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      {/* Admin Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Edit Gallery Item</h1>
          <p className="text-gray-600">ID: {id}</p>
        </div>
        
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push('/admin-dashboard/gallery')}
            className="px-4 py-2 rounded-sm text-sm"
            style={{ 
              border: `1px solid ${colors.border}`,
              color: colors.ink
            }}
          >
            Back to Gallery
          </button>
          
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-sm text-sm text-white"
            style={{ 
              backgroundColor: colors.accent,
              opacity: saving ? 0.7 : 1
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
      
      {/* Firebase Error Alert */}
      {firebaseError && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0 text-red-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
        </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
              <div className="mt-1 text-sm text-red-700">
                <p>{firebaseError}</p>
                <div className="mt-2 text-xs">
                  <p className="font-semibold">How to fix:</p>
                  <ol className="list-decimal pl-4 mt-1 space-y-1">
                    <li>Ensure you have a .env.local file at the project root</li>
                    <li>Add your Firebase credentials to the .env.local file:
                      <pre className="bg-red-100 p-1 mt-1 rounded text-xs">
                        FIREBASE_PROJECT_ID=your-project-id<br/>
                        FIREBASE_CLIENT_EMAIL=your-service-account-email<br/>
                        FIREBASE_PRIVATE_KEY="your-private-key"
                      </pre>
                    </li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Alert */}
        {error && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded shadow-sm">
            <div className="flex">
            <div className="flex-shrink-0 text-yellow-600">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              </div>
              <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="min-h-screen py-12 px-4 sm:px-6" style={{ backgroundColor: colors.paper }}>
          <div className="max-w-4xl mx-auto">
        <div className="rounded-sm shadow-sm overflow-hidden" style={{ backgroundColor: 'white', borderColor: colors.border }}>
          <div style={{ borderBottom: `1px solid ${colors.border}` }}>
            <nav className="flex">
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-8 inline-block transition-colors duration-200 focus:outline-none`}
                style={{ 
                  borderBottom: activeTab === 'details' ? `2px solid ${colors.accent}` : 'none',
                  color: activeTab === 'details' ? colors.accent : colors.muted,
                  fontWeight: activeTab === 'details' ? '500' : '400',
                }}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`py-4 px-8 inline-block transition-colors duration-200 focus:outline-none`}
                style={{ 
                  borderBottom: activeTab === 'images' ? `2px solid ${colors.accent}` : 'none',
                  color: activeTab === 'images' ? colors.accent : colors.muted,
                  fontWeight: activeTab === 'images' ? '500' : '400',
                }}
              >
                Images
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-8">
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.muted }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2"
                    style={{ 
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.paper,
                      color: colors.ink,
                      fontSize: '16px',
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.muted }}>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 rounded-sm focus:outline-none focus:ring-2"
                    style={{ 
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.paper,
                      color: colors.ink,
                      fontSize: '16px',
                      resize: 'vertical',
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.muted }}>
                    Categories
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {categories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium"
                        style={{ backgroundColor: colors.highlight, color: colors.muted }}
                      >
                        {category}
                        <button
                          type="button"
                          onClick={() => removeCategory(category)}
                          className="ml-2 focus:outline-none"
                          style={{ color: colors.muted }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    className="w-full px-4 py-3 rounded-sm focus:outline-none"
                    style={{ 
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.paper,
                      color: colors.muted,
                      fontSize: '16px',
                    }}
                    onChange={handleCategoryChange}
                  >
                    <option value="">Add category...</option>
                    <option value="restoration">Restoration</option>
                    <option value="collision">Collision Repair</option>
                    <option value="paint">Paint</option>
                    <option value="detailing">Detailing</option>
                    <option value="bodywork">Bodywork</option>
                    <option value="european">European</option>
                    <option value="american">American</option>
                    <option value="asian">Asian</option>
                    <option value="luxury">Luxury</option>
                    <option value="bf">Before/After</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.muted }}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium"
                        style={{ backgroundColor: colors.paper, color: colors.muted }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 focus:outline-none"
                          style={{ color: colors.muted }}
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    className="w-full px-4 py-3 rounded-sm focus:outline-none"
                    style={{ 
                      border: `1px solid ${colors.border}`,
                      backgroundColor: colors.paper,
                      color: colors.ink,
                      fontSize: '16px',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagChange(e);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-12">
                <div className="p-6 bg-white rounded-md shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-medium">Gallery Images</h3>
                    
                    {/* Add debug toggle button */}
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowDebugger(!showDebugger)}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md flex items-center"
                      >
                        {showDebugger ? 'Hide' : 'Show'} Image Debugger
                        <span className={`ml-1 w-2 h-2 rounded-full ${showDebugger ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Debugger section */}
                  {showDebugger && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium mb-2">Image Path Debugger</h4>
                      <div className="flex mb-4 space-x-2">
                        <input
                          type="text"
                          value={debugImagePath}
                          onChange={(e) => setDebugImagePath(e.target.value)}
                          placeholder="Enter image path to debug..."
                          className="flex-1 p-2 border rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => setDebugImagePath(galleryItem.mainImage || "")}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md text-sm"
                        >
                          Use Main Image
                        </button>
                      </div>
                      <ImageDebugger imagePath={debugImagePath} />
                    </div>
                  )}
                  
                  <div>
                        <h2 className="text-xl font-light mb-6" style={{ color: colors.ink }}>
                          Main Image
                          <span className="text-sm font-normal ml-2" style={{ color: colors.muted }}>
                            (Drag any image here to set as main)
                          </span>
                        </h2>
                        <div 
                          className={`relative h-64 w-full rounded-lg overflow-hidden border-2 mb-4 ${draggingOver === 'main' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                          onDragOver={(e) => handleDragOver(e, 'main')}
                          onDrop={(e) => handleDrop(e, 'main')}
                          onDragLeave={() => setDraggingOver(null)}
                        >
                          {mainImage?.preview || mainImage ? (
                            <div 
                              className={`relative w-full h-full ${dragSource?.source === 'main' ? 'opacity-50' : ''}`}
                              draggable
                              onDragStart={(e) => handleDragStart(e, 'main', 0)}
                              onDragEnd={handleDragEnd}
                            >
                      <ImageDisplay
                                src={mainImage?.preview || mainImage}
                                alt={title || 'Main image'}
                                className="w-full h-full"
                                blurAreas={blurAreas}
                                showBlurControls={true}
                                onBlurClick={() => handleImageBlur(mainImage?.preview || mainImage, 'main')}
                              />
                              
                              {/* Add blur button for main image */}
                              <button
                                type="button"
                                onClick={() => handleImageBlur(mainImage?.preview || mainImage, 'main')}
                                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                title="Add/Edit Blur Areas"
                              >
                                <FaEyeSlash />
                              </button>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <p className="text-gray-500 text-center p-4">
                                Drag any image here to set as main image
                              </p>
                            </div>
                          )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div>
                      <h2 className="text-xl font-light mb-6" style={{ color: colors.ink }}>Before Images</h2>
                      <div 
                        className={`border-2 ${draggingOver === 'before' ? 'border-green-500 bg-green-50' : 'border-dashed'} rounded-sm p-6 cursor-pointer mb-8`}
                        style={{ 
                          borderColor: draggingOver === 'before' ? 'rgb(34, 197, 94)' : colors.border,
                          backgroundColor: draggingOver === 'before' ? 'rgba(240, 253, 244, 0.5)' : 'white',
                        }}
                        onDragOver={(e) => handleDragOver(e, 'before')}
                        onDrop={(e) => handleDrop(e, 'before')}
                        onDragLeave={() => setDraggingOver(null)}
                        {...beforeImagesDropzone.getRootProps()}
                      >
                        <input {...beforeImagesDropzone.getInputProps()} />
                        <div className="flex flex-col items-center py-6">
                          <FaUpload 
                            className="h-10 w-10 mb-4" 
                            style={{ color: colors.muted }} 
                          />
                          <p style={{ color: colors.muted }}>
                            Click or drag to upload before images
                          </p>
                        </div>
                      </div>
                      
                      {beforeImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                              {beforeImages.map((image, index) => (
                                <div 
                                  key={`before-${index}`} 
                                  className={`relative group ${dragSource?.source === 'before' && dragSource?.index === index ? 'opacity-50' : ''}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, 'before', index)}
                                  onDragEnd={handleDragEnd}
                              >
                                <ImageDisplay
                                    src={image.preview || image} 
                                    alt={`Before image ${index + 1}`}
                                    className="w-full h-32 rounded-lg"
                                    blurAreas={blurAreas}
                                    showBlurControls={true}
                                    onBlurClick={() => handleImageBlur(image.preview || image, 'before', index)}
                                  />
                                  
                                  {/* Add blur button */}
                                  <div className="absolute top-0 right-0 p-1 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleImageBlur(image.preview || image, 'before', index)}
                                      className="bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-all z-20"
                                      title="Add/Edit Blur Areas"
                                    >
                                      <FaEyeSlash className="w-3 h-3" />
                                    </button>
                                  
                                  <button
                                    type="button"
                                      onClick={() => removeBeforeImage(index)}
                                      className="bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-all z-20"
                                    title="Remove Image"
                                  >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setImageAsMain(image)}
                                      className="bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-all z-20"
                                      title="Set as Main Image"
                                    >
                                      <FaArrowsAlt className="w-3 h-3" />
                                  </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h2 className="text-xl font-light mb-6" style={{ color: colors.ink }}>After Images</h2>
                      <div 
                        className={`border-2 ${draggingOver === 'after' ? 'border-green-500 bg-green-50' : 'border-dashed'} rounded-sm p-6 cursor-pointer mb-8`}
                        style={{ 
                          borderColor: draggingOver === 'after' ? 'rgb(34, 197, 94)' : colors.border,
                          backgroundColor: draggingOver === 'after' ? 'rgba(240, 253, 244, 0.5)' : 'white',
                        }}
                        onDragOver={(e) => handleDragOver(e, 'after')}
                        onDrop={(e) => handleDrop(e, 'after')}
                        onDragLeave={() => setDraggingOver(null)}
                        {...afterImagesDropzone.getRootProps()}
                      >
                        <input {...afterImagesDropzone.getInputProps()} />
                        <div className="flex flex-col items-center py-6">
                          <FaUpload 
                            className="h-10 w-10 mb-4" 
                            style={{ color: colors.muted }} 
                          />
                          <p style={{ color: colors.muted }}>
                            Click or drag to upload after images
                          </p>
                        </div>
                      </div>
                      
                      {afterImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mb-4">
                              {afterImages.map((image, index) => (
                                <div 
                                  key={`after-${index}`} 
                                  className={`relative group ${dragSource?.source === 'after' && dragSource?.index === index ? 'opacity-50' : ''}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, 'after', index)}
                                  onDragEnd={handleDragEnd}
                              >
                                <ImageDisplay
                                    src={image.preview || image} 
                                    alt={`After image ${index + 1}`}
                                    className="w-full h-32 rounded-lg"
                                    blurAreas={blurAreas}
                                    showBlurControls={true}
                                    onBlurClick={() => handleImageBlur(image.preview || image, 'after', index)}
                                  />
                                  
                                  {/* Add blur button */}
                                  <div className="absolute top-0 right-0 p-1 flex gap-1">
                                    <button
                                      type="button"
                                      onClick={() => handleImageBlur(image.preview || image, 'after', index)}
                                      className="bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-all z-20"
                                      title="Add/Edit Blur Areas"
                                    >
                                      <FaEyeSlash className="w-3 h-3" />
                                    </button>
                                  
                                  <button
                                    type="button"
                                      onClick={() => removeAfterImage(index)}
                                      className="bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-all z-20"
                                    title="Remove Image"
                                  >
                                      <FaTrash className="w-3 h-3" />
                                    </button>
                                    
                                    <button
                                      type="button"
                                      onClick={() => setImageAsMain(image)}
                                      className="bg-black bg-opacity-70 text-white p-1.5 rounded-full hover:bg-opacity-90 transition-all z-20"
                                      title="Set as Main Image"
                                    >
                                      <FaArrowsAlt className="w-3 h-3" />
                                  </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {showImageEditor && selectedImage && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center bg-black bg-opacity-75">
              <div className="bg-white rounded-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-auto">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">
                    Add License Plate Blur
              </h2>
              <button
                type="button"
                onClick={() => setShowImageEditor(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
              >
                &times;
              </button>
            </div>
            
                <div className="p-4">
            <ImageEditor
              imageUrl={selectedImage.url}
                  onClose={() => setShowImageEditor(false)}
              onSave={handleSaveBlurAreas}
                  existingBlurAreas={selectedImage.existingAreas || []}
            />
                </div>
          </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 