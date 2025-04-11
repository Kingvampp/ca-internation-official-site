'use client';
import { useTranslation } from 'react-i18next';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../context/LanguageContext';

const TestimonialSpotlight = () => {
  const { language } = useLanguage();

const { t } = useTranslation();
  
  // Using the verified reviews from Yelp and Facebook
  const testimonials = [
    {
      id: 'yelp-1',
      name: t('testimonials.reviews.john.name', 'John D.'),
      role: t('testimonials.reviews.john.title', 'Verified Yelp Review'),
      image: '/images/homepage/testimonials/testimonial-1.svg',
      quote: t('testimonials.reviews.john.content', 'Oscar and his team are amazing! They fixed my car after a bad accident and it looks brand new. The attention to detail and quality of work is outstanding. I highly recommend CA International Automotive for any auto body work.'),
      rating: 5,
      source: 'yelp'
    },
    {
      id: 'yelp-2',
      name: t('testimonials.reviews.maria.name', 'Maria L.'),
      role: t('testimonials.reviews.maria.title', 'Verified Yelp Review'),
      image: '/images/homepage/testimonials/testimonial-2.svg',
      quote: t('testimonials.reviews.maria.content', 'I had a great experience with CA International Automotive. They repaired my Mercedes after a fender bender and did an excellent job matching the paint. Oscar was very professional and kept me updated throughout the process. The price was fair and the work was completed on time. Will definitely return for any future needs!'),
      rating: 5,
      source: 'yelp'
    },
    {
      id: 'fb-1',
      name: t('testimonials.reviews.carlos.name', 'Carlos M.'),
      role: t('testimonials.reviews.carlos.title', 'Verified Facebook Review'),
      image: '/images/homepage/testimonials/testimonial-3.svg',
      quote: t('testimonials.reviews.carlos.content', "Oscar at CA International Automotive is a true professional. He restored my classic car to better than new condition. His knowledge and craftsmanship are exceptional. I couldn't be happier with the results!"),
      rating: 5,
      source: 'facebook'
    }
  ];
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
        setIsAnimating(false);
      }, 500);
    }, 8000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <svg 
        key={i} 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 ${i < rating ? 'text-[var(--gold)]' : 'text-gray-300'}`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const renderSourceIcon = (source: string) => {
    if (source === 'yelp') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.111 18.226c-.141.133-.322.2-.511.2-.247 0-.487-.113-.644-.324-.149-.199-.201-.461-.137-.698.061-.226.196-.415.398-.534.943-.534 1.553-.97 1.845-1.311.213-.248.301-.569.238-.882-.062-.308-.278-.555-.571-.682-.218-.095-1.935-.462-2.864-.642l-.514-.089c-.246-.046-.466-.185-.614-.388-.147-.203-.209-.455-.17-.703.058-.37.282-.683.601-.83.557-.261 1.891-.878 2.458-1.129.898-.415 1.408-.643 1.7-.742.153-.052.238-.221.191-.376-.078-.26-.243-.55-.517-.891-1.003-1.248-1.696-1.904-2.13-2.241-.161-.126-.241-.325-.217-.528.027-.203.148-.379.328-.479.181-.1.396-.092.577-.01 2.368 1.075 4.092 2.564 5.126 4.41.413.739.446 1.298.098 1.675-.173.178-.834.98-1.904 2.334-.901 1.141-1.739 2.225-2.474 3.234-.204.28-.51.424-.817.424z" />
          </svg>
          Yelp
        </span>
      );
    } else if (source === 'facebook') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </span>
      );
    }
    return null;
  };

  return (
    <section className="relative py-20 bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary)] overflow-hidden">
      {/* Racing stripe accent */}
      <div className="absolute top-0 left-0 right-0 flex h-2">
        <div className="w-1/3 bg-[var(--accent)]"></div>
        <div className="w-1/3 bg-[var(--accent-secondary)]"></div>
        <div className="w-1/3 bg-[var(--gold)]"></div>
      </div>
      
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" className="absolute inset-0">
          <pattern id="star-pattern" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M25,0 L30,20 L50,25 L30,30 L25,50 L20,30 L0,25 L20,20 Z" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#star-pattern)" />
        </svg>
      </div>
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 translatable">
            {t('testimonials.title', 'What Our Clients Say')}
          </h2>
          <div className="w-24 h-1 bg-[var(--accent)] mx-auto mb-6"></div>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-lg p-8 md:p-12 shadow-xl border border-white/20">
            {/* Accent corner */}
            <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
              <div className="absolute transform rotate-45 bg-[var(--accent)] text-white w-28 h-28 flex items-center justify-center -right-14 -top-14">
                <div className="transform -rotate-45 mt-16 mr-16">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 relative flex-shrink-0">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[var(--accent)] relative z-10">
                    <div className="w-full h-full bg-[var(--primary-light)] flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {testimonials[activeIndex].name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  {/* Decorative circle */}
                  <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-[var(--gold)] z-0"></div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start mb-3">
                    {renderStars(testimonials[activeIndex].rating)}
                  </div>
                  
                  <blockquote className="text-white text-lg md:text-xl italic mb-6 relative">
                    <svg className="absolute -top-6 -left-2 h-12 w-12 text-[var(--accent)]/20" fill="currentColor" viewBox="0 0 32 32">
                      <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1 0.9-2 2-2V8zm12 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1 0.9-2 2-2V8z"/>
                    </svg>
                    <p className="relative z-10">{testimonials[activeIndex].quote}</p>
                  </blockquote>
                  
                  <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
                    <div>
                      <h4 className="text-[var(--accent)] font-bold text-xl">{testimonials[activeIndex].name}</h4>
                      <p className="text-white/70">{testimonials[activeIndex].role}</p>
                    </div>
                    <div className="mt-2 md:mt-0">
                      {renderSourceIcon(testimonials[activeIndex].source)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial navigation */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAnimating(true);
                  setTimeout(() => {
                    setActiveIndex(index);
                    setIsAnimating(false);
                  }, 500);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeIndex === index 
                    ? 'bg-[var(--accent)] w-8' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link 
              href="/testimonials" 
              className="inline-flex items-center text-white hover:text-[var(--accent)] transition-colors"
            >
              <span className="mr-2">{t('testimonials.viewMore', 'View More Testimonials')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Bottom racing stripe */}
      <div className="absolute bottom-0 left-0 right-0 flex h-2">
        <div className="w-1/3 bg-[var(--gold)]"></div>
        <div className="w-1/3 bg-[var(--accent-secondary)]"></div>
        <div className="w-1/3 bg-[var(--accent)]"></div>
      </div>
    </section>
  );
};

export default TestimonialSpotlight; 
