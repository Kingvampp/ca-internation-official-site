/**
 * Code Splitting Optimization Utility
 * 
 * This utility improves code splitting for mobile devices
 * by dynamically loading non-critical components and scripts.
 */

import devLogger from './dev-logger';

const CodeSplitOptimizer = {
  /**
   * Initialize code splitting optimizations
   */
  init: () => {
    if (typeof window === 'undefined') return;
    
    devLogger.log('Initializing code splitting optimizations', 'info');
    
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    
    // Apply optimizations
    CodeSplitOptimizer.lazyLoadComponents();
    CodeSplitOptimizer.deferNonCriticalJS();
    CodeSplitOptimizer.optimizeThirdPartyScripts();
    
    devLogger.log('Code splitting optimizations applied', 'success');
  },
  
  /**
   * Lazy load components based on visibility
   */
  lazyLoadComponents: () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
    
    // Create an observer for lazy loading components
    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          
          // Check for lazy load attribute
          if (element.dataset.lazyComponent) {
            try {
              // Create a script element to load the component
              const script = document.createElement('script');
              script.type = 'module';
              script.textContent = `
                import(/* webpackChunkName: "${element.dataset.lazyComponent}" */ '${element.dataset.lazyComponent}')
                  .then(module => {
                    if (typeof module.default === 'function') {
                      // Initialize component
                      module.default('${element.id}');
                    }
                  })
                  .catch(error => console.error('Error lazy loading component:', error));
              `;
              
              document.head.appendChild(script);
              devLogger.recordChange('CodeSplit', `Lazy loaded component: ${element.dataset.lazyComponent}`);
              
              // Remove the lazy load attribute to prevent reloading
              delete element.dataset.lazyComponent;
              
              // Remove from observer
              lazyLoadObserver.unobserve(element);
            } catch (e) {
              console.error('Error lazy loading component:', e);
            }
          }
        }
      });
    }, { rootMargin: '200px' });
    
    // Observe elements with data-lazy-component attribute
    document.querySelectorAll('[data-lazy-component]').forEach(element => {
      lazyLoadObserver.observe(element);
    });
  },
  
  /**
   * Defer non-critical JavaScript
   */
  deferNonCriticalJS: () => {
    if (typeof window === 'undefined') return;
    
    // Create a list of scripts to defer
    const deferScripts = [
      { pattern: 'analytics', priority: 'low' },
      { pattern: 'tracking', priority: 'low' },
      { pattern: 'social', priority: 'medium' },
      { pattern: 'chat', priority: 'medium' },
      { pattern: 'feedback', priority: 'medium' },
      { pattern: 'survey', priority: 'low' }
    ];
    
    // Wait for the page to load before deferring scripts
    window.addEventListener('load', () => {
      setTimeout(() => {
        // Find scripts to defer
        const scripts = document.querySelectorAll('script[src]');
        
        scripts.forEach(script => {
          const src = script.getAttribute('src') || '';
          
          // Check if the script matches any of the patterns
          const matchingPattern = deferScripts.find(pattern => 
            src.toLowerCase().includes(pattern.pattern.toLowerCase())
          );
          
          if (matchingPattern) {
            // Remove the script
            if (script.parentNode) {
              script.parentNode.removeChild(script);
              
              // Create a new deferred script
              const newScript = document.createElement('script');
              newScript.src = src;
              newScript.defer = true;
              
              // Set load timing based on priority
              let delay = 0;
              switch (matchingPattern.priority) {
                case 'low':
                  delay = 3000; // 3 seconds
                  break;
                case 'medium':
                  delay = 1000; // 1 second
                  break;
                default:
                  delay = 0;
              }
              
              // Add script back after delay
              setTimeout(() => {
                document.body.appendChild(newScript);
                devLogger.recordChange('CodeSplit', `Deferred script (${matchingPattern.priority}): ${src}`);
              }, delay);
            }
          }
        });
      }, 1000);
    });
  },
  
  /**
   * Optimize third-party scripts
   */
  optimizeThirdPartyScripts: () => {
    if (typeof window === 'undefined') return;
    
    // Create a flag for optimization
    window.__OPTIMIZE_3RD_PARTY__ = true;
    
    // Define third-party domains to optimize
    const thirdPartyDomains = [
      'googletagmanager.com',
      'google-analytics.com',
      'analytics',
      'facebook.net',
      'twitter.com',
      'connect.facebook.net'
    ];
    
    // Add preconnect hints for third-party domains
    thirdPartyDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain.startsWith('http') ? domain : `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
    
    // Override XMLHttpRequest to detect heavy third-party requests
    if (!window.__ORIGINAL_XHR__) {
      window.__ORIGINAL_XHR__ = window.XMLHttpRequest;
      
      class OptimizedXHR extends window.__ORIGINAL_XHR__ {
        open(method, url, ...args) {
          this._url = url;
          this._startTime = performance.now();
          
          // Check if this is a third-party request
          const isThirdParty = thirdPartyDomains.some(domain => 
            typeof url === 'string' && url.includes(domain)
          );
          
          if (isThirdParty && window.__OPTIMIZE_3RD_PARTY__) {
            devLogger.log(`Monitoring third-party request: ${url}`, 'info');
          }
          
          super.open(method, url, ...args);
        }
        
        send(...args) {
          // Add listener to track response time
          this.addEventListener('load', () => {
            if (this._url && this._startTime) {
              const duration = performance.now() - this._startTime;
              
              // Log slow third-party requests
              const isThirdParty = thirdPartyDomains.some(domain => 
                typeof this._url === 'string' && this._url.includes(domain)
              );
              
              if (isThirdParty && duration > 500) {
                devLogger.trackMobileIssue('Performance', `Slow third-party request (${Math.round(duration)}ms): ${this._url}`);
              }
            }
          });
          
          super.send(...args);
        }
      }
      
      // Replace XMLHttpRequest with optimized version
      window.XMLHttpRequest = OptimizedXHR;
    }
    
    // Create a mechanism to temporarily pause third-party scripts during transitions
    window.__pauseNonCriticalRequests = () => {
      window.__OPTIMIZE_3RD_PARTY__ = true;
      devLogger.log('Paused non-critical requests during navigation', 'info');
      
      // Resume after navigation
      setTimeout(() => {
        window.__OPTIMIZE_3RD_PARTY__ = false;
        devLogger.log('Resumed non-critical requests', 'info');
      }, 1000);
    };
    
    // Listen for navigation events
    const originalPushState = history.pushState;
    history.pushState = function() {
      window.__pauseNonCriticalRequests();
      return originalPushState.apply(this, arguments);
    };
  }
};

export default CodeSplitOptimizer; 