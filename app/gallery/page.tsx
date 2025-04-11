"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "../../utils/LanguageContext";
import { getAllGalleryItems, normalizeImagePath } from "../../utils/galleryService";
import { GalleryItem } from "../../utils/galleryService";

// Gallery categories based on services offered
const categories = [
  { id: "all", name: "All Projects", nameEs: "Todos los Proyectos" },
  { id: "bf", name: "Before & After", nameEs: "Antes y Después" },
  { id: "collision", name: "Collision Repair", nameEs: "Reparación de Colisión" },
  { id: "paint", name: "Custom Paint", nameEs: "Pintura Personalizada" },
  { id: "restoration", name: "Restoration", nameEs: "Restauración" },
  { id: "detail", name: "Detailing", nameEs: "Detallado" },
  { id: "bodywork", name: "Bodywork", nameEs: "Carrocería" },
];

// Fallback hardcoded gallery items in case API fails
const fallbackGalleryItems = [
  {
    id: "1",
    title: "Thunderbird Classic Restoration",
    titleEs: "Restauración Clásica de Thunderbird",
    categories: ["restoration", "paint", "bf"],
    beforeImages: [
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-rear.jpg",
    ],
    afterImages: [
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-rear.jpg",
    ],
    mainImage: "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
    description: "Complete restoration of a classic Thunderbird, bringing back its original glory with meticulous attention to detail.",
    descriptionEs: "Restauración completa de un Thunderbird clásico, devolviendo su gloria original con meticulosa atención al detalle.",
    tags: ["Classic", "Restoration", "American", "Vintage", "Before/After"],
    tagsEs: ["Clásico", "Restauración", "Americano", "Vintage", "Antes/Después"]
  },
  // Additional fallback items would go here if needed
];

