'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';

/**
 * Example component demonstrating how to use ScrollReveal in sections
 * This can be used as a reference for implementing scroll animations in other components
 */
const ScrollRevealExample = () => {
  return (
    <div className="container mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-12">How to Use Scroll Reveal</h2>
      
      {/* Basic Fade In */}
      <section className="mb-16">
        <ScrollReveal>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4">Basic Fade In</h3>
            <p className="mb-4">
              This element uses the default scroll-fade-in animation.
              It will animate when it enters the viewport.
            </p>
            <code className="block bg-gray-100 p-4 rounded">
              {`<ScrollReveal>
  <div>Your content here</div>
</ScrollReveal>`}
            </code>
          </div>
        </ScrollReveal>
      </section>
      
      {/* With Delay */}
      <section className="mb-16">
        <ScrollReveal animation="scroll-fade-in" delay={200}>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4">With Delay</h3>
            <p className="mb-4">
              This element uses a 200ms delay before starting the animation.
              Useful for creating staggered animations.
            </p>
            <code className="block bg-gray-100 p-4 rounded">
              {`<ScrollReveal animation="scroll-fade-in" delay={200}>
  <div>Your content here</div>
</ScrollReveal>`}
            </code>
          </div>
        </ScrollReveal>
      </section>
      
      {/* Staggered Items */}
      <section className="mb-16">
        <h3 className="text-xl font-semibold mb-6 text-center">Staggered Animation</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <ScrollReveal key={i} animation="scroll-fade-in" delay={i * 150}>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h4 className="font-medium mb-2">Card {i + 1}</h4>
                <p>These cards animate one after another with staggered delays.</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal delay={500}>
          <code className="block bg-gray-100 p-4 rounded mt-6">
            {`// For staggered animations, use increasing delays
{items.map((item, i) => (
  <ScrollReveal key={i} delay={i * 150}>
    <div>Card {i}</div>
  </ScrollReveal>
))}`}
          </code>
        </ScrollReveal>
      </section>
      
      {/* Custom Threshold */}
      <section className="mb-16">
        <ScrollReveal threshold={0.5}>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4">Custom Threshold</h3>
            <p className="mb-4">
              This element uses a higher threshold (0.5), meaning more of the element
              needs to be visible before animating.
            </p>
            <code className="block bg-gray-100 p-4 rounded">
              {`<ScrollReveal threshold={0.5}>
  <div>Your content here</div>
</ScrollReveal>`}
            </code>
          </div>
        </ScrollReveal>
      </section>
      
      {/* Best Practices */}
      <section>
        <ScrollReveal>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use subtle animations that don't distract from content</li>
              <li>Avoid excessive animations on a single page</li>
              <li>Use appropriate thresholds based on content importance</li>
              <li>Consider reduced motion preferences for accessibility</li>
              <li>Stagger animations to create a natural flow</li>
            </ul>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default ScrollRevealExample; 