'use client';

import React from 'react';
import PageTransition from '../../components/ui/PageTransition';
import ScrollRevealExample from '../../components/ui/ScrollRevealExample';
import { useLanguage } from '../../utils/LanguageContext';

/**
 * UI Showcase page to demonstrate the Professional UI Enhancements
 * This page showcases typography, animations, and other UI improvements
 */
export default function UIShowcase() {
  const { t } = useLanguage();
  
  return (
    <PageTransition>
      <div className="container mx-auto py-12 px-4">
        <h1 className="mb-8 text-center">UI Enhancement Showcase</h1>
        
        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="h2 mb-8">Typography System</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h3 className="h3 mb-4">Heading Hierarchy</h3>
            
            <div className="space-y-6">
              <div>
                <h1 className="h1">Heading 1 (h1)</h1>
                <p className="text-gray-500">Used for page titles and main headings</p>
              </div>
              
              <div>
                <h2 className="h2">Heading 2 (h2)</h2>
                <p className="text-gray-500">Used for section titles</p>
              </div>
              
              <div>
                <h3 className="h3">Heading 3 (h3)</h3>
                <p className="text-gray-500">Used for subsection titles</p>
              </div>
              
              <div>
                <h4 className="h4">Heading 4 (h4)</h4>
                <p className="text-gray-500">Used for card titles and minor sections</p>
              </div>
              
              <div>
                <h5 className="h5">Heading 5 (h5)</h5>
                <p className="text-gray-500">Used for small titles and labels</p>
              </div>
              
              <div>
                <h6 className="h6">Heading 6 (h6)</h6>
                <p className="text-gray-500">Used for small subtitles</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="h3 mb-4">Text Styles</h3>
            
            <div className="space-y-6">
              <div>
                <p className="lead">Lead Paragraph</p>
                <p className="text-gray-500">Used for introductory text and important paragraphs</p>
              </div>
              
              <div>
                <p className="body">Body Text</p>
                <p className="text-gray-500">Standard paragraph text used throughout the site</p>
              </div>
              
              <div>
                <p className="small">Small Text</p>
                <p className="text-gray-500">Used for captions, footnotes, and supplementary information</p>
              </div>
              
              <div>
                <p className="accent-text">Accent Text</p>
                <p className="text-gray-500">Used for quotes, emphasis, and special callouts</p>
              </div>
              
              <div>
                <a href="#" className="text-teal-700 hover:text-teal-600">Link Style</a>
                <p className="text-gray-500">Interactive links with hover effects</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Animation Section */}
        <section className="mb-16">
          <h2 className="h2 mb-8">Animation System</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h3 className="h3 mb-4">Hover Effects</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="hover-lift bg-gray-50 p-6 rounded-lg">
                <h4 className="h4">Hover Lift</h4>
                <p>Hover over this card to see it lift slightly with a shadow effect.</p>
              </div>
              
              <div className="hover-glow bg-gray-50 p-6 rounded-lg">
                <h4 className="h4">Hover Glow</h4>
                <p>Hover over this card to see a subtle glow effect around the edges.</p>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <button className="btn-pulse bg-teal-600 text-white py-2 px-4 rounded">
                  Click Me
                </button>
                <p className="mt-3">Click the button to see a ripple effect.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="h3 mb-4">Scroll Animations</h3>
            <p className="mb-6">Scroll down to see various scroll-triggered animations in action.</p>
            
            <ScrollRevealExample />
          </div>
        </section>
        
        {/* Button & Form Styles */}
        <section className="mb-16">
          <h2 className="h2 mb-8">Interactive Elements</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="h3 mb-4">Buttons & Form Elements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="h4 mb-4">Button Styles</h4>
                <div className="space-y-4">
                  <div>
                    <button className="bg-teal-600 text-white py-2 px-6 rounded-md shadow-sm">
                      Primary Button
                    </button>
                  </div>
                  
                  <div>
                    <button className="bg-white border border-teal-600 text-teal-600 py-2 px-6 rounded-md shadow-sm">
                      Secondary Button
                    </button>
                  </div>
                  
                  <div>
                    <button className="bg-gray-200 text-gray-800 py-2 px-6 rounded-md shadow-sm">
                      Tertiary Button
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="h4 mb-4">Form Elements</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Input</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded-md" 
                      placeholder="Type something..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Select Input</label>
                    <select className="w-full p-2 border border-gray-300 rounded-md">
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Checkbox</label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span>I agree to terms</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Colors & Theme */}
        <section>
          <h2 className="h2 mb-8">Color System</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="h3 mb-4">Brand Colors</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-6 bg-teal-700 text-white rounded">
                <p className="font-bold">Primary</p>
                <p className="text-xs opacity-80">#0f766e</p>
              </div>
              
              <div className="p-6 bg-teal-500 text-white rounded">
                <p className="font-bold">Secondary</p>
                <p className="text-xs opacity-80">#14b8a6</p>
              </div>
              
              <div className="p-6 bg-gray-800 text-white rounded">
                <p className="font-bold">Dark</p>
                <p className="text-xs opacity-80">#1f2937</p>
              </div>
              
              <div className="p-6 bg-gray-100 text-gray-800 rounded border border-gray-200">
                <p className="font-bold">Light</p>
                <p className="text-xs opacity-80">#f3f4f6</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
} 