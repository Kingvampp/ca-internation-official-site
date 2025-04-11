'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import OptimizedImage from './OptimizedImage';
import { useLanguage } from '../context/LanguageContext';

const transformations = [
  {
    id: 1,
    title: 'Classic Thunderbird Restoration',
    beforeImage: '/images/before-1.jpg',
    afterImage: '/images/after-1.jpg',
    description: 'Complete restoration of a classic Ford Thunderbird, bringing back its original beauty and elegance',
  },
  {
    id: 2,
    title: 'Porsche 911 Detail & Paint Correction',
    beforeImage: '/images/before-4-bmwe90-front.jpg',
    afterImage: '/images/After-4-bmwe90-front.jpg',
    fallbackBeforeImage: '/images/before-5.svg',
    fallbackAfterImage: '/images/after-5.svg',
    description: 'Professional paint correction and detailing for a stunning Porsche 911',
  },
  {
    id: 3,
    title: 'Bentley Continental Collision Repair',
    beforeImage: '/images/Before-3-blackjeep-front.jpg',
    afterImage: '/images/After-3-blackjeep-front.jpg',
    description: 'Expert collision repair for a luxury Bentley Continental, restoring its pristine condition',
  },
  {
    id: 4,
    title: '1965 Ford Mustang Restoration',
    beforeImage: '/images/Before-8-bluemustang-front.jpg',
    afterImage: '/images/After-8-bluemustang-front.jpg',
    description: 'Meticulous restoration of a classic 1965 Ford Mustang to showroom quality',
  },
  {
    id: 5,
    title: 'BMW E90 Complete Restoration',
    beforeImage: '/images/Before-4-bmwe90-front.jpg',
    afterImage: '/images/After-4-bmwe90-front.jpg',
    description: 'Full restoration of a BMW E90 with custom paint and body work',
  },
];

const GalleryTeaser = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    // Log the transformations to help debug
    console.log('Transformations:', transformations);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { current: container } = scrollContainerRef;
      const scrollAmount = direction === 'left' ? -container.offsetWidth / 2 : container.offsetWidth / 2;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-16 bg-[var(--gray-light)]">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            {t('galleryTeaser.title', 'Our Transformations')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 text-center">
            {t('galleryTeaser.subtitle', 'See the dramatic before-and-after results of our expert craftsmanship.')}
          </p>
        </div>
        
        <div className="relative">
          {/* Scroll buttons */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
            aria-label="Scroll left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md"
            aria-label="Scroll right"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Scrollable container */}
          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto pb-8 hide-scrollbar snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none' }}
          >
            {transformations.map((item) => (
              <div 
                key={item.id}
                className="min-w-[300px] md:min-w-[400px] px-4 snap-start"
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-1/2 h-48 relative bg-gray-300">
                      {/* Before image */}
                      <div className="relative w-full h-full">
                        <OptimizedImage 
                          src={item.beforeImage}
                          alt={`Before - ${item.title}`}
                          fill
                          className="object-cover"
                          priority={item.id === 2}
                          quality={85}
                          fallbackSrc={(item as any).fallbackBeforeImage}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/50 group-hover:bg-black/30 transition-colors">
                          {t('galleryTeaser.before', 'Before')}
                        </div>
                      </div>
                    </div>
                    <div className="w-full md:w-1/2 h-48 relative bg-gray-300">
                      {/* After image */}
                      <div className="relative w-full h-full">
                        <OptimizedImage 
                          src={item.afterImage}
                          alt={`After - ${item.title}`}
                          fill
                          className="object-cover"
                          priority={item.id === 2}
                          quality={85}
                          fallbackSrc={(item as any).fallbackAfterImage}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/50 group-hover:bg-black/30 transition-colors">
                          {t('galleryTeaser.after', 'After')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold">{item.title}</h3>
                    {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-8">
          <Link href="/gallery" className="btn btn-primary">
            <span>{t('galleryTeaser.viewGallery', 'See More Transformations')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default GalleryTeaser; 