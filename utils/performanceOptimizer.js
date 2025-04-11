/**
 * Performance Optimization Utility
 * 
 * This utility monitors and optimizes performance on mobile devices
 * without disrupting the existing website functionality.
 */

import devLogger from './dev-logger';

const PerformanceOptimizer = {
  /**
   * Initialize performance optimizations
   */
  init: () => {
    if (typeof window === 'undefined') return;
    
    devLogger.log('Initializing performance optimizations', 'info');
    
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    
    // Apply optimizations
    PerformanceOptimizer.monitorCoreWebVitals();
    PerformanceOptimizer.optimizeJavaScript();
    PerformanceOptimizer.optimizeRendering();
    
    devLogger.log('Performance optimizations applied', 'success');
  },
  
  /**
   * Monitor Core Web Vitals
   */
  monitorCoreWebVitals: () => {
    if (typeof window === 'undefined' || !window.performance) return;
    
    // Create a performance observer to measure LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      try {
        // LCP Observer
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          const lcp = lastEntry?.startTime || 0;
          
          devLogger.log(`LCP: ${Math.round(lcp)}ms`, lcp > 2500 ? 'warning' : 'success');
          
          // Record LCP status
          window.__CA_PERFORMANCE__ = window.__CA_PERFORMANCE__ || {};
          window.__CA_PERFORMANCE__.lcp = lcp;
        });
        
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // FID Observer (First Input Delay)
        const fidObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          entries.forEach(entry => {
            const fid = entry.processingStart - entry.startTime;
            
            devLogger.log(`FID: ${Math.round(fid)}ms`, fid > 100 ? 'warning' : 'success');
            
            // Record FID status
            window.__CA_PERFORMANCE__ = window.__CA_PERFORMANCE__ || {};
            window.__CA_PERFORMANCE__.fid = fid;
          });
        });
        
        fidObserver.observe({ type: 'first-input', buffered: true });
        
        // CLS Observer (Cumulative Layout Shift)
        let clsValue = 0;
        let clsEntries = [];
        
        const clsObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach(entry => {
            // Only count layout shifts without recent user input
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              clsEntries.push(entry);
            }
          });
          
          devLogger.log(`CLS: ${clsValue.toFixed(3)}`, clsValue > 0.1 ? 'warning' : 'success');
          
          // Record CLS status
          window.__CA_PERFORMANCE__ = window.__CA_PERFORMANCE__ || {};
          window.__CA_PERFORMANCE__.cls = clsValue;
        });
        
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
      } catch (e) {
        console.error('Performance monitoring error:', e);
      }
    }
    
    // Record basic navigation timing metrics
    window.addEventListener('load', () => {
      setTimeout(() => {
        if (window.performance && window.performance.timing) {
          const timing = window.performance.timing;
          const dcl = timing.domContentLoadedEventEnd - timing.navigationStart;
          const load = timing.loadEventEnd - timing.navigationStart;
          
          devLogger.log(`DOMContentLoaded: ${dcl}ms`, dcl > 2500 ? 'warning' : 'success');
          devLogger.log(`Load: ${load}ms`, load > 4000 ? 'warning' : 'success');
          
          // Record navigation timing
          window.__CA_PERFORMANCE__ = window.__CA_PERFORMANCE__ || {};
          window.__CA_PERFORMANCE__.dcl = dcl;
          window.__CA_PERFORMANCE__.load = load;
        }
      }, 0);
    });
  },
  
  /**
   * Optimize JavaScript execution
   */
  optimizeJavaScript: () => {
    if (typeof window === 'undefined') return;
    
    // Defer non-critical JavaScript
    setTimeout(() => {
      // Find and defer non-critical third-party scripts
      const deferScripts = [
        'script[src*="analytics"]', 
        'script[src*="pixel"]',
        'script[src*="track"]',
        'script[src*="chat"]',
        'script[src*="social"]'
      ];
      
      const nonCriticalScripts = document.querySelectorAll(deferScripts.join(','));
      nonCriticalScripts.forEach(script => {
        if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
          // Clone the script and set it to defer
          const newScript = document.createElement('script');
          
          // Copy all attributes
          Array.from(script.attributes).forEach(attr => {
            newScript.setAttribute(attr.name, attr.value);
          });
          
          // Set defer
          newScript.defer = true;
          
          // Replace the original script
          if (script.parentNode) {
            script.parentNode.replaceChild(newScript, script);
            devLogger.recordChange('Performance', `Deferred non-critical script: ${script.src || 'inline script'}`);
          }
        }
      });
    }, 2000);
    
    // Implement IntersectionObserver for lazy initialization
    const lazyInitObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Initialize only when visible
          if (element.dataset.lazyInit) {
            try {
              // Execute lazy initialization function
              new Function(element.dataset.lazyInit)();
              devLogger.recordChange('Performance', `Lazy initialized: ${element.id || element.className}`);
            } catch (e) {
              console.error('Lazy init error:', e);
            }
            
            // Remove from observer after initialization
            lazyInitObserver.unobserve(element);
          }
        }
      });
    }, { rootMargin: '200px' });
    
    // Find elements with data-lazy-init attribute
    document.querySelectorAll('[data-lazy-init]').forEach(element => {
      lazyInitObserver.observe(element);
    });
  },
  
  /**
   * Optimize rendering performance
   */
  optimizeRendering: () => {
    if (typeof window === 'undefined') return;
    
    // Add CSS containment to improve rendering performance
    setTimeout(() => {
      // Add containment to large sections with lots of content
      const containSelectors = [
        'section', 
        '.card', 
        '[class*="container"]', 
        '[class*="wrapper"]',
        '[class*="section"]'
      ];
      
      const containerElements = document.querySelectorAll(containSelectors.join(','));
      containerElements.forEach(element => {
        // Only apply to larger elements
        if (element.offsetHeight > 100 && element.offsetWidth > 100) {
          // Add contain property for layout optimization
          element.style.contain = 'content';
          
          // Add will-change hints for smoother animations on key elements
          if (
            element.classList.contains('hero') || 
            element.tagName.toLowerCase() === 'header' ||
            element.querySelector('img[class*="hero"]')
          ) {
            element.style.willChange = 'transform';
          }
        }
      });
      
      // Reduce GPU pressure by removing will-change after animations
      window.addEventListener('load', () => {
        setTimeout(() => {
          document.querySelectorAll('[style*="will-change"]').forEach(element => {
            element.style.willChange = 'auto';
          });
        }, 5000); // 5 seconds after load
      });
      
      // Add offscreen hint for better resource prioritization
      const offscreenAttr = 'loading';
      document.querySelectorAll('img:not([loading])').forEach(img => {
        const rect = img.getBoundingClientRect();
        const isOffscreen = rect.top > window.innerHeight * 2;
        
        if (isOffscreen) {
          img.setAttribute(offscreenAttr, 'lazy');
        }
      });
    }, 1000);
    
    // Monitor for layout shifts
    let lastLayoutShift = 0;
    let layoutShiftElements = [];
    
    if ('PerformanceObserver' in window) {
      try {
        const layoutShiftObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          
          entries.forEach(entry => {
            if (!entry.hadRecentInput && entry.value > 0.01) {
              lastLayoutShift = entry.value;
              
              if (entry.sources && entry.sources.length) {
                entry.sources.forEach(source => {
                  if (source.node) {
                    layoutShiftElements.push(source.node);
                    
                    // Log elements causing layout shifts in development
                    if (process.env.NODE_ENV === 'development') {
                      devLogger.trackMobileIssue('LayoutShift', `Layout shift caused by: ${source.node.tagName} ${source.node.id ? `#${source.node.id}` : ''} ${source.node.className ? `.${source.node.className.split(' ').join('.')}` : ''}`);
                      
                      // Add visual indicator in development
                      source.node.dataset.layoutShift = entry.value.toFixed(3);
                      source.node.style.outline = '2px solid red';
                    }
                  }
                });
              }
            }
          });
        });
        
        layoutShiftObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (e) {
        console.error('Layout shift monitoring error:', e);
      }
    }
  }
};

export default PerformanceOptimizer; 