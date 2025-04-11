import React, { useState, useRef, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const reviews = [
  // ... existing reviews array
];

const Reviews = () => {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // ... rest of component state and refs

  // ... existing useEffect and functions

  return (
    <section className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('reviews.title', 'What Our Customers Say')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('reviews.subtitle', 'Hear from our satisfied customers about their experience with CA International Autobody.')}
          </p>
        </div>

        {/* ... rest of JSX with translation keys for navigation */}
        <button
          onClick={() => handleSlideChange('prev')}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <span className="sr-only">{t('reviews.previous', 'Previous')}</span>
          {/* ... icon */}
        </button>
        <button
          onClick={() => handleSlideChange('next')}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <span className="sr-only">{t('reviews.next', 'Next')}</span>
          {/* ... icon */}
        </button>

        {/* ... ratings display */}
        <div className="flex items-center">
          {/* ... stars */}
          <span className="text-black font-semibold">{review.rating}</span>
          <span className="font-medium ml-1">
            {t('reviews.outOf', 'out of 5')}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Reviews; 