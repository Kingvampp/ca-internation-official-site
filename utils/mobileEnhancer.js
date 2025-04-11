/**
 * Mobile Experience Enhancer
 * 
 * This utility enhances mobile experience without modifying existing components.
 * It uses JavaScript to add touch-friendly enhancements and performance improvements.
 */

import devLogger from './dev-logger';

const MobileEnhancer = {
  /**
   * Initialize mobile enhancements
   */
  init: () => {
    if (typeof window === 'undefined') return;
    
    devLogger.log('Initializing mobile enhancements', 'info');
    
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    
    // Apply enhancements
    MobileEnhancer.enhanceTouchTargets();
    MobileEnhancer.improveNavigation();
    MobileEnhancer.monitorPerformance();
    
    devLogger.log('Mobile enhancements applied', 'success');
  },
  
  /**
   * Enhance touch targets for better mobile experience
   */
  enhanceTouchTargets: () => {
    // Find small touch targets and log them
    setTimeout(() => {
      const smallTouchTargets = document.querySelectorAll(
        'button:not([style*="display: none"]), a:not([style*="display: none"]), input, select, textarea'
      );
      
      smallTouchTargets.forEach(element => {
        const rect = element.getBoundingClientRect();
        const touchTargetSize = Math.min(rect.width, rect.height);
        
        // Log if the touch target is too small (44px is recommended minimum)
        if (touchTargetSize < 44) {
          devLogger.trackMobileIssue(
            'TouchTarget',
            `Small touch target (${Math.round(touchTargetSize)}px) found: ${element.outerHTML.slice(0, 50)}...`
          );
          
          // Add a class to highlight small touch targets during development
          if (process.env.NODE_ENV === 'development') {
            element.classList.add('dev-small-touch-target');
            // Add development-only styles
            const style = document.createElement('style');
            style.innerHTML = `
              .dev-small-touch-target {
                outline: 2px dashed #f59e0b !important;
                outline-offset: 2px;
              }
            `;
            document.head.appendChild(style);
          }
        }
      });
    }, 1000); // Wait for page to fully render
  },
  
  /**
   * Improve mobile navigation experience
   */
  improveNavigation: () => {
    // Wait for the DOM to be ready
    setTimeout(() => {
      // Identify the mobile menu toggle
      const mobileMenuToggle = document.querySelector('button[aria-label="Open menu"], button[aria-label="Close menu"]');
      
      if (mobileMenuToggle) {
        // Ensure the toggle has appropriate aria attributes
        if (!mobileMenuToggle.hasAttribute('aria-expanded')) {
          mobileMenuToggle.setAttribute('aria-expanded', 'false');
          devLogger.recordChange('Navigation', 'Added aria-expanded attribute to mobile menu toggle');
        }
        
        // Enhance the toggle button to be more accessible
        if (mobileMenuToggle.clientWidth < 44 || mobileMenuToggle.clientHeight < 44) {
          mobileMenuToggle.style.padding = '12px';
          devLogger.recordChange('Navigation', 'Increased mobile menu toggle touch target size');
        }
      }
      
      // Add active page indicator to mobile menu
      const currentPath = window.location.pathname;
      const mobileLinks = document.querySelectorAll('nav a');
      
      mobileLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
          link.classList.add('mobile-active-page');
          
          // Add development-only styles for active page
          if (process.env.NODE_ENV === 'development') {
            const style = document.createElement('style');
            style.innerHTML = `
              .mobile-active-page {
                font-weight: bold !important;
                color: #3b82f6 !important;
              }
            `;
            document.head.appendChild(style);
          }
          
          devLogger.recordChange('Navigation', `Highlighted active page in mobile menu: ${currentPath}`);
        }
      });
    }, 1000);
  },
  
  /**
   * Monitor performance metrics
   */
  monitorPerformance: () => {
    if (typeof window === 'undefined' || !window.performance) return;
    
    // Monitor performance metrics
    setTimeout(() => {
      const perfEntries = performance.getEntriesByType('navigation');
      if (perfEntries.length > 0) {
        const timing = perfEntries[0];
        
        // Log performance metrics
        devLogger.log(`Page Load Time: ${timing.loadEventEnd - timing.startTime}ms`, 'info');
        devLogger.log(`Time to First Byte: ${timing.responseStart - timing.requestStart}ms`, 'info');
        devLogger.log(`DOM Content Loaded: ${timing.domContentLoadedEventEnd - timing.startTime}ms`, 'info');
        devLogger.log(`DOM Interactive: ${timing.domInteractive - timing.startTime}ms`, 'info');
      }
    }, 2000);
  }
};

export default MobileEnhancer; 