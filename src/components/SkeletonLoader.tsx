'use client';

import React from 'react';

type SkeletonType = 'hero' | 'card' | 'text' | 'image' | 'testimonial' | 'service' | 'gallery';

interface SkeletonLoaderProps {
  type: SkeletonType;
  count?: number;
  className?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type, 
  count = 1, 
  className = '' 
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'hero':
        return (
          <div className="h-[calc(100vh-90px)] bg-gray-200 relative">
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
              <div className="h-8 w-40 bg-gray-300 rounded-full mb-8"></div>
              <div className="h-12 w-full bg-gray-300 rounded-lg mb-4"></div>
              <div className="h-12 w-3/4 bg-gray-300 rounded-lg mb-8"></div>
              <div className="h-6 w-full bg-gray-300 rounded-lg mb-12"></div>
              
              <div className="flex gap-4">
                <div className="h-12 w-40 bg-gray-300 rounded-lg"></div>
                <div className="h-12 w-40 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
          </div>
        );
        
      case 'card':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-1/2"></div>
          </div>
        );
        
      case 'text':
        return (
          <div>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        );
        
      case 'image':
        return (
          <div className="aspect-video bg-gray-200 rounded-md"></div>
        );
        
      case 'testimonial':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        );
        
      case 'service':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded-md w-1/2 mx-auto"></div>
          </div>
        );
        
      case 'gallery':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-200 rounded-md"></div>
            <div className="aspect-square bg-gray-200 rounded-md"></div>
            <div className="aspect-square bg-gray-200 rounded-md"></div>
            <div className="aspect-square bg-gray-200 rounded-md"></div>
          </div>
        );
        
      default:
        return <div className="h-10 bg-gray-200 rounded w-full"></div>;
    }
  };

  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={count > 1 ? 'mb-4' : ''}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader; 