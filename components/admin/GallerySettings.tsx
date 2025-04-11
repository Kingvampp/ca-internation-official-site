'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../utils/LanguageContext';
import BlurPositionEditor from './BlurPositionEditor';
import { BlurZone } from '../BlurredLicensePlateImage';

interface ImageBlurZones {
  [imageUrl: string]: BlurZone[];
}

export default function GallerySettings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    blurLicensePlates: true,
    blurIntensity: 10,
    imageBlurZones: {} as ImageBlurZones,
    watermarkImages: false,
    watermarkOpacity: 50,
    watermarkText: 'CA Automotive',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  
  // Image editor state
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('gallerySettings');
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings(prev => ({
            ...prev,
            ...parsed,
            // Ensure imageBlurZones is an object even if not present in saved settings
            imageBlurZones: parsed.imageBlurZones || {}
          }));
        } catch (error) {
          console.error('Failed to parse gallery settings:', error);
        }
      }
    };
    
    loadSettings();
    loadGalleryImages();
  }, []);

  // Load gallery images
  const loadGalleryImages = async () => {
    setIsLoadingImages(true);
    try {
      const response = await fetch('/api/gallery');
      if (response.ok) {
        const data = await response.json();
        
        // Extract all image URLs from gallery items
        const imageUrls: string[] = [];
        
        data.items.forEach((item: any) => {
          if (item.mainImage) {
            imageUrls.push(item.mainImage);
          }
          
          if (item.beforeImages) {
            imageUrls.push(...item.beforeImages);
          }
          
          if (item.afterImages) {
            imageUrls.push(...item.afterImages);
          }
        });
        
        // Remove duplicates
        const uniqueImageUrls = Array.from(new Set(imageUrls));
        setGalleryImages(uniqueImageUrls);
        
        // Select the first image if none is selected
        if (!selectedImage && uniqueImageUrls.length > 0) {
          setSelectedImage(uniqueImageUrls[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load gallery images:', error);
    } finally {
      setIsLoadingImages(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle blur zone save for a specific image
  const handleSaveBlurZones = (imageUrl: string, zones: BlurZone[]) => {
    setSettings(prev => ({
      ...prev,
      imageBlurZones: {
        ...prev.imageBlurZones,
        [imageUrl]: zones
      }
    }));
    
    setSaveMessage('Blur zones saved for this image. Click "Save Settings" to apply.');
    setTimeout(() => {
      setSaveMessage('');
    }, 3000);
  };

  // Save settings
  const saveSettings = async () => {
    setIsSaving(true);
    setSaveMessage('');
    setSaveError('');
    
    try {
      // Save to localStorage
      localStorage.setItem('gallerySettings', JSON.stringify(settings));
      
      // Set to window global for immediate use
      (window as any).gallerySettings = settings;
      
      // Dispatch a custom event to notify components of the change
      const event = new CustomEvent('gallerySettingsUpdated', { 
        detail: settings 
      });
      window.dispatchEvent(event);
      
      // Show success message
      setSaveMessage('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">{t('admin.gallery.privacy.settings')}</h2>
      
      {/* License Plate Blur Settings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{t('admin.license.plate.privacy')}</h3>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="blurLicensePlates"
              name="blurLicensePlates"
              checked={settings.blurLicensePlates}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 rounded"
            />
            <label htmlFor="blurLicensePlates" className="ml-2 text-gray-700">
              {t('admin.blur.license.plates')}
            </label>
          </div>
          <p className="text-sm text-gray-500 ml-7">
            {t('admin.blur.license.plates.help')}
          </p>
        </div>
        
        {settings.blurLicensePlates && (
          <>
            <div className="mb-4 ml-7">
              <label htmlFor="blurIntensity" className="block text-gray-700 mb-1">
                {t('admin.blur.intensity')}
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="blurIntensity"
                  name="blurIntensity"
                  min="1"
                  max="20"
                  value={settings.blurIntensity}
                  onChange={handleInputChange}
                  className="w-1/2 mr-4"
                />
                <span className="text-gray-700">{settings.blurIntensity}px</span>
              </div>
            </div>
            
            {/* Image Blur Zone Editor */}
            <div className="mt-8 border-t pt-6">
              <h4 className="text-lg font-semibold mb-4">{t('admin.edit.blur.zones')}</h4>
              
              {isLoadingImages ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('admin.loading.gallery.images')}</p>
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
                  <p className="text-yellow-700">{t('admin.no.gallery.images')}</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label htmlFor="selectImage" className="block text-gray-700 mb-2">
                      {t('admin.select.image.to.edit')}
                    </label>
                    <select
                      id="selectImage"
                      value={selectedImage || ''}
                      onChange={(e) => setSelectedImage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      {galleryImages.map((url, index) => (
                        <option key={`image-${index}`} value={url}>
                          {url.split('/').pop() || `Image ${index + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedImage && (
                    <BlurPositionEditor
                      imageUrl={selectedImage}
                      initialBlurZones={settings.imageBlurZones[selectedImage] || []}
                      blurIntensity={settings.blurIntensity}
                      onSave={(zones) => handleSaveBlurZones(selectedImage, zones)}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Watermark Settings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">{t('admin.watermark.settings')}</h3>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              id="watermarkImages"
              name="watermarkImages"
              checked={settings.watermarkImages}
              onChange={handleInputChange}
              className="h-5 w-5 text-blue-600 rounded"
            />
            <label htmlFor="watermarkImages" className="ml-2 text-gray-700">
              {t('admin.add.watermark')}
            </label>
          </div>
          <p className="text-sm text-gray-500 ml-7">
            {t('admin.watermark.help')}
          </p>
        </div>
        
        {settings.watermarkImages && (
          <>
            <div className="mb-4 ml-7">
              <label htmlFor="watermarkText" className="block text-gray-700 mb-1">
                {t('admin.watermark.text')}
              </label>
              <input
                type="text"
                id="watermarkText"
                name="watermarkText"
                value={settings.watermarkText}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CA Automotive"
              />
            </div>
            
            <div className="mb-4 ml-7">
              <label htmlFor="watermarkOpacity" className="block text-gray-700 mb-1">
                {t('admin.watermark.opacity')}
              </label>
              <div className="flex items-center">
                <input
                  type="range"
                  id="watermarkOpacity"
                  name="watermarkOpacity"
                  min="10"
                  max="100"
                  value={settings.watermarkOpacity}
                  onChange={handleInputChange}
                  className="w-1/2 mr-4"
                />
                <span className="text-gray-700">{settings.watermarkOpacity}%</span>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Save Button */}
      <div className="flex items-center">
        <button
          onClick={saveSettings}
          disabled={isSaving}
          className={`px-4 py-2 rounded-md ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isSaving ? t('admin.saving') : t('admin.save.settings')}
        </button>
        
        {saveMessage && (
          <span className="ml-4 text-green-600">{saveMessage}</span>
        )}
        
        {saveError && (
          <span className="ml-4 text-red-600">{saveError}</span>
        )}
      </div>
    </div>
  );
} 