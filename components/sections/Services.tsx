"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCarCrash, FaSprayCan, FaCar, FaTruck, FaWrench, FaBrush, FaRulerCombined, FaCogs } from "react-icons/fa";
import { useLanguage } from "../../utils/LanguageContext";

export default function Services() {
  const { t, translationStats, language } = useLanguage();
  const [activeService, setActiveService] = useState("collision");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  
  // Log translation keys for debugging purposes
  useEffect(() => {
    console.log('🔧 [Services] Translation stats:', {
      loaded: translationStats.loaded,
      count: translationStats.count,
      missing: translationStats.missing.length
    });
    
    // Check for key translations we're using
    const keysToCheck = [
      'services.our.services',
      'services.collision',
      'services.paint',
      'services.restoration',
      'services.detailing'
    ];
    
    keysToCheck.forEach(key => {
      const translation = t(key);
      if (translation === key) {
        console.warn(`🔧 [Services] Missing translation for: ${key}`);
      } else {
        console.log(`🔧 [Services] Translation loaded for ${key}: "${translation}"`);
      }
    });
  }, [t, translationStats, language]);
  
  // Service data
  const services = [
    {
      id: "collision",
      icon: <FaCarCrash size={32} />,
      titleKey: "services.collision",
      descriptionKey: "services.collisionDesc",
      image: "/images/homepage/services/collision-repair.jpg",
      color: "bmw-blue"
    },
    {
      id: "paint",
      icon: <FaSprayCan size={32} />,
      titleKey: "services.paint",
      descriptionKey: "services.paintDesc",
      image: "/images/homepage/services/custom-paint.jpg",
      color: "bmw-red"
    },
    {
      id: "restoration",
      icon: <FaCar size={32} />,
      titleKey: "services.restoration",
      descriptionKey: "services.restorationDesc",
      image: "/images/homepage/services/vehicle-restoration.jpg",
      color: "bmw-blue"
    },
    {
      id: "detailing",
      icon: <FaBrush size={32} />,
      titleKey: "services.detailing",
      descriptionKey: "services.detailingDesc",
      image: "/images/homepage/services/vehicle-detailing.jpg",
      color: "bmw-red"
    },
    {
      id: "pickup",
      icon: <FaTruck size={32} />,
      titleKey: "services.pickup",
      descriptionKey: "services.pickupDesc",
      image: "/images/homepage/services/pick-up-and-delivery.jpg",
      color: "bmw-blue"
    },
    {
      id: "towing",
      icon: <FaTruck size={32} />,
      titleKey: "services.towing",
      descriptionKey: "services.towingDesc",
      image: "/images/homepage/services/24-7-towing.jpg",
      color: "bmw-red"
    },
    {
      id: "frame",
      icon: <FaRulerCombined size={32} />,
      titleKey: "services.frame",
      descriptionKey: "services.frameDesc",
      image: "/images/homepage/services/frame-straightnening.jpg",
      color: "bmw-blue"
    },
    {
      id: "wheel",
      icon: <FaCogs size={32} />,
      titleKey: "services.wheel",
      descriptionKey: "services.wheelDesc",
      image: "/images/homepage/services/wheel-repair.jpg",
      color: "bmw-red"
    }
  ];

  // Get active service data
  const activeServiceData = services.find((service) => service.id === activeService) || services[0];

  // Handle image loading errors
  const handleImageError = (serviceId: string) => {
    setImageErrors(prev => ({ ...prev, [serviceId]: true }));
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-2">
            <div className="h-px w-12 bg-bmw-red mr-4"></div>
            <h4 className="text-bmw-blue uppercase font-bold tracking-wider text-sm">{t('services.our.services')}</h4>
            <div className="h-px w-12 bg-bmw-red ml-4"></div>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-12">
            {t('services.our.services')}
          </h2>

          {/* Service Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => setActiveService(service.id)}
                className={`relative rounded-lg p-4 transition-all duration-300 overflow-hidden group ${
                  activeService === service.id
                    ? `bg-${service.color} text-white shadow-lg`
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div 
                  className={`flex flex-col items-center justify-center relative z-10 ${
                    activeService === service.id ? "text-shadow-sm scale-110" : ""
                  } transition-transform duration-300`}
                >
                  <div className={`${activeService === service.id ? "text-white" : `text-${service.color}`} mb-2`}>
                    {service.icon}
                  </div>
                  <span className={`font-medium text-center ${activeService === service.id ? "text-white" : ""}`}>
                    {t(service.titleKey)}
                  </span>
                </div>
                {activeService === service.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white"></div>
                )}
              </button>
            ))}
          </div>

          {/* Active Service Content */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-2 md:order-1">
              <motion.div
                key={activeService}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6"
              >
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg bg-${activeServiceData.color} mr-4`}>
                    <div className="text-white">{activeServiceData.icon}</div>
                  </div>
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">{t(activeServiceData.titleKey)}</h3>
                </div>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  {t(activeServiceData.descriptionKey)}
                </p>
                
                <Link
                  href={`/services#${activeServiceData.id}`}
                  className="relative inline-flex items-center bg-bmw-blue hover:bg-bmw-darker-blue text-white py-3 px-8 rounded-full font-medium transition-colors overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                  <span className="relative z-10">{t('common.learnMore')}</span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-bmw-blue via-white to-bmw-red transition-all duration-300 group-hover:h-full opacity-0 group-hover:opacity-20"></span>
                </Link>
              </motion.div>
            </div>
            
            <motion.div
              key={`image-${activeService}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative order-1 md:order-2 aspect-video rounded-lg overflow-hidden shadow-2xl group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-bmw-dark-blue/40 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-carbon-fiber opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10"></div>
              
              {/* Image with fallback */}
              {imageErrors[activeServiceData.id] 
                ? <div className="absolute inset-0 bg-gradient-to-r from-bmw-blue to-bmw-dark-blue"></div>
                : <Image
                    src={activeServiceData.image}
                    alt={t(activeServiceData.titleKey)}
                    fill
                    sizes="100vw"
                    className="object-cover transition-transform duration-7000 group-hover:scale-110"
                    onError={() => handleImageError(activeServiceData.id)}
                  />
              }
              
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-full h-2 bg-racing-stripe z-20"></div>
              <div className="absolute bottom-0 left-0 w-full h-2 bg-racing-stripe z-20"></div>
              <div className="absolute top-4 right-4 text-white z-20 bg-bmw-red/80 backdrop-blur-sm py-1 px-4 rounded-full text-sm font-medium">
                {t('services.premiumService')}
              </div>
              
              {/* Accent corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-bmw-blue z-20"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-bmw-red z-20"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-bmw-red z-20"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-bmw-blue z-20"></div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 