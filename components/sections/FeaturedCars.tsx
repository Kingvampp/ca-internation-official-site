"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaRegClock, FaTachometerAlt, FaCog } from "react-icons/fa";
import { useLanguage } from "../../utils/LanguageContext";

// Featured cars data - ensure images exist
const featuredCars = [
  {
    id: 1,
    nameKey: "featuredCars.bmwM4.name",
    descriptionKey: "featuredCars.bmwM4.description",
    image: "/images/homepage/featured/bmw-m4-competition.jpeg",
    specs: {
      power: "444 hp",
      acceleration: "3.9s 0-60mph",
      topSpeed: "190 mph",
    },
    badgesKeys: ["Performance", "Luxury", "Sport"],
  },
  {
    id: 2,
    nameKey: "featuredCars.porsche911.name",
    descriptionKey: "featuredCars.porsche911.description",
    image: "/images/homepage/featured/porsche 911 gt3.jpg",
    specs: {
      power: "435 hp",
      acceleration: "3.8s 0-60mph",
      topSpeed: "193 mph",
    },
    badgesKeys: ["Performance", "Track-Ready", "Iconic"],
  },
  {
    id: 3,
    nameKey: "featuredCars.lamborghini.name",
    descriptionKey: "featuredCars.lamborghini.description",
    image: "/images/homepage/featured/lamborghini gallardo.jpg",
    specs: {
      power: "493 hp",
      acceleration: "4.0s 0-60mph",
      topSpeed: "192 mph",
    },
    badgesKeys: ["Exotic", "Supercar", "Italian"],
  },
  {
    id: 4,
    nameKey: "featuredCars.bentley.name",
    descriptionKey: "featuredCars.bentley.description",
    image: "/images/homepage/featured/Bentley Continental Flying Spur.jpg",
    specs: {
      power: "552 hp",
      acceleration: "5.2s 0-60mph",
      topSpeed: "195 mph",
    },
    badgesKeys: ["Luxury", "Handcrafted", "British"],
  },
  {
    id: 5,
    nameKey: "featuredCars.porscheCayman.name",
    descriptionKey: "featuredCars.porscheCayman.description",
    image: "/images/homepage/featured/porsche cayman.jpg",
    specs: {
      power: "325 hp",
      acceleration: "4.6s 0-60mph",
      topSpeed: "175 mph",
    },
    badgesKeys: ["Precision", "Balanced", "Sports"],
  },
];

