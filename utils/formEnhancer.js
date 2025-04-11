/**
 * Form Enhancement Utility
 * 
 * This utility improves form usability on mobile devices without
 * modifying existing components directly.
 */

import devLogger from './dev-logger';

const FormEnhancer = {
  /**
   * Initialize form enhancements
   */
  init: () => {
    if (typeof window === 'undefined') return;
    
    devLogger.log('Initializing form enhancements', 'info');
    
    // Only run on mobile devices
    const isMobile = window.innerWidth < 768;
    if (!isMobile) return;
    
    // Apply enhancements
    FormEnhancer.optimizeInputTypes();
    FormEnhancer.improveFormLayout();
    FormEnhancer.addAccessibilityFeatures();
    
    devLogger.log('Form enhancements applied', 'success');
  },
  
  /**
   * Optimize input types for mobile
   */
  optimizeInputTypes: () => {
    setTimeout(() => {
      // Find form fields and optimize their types
      const inputMap = {
        // Detect email fields
        email: [
          'input[type="text"][name*="email" i]',
          'input[name*="email" i]',
          'input[placeholder*="email" i]'
        ],
        // Detect phone fields
        tel: [
          'input[type="text"][name*="phone" i]',
          'input[type="text"][name*="tel" i]',
          'input[name*="phone" i]',
          'input[placeholder*="phone" i]',
          'input[placeholder*="tel" i]'
        ],
        // Detect number fields
        number: [
          'input[name*="number" i]:not([name*="phone" i]):not([name*="tel" i])',
          'input[name*="zip" i]',
          'input[name*="postal" i]',
          'input[name*="age" i]',
          'input[name*="year" i]'
        ],
        // Detect date fields
        date: [
          'input[name*="date" i]',
          'input[placeholder*="date" i]',
          'input[name*="birthday" i]',
          'input[name*="dob" i]'
        ],
        // Detect URL fields
        url: [
          'input[name*="website" i]',
          'input[name*="url" i]',
          'input[placeholder*="website" i]'
        ]
      };
      
      // Process each input type
      Object.entries(inputMap).forEach(([type, selectors]) => {
        // Join all selectors for this type
        const combinedSelector = selectors.join(', ');
        const inputs = document.querySelectorAll(combinedSelector);
        
        inputs.forEach(input => {
          // Only change type if it's currently text or not set
          if (input.type === 'text' || input.type === '') {
            const originalType = input.type;
            input.type = type;
            
            devLogger.recordChange('Form', `Changed input type from ${originalType || 'unspecified'} to ${type}: ${input.name || 'unnamed input'}`);
          }
        });
      });
      
      // Add autofocus for the first field
      const firstInput = document.querySelector('form input:not([type="hidden"]):not([disabled])');
      if (firstInput && document.activeElement !== firstInput) {
        // Don't autofocus if the user is already interacting with the page
        if (document.visibilityState === 'visible' && !document.querySelector(':focus')) {
          // Delay focus to prevent mobile keyboard from immediately appearing on page load
          setTimeout(() => {
            firstInput.focus();
          }, 1000);
        }
      }
    }, 500);
  },
  
  /**
   * Improve form layout for mobile
   */
  improveFormLayout: () => {
    setTimeout(() => {
      // Find all forms
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        // Add mobile-form class for CSS targeting
        form.classList.add('mobile-form');
        
        // Find all inputs and textareas
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
          // Ensure inputs have proper attributes
          if (!input.hasAttribute('autocapitalize')) {
            // Disable autocapitalize for email and username fields
            if (
              input.type === 'email' || 
              input.name?.toLowerCase().includes('email') || 
              input.name?.toLowerCase().includes('user')
            ) {
              input.setAttribute('autocapitalize', 'off');
            } else {
              input.setAttribute('autocapitalize', 'sentences');
            }
          }
          
          // Adjust textarea behavior
          if (input.tagName === 'TEXTAREA' && !input.hasAttribute('rows')) {
            input.setAttribute('rows', '4');
          }
          
          // Add better validation cues
          if (input.hasAttribute('required') && !input.classList.contains('required-field')) {
            input.classList.add('required-field');
            
            // Add 'required' to placeholder if not already there
            if (input.hasAttribute('placeholder') && !input.getAttribute('placeholder').includes('*')) {
              input.setAttribute('placeholder', `${input.getAttribute('placeholder')} *`);
            }
          }
        });
        
        // Make submit buttons more mobile-friendly
        const submitButtons = form.querySelectorAll('button[type="submit"], input[type="submit"]');
        submitButtons.forEach(button => {
          button.classList.add('mobile-submit');
        });
      });
      
      // Add CSS for mobile forms if not already added
      if (!document.getElementById('mobile-form-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-form-styles';
        style.innerHTML = `
          @media (max-width: 767px) {
            .mobile-enhanced .mobile-form input,
            .mobile-enhanced .mobile-form select,
            .mobile-enhanced .mobile-form textarea {
              font-size: 16px;
              padding: 12px;
              margin-bottom: 16px;
              border-radius: 8px;
              width: 100%;
              max-width: 100%;
              box-sizing: border-box;
            }
            
            .mobile-enhanced .mobile-form .mobile-submit {
              min-height: 48px;
              font-size: 16px;
              width: 100%;
              margin-top: 8px;
            }
            
            .mobile-enhanced .mobile-form .required-field:not(:focus):invalid {
              border-color: #f87171;
            }
          }
        `;
        document.head.appendChild(style);
        
        devLogger.recordChange('Form', 'Added mobile-friendly form styles');
      }
    }, 500);
  },
  
  /**
   * Add accessibility features to forms
   */
  addAccessibilityFeatures: () => {
    setTimeout(() => {
      // Find all forms
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
        // Find all inputs
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
          // Skip hidden and submit inputs
          if (input.type === 'hidden' || input.type === 'submit') return;
          
          // Check if input has a label
          const id = input.id || '';
          const hasLabel = id ? !!document.querySelector(`label[for="${id}"]`) : false;
          
          // Add aria-label for accessibility if no label
          if (!hasLabel && !input.hasAttribute('aria-label')) {
            // Use placeholder or name for the label
            const labelText = input.placeholder || input.name || '';
            if (labelText) {
              input.setAttribute('aria-label', labelText.replace(/[-_]/g, ' '));
            }
          }
        });
        
        // Add form validation feedback
        form.addEventListener('submit', (e) => {
          // Find the first invalid field
          const invalidField = form.querySelector(':invalid');
          if (invalidField) {
            // Scroll to the invalid field
            invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Focus the invalid field after scrolling
            setTimeout(() => {
              invalidField.focus();
            }, 500);
          }
        });
      });
    }, 1000);
  }
};

export default FormEnhancer; 