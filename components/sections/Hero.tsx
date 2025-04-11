"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import useIsMobile from "../../hooks/useIsMobile";
import { useLanguage } from "../../utils/LanguageContext";

// Hero images configuration
const heroImages = [
  {
    src: "/images/homepage/hero/hero-1.jpg",
    altKey: "hero.alt1"
  },
  {
    src: "/images/homepage/hero/hero-2.jpg",
    altKey: "hero.alt2"
  },
  {
    src: "/images/homepage/hero/hero-3.jpg",
    altKey: "hero.alt3"
  }
];

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useLanguage();
  
  // Mobile check for responsive layout
  const isMobile = useIsMobile();

  // Function to move to the next slide
  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    // Give time for transition to complete
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Function to move to a specific slide
  const goToSlide = (index: number) => {
    if (isTransitioning || index === activeIndex) return;
    setIsTransitioning(true);
    setActiveIndex(index);
    // Give time for transition to complete
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Handle image loading errors
  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  // Setup auto-rotation timer
  useEffect(() => {
    timerRef.current = setInterval(nextSlide, 7000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <section className="relative h-screen min-h-[600px] md:min-h-[800px] w-full overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0 bg-bmw-dark-blue">
        {heroImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              activeIndex === index ? "opacity-100" : "opacity-0"
            }`}
          >
            {imageErrors[index] 
              ? <div className="absolute inset-0 bg-gradient-to-r from-bmw-dark-blue to-bmw-blue"></div>
              : <>
                  <Image
                    src={image.src}
                    alt={t(image.altKey)}
                    fill
                    priority={index === 0}
                    className="object-cover object-center"
                    sizes="100vw"
                    onError={() => handleImageError(index)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50 z-10"></div>
                </>
            }
          </div>
        ))}
      </div>

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
              {t('hero.title')} <span className="text-bmw-red">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/services"
                className="relative inline-flex items-center bg-bmw-blue hover:bg-bmw-darker-blue text-white py-3 px-8 rounded-full font-medium transition-colors overflow-hidden group"
              >
                <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <span className="relative z-10">{t('hero.exploreServices')}</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-bmw-blue via-white to-bmw-red transition-all duration-300 group-hover:h-full opacity-0 group-hover:opacity-20"></span>
              </Link>
              <Link
                href="/contact"
                className="relative inline-flex items-center bg-transparent hover:bg-white/10 text-white border-2 border-white py-3 px-8 rounded-full font-medium transition-colors overflow-hidden group"
              >
                <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                <span className="relative z-10">{t('hero.bookNow')}</span>
                <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-bmw-blue via-white to-bmw-red transition-all duration-300 group-hover:h-full opacity-0 group-hover:opacity-20"></span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Image Indicators/Navigation */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center">
        <div className="flex items-center space-x-3">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-500 ${
                activeIndex === index ? "bg-bmw-red w-6" : "bg-white/50 hover:bg-white"
              }`}
              aria-label={`${t('hero.viewImage')} ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent z-10"></div>
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-10"></div>
      
      {/* Racing stripes */}
      <div className="absolute top-0 left-0 w-full h-4 bg-racing-stripe z-20"></div>
      <div className="absolute bottom-0 left-0 w-full h-4 bg-racing-stripe z-20"></div>
    </section>
  );
}