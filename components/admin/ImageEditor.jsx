'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaTrash, FaSave, FaUndo, FaRedo } from 'react-icons/fa';
import LoadingSpinner from '@/components/common/LoadingSpinner';

/**
 * ImageEditor component for adding blur areas to images
 * Mainly used for license plate blurring in gallery images
 * Supports rotation of blur areas
 */
export default function ImageEditor({ 
  imageUrl, 
  existingBlurAreas = [], 
  onSave,
  colors = {
    // Default colors if not provided
    paper: '#F7F3EE',
    ink: '#333333',
    accent: '#A0522D',
    muted: '#8C7A6B',
    success: '#5B8A72',
    error: '#A13D2D',
    border: '#E5DFDA',
    highlight: '#F0E9DF',
  }
}) {
  console.log(`[ImageEditor] Initializing with imageUrl: ${imageUrl}`);
  console.log(`[ImageEditor] existingBlurAreas type: ${typeof existingBlurAreas}`, 
    Array.isArray(existingBlurAreas) ? `Array with ${existingBlurAreas.length} items` : existingBlurAreas);
    
  // Debug log the existing blur areas in more detail
  if (existingBlurAreas && existingBlurAreas.length > 0) {
    console.log('[ImageEditor] Existing blur areas details:', JSON.stringify(existingBlurAreas));
  }
    
  // Use either provided blurAreas or existingBlurAreas
  const initialAreas = existingBlurAreas && existingBlurAreas.length > 0 ? existingBlurAreas : [];
  
  const [currentAreas, setCurrentAreas] = useState(initialAreas);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentArea, setCurrentArea] = useState(null);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Effect to log when currentAreas change
  useEffect(() => {
    console.log(`[ImageEditor] Current blur areas updated: ${currentAreas.length} areas`);
    if (currentAreas.length > 0) {
      console.log('[ImageEditor] First current area:', JSON.stringify(currentAreas[0]));
    }
  }, [currentAreas]);
  
  // Use effect to ensure blur areas are properly initialized
  useEffect(() => {
    // If existingBlurAreas changes, update currentAreas
    console.log(`[ImageEditor] existingBlurAreas changed: ${existingBlurAreas?.length} areas`);
    
    if (existingBlurAreas && existingBlurAreas.length > 0) {
      console.log('[ImageEditor] Updating currentAreas from existingBlurAreas');
      
      // Ensure we have valid blur areas with all required properties
      const validAreas = existingBlurAreas
        .filter(area => 
          area && 
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
          _metadata: area._metadata || { timestamp: Date.now() }
        }));
      
      console.log(`[ImageEditor] Found ${validAreas.length} valid areas to display`);
      
      if (validAreas.length > 0) {
        console.log('[ImageEditor] First valid area:', JSON.stringify(validAreas[0]));
        setCurrentAreas(validAreas);
      }
    }
  }, [existingBlurAreas]);
  
  // Clean URL for better image loading
  const cleanImageUrl = (url) => {
    if (!url) {
      console.error('[ImageEditor] No image URL provided');
      return '';
    }
    
    console.log(`[ImageEditor] Original URL: ${url}`);
    
    // Handle blob and data URLs
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      console.log('[ImageEditor] Using blob/data URL as is');
      return url;
    }
    
    // For absolute URLs, remove localhost part if present
    if (url.startsWith('http://') || url.startsWith('https://')) {
      if (url.includes('localhost:3000')) {
        const parsedUrl = new URL(url);
        url = parsedUrl.pathname;
        console.log(`[ImageEditor] Extracted path from localhost URL: ${url}`);
      } else {
        console.log('[ImageEditor] Using absolute URL as is');
        return url;
      }
    }
    
    // Remove any query parameters and hash fragments
    let cleanUrl = url.split('?')[0].split('#')[0];
    
    // Ensure URL has proper structure
    if (!cleanUrl.startsWith('/')) {
      cleanUrl = '/' + cleanUrl;
    }
    
    // Normalize to lowercase for consistent matching
    cleanUrl = cleanUrl.toLowerCase();
    console.log(`[ImageEditor] Lowercase normalized URL: ${cleanUrl}`);
    
    // Check if path already contains /images/gallery-page
    if (cleanUrl.includes('/images/gallery-page/')) {
      console.log(`[ImageEditor] URL already has gallery path: ${cleanUrl}`);
      return cleanUrl;
    }
    
    // Extract filename to determine folder
    const filename = cleanUrl.split('/').pop();
    
    // Map of car patterns to their directories
    const carMappings = {
      'thunderbird': 'thunderbird-restoration',
      'cadillac': 'red-cadillac-repair',
      'redcadillac': 'red-cadillac-repair',
      'porsche': 'porsche-detail',
      'porschedetail': 'porsche-detail',
      'mustangrebuild': 'mustang-rebuild',
      'mustang': 'mustang-rebuild',
      'mercedes': 'mercedes-sl550-repaint',
      'mercedesrepaint': 'mercedes-sl550-repaint',
      'mercedessls': 'mercedes-sl550-repaint',
      'mercedessl550': 'mercedes-sl550-repaint',
      'sl550': 'mercedes-sl550-repaint',
      'greenmercedes': 'green-mercedes-repair',
      'jaguar': 'jaguar-repaint',
      'jaguarrepaint': 'jaguar-repaint',
      'honda': 'honda-accord-repair',
      'hondaaccord': 'honda-accord-repair',
      'accord': 'honda-accord-repair',
      'bmw': 'bmw-e90-repair',
      'bmwe90': 'bmw-e90-repair',
      'bluealfa': 'blue-alfa-repair',
      'alfa': 'blue-alfa-repair',
      'bluemustang': 'blue-mustang-repair',
      'blueaccord': 'blue-accord-repair'
    };
    
    // Try to match the filename to a car directory
    let carDirectory = '';
    
    // First try to extract from URL structure if possible
    const urlParts = cleanUrl.split('/');
    if (urlParts.length > 3 && urlParts.includes('gallery-page')) {
      const galleryPageIndex = urlParts.indexOf('gallery-page');
      if (galleryPageIndex > -1 && galleryPageIndex + 1 < urlParts.length) {
        carDirectory = urlParts[galleryPageIndex + 1];
        console.log(`[ImageEditor] Extracted directory from URL: ${carDirectory}`);
      }
    }
    
    // If not found in URL, try to match from filename
    if (!carDirectory && filename) {
      // Check if it follows the pattern after-X-carname-view.jpg or before-X-carname-view.jpg
      const carMatch = filename.match(/(?:before|after)-\d+[-_]([a-z0-9]+)/i);
      if (carMatch && carMatch[1]) {
        const carName = carMatch[1].toLowerCase();
        
        if (carMappings[carName]) {
          carDirectory = carMappings[carName];
          console.log(`[ImageEditor] Extracted car name from filename: ${carName} -> ${carDirectory}`);
        }
      }
      
      // If still no match, try checking if any car name is contained in the filename
      if (!carDirectory) {
        for (const [pattern, directory] of Object.entries(carMappings)) {
          if (filename.toLowerCase().includes(pattern.toLowerCase())) {
            carDirectory = directory;
            console.log(`[ImageEditor] Matched car name pattern in filename: ${pattern} -> ${directory}`);
            break;
          }
        }
      }
    }
    
    // If we found a matching car directory, construct full gallery path
    if (carDirectory) {
      cleanUrl = `/images/gallery-page/${carDirectory}/${filename}`;
      console.log(`[ImageEditor] Mapped to gallery path: ${cleanUrl}`);
    } 
    // If no car directory was found but it looks like an image
    else if (filename && filename.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      // Check if it's in the edit page URL and we can extract car name
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin-dashboard/gallery/edit/')) {
          const carId = currentPath.split('/admin-dashboard/gallery/edit/')[1];
          if (carId && carMappings[carId.replace(/-/g, '')]) {
            const directory = carMappings[carId.replace(/-/g, '')];
            cleanUrl = `/images/gallery-page/${directory}/${filename}`;
            console.log(`[ImageEditor] Used ID from URL path: ${carId} -> ${directory}`);
          } else if (carId) {
            // Use the ID directly as the directory
            cleanUrl = `/images/gallery-page/${carId}/${filename}`;
            console.log(`[ImageEditor] Used ID from URL path as directory: ${carId}`);
          }
        }
      }
      
      // Make sure it has /images prefix at minimum
      if (!cleanUrl.includes('/images/')) {
        cleanUrl = `/images${cleanUrl}`;
        console.log(`[ImageEditor] Added /images prefix: ${cleanUrl}`);
      }
    }
    
    console.log(`[ImageEditor] Final cleaned URL: ${cleanUrl}`);
    return cleanUrl;
  };
  
  const cleanedImageUrl = cleanImageUrl(imageUrl);
  
  // Add a debug function to test blur area paths
  const testBlurAreaPaths = () => {
    console.log('======= BLUR AREA PATH TEST =======');
    console.log(`Original image URL: ${imageUrl}`);
    console.log(`Cleaned image URL: ${cleanedImageUrl}`);
    
    // Generate a test version of the URL with different casing
    const mixedCaseUrl = cleanedImageUrl.split('').map((char, idx) => 
      idx % 2 === 0 ? char.toLowerCase() : char.toUpperCase()
    ).join('');
    
    console.log(`Mixed case version: ${mixedCaseUrl}`);
    
    // Check if the keys match when normalized
    const normalizedOriginal = cleanedImageUrl.toLowerCase();
    const normalizedMixed = mixedCaseUrl.toLowerCase();
    
    console.log(`Normalized original: ${normalizedOriginal}`);
    console.log(`Normalized mixed case: ${normalizedMixed}`);
    console.log(`Matching keys: ${normalizedOriginal === normalizedMixed}`);
    
    // Show blur areas being used
    if (existingBlurAreas && existingBlurAreas.length > 0) {
      console.log(`Using ${existingBlurAreas.length} existing blur areas`);
    } else {
      console.log('No existing blur areas found');
    }
    
    console.log('====================================');
  };
  
  // Call test on initial render
  useEffect(() => {
    testBlurAreaPaths();
  }, []);

  // Handle image load
  const handleImageLoad = () => {
    if (imageRef.current) {
    setImageLoaded(true);
    setImageError(false);
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      });
      console.log(`[ImageEditor] Image loaded successfully: ${cleanedImageUrl}`);
      console.log(`[ImageEditor] Image dimensions: ${imageRef.current.naturalWidth}x${imageRef.current.naturalHeight}`);
    }
  };

  // Handle image error with better diagnostics
  const handleImageError = () => {
    console.error(`[ImageEditor] Failed to load image: ${cleanedImageUrl}`);
    
    // Try to diagnose the issue
    if (cleanedImageUrl.includes('/images/gallery-page/')) {
      console.log('[ImageEditor] Trying to determine why gallery image failed:');
      console.log(`- Check if directory exists: /images/gallery-page/...`);
      console.log(`- Check if file exists: ${cleanedImageUrl.split('/').pop()}`);
      
      // Try an alternative approach - maybe the path is case sensitive
      const parts = cleanedImageUrl.split('/');
      const filename = parts.pop();
      const directory = parts.pop();
      
      console.log(`[ImageEditor] Alternatives to try manually:`);
      console.log(`1. /images/gallery-page/${directory}/${filename?.toLowerCase()}`);
      console.log(`2. /images/${filename}`);
      
      // If the URL is from the current edit page, suggest a direct match
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/admin-dashboard/gallery/edit/')) {
          const carId = currentPath.split('/admin-dashboard/gallery/edit/')[1];
          console.log(`3. /images/gallery-page/${carId}/${filename}`);
        }
      }
    }
    
    setImageLoaded(false);
    setImageError(true);
  };
  
  // Use effect to log image URL changes
  useEffect(() => {
    console.log(`[ImageEditor] Image URL changed to: ${imageUrl}`);
    console.log(`[ImageEditor] Cleaned image URL: ${cleanedImageUrl}`);
  }, [imageUrl, cleanedImageUrl]);
  
  // Use effect to ensure image is properly displayed
  useEffect(() => {
    // Reset loading state when URL changes
    setImageLoaded(false);
    setImageError(false);
  }, [cleanedImageUrl]);

  // Calculate distance between two points
  const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  // Calculate angle between two points in degrees
  const calculateAngle = (cx, cy, x, y) => {
    const radians = Math.atan2(y - cy, x - cx);
    return radians * (180 / Math.PI);
  };

  // Check if point is inside rotated blur area
  const isPointInArea = (x, y, area) => {
    // For non-rotated areas, use simple boundary check
    if (area.rotation === 0) {
      return (
        x >= area.x && 
        x <= area.x + area.width && 
        y >= area.y && 
        y <= area.y + area.height
      );
    }
    
    // For rotated areas, transform point to area's coordinate system
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    
    // Translate to origin
    const translatedX = x - centerX;
    const translatedY = y - centerY;
    
    // Rotate point in the opposite direction of area's rotation
    const angleInRadians = -area.rotation * (Math.PI / 180);
    const rotatedX = translatedX * Math.cos(angleInRadians) - translatedY * Math.sin(angleInRadians);
    const rotatedY = translatedX * Math.sin(angleInRadians) + translatedY * Math.cos(angleInRadians);
    
    // Check if the rotated point is inside the unrotated rectangle
    return (
      rotatedX >= -area.width / 2 &&
      rotatedX <= area.width / 2 &&
      rotatedY >= -area.height / 2 &&
      rotatedY <= area.height / 2
    );
  };
  
  // Check if point is on resize handle or rotation handle of blur area
  const getResizeHandle = (x, y, area) => {
    const handleSize = 10;
    
    // Area center point
    const centerX = area.x + area.width / 2;
    const centerY = area.y + area.height / 2;
    
    // Calculate corners with rotation
    const corners = [
      { name: 'top-left', offsetX: -area.width/2, offsetY: -area.height/2 },
      { name: 'top-right', offsetX: area.width/2, offsetY: -area.height/2 },
      { name: 'bottom-left', offsetX: -area.width/2, offsetY: area.height/2 },
      { name: 'bottom-right', offsetX: area.width/2, offsetY: area.height/2 }
    ];
    
    // Rotate corners and check if point is on any corner
    const angleInRadians = area.rotation * (Math.PI / 180);
    
    for (const corner of corners) {
      // Rotate corner
      const rotatedX = corner.offsetX * Math.cos(angleInRadians) - corner.offsetY * Math.sin(angleInRadians);
      const rotatedY = corner.offsetX * Math.sin(angleInRadians) + corner.offsetY * Math.cos(angleInRadians);
      
      // Add center offset
      const cornerX = centerX + rotatedX;
      const cornerY = centerY + rotatedY;
      
      // Check if point is on this corner
      if (
        x >= cornerX - handleSize && 
        x <= cornerX + handleSize && 
        y >= cornerY - handleSize && 
        y <= cornerY + handleSize
      ) {
        return corner.name;
      }
    }
    
    // Check for rotation handle (placed above the top-center)
    const rotationHandleOffset = 20; // Distance above the area
    const rotationHandleX = centerX;
    const rotationHandleY = centerY - area.height/2 - rotationHandleOffset;
    
    // Calculate the rotated position of the rotation handle
    const rotHandleRotatedX = rotationHandleX - centerX;
    const rotHandleRotatedY = rotationHandleY - centerY;
    const rotatedRotHandleX = centerX + (rotHandleRotatedX * Math.cos(angleInRadians) - rotHandleRotatedY * Math.sin(angleInRadians));
    const rotatedRotHandleY = centerY + (rotHandleRotatedX * Math.sin(angleInRadians) + rotHandleRotatedY * Math.cos(angleInRadians));
    
    // Increase the hit box size for the rotation handle to make it easier to grab
    const rotationHandleSize = handleSize * 2;
    
    if (
      x >= rotatedRotHandleX - rotationHandleSize && 
      x <= rotatedRotHandleX + rotationHandleSize && 
      y >= rotatedRotHandleY - rotationHandleSize && 
      y <= rotatedRotHandleY + rotationHandleSize
    ) {
      console.log('[ImageEditor] Detected click on rotation handle');
      return 'rotation';
    }
    
    return null;
  };

  // Start drawing a new blur area
  const handleMouseDown = (e) => {
    if (!imageLoaded || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an existing area
    for (let i = currentAreas.length - 1; i >= 0; i--) {
      const area = currentAreas[i];
      
      // Check for resize or rotation handles first
      const handle = getResizeHandle(x, y, area);
      if (handle) {
        setSelectedAreaIndex(i);
        
        if (handle === 'rotation') {
          setIsRotating(true);
          
          // Calculate center of the blur area
          const centerX = area.x + area.width / 2;
          const centerY = area.y + area.height / 2;
          
          // Calculate the current angle
          const currentAngle = calculateAngle(centerX, centerY, x, y);
          setRotationStartAngle(currentAngle - area.rotation);
        } else {
          setIsResizing(true);
          setResizeHandle(handle);
        }
        
        e.preventDefault();
        return;
      }
      
      // Check if clicking inside the area
      if (isPointInArea(x, y, area)) {
        setSelectedAreaIndex(i);
        setIsDragging(true);
        
        // For rotated areas, still use the top-left corner as reference
        setDragOffset({
          x: x - area.x,
          y: y - area.y
        });
        
        e.preventDefault();
        return;
      }
    }
    
    // If not clicking on an existing area, start drawing a new one
    setIsDrawing(true);
    setCurrentArea({
      x,
      y,
      width: 0,
      height: 0,
      blurAmount: 8, // Default blur amount
      rotation: 0 // Default rotation
    });

    if (debugMode) {
      // Calculate relative click position
      const relX = (x / imageRef.current.width) * 100;
      const relY = (y / imageRef.current.height) * 100;
      console.log(`[ImageEditor] Click at (${relX.toFixed(2)}%, ${relY.toFixed(2)}%)`);
      console.log(`[ImageEditor] Raw click at (${x}, ${y}) on image ${imageRef.current.width}x${imageRef.current.height}`);
    }
  };

  // Update the blur area while drawing, dragging, resizing, or rotating
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle drawing
    if (isDrawing && currentArea) {
      setCurrentArea(prev => ({
        ...prev,
        width: x - prev.x,
        height: y - prev.y
      }));
      return;
    }
    
    // Handle dragging
    if (isDragging && selectedAreaIndex !== null) {
      const newAreas = [...currentAreas];
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      // Calculate new position ensuring it stays within bounds
      let newX = x - dragOffset.x;
      let newY = y - dragOffset.y;
      
      const area = newAreas[selectedAreaIndex];
      
      // Keep area within container bounds (simplified for rotated areas)
      newX = Math.max(0, Math.min(containerWidth - area.width, newX));
      newY = Math.max(0, Math.min(containerHeight - area.height, newY));
      
      newAreas[selectedAreaIndex] = {
        ...area,
        x: newX,
        y: newY
      };
      
      setCurrentAreas(newAreas);
      return;
    }
    
    // Handle rotating
    if (isRotating && selectedAreaIndex !== null) {
      const newAreas = [...currentAreas];
      const area = {...newAreas[selectedAreaIndex]};
      
      // Calculate center of the blur area
      const centerX = area.x + area.width / 2;
      const centerY = area.y + area.height / 2;
      
      // Calculate the current angle from center to mouse
      const currentAngle = calculateAngle(centerX, centerY, x, y);
      
      // Ensure we have a valid rotation angle
      let newRotation = (currentAngle - rotationStartAngle) % 360;
      
      // Normalize the angle to 0-359 range
      if (newRotation < 0) newRotation += 360;
      
      // Apply the rotation and ensure it's a number
      area.rotation = Number(newRotation.toFixed(1));
      
      console.log(`[ImageEditor] Rotating area to ${area.rotation}° (original angle: ${currentAngle}°, start offset: ${rotationStartAngle}°)`);
      
      newAreas[selectedAreaIndex] = area;
      setCurrentAreas(newAreas);
      return;
    }
    
    // Handle resizing
    if (isResizing && selectedAreaIndex !== null && resizeHandle) {
      const newAreas = [...currentAreas];
      const area = {...newAreas[selectedAreaIndex]};
      
      // For rotated areas, we need to transform the mouse point
      const centerX = area.x + area.width / 2;
      const centerY = area.y + area.height / 2;
      
      // Translate mouse point to area's coordinate system
      const angleInRadians = -area.rotation * (Math.PI / 180);
      const translatedX = x - centerX;
      const translatedY = y - centerY;
      
      // Rotate point to align with area's axes
      const rotatedX = translatedX * Math.cos(angleInRadians) - translatedY * Math.sin(angleInRadians);
      const rotatedY = translatedX * Math.sin(angleInRadians) + translatedY * Math.cos(angleInRadians);
      
      // Adjust dimensions based on the handle being dragged
      const newWidth = 2 * Math.abs(rotatedX);
      const newHeight = 2 * Math.abs(rotatedY);
      
      // Update width and height, keeping the center fixed
      if (newWidth >= 20) area.width = newWidth;
      if (newHeight >= 20) area.height = newHeight;
      
      // Recalculate the top-left corner to maintain the center position
      area.x = centerX - area.width / 2;
      area.y = centerY - area.height / 2;
      
      newAreas[selectedAreaIndex] = area;
      setCurrentAreas(newAreas);
    }
  };

  // Finish drawing, dragging, resizing, or rotating
  const handleMouseUp = () => {
    if (isDrawing && currentArea) {
      // Make sure width and height are positive
      const normalizedArea = {
        x: currentArea.width < 0 ? currentArea.x + currentArea.width : currentArea.x,
        y: currentArea.height < 0 ? currentArea.y + currentArea.height : currentArea.y,
        width: Math.abs(currentArea.width),
        height: Math.abs(currentArea.height),
        blurAmount: currentArea.blurAmount,
        rotation: currentArea.rotation || 0
      };
      
      // Only add areas with some minimum size
      if (normalizedArea.width > 10 && normalizedArea.height > 10) {
        setCurrentAreas([...currentAreas, normalizedArea]);
        setSelectedAreaIndex(currentAreas.length); // Select the new area
      }
    }
    
    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
    setIsRotating(false);
    setCurrentArea(null);
    setResizeHandle(null);
  };

  // Cancel drawing, dragging, resizing, or rotating if the mouse leaves the container
  const handleMouseLeave = () => {
    if (isDrawing || isDragging || isResizing || isRotating) {
      setIsDrawing(false);
      setIsDragging(false);
      setIsResizing(false);
      setIsRotating(false);
      setCurrentArea(null);
      setResizeHandle(null);
    }
  };

  // Add a fixed-size blur area to the center
  const handleAddBlurArea = () => {
    if (!containerRef.current || !imageLoaded) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const newArea = {
      x: centerX - 50,
      y: centerY - 25,
      width: 100,
      height: 50,
      blurAmount: 8,
      rotation: 0
    };
    
    setCurrentAreas([...currentAreas, newArea]);
    setSelectedAreaIndex(currentAreas.length);
  };

  // Remove a blur area
  const handleRemoveBlurArea = (index) => {
    console.log(`[ImageEditor] Removing blur area at index ${index}`);
    const updatedAreas = [...currentAreas];
    updatedAreas.splice(index, 1);
    setCurrentAreas(updatedAreas);
    setSelectedAreaIndex(null);
  };

  // Save the blur areas
  const handleSave = () => {
    console.log(`[ImageEditor] ==== SAVE PROCESS START ====`);
    console.log(`[ImageEditor] Saving ${currentAreas.length} blur areas for image URL: ${cleanedImageUrl}`);
    
    if (currentAreas.length > 0) {
      // Get the current timestamp for consistent debugging
      const saveTimestamp = Date.now();
      const imageWidth = imageRef.current?.naturalWidth || imageRef.current?.width || 0;
      const imageHeight = imageRef.current?.naturalHeight || imageRef.current?.height || 0;
      
      // Use direct pixel values - simpler and more reliable
      // Add metadata to track the image dimensions used at creation time
      const pixelBasedAreas = currentAreas.map(area => ({
        x: typeof area.x === 'number' ? area.x : 0,
        y: typeof area.y === 'number' ? area.y : 0,
        width: typeof area.width === 'number' ? area.width : 10,
        height: typeof area.height === 'number' ? area.height : 10,
        rotation: area.rotation || 0,
        blurAmount: area.blurAmount || 8,
        // Store original dimensions and detailed metadata for reference
        _metadata: {
          // Preserve any existing metadata
          ...(area._metadata || {}),
          // Add/update with fresh info
          imageWidth,
          imageHeight,
          timestamp: saveTimestamp,
          originalUrl: imageUrl,
          cleanedUrl: cleanedImageUrl,
          editor: "ImageEditor-v1.1" // Version to track implementation changes
        }
      }));
      
      console.log('[ImageEditor] Area details:', pixelBasedAreas.map((area, i) => ({
        index: i,
        x: Math.round(area.x),
        y: Math.round(area.y),
        width: Math.round(area.width), 
        height: Math.round(area.height),
        rotation: area.rotation || 0
      })));
      
      // Create a check signature we can use to verify if the data arrives correctly
      const checkSignature = `${pixelBasedAreas.length}-areas-${saveTimestamp}`;
      console.log(`[ImageEditor] Save signature: ${checkSignature}`);
      
      // Add a reference field to help debug
      const areasWithSignature = pixelBasedAreas.map(area => ({
        ...area,
        _save_ref: checkSignature
      }));
      
      // Log the normalized image URL
      console.log(`[ImageEditor] Using normalized image URL for save: ${cleanedImageUrl}`);
      
      // Send the areas to the parent component
      onSave(cleanedImageUrl, areasWithSignature);
    } else {
      // If no areas, just pass an empty array
      console.log('[ImageEditor] No blur areas to save');
      onSave(cleanedImageUrl, []);
    }
    
    console.log(`[ImageEditor] ==== SAVE PROCESS END ====`);
  };

  // Update a blur area's blur amount
  const handleBlurAmountChange = (index, amount) => {
    const newAreas = [...currentAreas];
    newAreas[index].blurAmount = parseInt(amount, 10);
    setCurrentAreas(newAreas);
  };

  // Update a blur area's rotation
  const handleRotationChange = (index, rotation) => {
    if (index < 0 || index >= currentAreas.length) {
      console.error(`[ImageEditor] Invalid area index for rotation: ${index}`);
      return;
    }

    // Ensure we have a valid rotation value
    let newRotation = parseInt(rotation, 10);
    
    // Enforce value limits
    if (isNaN(newRotation)) newRotation = 0;
    newRotation = Math.max(0, Math.min(359, newRotation));
    
    console.log(`[ImageEditor] Setting rotation of area ${index} to ${newRotation}°`);
    
    const newAreas = [...currentAreas];
    newAreas[index] = {
      ...newAreas[index],
      rotation: newRotation
    };
    
    setCurrentAreas(newAreas);
  };

  // Get cursor style based on current state and position
  const getCursorStyle = () => {
    if (isDrawing) return 'crosshair';
    if (isDragging) return 'move';
    if (isRotating) return 'grab';
    if (isResizing) {
      switch(resizeHandle) {
        case 'top-left':
        case 'bottom-right':
          return 'nwse-resize';
        case 'top-right':
        case 'bottom-left':
          return 'nesw-resize';
        default:
          return 'crosshair';
      }
    }
    return 'default';
  };

  return (
    <div className="image-editor">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-xl font-light" style={{ color: colors.ink }}>License Plate Blur Tool</h3>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleAddBlurArea}
            className="px-4 py-2 rounded-sm text-sm inline-flex items-center"
            style={{ backgroundColor: colors.accent, color: 'white' }}
          >
            <FaPlus className="mr-2" /> Add Blur Area
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-sm text-sm inline-flex items-center"
            style={{ backgroundColor: colors.success, color: 'white' }}
          >
            <FaSave className="mr-2" /> Save Changes
          </button>
        </div>
      </div>
      
      <div
        ref={containerRef}
        className="relative rounded-sm overflow-hidden"
        style={{ 
          border: `1px solid ${colors.border}`, 
          cursor: getCursorStyle(),
          minHeight: '300px', // Ensure minimum size even if image fails to load
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: colors.paper }}>
            <LoadingSpinner size="lg" color={colors.accent} />
            <div className="ml-3 text-sm" style={{ color: colors.muted }}>Loading image...</div>
          </div>
        )}
        
        {imageError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4" style={{ backgroundColor: colors.paper }}>
            <div className="text-center mb-4" style={{ color: colors.error }}>
              <p className="font-medium">Failed to load image</p>
              <p className="text-sm mt-2 break-all">{cleanedImageUrl}</p>
            </div>
            <div className="text-sm p-4 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: colors.muted }}>
              <p>Possible solutions:</p>
              <ul className="list-disc pl-5 mt-2">
                <li>Check if the image path is correct</li>
                <li>Verify the image exists on the server</li>
                <li>Try using a different image format</li>
              </ul>
            </div>
          </div>
        )}
        
        {/* Use direct src rather than state-derived value for better reliability */}
          <img
            ref={imageRef}
          src={cleanedImageUrl}
            alt="Image to edit"
            className="max-w-full"
            style={{ 
            display: 'block', // Always show the image element
            opacity: imageLoaded ? 1 : 0, // Control visibility with opacity
              maxHeight: '600px', // Prevent huge images from breaking layout
            transition: 'opacity 0.3s',
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        
        {/* Render blur areas */}
        {imageLoaded && currentAreas.map((area, index) => {
          // Calculate center point for rotation
          const centerX = area.x + area.width / 2;
          const centerY = area.y + area.height / 2;
          
          return (
            <div
              key={index}
              className={`absolute ${selectedAreaIndex === index ? 'z-20' : 'z-10'}`}
              style={{
                left: `${area.x}px`,
                top: `${area.y}px`,
                width: `${area.width}px`,
                height: `${area.height}px`,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selectedAreaIndex === index ? colors.accent : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: `blur(${area.blurAmount || 8}px)`,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transform: `rotate(${area.rotation}deg)`,
                transformOrigin: 'center center',
                cursor: 'move'
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAreaIndex(index);
              }}
            >
              {/* Resize handles */}
              {selectedAreaIndex === index && (
                <>
                  {/* Top-left resize handle */}
                  <div
                    className="absolute w-3 h-3 bg-white border-2 rounded-full -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ 
                      left: 0, 
                      top: 0, 
                      borderColor: colors.accent,
                      cursor: 'nwse-resize'
                    }}
                  />
                  
                  {/* Top-right resize handle */}
                  <div
                    className="absolute w-3 h-3 bg-white border-2 rounded-full translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ 
                      left: '100%', 
                      top: 0, 
                      borderColor: colors.accent,
                      cursor: 'nesw-resize'
                    }}
                  />
                  
                  {/* Bottom-left resize handle */}
                  <div
                    className="absolute w-3 h-3 bg-white border-2 rounded-full -translate-x-1/2 translate-y-1/2 z-20"
                    style={{ 
                      left: 0, 
                      top: '100%', 
                      borderColor: colors.accent,
                      cursor: 'nesw-resize'
                    }}
                  />
                  
                  {/* Bottom-right resize handle */}
                  <div
                    className="absolute w-3 h-3 bg-white border-2 rounded-full translate-x-1/2 translate-y-1/2 z-20"
                    style={{ 
                      left: '100%', 
                      top: '100%', 
                      borderColor: colors.accent,
                      cursor: 'nwse-resize'
                    }}
                  />
                  
                  {/* Rotation handle */}
                  <div
                    className="absolute w-4 h-4 bg-green-500 border-2 border-white rounded-full left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
                    style={{ 
                      top: '-25px',
                      cursor: 'grab',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                    title="Drag to rotate"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                    </svg>
                  </div>
                </>
              )}
            </div>
          );
        })}
        
        {/* Show current drawing area */}
        {isDrawing && currentArea && (
          <div
            className="absolute z-10 border-2"
            style={{
              left: `${currentArea.width < 0 ? currentArea.x + currentArea.width : currentArea.x}px`,
              top: `${currentArea.height < 0 ? currentArea.y + currentArea.height : currentArea.y}px`,
              width: `${Math.abs(currentArea.width)}px`,
              height: `${Math.abs(currentArea.height)}px`,
              backdropFilter: `blur(8px)`,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              borderColor: colors.accent
            }}
          />
        )}
      </div>
      
      {/* Blur Areas List */}
      <div className="mt-8">
        <h3 className="text-xl font-light mb-4" style={{ color: colors.ink }}>
          Blur Areas {currentAreas.length > 0 && `(${currentAreas.length})`}
        </h3>
        
        {currentAreas.length === 0 ? (
          <p style={{ color: colors.muted }}>No blur areas defined yet. Click and drag on the image to create one.</p>
        ) : (
          <div className="space-y-4">
            {currentAreas.map((area, index) => (
              <div 
                key={index} 
                className="p-4 rounded-sm"
                style={{
                  backgroundColor: selectedAreaIndex === index ? colors.highlight : 'white',
                  border: `1px solid ${selectedAreaIndex === index ? colors.accent : colors.border}`,
                }}
                onClick={() => setSelectedAreaIndex(index)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-medium" style={{ color: colors.ink }}>Blur Area {index + 1} </span>
                    <span style={{ color: colors.muted, fontSize: '14px' }}>
                      {Math.round(area.width)} × {Math.round(area.height)} px
                    </span>
                    {area.rotation !== 0 && (
                      <span style={{ color: colors.muted, fontSize: '14px', marginLeft: '8px' }}>
                        {Math.round(area.rotation)}°
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBlurArea(index);
                    }}
                    className="p-1 rounded-full hover:opacity-80"
                    style={{ color: colors.error }}
                  >
                    <FaTrash />
                  </button>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.muted }}>Blur Amount:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={area.blurAmount}
                        onChange={(e) => handleBlurAmountChange(index, e.target.value)}
                        className="w-full"
                        style={{ accentColor: colors.accent }}
                      />
                      <span className="text-sm font-mono w-8 text-right" style={{ color: colors.ink }}>
                        {area.blurAmount}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2" style={{ color: colors.muted }}>Rotation (degrees):</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="range"
                        min="0"
                        max="359"
                        value={area.rotation || 0}
                        onChange={(e) => handleRotationChange(index, e.target.value)}
                        className="w-full"
                        style={{ accentColor: colors.accent }}
                      />
                      <span className="text-sm font-mono w-8 text-right" style={{ color: colors.ink }}>
                        {Math.round(area.rotation || 0)}°
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 