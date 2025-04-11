'use client';

import React, { useState, useEffect } from 'react';

/**
 * A debugging component for testing different image path formats
 * Useful for identifying which path variation works when images aren't loading
 */
export default function ImageDebugger({ imagePath }) {
  const [variants, setVariants] = useState([]);
  const [checks, setChecks] = useState({});
  
  useEffect(() => {
    if (!imagePath) return;
    
    // Generate path variants to test
    const pathVariants = [
      {
        label: "Original",
        path: imagePath,
        description: "The original path as provided"
      },
      {
        label: "Without leading slash",
        path: imagePath.startsWith('/') ? imagePath.substring(1) : imagePath,
        description: "Path without leading slash"
      },
      {
        label: "Without /images/ prefix",
        path: imagePath.includes('/images/') 
          ? imagePath.replace('/images/', '/gallery-page/') 
          : `/gallery-page/${imagePath.startsWith('/') ? imagePath.substring(1) : imagePath}`,
        description: "Path with /gallery-page/ instead of /images/"
      },
      {
        label: "With /public/ prefix",
        path: `/public/images/gallery-page/${imagePath.split('/').pop()}`,
        description: "Path with /public/ prefix"
      },
      {
        label: "Absolute URL",
        path: `http://localhost:3000/images/gallery-page/${imagePath.split('/').pop()}`,
        description: "Full URL with localhost"
      },
      {
        label: "From root with filename only",
        path: `/${imagePath.split('/').pop()}`,
        description: "Just the filename with leading slash"
      }
    ];
    
    setVariants(pathVariants);
  }, [imagePath]);
  
  const checkImageLoads = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  };
  
  useEffect(() => {
    const checkAllImages = async () => {
      const results = {};
      
      for (const variant of variants) {
        results[variant.label] = await checkImageLoads(variant.path);
      }
      
      setChecks(results);
    };
    
    if (variants.length > 0) {
      checkAllImages();
    }
  }, [variants]);
  
  if (!imagePath) {
    return <div className="italic text-gray-500">Enter an image path to debug</div>;
  }
  
  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b">
        <h3 className="font-semibold">Original path: {imagePath}</h3>
      </div>
      
      <div className="divide-y">
        {variants.map((variant, index) => (
          <div key={index} className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium">{variant.label}</div>
              <div className="text-xs text-gray-500 mt-1">{variant.path}</div>
            </div>
            
            <div className="col-span-1 md:col-span-2 flex">
              <div className="w-20 h-20 flex-shrink-0 mr-4">
                {variant.path && (
                  <div className="relative h-full w-full bg-gray-100 flex items-center justify-center rounded">
                    <img 
                      src={variant.path} 
                      alt="Test"
                      className="max-h-full max-w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center text-red-500 text-sm font-medium hidden"
                    >
                      Failed to load
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className={`text-sm font-medium ${checks[variant.label] ? 'text-green-600' : 'text-red-600'}`}>
                  {checks[variant.label] ? '✓ Works!' : 'Failed to load'}
                </div>
                <div className="text-xs text-gray-500 mt-1">{variant.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 