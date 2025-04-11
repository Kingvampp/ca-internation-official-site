"use client";

import React, { useState, useRef, useEffect } from 'react';
import { BlurZone } from '../BlurredLicensePlateImage';
import Image from 'next/image';
import { useLanguage } from '../../utils/LanguageContext';

interface BlurPositionEditorProps {
  imageUrl: string;
  initialBlurZones?: BlurZone[];
  onSave: (zones: BlurZone[]) => void;
  blurIntensity: number;
}

export default function BlurPositionEditor({
  imageUrl,
  initialBlurZones = [],
  onSave,
  blurIntensity
}: BlurPositionEditorProps) {
  const { t } = useLanguage();
  const [blurZones, setBlurZones] = useState<BlurZone[]>(initialBlurZones);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Track image dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (imageContainerRef.current) {
        setImageDimensions({
          width: imageContainerRef.current.offsetWidth,
          height: imageContainerRef.current.offsetHeight
        });
      }
    };
    
    // Initial update
    updateDimensions();
    
    // Update on window resize
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);
  
  // Add a new blur zone at the center of the image
  const addBlurZone = () => {
    const newZone: BlurZone = {
      x: 50,
      y: 50,
      width: 20,
      height: 10
    };
    
    setBlurZones([...blurZones, newZone]);
    setSelectedZoneIndex(blurZones.length);
  };
  
  // Remove the selected blur zone
  const removeSelectedZone = () => {
    if (selectedZoneIndex !== null) {
      const newZones = blurZones.filter((_, index) => index !== selectedZoneIndex);
      setBlurZones(newZones);
      setSelectedZoneIndex(null);
    }
  };
  
  // Save the current blur zones
  const saveBlurZones = () => {
    onSave(blurZones);
  };
  
  // Handle mouse down on a blur zone
  const handleZoneMouseDown = (index: number, e: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const container = imageContainerRef.current;
    if (!container) return;
    
    setSelectedZoneIndex(index);
    
    // Check if this is a resize action (from the corner handle)
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    
    // Record starting point
    const rect = container.getBoundingClientRect();
    setStartPoint({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  // Handle mouse move (for dragging or resizing zones)
  const handleMouseMove = (e: any) => {
    if (selectedZoneIndex === null || (!isDragging && !isResizing)) return;
    
    const container = imageContainerRef.current;
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const deltaX = mouseX - startPoint.x;
    const deltaY = mouseY - startPoint.y;
    
    // Clone the current zones array
    const newZones = [...blurZones];
    const zone = { ...newZones[selectedZoneIndex] };
    
    if (isDragging) {
      // Update position (convert pixel changes to percentage)
      zone.x += (deltaX / imageDimensions.width) * 100;
      zone.y += (deltaY / imageDimensions.height) * 100;
      
      // Keep within bounds
      zone.x = Math.max(zone.width / 2, Math.min(100 - zone.width / 2, zone.x));
      zone.y = Math.max(zone.height / 2, Math.min(100 - zone.height / 2, zone.y));
    } else if (isResizing) {
      // Update size (convert pixel changes to percentage)
      zone.width = Math.max(5, zone.width + (deltaX / imageDimensions.width) * 100);
      zone.height = Math.max(5, zone.height + (deltaY / imageDimensions.height) * 100);
      
      // Make sure it doesn't extend beyond the image
      zone.width = Math.min(zone.width, 100 - zone.x + zone.width / 2);
      zone.height = Math.min(zone.height, 100 - zone.y + zone.height / 2);
    }
    
    newZones[selectedZoneIndex] = zone;
    setBlurZones(newZones);
    setStartPoint({ x: mouseX, y: mouseY });
  };
  
  // Handle mouse up (end drag/resize)
  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };
  
  // Handle clicking on the background (deselect)
  const handleContainerClick = (e: any) => {
    // Only deselect if clicking directly on the container, not a child
    if (e.target === e.currentTarget) {
      setSelectedZoneIndex(null);
    }
  };
  
  // Clean up event listeners
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };
    
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);
  
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{t('admin.blur.zones')}</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={addBlurZone}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {t('admin.add.zone')}
          </button>
          <button
            type="button"
            onClick={removeSelectedZone}
            disabled={selectedZoneIndex === null}
            className={`px-3 py-1 rounded ${
              selectedZoneIndex !== null
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('admin.remove.selected')}
          </button>
          <button
            type="button"
            onClick={saveBlurZones}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {t('admin.save.zones')}
          </button>
        </div>
      </div>
      
      <div 
        ref={imageContainerRef}
        className="relative w-full aspect-video bg-gray-100 overflow-hidden border border-gray-300 rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleContainerClick}
      >
        {/* Display the image */}
        <Image 
          src={imageUrl} 
          alt={t('admin.edit.blur.zones')}
          fill 
          className="object-contain"
        />
        
        {/* Display the blur zones */}
        {blurZones.map((zone, index) => (
          <div
            key={`edit-zone-${index}`}
            className={`absolute cursor-move border-2 ${
              selectedZoneIndex === index
                ? 'border-blue-500'
                : 'border-white border-opacity-70'
            }`}
            style={{
              left: `${zone.x - zone.width / 2}%`,
              top: `${zone.y - zone.height / 2}%`,
              width: `${zone.width}%`,
              height: `${zone.height}%`,
              backdropFilter: `blur(${blurIntensity}px)`,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
            onMouseDown={(e) => handleZoneMouseDown(index, e)}
          >
            {/* Resize handle */}
            <div
              className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize"
              style={{ transform: 'translate(50%, 50%)' }}
            />
          </div>
        ))}
        
        {/* Instructions */}
        {blurZones.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white p-4 text-center">
            <p>{t('admin.add.zone.instruction')}</p>
          </div>
        )}
      </div>
      
      <div className="text-sm text-gray-600">
        <p>{t('admin.blur.zone.instruction')}</p>
      </div>
    </div>
  );
} 