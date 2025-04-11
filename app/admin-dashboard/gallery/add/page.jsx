'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export default function AddGalleryItem() {
  const router = useRouter();
  
  // Predefined categories and tags
  const PREDEFINED_CATEGORIES = [
    'paint',
    'collision',
    'bodywork',
    'restoration',
    'detailing',
    'luxury'
  ];
  
  const PREDEFINED_TAGS = [
    'BMW',
    'Mercedes',
    'Audi',
    'Porsche',
    'Ferrari',
    'Lamborghini',
    'Honda',
    'Toyota',
    'Ford',
    'Chevrolet',
    'Paint',
    'Collision',
    'Bodywork',
    'Restoration',
    'Detailing',
    'European',
    'American',
    'Japanese',
    'Classic',
    'Modern'
  ];
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: PREDEFINED_CATEGORIES[0],
    carDetails: '',
    tags: [],
    selectedTag: PREDEFINED_TAGS[0]
  });
  
  // Image state
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Check authentication
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to home');
      router.push('/');
      return;
    }
    
    console.log('User authenticated, initializing add gallery page');
    
    // Clean up uploaded image URLs when component unmounts
    return () => {
      if (imageFiles.length > 0) {
        console.log('Cleaning up temporary image URLs on unmount');
        imageFiles.forEach(file => {
          if (file.preview) {
            try {
              URL.revokeObjectURL(file.preview);
            } catch (error) {
              console.error('Error revoking object URL:', error);
            }
          }
        });
      }
    };
  }, [imageFiles, router]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };
  
  const handleTagInput = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tagValue = e.target.value.trim();
      if (tagValue && !formData.tags.includes(tagValue)) {
        setFormData(prevData => ({
          ...prevData,
          tags: [...prevData.tags, tagValue],
        }));
        e.target.value = '';
      }
    }
  };
  
  const removeTag = (tagToRemove) => {
    setFormData(prevData => ({
      ...prevData,
      tags: prevData.tags.filter(tag => tag !== tagToRemove),
    }));
  };
  
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    console.log(`Selected ${files.length} images`);
    
    if (files.length === 0) return;
    
    // Clean up existing previews to prevent memory leaks
    imageFiles.forEach(file => {
      if (file.preview) {
        try {
          URL.revokeObjectURL(file.preview);
        } catch (error) {
          console.error('Error revoking object URL:', error);
        }
      }
    });
    
    // Create new file objects with previews
    const newFiles = files.map(file => {
      try {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
      } catch (error) {
        console.error('Error creating object URL:', error);
        return file;
      }
    });
    
    setImageFiles(newFiles);
    setFormData(prev => ({ ...prev, images: newFiles }));
  };
  
  const removeImage = (indexToRemove) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== indexToRemove));
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== indexToRemove));
  };
  
  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setImageUploading(true);
    const imageUrls = [];
    
    try {
      for (const file of imageFiles) {
        const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        imageUrls.push(downloadUrl);
      }
      
      setImageUploading(false);
      return imageUrls;
    } catch (err) {
      console.error('Error uploading images:', err);
      setImageUploading(false);
      throw new Error('Failed to upload images');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate form
      if (!formData.title.trim() || !formData.description.trim()) {
        throw new Error('Please fill in all required fields');
      }
      
      if (imageFiles.length === 0) {
        throw new Error('Please add at least one image');
      }
      
      // Upload images
      const imageUrls = await uploadImages();
      
      // Add document to Firestore
      await addDoc(collection(db, 'gallery'), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        carDetails: formData.carDetails,
        tags: formData.tags,
        imageUrls,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Redirect to gallery management
      router.push('/admin-dashboard/gallery');
    } catch (err) {
      console.error('Error adding gallery item:', err);
      setError(err.message || 'Failed to add gallery item');
      setIsSubmitting(false);
    }
  };
  
  // Handle tag selection from predefined list
  const handleTagSelection = () => {
    if (formData.selectedTag && !formData.tags.includes(formData.selectedTag)) {
      setFormData(prevData => ({
        ...prevData,
        tags: [...prevData.tags, formData.selectedTag],
      }));
    }
  };
  
  // Handle tag selection change
  const handleTagSelectionChange = (e) => {
    setFormData(prevData => ({
      ...prevData,
      selectedTag: e.target.value
    }));
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Add Gallery Item</h1>
        <button
          onClick={() => router.push('/admin-dashboard/gallery')}
          className="text-blue-600 hover:text-blue-800"
        >
          Back to Gallery
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {PREDEFINED_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          {/* Car Details */}
          <div>
            <label htmlFor="carDetails" className="block text-sm font-medium text-gray-700 mb-1">
              Car Details
            </label>
            <input
              type="text"
              id="carDetails"
              name="carDetails"
              value={formData.carDetails}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <select
                value={formData.selectedTag}
                onChange={handleTagSelectionChange}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md rounded-r-none"
              >
                {PREDEFINED_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleTagSelection}
                className="bg-blue-600 text-white px-4 py-2 rounded-md rounded-l-none hover:bg-blue-700 transition-colors"
              >
                Add Tag
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-1">
              Or press Enter after typing to add custom tags
            </p>
            <input
              type="text"
              placeholder="Type and press Enter to add custom tags"
              onKeyDown={handleTagInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mt-2"
            />
          </div>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Images *
            </label>
            
            <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload files</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      multiple
                      className="sr-only" 
                      onChange={handleImageChange}
                      accept="image/*"
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
            
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="relative aspect-square overflow-hidden rounded-md">
                      <Image
                        src={image.url}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || imageUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded disabled:opacity-50"
            >
              {isSubmitting || imageUploading ? 'Saving...' : 'Add Gallery Item'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 