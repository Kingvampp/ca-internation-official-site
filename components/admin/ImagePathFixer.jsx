'use client';

import React, { useState, useEffect } from 'react';

/**
 * Component to debug and fix image paths in gallery items
 */
export default function ImagePathFixer({ galleryItem, onFixPaths }) {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState({});
  const [fixedPaths, setFixedPaths] = useState({});
  
  const checkImage = async (path) => {
    if (!path) return { exists: false, error: 'No path provided' };
    
    try {
      const response = await fetch(`/api/check-image?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`[ImagePathFixer] Error checking image path ${path}:`, error);
      return { exists: false, error: error.message };
    }
  };
  
  const handleCheck = async () => {
    if (!galleryItem) return;
    
    setChecking(true);
    setResults({});
    
    const checkResults = {};
    const fixes = {};
    
    // Check main image
    if (galleryItem.mainImage) {
      console.log(`[ImagePathFixer] Checking main image: ${galleryItem.mainImage}`);
      checkResults.mainImage = await checkImage(galleryItem.mainImage);
      
      if (checkResults.mainImage.workingPath && 
          checkResults.mainImage.workingPath !== galleryItem.mainImage) {
        fixes.mainImage = checkResults.mainImage.workingPath;
      }
    }
    
    // Check before images
    if (Array.isArray(galleryItem.beforeImages)) {
      checkResults.beforeImages = [];
      fixes.beforeImages = [...galleryItem.beforeImages];
      let hasChanges = false;
      
      for (let i = 0; i < galleryItem.beforeImages.length; i++) {
        const path = galleryItem.beforeImages[i];
        console.log(`[ImagePathFixer] Checking before image ${i}: ${path}`);
        const result = await checkImage(path);
        checkResults.beforeImages.push(result);
        
        if (result.workingPath && result.workingPath !== path) {
          fixes.beforeImages[i] = result.workingPath;
          hasChanges = true;
        }
      }
      
      if (!hasChanges) {
        delete fixes.beforeImages;
      }
    }
    
    // Check after images
    if (Array.isArray(galleryItem.afterImages)) {
      checkResults.afterImages = [];
      fixes.afterImages = [...galleryItem.afterImages];
      let hasChanges = false;
      
      for (let i = 0; i < galleryItem.afterImages.length; i++) {
        const path = galleryItem.afterImages[i];
        console.log(`[ImagePathFixer] Checking after image ${i}: ${path}`);
        const result = await checkImage(path);
        checkResults.afterImages.push(result);
        
        if (result.workingPath && result.workingPath !== path) {
          fixes.afterImages[i] = result.workingPath;
          hasChanges = true;
        }
      }
      
      if (!hasChanges) {
        delete fixes.afterImages;
      }
    }
    
    setResults(checkResults);
    setFixedPaths(fixes);
    setChecking(false);
  };
  
  const handleApplyFixes = () => {
    if (Object.keys(fixedPaths).length === 0) {
      console.log('[ImagePathFixer] No paths to fix');
      return;
    }
    
    console.log('[ImagePathFixer] Applying fixes:', fixedPaths);
    onFixPaths(fixedPaths);
  };
  
  const renderStatus = (result) => {
    if (!result) return null;
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${
        result.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {result.exists ? 'Found' : 'Not Found'}
      </span>
    );
  };
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Image Path Checker</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm flex items-center"
          >
            {checking ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </span>
            ) : 'Check Paths'}
          </button>
          
          {Object.keys(fixedPaths).length > 0 && (
            <button
              type="button"
              onClick={handleApplyFixes}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm"
            >
              Apply Fixes
            </button>
          )}
        </div>
      </div>
      
      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          {results.mainImage && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Main Image</div>
                {renderStatus(results.mainImage)}
              </div>
              <div className="text-sm break-all">{galleryItem.mainImage}</div>
              {results.mainImage.workingPath && results.mainImage.workingPath !== galleryItem.mainImage && (
                <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-md">
                  <div className="text-xs text-green-700 mb-1">Suggested fix:</div>
                  <div className="text-sm break-all">{results.mainImage.workingPath}</div>
                </div>
              )}
            </div>
          )}
          
          {Array.isArray(results.beforeImages) && results.beforeImages.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium mb-2">Before Images</div>
              {results.beforeImages.map((result, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">Before {index + 1}</div>
                    {renderStatus(result)}
                  </div>
                  <div className="text-xs break-all">{galleryItem.beforeImages[index]}</div>
                  {result.workingPath && result.workingPath !== galleryItem.beforeImages[index] && (
                    <div className="mt-1 p-2 bg-green-50 border border-green-100 rounded-md">
                      <div className="text-xs text-green-700 mb-1">Suggested fix:</div>
                      <div className="text-xs break-all">{result.workingPath}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {Array.isArray(results.afterImages) && results.afterImages.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="font-medium mb-2">After Images</div>
              {results.afterImages.map((result, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm">After {index + 1}</div>
                    {renderStatus(result)}
                  </div>
                  <div className="text-xs break-all">{galleryItem.afterImages[index]}</div>
                  {result.workingPath && result.workingPath !== galleryItem.afterImages[index] && (
                    <div className="mt-1 p-2 bg-green-50 border border-green-100 rounded-md">
                      <div className="text-xs text-green-700 mb-1">Suggested fix:</div>
                      <div className="text-xs break-all">{result.workingPath}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 