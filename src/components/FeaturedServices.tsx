'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

const services = [
  {
    id: 'custom-paint',
    imageUrl: '/images/services/paint.jpg',
    title: 'featuredServices.collision',
    defaultTitle: 'Custom Paint',
    description: 'featuredServices.collisionDesc',
    defaultDescription: 'Premium paint services for luxury and classic vehicles with flawless finishes.',
    link: '/services/paint'
  },
  {
    id: 'paint-correction',
    imageUrl: '/images/services/paint-correction.jpg',
    title: 'featuredServices.paintCorrection',
    defaultTitle: 'Paint Correction',
    description: 'featuredServices.paintCorrectionDesc',
    defaultDescription: 'Professional refinishing and correction services to restore your vehicle\'s original beauty.',
    link: '/services/paint-correction'
  },
  {
    id: 'classic-restoration',
    imageUrl: '/images/services/restoration.jpg',
    title: 'featuredServices.classicRestoration',
    defaultTitle: 'Classic Restoration',
    description: 'featuredServices.classicRestorationDesc',
    defaultDescription: 'Expert restoration services for classic and vintage vehicles.',
    link: '/services/restoration'
  }
];

const FeaturedServices = () => {
  const { t } = useTranslation();
  
  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('featuredServices.title', 'Our Premium Services')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('featuredServices.subtitle', 'We specialize in high-quality repairs and transformations for luxury and classic vehicles.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <div 
              key={service.id}
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-105"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.imageUrl}
                  alt={t(service.title, service.defaultTitle) || service.defaultTitle}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">
                  {t(service.title, service.defaultTitle)}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t(service.description, service.defaultDescription)}
                </p>
                <Link 
                  href={service.link} 
                  className="text-[var(--primary)] font-medium hover:underline"
                >
                  {t('featuredServices.learnMore', 'Learn More')} →
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Link 
            href="/services" 
            className="btn btn-primary"
          >
            {t('featuredServices.viewAll', 'View All Services')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedServices; 