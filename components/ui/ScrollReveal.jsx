'use client';

import React, { useEffect, useRef } from 'react';

/**
 * ScrollReveal component that animates children when they enter the viewport
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to be revealed on scroll
 * @param {string} props.animation - Animation class to apply (fade-in, slide-up, etc.)
 * @param {number} props.delay - Delay before animation starts (in milliseconds)
 * @param {number} props.threshold - Viewport threshold for triggering (0-1)
 * @param {string} props.className - Additional classes to apply to the container
 * @returns {JSX.Element}
 */
const ScrollReveal = ({
  children,
  animation = 'scroll-fade-in',
  delay = 0,
  threshold = 0.2,
  className = '',
}) => {
  const elementRef = useRef(null);
  const hasAnimated = useRef(false);
  
  useEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;
    
    const element = elementRef.current;
    
    if (!element) return;
    
    // Create a style element for the delay if needed
    if (delay && !document.getElementById(`scroll-delay-${delay}`)) {
      const style = document.createElement('style');
      style.id = `scroll-delay-${delay}`;
      style.innerHTML = `
        .delay-${delay} {
          transition-delay: ${delay}ms !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    const handleIntersection = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated.current) {
          // Add the visible class which triggers the animation
          entry.target.classList.add('visible');
          hasAnimated.current = true;
          
          // Stop observing after animation
          observer.unobserve(entry.target);
        }
      });
    };
    
    // Set up the Intersection Observer
    const observer = new IntersectionObserver(handleIntersection, {
      root: null, // use viewport
      rootMargin: '0px',
      threshold: threshold,
    });
    
    // Start observing
    observer.observe(element);
    
    // Cleanup
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay, threshold]);
  
  return (
    <div 
      ref={elementRef}
      className={`${animation} ${delay ? `delay-${delay}` : ''} ${className}`}
      style={{ willChange: 'opacity, transform' }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal; 