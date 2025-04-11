'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import I18nLoader from './I18nLoader';

const Hero = () => {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);
  const [activeStorefrontImage, setActiveStorefrontImage] = useState(0);
  const [animateHeadline, setAnimateHeadline] = useState(true);

  // Create slides with translations
  const slides = [
    {
      id: 2,
      image: '/images/hero-2.jpg',
      alt: t('hero.slide2.alt', 'Classic car restoration'),
      title: t('hero.slide2.title', 'Classic Car Restoration'),
      subtitle: t('hero.slide2.subtitle', 'Bringing timeless beauty back to life'),
    },
    {
      id: 3,
      image: '/images/hero-3.jpg',
      alt: t('hero.slide3.alt', 'Custom paint job'),
      title: t('hero.slide3.title', 'Premium Custom Paint'),
      subtitle: t('hero.slide3.subtitle', 'Flawless finishes that turn heads'),
    },
    {
      id: 1,
      image: '/images/hero-1.jpg',
      alt: t('hero.slide1.alt', 'Luxury car transformation'),
      title: t('hero.slide1.title', 'Auto Body Repair'),
      subtitle: t('hero.slide1.subtitle', 'Restoring your vehicle to its original glory'),
    },
  ];

  // Store front images for the scrollable gallery
  const storeFrontImages = [
    {
      id: 2,
      image: '/images/hero-2.jpg',
      alt: t('hero.storefront2.alt', 'CA International Automotive team with classic Mercedes'),
    },
    {
      id: 3,
      image: '/images/hero-3.jpg',
      alt: t('hero.storefront3.alt', 'CA International Automotive staff with yellow Jaguar E-Type'),
    },
    {
      id: 1,
      image: '/images/hero-1.jpg',
      alt: t('hero.storefront1.alt', 'CA International Automotive Store Front with Mercedes vehicles'),
    },
  ];

  // Auto-advance slides with interval
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoScroll, slides.length]);

  // Auto-advance storefront images
  useEffect(() => {
    if (!autoScroll) return;
    
    const interval = setInterval(() => {
      setActiveStorefrontImage((prev) => (prev + 1) % storeFrontImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [autoScroll, storeFrontImages.length]);

  // Animation for headline - reset animation on slide change
  useEffect(() => {
    setAnimateHeadline(false);
    const timeout = setTimeout(() => {
      setAnimateHeadline(true);
    }, 50);
    
    return () => clearTimeout(timeout);
  }, [currentSlide]);

  // Event handlers for pausing auto-scroll
  const handleMouseEnter = () => setAutoScroll(false);
  const handleMouseLeave = () => setAutoScroll(true);
  const handleTouchStart = () => setAutoScroll(false);
  const handleTouchEnd = () => setAutoScroll(true);
  
  // Change to specific slide
  const goToImage = (index: number) => {
    setCurrentSlide(index);
  };

  const HeroContent = () => (
    <div className="relative w-full overflow-hidden h-[calc(100vh-90px)]">
      {/* Racing stripes at the top */}
      <div className="absolute top-0 left-0 right-0 flex h-2 z-20">
        <div className="w-1/3 bg-[var(--accent)]"></div>
        <div className="w-1/3 bg-[var(--accent-secondary)]"></div>
        <div className="w-1/3 bg-[var(--gold)]"></div>
      </div>
      
      {/* Storefront Images with Fade Transition */}
      <div className="absolute inset-0 top-2">
        {storeFrontImages.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1500 ${
              index === activeStorefrontImage ? 'opacity-100' : 'opacity-0'
            }`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="w-full h-full relative"
              style={{
                backgroundImage: `url(${image.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'brightness(0.8) contrast(1.1) saturate(1.1)',
              }}
            >
              {/* Actual storefront images */}
            </div>
            
            {/* Edge fading overlays */}
            <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/50 to-transparent"></div>
            <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/50 to-transparent"></div>
            
            {/* Overlay gradient for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            
            {/* Diagonal accent line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[var(--accent)]"></div>
            <div className="absolute bottom-0 right-0 w-1/3 h-1 bg-[var(--gold)]"></div>
          </div>
        ))}
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4 py-0">
        <div className="max-w-3xl">
          {/* Premium Badge */}
          <div className="inline-block bg-[var(--accent)] text-white px-4 py-2 rounded-full mb-8 animate-fade-in">
            <p className="text-sm font-bold tracking-wider uppercase translatable">
              {t('hero.tagline', "SAN FRANCISCO'S PREMIER AUTO REPAIR SHOP")}
            </p>
          </div>
          
          {/* Hero Title with Animation */}
          <div className={`${animateHeadline ? 'animate-fade-in' : ''}`}>
            <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-lg">
              <span className="block mb-2 translatable">{t('home.hero.welcome', 'Welcome to')}</span>
              <span className="block text-[var(--gold)] notranslate">CA International Automotive</span>
            </h1>
          </div>
          
          {/* Hero Subtitle */}
          <p className="text-white text-xl mb-8 max-w-2xl animate-fade-in animation-delay-200 translatable hero-tagline">
            {t('home.hero.tagline', 'Premier auto repair shop specializing in high-end vehicles and custom restorations')}
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 animate-fade-in animation-delay-400">
            <Link href="/services" className="btn btn-primary translatable">
              {t('home.hero.ourServices', 'Our Services')}
            </Link>
            <Link href="/booking" className="btn btn-secondary translatable">
              {t('home.hero.bookAppointment', 'Book Appointment')}
            </Link>
          </div>
          
          {/* Features Badges */}
          <div className="mt-12 flex flex-wrap gap-6 animate-fade-in animation-delay-600">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-[var(--gold)]/20 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[var(--gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold translatable">{t('hero.experience', '35+ Years')}</p>
                <p className="text-white/70 text-sm translatable">{t('hero.experienceDesc', 'Industry Experience')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              currentSlide === index ? 'bg-[var(--accent)] w-10' : 'bg-white/50 hover:bg-white/70'
            }`}
            onClick={() => goToImage(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  return (
    <I18nLoader>
      <HeroContent />
    </I18nLoader>
  );
};

export default Hero;