export default function GalleryPage() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<null | string>(null);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [mainImageType, setMainImageType] = useState<"before" | "after">("after");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const { language } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery items from Firestore
  const fetchGalleryItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('[Gallery Page] Fetching gallery items...');
      let items;
      
      try {
        // First try to get items from Firebase
        items = await getAllGalleryItems();
        console.log(`[Gallery Page] Fetched ${items?.length || 0} items from Firebase`);
      } catch (firebaseError) {
        console.error('[Gallery Page] Error fetching from Firebase:', firebaseError);
        items = null;
      }
      
      // If no items from Firebase, use fallback items
      if (!items || items.length === 0) {
        console.log('[Gallery Page] No items from Firebase, using fallback items');
        // Make sure fallbackItems are properly normalized before using them
        items = fallbackGalleryItems.map(item => ({
          ...item,
          mainImage: normalizeGalleryImagePath(item.mainImage),
          beforeImages: item.beforeImages.map(img => normalizeGalleryImagePath(img)),
          afterImages: item.afterImages.map(img => normalizeGalleryImagePath(img))
        }));
        
        if (items.length > 0) {
          console.log('[Gallery Page] First fallback item:', items[0]);
        }
      }
      
      // Final check to ensure we have items
      if (!items || items.length === 0) {
        throw new Error('No gallery items available');
      }
      
      const normalizedItems = items.map(item => ({
        ...item,
        mainImage: normalizeGalleryImagePath(item.mainImage),
        beforeImages: item.beforeImages.map(img => normalizeGalleryImagePath(img)),
        afterImages: item.afterImages.map(img => normalizeGalleryImagePath(img))
      }));
      
      console.log(`[Gallery Page] Normalized ${normalizedItems.length} items`);
      setGalleryItems(normalizedItems);
    } catch (error) {
      console.error('[Gallery Page] Error fetching gallery items:', error);
      setError('Failed to load gallery items. Please try again later.');
      
      // Use fallback items in case of error
      console.log('[Gallery Page] Using fallback items due to error');
      const fallbackItems = fallbackGalleryItems.map(item => ({
        ...item,
        mainImage: normalizeGalleryImagePath(item.mainImage),
        beforeImages: item.beforeImages.map(img => normalizeGalleryImagePath(img)),
        afterImages: item.afterImages.map(img => normalizeGalleryImagePath(img))
      }));
      
      if (fallbackItems.length > 0) {
        console.log('[Gallery Page] First fallback item after error:', fallbackItems[0]);
        setGalleryItems(fallbackItems);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  // Helper function to get text based on language
  const getText = (en: string, es: string) => language === 'es' ? es : en;
  
  // Helper function to get category name based on language
  const getCategoryName = (category: typeof categories[0]) => {
    return language === 'es' ? category.nameEs : category.name;
  };

  // Helper function to get item text based on language
  const getItemText = (item: GalleryItem, field: 'title' | 'description') => {
    if (language === 'es') {
      // First try translationKeys if available
      if (item.translationKeys && field === 'title' && item.translationKeys.title) {
        const translated = useLanguage().t(item.translationKeys.title);
        if (translated && translated !== item.translationKeys.title) {
          return translated;
        }
      }
      
      if (item.translationKeys && field === 'description' && item.translationKeys.description) {
        const translated = useLanguage().t(item.translationKeys.description);
        if (translated && translated !== item.translationKeys.description) {
          return translated;
        }
      }
      
      // Fall back to direct titleEs/descriptionEs if available
      return field === 'title' 
        ? ((item as any).titleEs || item.title) 
        : ((item as any).descriptionEs || item.description);
    }
    return item[field];
  };

  // Helper function to get item tags based on language
  const getItemTags = (item: GalleryItem) => {
    return language === 'es' && (item as any).tagsEs ? (item as any).tagsEs : item.tags;
  };

  // Handle image loading errors
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    try {
      const imagePath = e.currentTarget.src;
      console.error(`[Gallery Page] Image failed to load: ${imagePath}`);
      
      // Extract the image path from the URL
      const urlParts = imagePath.split('/');
      const imageKey = urlParts[urlParts.length - 1]; // Use filename as key
      
    setImageErrors(prev => ({
      ...prev,
        [imageKey]: true
      }));
    } catch (error) {
      console.error('[Gallery Page] Error in handleImageError:', error);
    }
  };

  // Get the normalized path and prepare image props
  const getImageProps = (imagePath: string, altText: string) => {
    const normalizedPath = normalizeGalleryImagePath(imagePath);
    return {
      src: normalizedPath,
      alt: altText,
      onError: handleImageError,
      className: "object-cover",
    };
  };

  // Update the normalizeGalleryImagePath function for better case handling
  const normalizeGalleryImagePath = (path: string): string => {
    if (!path) return '';
    
    console.log(`[Gallery Page] Normalizing image path: ${path}`);
    
    // First try using the normalizeImagePath function from galleryService
    if (normalizeImagePath) {
      try {
        return normalizeImagePath(path);
      } catch (error) {
        console.error('[Gallery Page] Error using normalizeImagePath from service:', error);
        // Fall back to our local implementation if service function fails
      }
    }
    
    // Remove any query parameters and hash fragments
    let normalizedPath = path.split('?')[0].split('#')[0];
    
    // Ensure the path starts with a slash if it doesn't already
    if (!normalizedPath.startsWith('/') && !normalizedPath.startsWith('http')) {
      normalizedPath = '/' + normalizedPath;
      console.log(`[Gallery Page] Added leading slash: ${normalizedPath}`);
    }
    
    // Fix case sensitivity for After/Before in paths
    if (normalizedPath.includes('/After-') || normalizedPath.includes('/AFTER-')) {
      normalizedPath = normalizedPath.replace(/\/After-/ig, '/after-');
      console.log(`[Gallery Page] Fixed 'After-' case in path: ${normalizedPath}`);
    }
    
    if (normalizedPath.includes('/Before-') || normalizedPath.includes('/BEFORE-')) {
      normalizedPath = normalizedPath.replace(/\/Before-/ig, '/before-');
      console.log(`[Gallery Page] Fixed 'Before-' case in path: ${normalizedPath}`);
    }
    
    // Handle filenames that start with After- or Before-
    const parts = normalizedPath.split('/');
    const filename = parts[parts.length - 1];
    
    if (filename.startsWith('After-') || filename.startsWith('AFTER-')) {
      parts[parts.length - 1] = filename.replace(/^After-|^AFTER-/i, 'after-');
      normalizedPath = parts.join('/');
      console.log(`[Gallery Page] Fixed 'After-' in filename: ${normalizedPath}`);
    }
    
    if (filename.startsWith('Before-') || filename.startsWith('BEFORE-')) {
      parts[parts.length - 1] = filename.replace(/^Before-|^BEFORE-/i, 'before-');
      normalizedPath = parts.join('/');
      console.log(`[Gallery Page] Fixed 'Before-' in filename: ${normalizedPath}`);
    }
    
    // Process paths with or without gallery-page directory
    if (normalizedPath.includes('/gallery-page/')) {
      console.log(`[Gallery Page] Path already in gallery-page directory: ${normalizedPath}`);
      return normalizedPath;
    }
    
    // Check if the path should be in the gallery-page directory
    if (normalizedPath.includes('/images/') && 
        !normalizedPath.includes('/gallery-page/') && 
        (normalizedPath.match(/before-|after-/i) || normalizedPath.match(/thunderbird|cadillac|porsche|mercedes|bmw|honda|accord|alfa|mustang|jaguar/i))) {
      // Extract the filename
      const filename = normalizedPath.split('/').pop() || '';
      
      // Try to determine the correct directory based on the filename
      let directory = '';
      
      if (filename.toLowerCase().includes('thunderbird')) {
        directory = 'thunderbird-restoration';
      } else if (filename.toLowerCase().includes('cadillac')) {
        directory = 'red-cadillac-repair';
      } else if (filename.toLowerCase().includes('porsche')) {
        directory = 'porsche-detail';
      } else if (filename.toLowerCase().includes('mustangrebuild') || 
                (filename.toLowerCase().includes('mustang') && !filename.toLowerCase().includes('blue'))) {
        directory = 'mustang-rebuild';
      } else if (filename.toLowerCase().includes('bluemustang')) {
        directory = 'blue-mustang-repair';
      } else if (filename.toLowerCase().includes('mercedessl550') || 
                 filename.toLowerCase().includes('sl550')) {
        directory = 'mercedes-sl550-repaint';
      } else if (filename.toLowerCase().includes('greenmercedes')) {
        directory = 'green-mercedes-repair';
      } else if (filename.toLowerCase().includes('mercedes')) {
        directory = 'mercedes-sl550-repaint';
      } else if (filename.toLowerCase().includes('jaguar')) {
        directory = 'jaguar-repaint';
      } else if (filename.toLowerCase().includes('hondaaccord')) {
        directory = 'honda-accord-repair';
      } else if (filename.toLowerCase().includes('honda') || 
                (filename.toLowerCase().includes('accord') && !filename.toLowerCase().includes('blue'))) {
        directory = 'honda-accord-repair';
      } else if (filename.toLowerCase().includes('bmw')) {
        directory = 'bmw-e90-repair';
      } else if (filename.toLowerCase().includes('bluealfa') || filename.toLowerCase().includes('alfa')) {
        directory = 'blue-alfa-repair';
      } else if (filename.toLowerCase().includes('blueaccord')) {
        directory = 'blue-accord-repair';
      }
      
      if (directory) {
        const newPath = `/images/gallery-page/${directory}/${filename}`;
        console.log(`[Gallery Page] Corrected path to gallery-page directory: ${newPath}`);
        return newPath;
      }
    }
    
    console.log(`[Gallery Page] Final normalized path: ${normalizedPath}`);
    return normalizedPath;
  };

  // Filter gallery items based on active category
  const filteredItems = activeCategory === "all" 
    ? galleryItems 
    : activeCategory === "bf"
      ? galleryItems.filter(item => item.beforeImages && item.beforeImages.length > 0)
      : galleryItems.filter(item => item.categories && item.categories.includes(activeCategory));

  // Function to handle thumbnails click - swap with main image
  const handleThumbnailClick = (index: number, type: "before" | "after") => {
    setMainImageIndex(index);
    setMainImageType(type);
  };

  // Reset main image when selected item changes
  useEffect(() => {
    // Default to first after image when opening modal
    setMainImageIndex(0);
    setMainImageType("after");
  }, [selectedItem]);

  // Get current item data more efficiently
  const currentItem = selectedItem ? galleryItems.find(item => item.id === selectedItem) : null;
  
  // Prepare combined image arrays for the current item
  const allBeforeImages = currentItem?.beforeImages || [];
  const allAfterImages = currentItem?.afterImages || [];
  
  // Get the current main image based on type and index
  const mainImage = mainImageType === "before" 
    ? allBeforeImages[mainImageIndex] || "" 
    : allAfterImages[mainImageIndex] || "";

  // Add this function to debug image loading
  const debugImagePath = (path, context) => {
    console.log(`[Gallery] ${context} path: ${path}`);
    return path;
  };

  // Add this to help debug why images might not be showing
  useEffect(() => {
    console.log('[Gallery] Active category:', activeCategory);
    if (galleryItems.length > 0) {
      console.log(`[Gallery] Loaded ${galleryItems.length} items`);
      console.log('[Gallery] First gallery item:', galleryItems[0]);
      
      // Check status of Firebase initialization
      if (typeof window !== 'undefined') {
        console.log('[Gallery] Window.navigator.onLine:', window.navigator.onLine);
      }
      
      // Display file paths for the first few items to help with debugging
      galleryItems.slice(0, 3).forEach((item, index) => {
        console.log(`[Gallery] Item ${index} (id: ${item.id}):`);
        console.log(`  Main image: ${item.mainImage}`);
        console.log(`  Categories: ${item.categories?.join(', ')}`);
        if (item.beforeImages?.length > 0) {
          console.log(`  Before images: ${item.beforeImages.length}`);
          console.log(`    First: ${item.beforeImages[0]}`);
        }
        if (item.afterImages?.length > 0) {
          console.log(`  After images: ${item.afterImages.length}`);
          console.log(`    First: ${item.afterImages[0]}`);
        }
      });
    } else {
      console.warn('[Gallery] No gallery items available to display');
    }
  }, [galleryItems, activeCategory]);

  if (loading) {
    return (
      <div className="pt-6 pb-20 flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">{getText('Loading gallery...', 'Cargando galería...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 pb-16" ref={ref}>
      {/* Back to Home Button */}
      <div className="container mb-6">
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {getText('Back to Home', 'Volver al Inicio')}
        </a>
      </div>

      {/* Error message if any */}
      {error && (
        <div className="container my-2">
          <div className="bg-yellow-900/50 border-l-4 border-yellow-600 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-300">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gallery Section - Positioned below navbar */}
      <section className="mt-0">
        <div className="container">
          {/* Translatable Project Gallery title */}
          <div className="text-center mb-4">
            <h1 className="text-4xl font-bold text-white">
              {getText('Project Gallery', 'Galería de Proyectos')}
            </h1>
          </div>
          
          {/* Category Filters - Simple style matching production site */}
          <div className="flex flex-wrap justify-center mb-6 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-6 py-3 rounded-full text-base font-semibold transition-colors ${
                  activeCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 hover:bg-gray-100"
                }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="w-full max-w-7xl mx-auto px-4 mb-16">
            {!loading && filteredItems.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/50 rounded-lg shadow-lg border border-gray-700">
                <h3 className="text-2xl font-semibold text-white">
                  {getText('No projects found in this category', 'No se encontraron proyectos en esta categoría')}
                </h3>
                <p className="text-gray-300 mt-2">
                  {getText('Please try another category or check back later.', 'Por favor, intente con otra categoría o vuelva más tarde.')}
                </p>
                {error && <p className="text-red-400 mt-2">{error}</p>}
              </div>
            ) : (
              <div className="gallery-content">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                      layout
                initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      className="rounded-lg overflow-hidden shadow-lg bg-white"
                      onClick={() => setSelectedItem(item.id || "")}
              >
                <div className="relative h-64 overflow-hidden">
                        {/* Image with proper error handling */}
                  <Image
                          src={normalizeGalleryImagePath(item.mainImage)}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          onError={handleImageError}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <h3 className="text-white font-semibold text-lg">{getItemText(item, 'title')}</h3>
                          <p className="text-white/80 text-sm">
                            {item.categories && item.categories.length > 0 
                              ? getCategoryName(categories.find(cat => cat.id === item.categories[0]) || categories[0])
                              : ''}
                          </p>
                  </div>
                </div>
              </motion.div>
            ))}
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal for gallery view */}
      {selectedItem && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            {/* Close button */}
            <button
          onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-10 bg-gray-200 p-2 rounded-full transition-colors hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
                </svg>
              </button>
            
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left column: Main image and thumbnails */}
              <div>
                {/* Main Image - Adjusted container */}
                <div className="relative rounded-lg overflow-hidden mb-4 bg-gray-200">
                  <div className="relative w-full h-0" style={{ paddingBottom: '66.67%' }}>
                    {mainImage ? (
                <Image
                        src={normalizeGalleryImagePath(mainImage)}
                        alt={currentItem ? getItemText(currentItem, 'title') : ''}
                  fill
                  className="object-contain"
                        onError={handleImageError}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-gray-500">{getText('No image available', 'Imagen no disponible')}</span>
                  </div>
                )}
                    {mainImage && imageErrors[mainImage] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                        <span className="text-gray-500">{getText('Image unavailable', 'Imagen no disponible')}</span>
                </div>
                    )}
              </div>
            </div>

                {/* Before/After label */}
                {mainImage && !imageErrors[mainImage] && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 text-white text-sm font-semibold rounded-full shadow-md ${
                      mainImageType === "before" ? "bg-gray-700" : "bg-primary"
                    }`}>
                      {mainImageType === "before" ? getText('Before', 'Antes') : getText('After', 'Después')}
                  </span>
                </div>
              )}
              
                {/* Thumbnails */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Before Images */}
                  {allBeforeImages && allBeforeImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">{getText('Before', 'Antes')}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {allBeforeImages.map((img, idx) => (
                          <div 
                            key={`before-${idx}`}
                            className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                              mainImageType === "before" && mainImageIndex === idx ? "border-primary" : "border-transparent"
                            }`}
                            onClick={() => handleThumbnailClick(idx, "before")}
                    >
                      <Image
                              src={normalizeGalleryImagePath(img)}
                              alt={`Before ${idx + 1}`}
                        fill
                        className="object-cover"
                              onError={handleImageError}
                      />
                            {imageErrors[img.split('/').pop() || ''] && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <span className="text-gray-500 text-xs">N/A</span>
                        </div>
                      )}
                          </div>
                        ))}
                      </div>
                </div>
              )}
              
                  {/* After Images */}
                  {allAfterImages && allAfterImages.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 mb-2">{getText('After', 'Después')}</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {allAfterImages.map((img, idx) => (
                          <div 
                            key={`after-${idx}`}
                            className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                              mainImageType === "after" && mainImageIndex === idx ? "border-primary" : "border-transparent"
                            }`}
                            onClick={() => handleThumbnailClick(idx, "after")}
                  >
                    <Image
                              src={normalizeGalleryImagePath(img)}
                              alt={`After ${idx + 1}`}
                      fill
                      className="object-cover"
                              onError={handleImageError}
                    />
                            {imageErrors[img.split('/').pop() || ''] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                                <span className="text-gray-500 text-xs">N/A</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  </div>
              </div>
              
              {/* Right column: Details */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {currentItem ? getItemText(currentItem, 'title') : ''}
                </h2>
                
                {/* Categories */}
                {currentItem && currentItem.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentItem.categories.map(cat => (
                      <span
                        key={cat}
                        className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full"
                      >
                        {getCategoryName(categories.find(c => c.id === cat) || categories[0])}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="prose max-w-none mb-6">
                  <p className="text-gray-700">
                    {currentItem ? getItemText(currentItem, 'description') : ''}
                  </p>
            </div>
            
                {/* Tags */}
                {currentItem && currentItem.tags && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 mb-2">{getText('Tags', 'Etiquetas')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {getItemTags(currentItem)?.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                        >
                    {tag}
                  </span>
                ))}
              </div>
                </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 