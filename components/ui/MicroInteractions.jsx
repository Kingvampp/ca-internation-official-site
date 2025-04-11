'use client';

import React, { useEffect } from 'react';

/**
 * MicroInteractions component adds subtle animations and effects to interactive elements
 * This component uses JavaScript to enhance interactive elements with smooth animations
 * 
 * @returns {null} This component doesn't render anything visible
 */
const MicroInteractions = () => {
  useEffect(() => {
    // Add hover effects to buttons
    const enhanceButtons = () => {
      const buttons = document.querySelectorAll('button, .btn');
      
      buttons.forEach(button => {
        if (!button.classList.contains('micro-enhanced')) {
          // Add press effect
          button.classList.add('button-press');
          
          // Add ripple effect handler for clicks
          button.addEventListener('click', createRippleEffect);
          
          // Mark as enhanced
          button.classList.add('micro-enhanced');
        }
      });
    };
    
    // Add ripple effect to clicks
    const createRippleEffect = (event) => {
      const button = event.currentTarget;
      
      // Create ripple element
      const ripple = document.createElement('span');
      ripple.classList.add('ripple-effect');
      
      // Calculate position
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - size / 2;
      const y = event.clientY - rect.top - size / 2;
      
      // Style the ripple
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      // Add to button
      button.appendChild(ripple);
      
      // Remove after animation
      setTimeout(() => {
        ripple.remove();
      }, 600);
    };
    
    // Add smooth focus styles to form elements
    const enhanceFormElements = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      
      inputs.forEach(input => {
        if (!input.classList.contains('micro-enhanced')) {
          input.classList.add('input-focus-effect');
          input.classList.add('micro-enhanced');
        }
      });
    };
    
    // Add hover lift effect to cards
    const enhanceCards = () => {
      const cards = document.querySelectorAll('.card, .gallery-card');
      
      cards.forEach(card => {
        if (!card.classList.contains('micro-enhanced')) {
          card.classList.add('hover-lift');
          card.classList.add('micro-enhanced');
        }
      });
    };
    
    // Run enhancements initially
    enhanceButtons();
    enhanceFormElements();
    enhanceCards();
    
    // Set up mutation observer to catch dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          enhanceButtons();
          enhanceFormElements();
          enhanceCards();
        }
      });
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Cleanup
    return () => {
      observer.disconnect();
      
      // Remove event listeners
      const enhancedButtons = document.querySelectorAll('.micro-enhanced');
      enhancedButtons.forEach(button => {
        button.removeEventListener('click', createRippleEffect);
      });
    };
  }, []);
  
  // Add global styles for effects
  useEffect(() => {
    // Create style element if it doesn't exist
    if (!document.getElementById('micro-interactions-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'micro-interactions-styles';
      
      // Add styles for ripple effect
      styleElement.textContent = `
        .ripple-effect {
          position: absolute;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        }
        
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      
      document.head.appendChild(styleElement);
    }
  }, []);
  
  // This component doesn't render anything visible
  return null;
};

export default MicroInteractions; 