export default function FeaturedCars() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imagesPreloaded, setImagesPreloaded] = useState<Record<number, boolean>>({});
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  const currentCar = featuredCars[currentIndex];

  // Preload all images on component mount
  useEffect(() => {
    featuredCars.forEach((car, index) => {
      const img = new window.Image();
      img.src = car.image;
      img.onload = () => {
        setImagesPreloaded(prev => ({...prev, [index]: true}));
      };
      img.onerror = () => {
        setImageErrors(prev => ({...prev, [index]: true}));
        console.error(`Error preloading image for ${car.nameKey}: ${car.image}`);
      };
    });
    setLoaded(true);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredCars.length - 1 : prev - 1));
    // Reset any lingering error for the next image to ensure it tries to load again
    const nextIndex = currentIndex === 0 ? featuredCars.length - 1 : currentIndex - 1;
    if (imageErrors[nextIndex]) {
      // If we've cached an error, attempt to load the image again
      setImageErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[nextIndex];
        return newErrors;
      });
    }
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === featuredCars.length - 1 ? 0 : prev + 1));
    // Reset any lingering error for the next image to ensure it tries to load again
    const nextIndex = currentIndex === featuredCars.length - 1 ? 0 : currentIndex + 1;
    if (imageErrors[nextIndex]) {
      // If we've cached an error, attempt to load the image again
      setImageErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[nextIndex];
        return newErrors;
      });
    }
  };

  // Handle image load errors - improved to track per image
  const handleImageError = () => {
    setImageErrors(prev => ({...prev, [currentIndex]: true}));
    console.error(`Error loading image for ${currentCar.nameKey}: ${currentCar.image}`);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-center mb-2">
          <div className="h-px w-12 bg-bmw-red mr-4"></div>
          <h4 className="text-bmw-blue uppercase font-bold tracking-wider text-sm">{t('featuredCars.performanceFleet')}</h4>
          <div className="h-px w-12 bg-bmw-red ml-4"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12">
          {t('featuredCars.title')} <span className="text-bmw-red">{t('featuredCars.subtitle')}</span>
        </h2>

        <div ref={containerRef} className="relative">
          {/* Featured Car Display */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Car Image */}
            <motion.div
              key={`car-image-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative aspect-video md:aspect-square rounded-lg overflow-hidden shadow-2xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-bmw-dark-blue/50 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10"></div>
              
              {imageErrors[currentIndex] ? (
                <div className="absolute inset-0 bg-gradient-to-r from-bmw-blue to-bmw-dark-blue flex items-center justify-center">
                  <div className="text-white text-center px-6">
                    <div className="mx-auto mb-2 flex justify-center">
                      <div className="animate-spin">
                        <FaCog size={36} color="white" />
                      </div>
                    </div>
                    <p className="font-bold">{t('common.imageUnavailable')}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-bmw-dark-blue/50 to-transparent flex items-center justify-center">
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="animate-pulse bg-bmw-blue/20 rounded-full h-16 w-16 flex items-center justify-center">
                        <FaCog size={24} color="white" />
                      </div>
                    </div>
                  </div>
                  <Image
                    src={currentCar.image}
                    alt={currentCar.nameKey}
                    fill
                    className="object-cover transition-transform duration-10000 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={handleImageError}
                    priority={currentIndex === 0}
                  />
                </>
              )}
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-racing-stripe z-20"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-racing-stripe z-20"></div>
              
              {/* Accent corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-bmw-blue z-20"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-bmw-red z-20"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-bmw-red z-20"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-bmw-blue z-20"></div>
              
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-bmw-red/80 backdrop-blur-sm py-1 px-4 rounded-full text-white text-sm font-medium z-20">
                {t('featuredCars.featured')}
              </div>
            </motion.div>
            
            {/* Car Details */}
            <motion.div
              key={`car-details-${currentIndex}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-white/5 backdrop-blur-sm p-8 rounded-lg border-l-4 border-bmw-blue relative overflow-hidden group">
                <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                
                <h3 className="text-3xl font-bold text-white mb-2 flex items-center">
                  <span className="relative">
                    {t(currentCar.nameKey)}
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-bmw-blue to-bmw-red"></span>
                  </span>
                </h3>
                
                <p className="text-white/80 mb-6">{t(currentCar.descriptionKey)}</p>
                
                {/* Car Specs */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 p-4 rounded-lg text-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="text-bmw-blue mb-2">
                      <div className="mx-auto w-6 h-6 flex items-center justify-center">
                        <FaCog size={24} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentCar.specs.power}</div>
                    <div className="text-white/60 text-xs uppercase">{t('featuredCars.specs.power')}</div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg text-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="text-bmw-red mb-2">
                      <div className="mx-auto w-6 h-6 flex items-center justify-center">
                        <FaRegClock size={24} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentCar.specs.acceleration}</div>
                    <div className="text-white/60 text-xs uppercase">{t('featuredCars.specs.acceleration')}</div>
                  </div>
                  
                  <div className="bg-white/10 p-4 rounded-lg text-center relative group overflow-hidden">
                    <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="text-white mb-2">
                      <div className="mx-auto w-6 h-6 flex items-center justify-center">
                        <FaTachometerAlt size={24} />
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{currentCar.specs.topSpeed}</div>
                    <div className="text-white/60 text-xs uppercase">{t('featuredCars.specs.topSpeed')}</div>
                  </div>
                </div>
                
                {/* Tags/Badges */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {currentCar.badgesKeys.map((badge, idx) => (
                    <span
                      key={`badge-${idx}`}
                      className="bg-white/10 text-white text-xs py-1 px-3 rounded-full hover:bg-bmw-red transition-colors duration-300"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex justify-center mt-10 gap-4">
            <button 
              onClick={goToPrevious}
              className="relative overflow-hidden w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-bmw-blue/20 focus:outline-none focus:ring-2 focus:ring-bmw-blue/50 group"
              aria-label={t('common.previous')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-bmw-blue to-bmw-red opacity-0 group-hover:opacity-10 transition-all duration-300"></span>
              <FaChevronLeft color={t('common.white')} />
            </button>
            
            <div className="flex mt-4 space-x-2 justify-center">
              {featuredCars.map((_, index) => (
                <button
                  key={`dot-${index}`}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    currentIndex === index 
                      ? "bg-bmw-red scale-125" 
                      : "bg-white/30 hover:bg-white/50"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`${t('common.viewImage')} ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={goToNext}
              className="relative overflow-hidden w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-bmw-blue/20 focus:outline-none focus:ring-2 focus:ring-bmw-blue/50 group"
              aria-label={t('common.next')}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-bmw-blue to-bmw-red opacity-0 group-hover:opacity-10 transition-all duration-300"></span>
              <FaChevronRight color={t('common.white')} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Background Elements */}
      <div className="absolute inset-0 bg-bmw-dark-blue z-0"></div>
      <div className="absolute inset-0 bg-carbon-fiber bg-repeat opacity-5 z-0"></div>
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-black/30 to-transparent z-0"></div>
    </section>
  );
} 