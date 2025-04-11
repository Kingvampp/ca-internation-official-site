/**
 * Image Optimization Utility
 * 
 * This utility enhances image loading on mobile devices without modifying existing components.
 * It adds responsive image loading, lazy loading, and other optimizations.
 */

import devLogger from './dev-logger';

const ImageOptimizer = {
  /**
   * Initialize image optimizations
   */
  init: () => {
    if (typeof window === 'undefined') return;
    
    devLogger.log('Initializing image optimizations', 'info');
    
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    
    // Apply optimizations
    ImageOptimizer.addLazyLoading();
    ImageOptimizer.prioritizeLCP();
    ImageOptimizer.optimizeBackgroundImages();
    
    devLogger.log('Image optimizations applied', 'success');
  },
  
  /**
   * Add lazy loading to images below the fold
   */
  addLazyLoading: () => {
    setTimeout(() => {
      // Find all images without loading attribute
      const images = document.querySelectorAll('img:not([loading])');
      
      images.forEach((img, index) => {
        // Check if image is in viewport or close to it
        const rect = img.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight * 1.5;
        
        // Skip first two images (likely LCP)
        if (index < 2 || isInViewport) {
          // Set eager loading for images in viewport
          img.setAttribute('loading', 'eager');
          
          if (img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'sync');
          }
        } else {
          // Set lazy loading for images below the fold
          img.setAttribute('loading', 'lazy');
          
          if (!img.hasAttribute('decoding')) {
            img.setAttribute('decoding', 'async');
          }
          
          devLogger.recordChange('Image', `Added lazy loading to image: ${img.alt || img.src}`);
        }
      });
    }, 1000);
  },
  
  /**
   * Prioritize Largest Contentful Paint images
   */
  prioritizeLCP: () => {
    setTimeout(() => {
      // Find hero images and prioritize them
      const heroImages = document.querySelectorAll('.hero img, header img, section:first-of-type img');
      
      heroImages.forEach(img => {
        // Add fetchpriority high
        if (!img.hasAttribute('fetchpriority')) {
          img.setAttribute('fetchpriority', 'high');
          devLogger.recordChange('Image', `Prioritized LCP image: ${img.alt || img.src}`);
        }
      });
    }, 1000);
  },
  
  /**
   * Optimize background images for mobile
   */
  optimizeBackgroundImages: () => {
    setTimeout(() => {
      // Add a helper style to make background images load efficiently on mobile
      const style = document.createElement('style');
      style.id = 'mobile-image-optimizations';
      style.innerHTML = `
        @media (max-width: 767px) {
          /* Optimize background images */
          .mobile-enhanced [style*="background-image"] {
            background-size: cover;
            background-position: center;
          }
          
          /* Prevent layout shifts from images */
          .mobile-enhanced img:not([width]):not([height]) {
            aspect-ratio: 16/9;
          }
          
          /* Optimize NextJS Image component */
          .mobile-enhanced span[style*="padding"][style*="box-sizing: border-box"] > img {
            object-fit: cover !important;
          }
        }
      `;
      
      document.head.appendChild(style);
      devLogger.recordChange('CSS', 'Added background image optimizations');
    }, 500);
  },
  
  /**
   * Analyze image sizes and log issues
   */
  analyzeImages: () => {
    setTimeout(() => {
      const images = document.querySelectorAll('img');
      
      images.forEach(img => {
        const naturalSize = {
          width: img.naturalWidth,
          height: img.naturalHeight
        };
        
        const displaySize = {
          width: img.width,
          height: img.height
        };
        
        // Skip SVGs and tiny images
        if (img.src.includes('.svg') || (naturalSize.width < 100 && naturalSize.height < 100)) {
          return;
        }
        
        // Check if image is significantly larger than display size
        if (naturalSize.width > displaySize.width * 2) {
          devLogger.trackMobileIssue(
            'Image',
            `Oversized image (${naturalSize.width}x${naturalSize.height}) displayed at ${displaySize.width}x${displaySize.height}: ${img.alt || img.src}`
          );
        }
        
        // Check if image is missing width/height attributes
        if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
          devLogger.trackMobileIssue(
            'Image',
            `Missing width/height attributes (CLS risk): ${img.alt || img.src}`
          );
        }
      });
    }, 2000);
  }
};

export default ImageOptimizer; 