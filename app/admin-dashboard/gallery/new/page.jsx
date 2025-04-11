'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createGalleryItem } from '@/utils/galleryService';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { FaImage, FaSave, FaArrowLeft, FaExclamationTriangle, FaUpload, FaTrash, FaArrowsAlt, FaEyeSlash } from 'react-icons/fa';
import ImageEditor from '@/components/admin/ImageEditor';
import { toast } from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import ImageDisplay from '@/components/admin/ImageDisplay';

export default function NewGalleryItemPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  // Add state for dragging
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImage, setDraggedImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const newItem = {
      title,
      description,
      categories,
      tags,
      mainImage,
      beforeImages,
      afterImages,
      blurAreas,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    try {
      console.log('Creating new gallery item:', newItem);
      
      // Try API endpoint first
      try {
        const response = await fetch('/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newItem),
        });
        
        if (!response.ok) {
          throw new Error(`API create failed with status ${response.status}`);
        }
        
        console.log('Gallery item created successfully via API');
        toast.success('Gallery item created successfully');
        router.push('/admin-dashboard/gallery');
      } catch (apiError) {
        console.error('API create error:', apiError);
        console.log('Falling back to client-side create...');
        
        // Fallback to client-side create
        const result = await createGalleryItem(newItem);
        console.log('Gallery item created successfully via client library');
        toast.success('Gallery item created successfully');
        router.push('/admin-dashboard/gallery');
      }
    } catch (err) {
      console.error('Error creating gallery item:', err);
      setError('Failed to create gallery item: ' + err.message);
      toast.error('Failed to create gallery item: ' + err.message);
      setLoading(false);
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

  const handleImageBlur = (imageUrl, imageType, index) => {
    setSelectedImage({
      url: imageUrl,
      type: imageType,
      index: index
    });
    setShowImageEditor(true);
  };

  // Enhanced normalizeImagePath function with consistent handling
  const normalizeImagePath = (path) => {
    if (!path) return '';
    
    console.log(`[Gallery New] Normalizing image path: ${path}`);
    
    // Remove any query parameters and hash fragments
    let normalizedPath = path.split('?')[0].split('#')[0];
    
    // Ensure the path starts with a slash if it doesn't already
    // But only if it's not an absolute URL or blob URL
    if (!normalizedPath.startsWith('/') && 
        !normalizedPath.startsWith('http') && 
        !normalizedPath.startsWith('blob:') &&
        !normalizedPath.startsWith('data:')) {
      normalizedPath = '/' + normalizedPath;
    }
    
    // Handle potential blob URLs
    if (normalizedPath.startsWith('/blob:')) {
      normalizedPath = normalizedPath.replace('/blob:', 'blob:');
    }
    
    // Make sure image paths are consistent for lookup
    // If the path should be in the /images directory but isn't, add it
    if (!normalizedPath.startsWith('http:') && 
        !normalizedPath.startsWith('https:') && 
        !normalizedPath.startsWith('blob:') && 
        !normalizedPath.startsWith('data:') && 
        !normalizedPath.includes('/images/') && 
        normalizedPath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      
      normalizedPath = `/images${normalizedPath}`;
      console.log(`[Gallery New] Added /images prefix: ${normalizedPath}`);
    }
    
    console.log(`[Gallery New] Normalized path: ${normalizedPath}`);
    return normalizedPath;
  };

  // Enhanced handleSaveBlurAreas function with improved error handling
  const handleSaveBlurAreas = (imageUrl, areas) => {
    if (!imageUrl) {
      console.error('[Gallery New] No image URL provided for saving blur areas');
      return;
    }
    
    const normalizedImageUrl = normalizeImagePath(imageUrl);
    console.log(`[Gallery New] Saving blur areas for image: ${normalizedImageUrl}`);
    console.log(`[Gallery New] Number of blur areas: ${areas.length}`);
    
    // Validate blur areas
    const validAreas = areas.filter(area => 
      typeof area.x === 'number' && 
      typeof area.y === 'number' && 
      typeof area.width === 'number' && 
      typeof area.height === 'number'
    );
    
    if (validAreas.length > 0) {
      console.log(`[Gallery New] First blur area:`, validAreas[0]);
    }
    
    // Create the updated gallery item with blur areas
    setBlurAreas(prev => ({
      ...prev,
      [normalizedImageUrl]: validAreas
    }));
    
    setShowImageEditor(false);
    
    // Log a success message
    console.log(`[Gallery New] Successfully saved ${validAreas.length} blur areas for image: ${normalizedImageUrl}`);
    toast.success(`Saved ${validAreas.length} blur area(s)`);
  };

  // Helper function to get gallery images from public directory
  const getGalleryImages = () => {
    return {
      porsche: {
        main: '/images/gallery-page/porsche-detail/After-11-porschedetail-front.jpg',
        before: [],
        after: [
          '/images/gallery-page/porsche-detail/After-11-porschedetail-side.jpg',
          '/images/gallery-page/porsche-detail/After-11-porschedetail-side(2).jpg',
          '/images/gallery-page/porsche-detail/After-11-porschedetail-front.jpg'
        ]
      },
      thunderbird: {
        main: '/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg',
        before: [
          '/images/gallery-page/thunderbird-restoration/before-1-thunderbird-front.jpg',
          '/images/gallery-page/thunderbird-restoration/before-1-thunderbird-rear.jpg',
          '/images/gallery-page/thunderbird-restoration/before-1-thunderbird-side.jpg'
        ],
        after: [
          '/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg',
          '/images/gallery-page/thunderbird-restoration/After-1-thunderbird-rear.jpg',
          '/images/gallery-page/thunderbird-restoration/after-1-thunderbird-side.jpg'
        ]
      },
      redcadillac: {
        main: '/images/gallery-page/red-cadillac-repair/After-5-redcadillac-front.jpg',
        before: [
          '/images/gallery-page/red-cadillac-repair/before-5-redcadillac-front.jpg',
          '/images/gallery-page/red-cadillac-repair/before-5-redcadillac-side.jpg',
          '/images/gallery-page/red-cadillac-repair/before-5-redcadillac-front(2).jpg'
        ],
        after: [
          '/images/gallery-page/red-cadillac-repair/After-5-redcadillac-front.jpg',
          '/images/gallery-page/red-cadillac-repair/After-5-redcadillac-side.jpg'
        ]
      },
      mustangrebuild: {
        main: '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front.jpg',
        before: [
          '/images/gallery-page/mustang-rebuild/before-12mustangrebuild-front.jpg',
          '/images/gallery-page/mustang-rebuild/before-12-mustangrebuild-side.jpg',
          '/images/gallery-page/mustang-rebuild/before-12-mustangrebuild-side(2).jpg'
        ],
        after: [
          '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front.jpg',
          '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front(3).jpg',
          '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-front(4).jpg',
          '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side.jpg',
          '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side(2).jpg',
          '/images/gallery-page/mustang-rebuild/after-12-mustangrebuild-side(3).jpg'
        ]
      },
      mercedessl550: {
        main: '/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-front.jpg',
        before: [],
        after: [
          '/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-front.jpg',
          '/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-side.jpg',
          '/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-side(2).jpg',
          '/images/gallery-page/mercedes-sl550-repaint/After-13-mercedessl550repaint-rear.jpg'
        ]
      },
      greenmercedes: {
        main: '/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front.jpg',
        before: [
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-front.jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side.jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(2).jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-rear.jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(3).jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(4).jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(5).jpg',
          '/images/gallery-page/green-mercedes-repair/before-2-greenmercedes-side(6).jpg'
        ],
        after: [
          '/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front.jpg',
          '/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-side.jpg',
          '/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front(2).jpg',
          '/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-side(2).jpg',
          '/images/gallery-page/green-mercedes-repair/after-2-greenmercedes-front(3).jpg'
        ]
      },
      jaguar: {
        main: '/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front.jpg',
        before: [
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front.jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(2).jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(3).jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(4).jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-front(5).jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-side.jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-side(2).jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-back.jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-back(2).jpg',
          '/images/gallery-page/jaguar-repaint/before-14-Jaguarrepaint-back(3).jpg'
        ],
        after: [
          '/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front.jpg',
          '/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-side.jpg',
          '/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front(2).jpg',
          '/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-side(2).jpg',
          '/images/gallery-page/jaguar-repaint/after-14-Jaguarrepaint-front(3).jpg'
        ]
      },
      hondaaccord: {
        main: '/images/gallery-page/honda-accord-repair/After-7-hondaaccord-front.jpg',
        before: [
          '/images/gallery-page/honda-accord-repair/before-7-hondaaccord-front.jpg'
        ],
        after: [
          '/images/gallery-page/honda-accord-repair/After-7-hondaaccord-front.jpg'
        ]
      },
      bmwe90: {
        main: '/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg',
        before: [
          '/images/gallery-page/bmw-e90-repair/before-4-BmwE90-front.jpg',
          '/images/gallery-page/bmw-e90-repair/before-4-BmwE90-side.jpg',
          '/images/gallery-page/bmw-e90-repair/before-4-BmwE90-interior.jpg'
        ],
        after: [
          '/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg',
          '/images/gallery-page/bmw-e90-repair/After-4-BmwE90-side(2).jpg',
          '/images/gallery-page/bmw-e90-repair/After-4-BmwE90-interior.jpg',
          '/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front(3).jpg',
          '/images/gallery-page/bmw-e90-repair/After-4-BmwE90-interior(2).jpg'
        ]
      },
      bluemustang: {
        main: '/images/gallery-page/blue-mustang-repair/After-8-bluemustang-front.jpg',
        before: [
          '/images/gallery-page/blue-mustang-repair/before-8-bluemustang-side.jpg',
          '/images/gallery-page/blue-mustang-repair/Before-8-bluemustang-side(2).jpg'
        ],
        after: [
          '/images/gallery-page/blue-mustang-repair/after-8-bluemustang-side.jpg',
          '/images/gallery-page/blue-mustang-repair/After-8-bluemustang-front.jpg'
        ]
      },
      bluealfa: {
        main: '/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg',
        before: [
          '/images/gallery-page/blue-alfa-repair/before-3-bluealfa-front.jpg',
          '/images/gallery-page/blue-alfa-repair/before-3-bluealfa-front(2).jpg'
        ],
        after: [
          '/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg'
        ]
      },
      blueaccord: {
        main: '/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg',
        before: [
          '/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side.jpg',
          '/images/gallery-page/blue-accord-repair/before-9-blueaccord-side(2).jpg',
          '/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side(3).jpg',
          '/images/gallery-page/blue-accord-repair/before-9-blueaccord-side(4).jpg'
        ],
        after: [
          '/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg',
          '/images/gallery-page/blue-accord-repair/after-9-blueaccord-side.jpg',
          '/images/gallery-page/blue-accord-repair/after-9-blueaccord-side(2).jpg',
          '/images/gallery-page/blue-accord-repair/after-9-blueaccord-side(3).jpg'
        ]
      }
    };
  };

  // Helper function to suggest real images
  const suggestRealImages = () => {
    const galleryImages = getGalleryImages();
    const imageOptions = [];
    
    Object.keys(galleryImages).forEach(car => {
      imageOptions.push({
        label: `${car.charAt(0).toUpperCase() + car.slice(1)} Main Image`,
        value: galleryImages[car].main
      });
      
      galleryImages[car].before.forEach((img, idx) => {
        imageOptions.push({
          label: `${car.charAt(0).toUpperCase() + car.slice(1)} Before Image ${idx + 1}`,
          value: img
        });
      });
      
      galleryImages[car].after.forEach((img, idx) => {
        imageOptions.push({
          label: `${car.charAt(0).toUpperCase() + car.slice(1)} After Image ${idx + 1}`,
          value: img
        });
      });
    });
    
    return imageOptions;
  };

  // Handle setting an image as the main image
  const setImageAsMain = (image) => {
    // If the current main image is not empty, add it to the after images
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
    if (oldMainImage && oldMainImage !== image && oldMainImage.trim() !== '') {
      setAfterImages(prev => [oldMainImage, ...prev]);
    }
  };
  
  // Dropzone for main image
  const onDropMainImage = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(file);
      setMainImage(objectUrl);
      toast.success('Main image added');
    }
  }, []);
  
  const mainImageDropzone = useDropzone({
    onDrop: onDropMainImage,
    accept: {'image/*': []},
    multiple: false
  });
  
  // Dropzone for before images
  const onDropBeforeImages = useCallback(acceptedFiles => {
    const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
    setBeforeImages(prev => [...prev, ...newImages]);
    toast.success(`${acceptedFiles.length} before image(s) added`);
  }, []);
  
  const beforeImagesDropzone = useDropzone({
    onDrop: onDropBeforeImages,
    accept: {'image/*': []},
    multiple: true
  });
  
  // Dropzone for after images
  const onDropAfterImages = useCallback(acceptedFiles => {
    const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
    setAfterImages(prev => [...prev, ...newImages]);
    toast.success(`${acceptedFiles.length} after image(s) added`);
  }, []);
  
  const afterImagesDropzone = useDropzone({
    onDrop: onDropAfterImages,
    accept: {'image/*': []},
    multiple: true
  });
  
  // Function to remove a before image
  const removeBeforeImage = (index) => {
    setBeforeImages(beforeImages.filter((_, i) => i !== index));
    toast.success('Before image removed');
  };
  
  // Function to remove an after image
  const removeAfterImage = (index) => {
    setAfterImages(afterImages.filter((_, i) => i !== index));
    toast.success('After image removed');
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up any blob URLs when component unmounts
      if (mainImage && mainImage.startsWith('blob:')) {
        URL.revokeObjectURL(mainImage);
      }
      
      beforeImages.forEach(img => {
        if (img.startsWith('blob:')) {
          URL.revokeObjectURL(img);
        }
      });
      
      afterImages.forEach(img => {
        if (img.startsWith('blob:')) {
          URL.revokeObjectURL(img);
        }
      });
    };
  }, [mainImage, beforeImages, afterImages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => router.push('/admin-dashboard/gallery')}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <FaArrowLeft className="mr-2" />
          Back to Gallery
        </button>
        
        <h1 className="text-2xl font-bold text-center">Add New Gallery Item</h1>
        
        <div></div> {/* Empty div for flex alignment */}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 inline-block focus:outline-none ${
                activeTab === 'details'
                  ? 'border-b-2 border-primary font-medium text-primary'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`py-4 px-6 inline-block focus:outline-none ${
                activeTab === 'images'
                  ? 'border-b-2 border-primary font-medium text-primary'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              Images
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() => removeCategory(category)}
                        className="ml-1.5 text-blue-500 hover:text-blue-700 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Add a tag and press Enter"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleTagChange(e);
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Image URL
                </label>
                <input
                  type="text"
                  value={mainImage}
                  onChange={(e) => setMainImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  required
                />
                
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quick Select Gallery Image
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    onChange={(e) => {
                      if (e.target.value) {
                        setMainImage(e.target.value);
                      }
                    }}
                    value=""
                  >
                    <option value="">Select a gallery image...</option>
                    {suggestRealImages().map((option, idx) => (
                      <option key={idx} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Image Preview 
                    <span className="text-sm font-normal ml-2 text-gray-500">
                      (Drag any image here to set as main)
                    </span>
                  </label>
                  <div 
                    {...mainImageDropzone.getRootProps()} 
                    className={`mt-1 border-2 ${isDragging ? 'border-primary' : 'border-dashed'} rounded-md p-4 h-64 flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors`}
                    style={{ 
                      borderColor: isDragging ? '#3b82f6' : '#d1d5db',
                      backgroundColor: isDragging ? '#f0f9ff' : 'white'
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDragging) setIsDragging(true);
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!isDragging) setIsDragging(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsDragging(false);
                      
                      if (draggedImage) {
                        setImageAsMain(draggedImage);
                        setDraggedImage(null);
                      }
                    }}
                  >
                    <input {...mainImageDropzone.getInputProps()} />
                    {mainImage ? (
                      <div className="relative group w-full h-full flex items-center justify-center">
                        <ImageDisplay
                        src={mainImage}
                        alt="Main"
                          onClick={() => handleImageBlur(mainImage, 'main', 0)}
                          className="max-h-full max-w-full object-contain"
                      />
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageBlur(mainImage, 'main', 0);
                            }}
                            className="p-2 rounded-full hover:bg-opacity-90 transition-colors bg-white shadow-md"
                            title="Add/Edit Blur Areas"
                          >
                            <FaEyeSlash className="text-gray-600" />
                    </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <FaImage className="mx-auto h-12 w-12 text-gray-300" />
                        <p className="mt-1 text-sm text-gray-500">
                          Drag and drop an image here or click to select
                        </p>
                  </div>
                )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Before Images
                </label>
                  <div
                    {...beforeImagesDropzone.getRootProps()}
                    className="mt-1 border-2 border-dashed rounded-md p-4 h-40 flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input {...beforeImagesDropzone.getInputProps()} />
                    <div className="text-center">
                      <FaUpload className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-1 text-sm text-gray-500">
                        Drag and drop before images or click to select
                      </p>
                  </div>
                </div>
                
                {beforeImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {beforeImages.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative group"
                          draggable
                          onDragStart={(e) => {
                            setDraggedImage(image);
                            e.dataTransfer.setData('text/plain', 'beforeImage');
                            // Set a ghost image
                            const ghost = document.createElement('div');
                            ghost.style.width = '100px';
                            ghost.style.height = '100px';
                            ghost.style.background = 'transparent';
                            document.body.appendChild(ghost);
                            e.dataTransfer.setDragImage(ghost, 50, 50);
                            setTimeout(() => document.body.removeChild(ghost), 0);
                          }}
                          onDragEnd={() => {
                            setDraggedImage(null);
                            setIsDragging(false);
                          }}
                        >
                          <div className="relative h-32 border rounded-md overflow-hidden">
                            <ImageDisplay
                              src={image}
                              alt={`Before image ${index + 1}`}
                              onClick={() => handleImageBlur(image, 'before', index)}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeBeforeImage(index);
                                }}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900 mr-2"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageAsMain(image);
                                }}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900 mr-2"
                              >
                                <FaArrowsAlt className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageBlur(image, 'before', index);
                                }}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900"
                              >
                                <FaEyeSlash className="h-4 w-4" />
                        </button>
                            </div>
                          </div>
                          <div className="mt-1 text-center text-xs text-gray-500">
                            Before {index + 1}
                            <span className="block text-xs">Drag to make main</span>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    After Images
                </label>
                  <div
                    {...afterImagesDropzone.getRootProps()}
                    className="mt-1 border-2 border-dashed rounded-md p-4 h-40 flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input {...afterImagesDropzone.getInputProps()} />
                    <div className="text-center">
                      <FaUpload className="mx-auto h-8 w-8 text-gray-300" />
                      <p className="mt-1 text-sm text-gray-500">
                        Drag and drop after images or click to select
                      </p>
                  </div>
                </div>
                
                {afterImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      {afterImages.map((image, index) => (
                        <div 
                          key={index} 
                          className="relative group"
                          draggable
                          onDragStart={(e) => {
                            setDraggedImage(image);
                            e.dataTransfer.setData('text/plain', 'afterImage');
                            // Set a ghost image 
                            const ghost = document.createElement('div');
                            ghost.style.width = '100px';
                            ghost.style.height = '100px';
                            ghost.style.background = 'transparent';
                            document.body.appendChild(ghost);
                            e.dataTransfer.setDragImage(ghost, 50, 50);
                            setTimeout(() => document.body.removeChild(ghost), 0);
                          }}
                          onDragEnd={() => {
                            setDraggedImage(null);
                            setIsDragging(false);
                          }}
                        >
                          <div className="relative h-32 border rounded-md overflow-hidden">
                            <ImageDisplay
                              src={image}
                              alt={`After image ${index + 1}`}
                              onClick={() => handleImageBlur(image, 'after', index)}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAfterImage(index);
                                }}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900 mr-2"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setImageAsMain(image);
                                }}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900 mr-2"
                              >
                                <FaArrowsAlt className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageBlur(image, 'after', index);
                                }}
                                className="p-1 bg-white rounded-full text-gray-700 hover:text-gray-900"
                              >
                                <FaEyeSlash className="h-4 w-4" />
                        </button>
                            </div>
                          </div>
                          <div className="mt-1 text-center text-xs text-gray-500">
                            After {index + 1}
                            <span className="block text-xs">Drag to make main</span>
                          </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Create Gallery Item
                </>
              )}
            </button>
          </div>
        </form>
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
                blurAreas={blurAreas[normalizeImagePath(selectedImage.url)] || []}
              onSave={handleSaveBlurAreas}
            />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 