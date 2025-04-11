'use client';
import { useTranslation } from 'react-i18next';

import ServiceCard from './ServiceCard';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

const Services = () => {
  const { language } = useLanguage();

const { t } = useTranslation();
  
  const services = [
    {
      id: 1,
      title: t('services.collision', 'Collision Repair'),
      description: t('services.collisionDesc', 'Expert collision repair services for all makes and models. We restore your vehicle to pre-accident condition with precision and care.'),
      icon: (
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image 
            src="/images/service-collision.jpg" 
            alt="Collision Repair" 
            fill 
            sizes="48px"
            className="object-cover"
          />
        </div>
      ),
      link: '/services/collision-repair'
    },
    {
      id: 2,
      title: t('services.paint', 'Paint Services'),
      description: t('services.paintDesc', 'Premium paint services with color matching technology. Our expert painters deliver flawless finishes for both repairs and custom work.'),
      icon: (
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image 
            src="/images/service-paint.jpg" 
            alt="Paint Services" 
            fill 
            sizes="48px"
            className="object-cover"
          />
        </div>
      ),
      link: '/services/paint-services'
    },
    {
      id: 3,
      title: t('services.frame', 'Frame Straightening'),
      description: t('services.frameDesc', "Precision frame straightening to restore your vehicle's structural integrity after an accident."),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
          <path d="M3 9l4 4" />
          <path d="M17 9l4 4" />
        </svg>
      ),
      link: '/services#frame-straightening',
    },
    {
      id: 4,
      title: t('services.dent', 'Paintless Dent Repair'),
      description: t('services.dentDesc', "Remove dents without affecting your vehicle's factory finish, saving time and money."),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
          <path d="M8.5 8.5l7 7" />
          <path d="M15.5 8.5l-7 7" />
          <path d="M7.5 16.5l9-9" />
        </svg>
      ),
      link: '/services#paintless-dent-repair',
    },
    {
      id: 5,
      title: t('services.restoration', 'Classic Car Restoration'),
      description: t('services.restorationDesc', 'Bring your classic back to its original glory with our meticulous restoration services.'),
      icon: (
        <div className="relative h-12 w-12 overflow-hidden rounded-full">
          <Image 
            src="/images/service-restoration.jpg" 
            alt="Classic Car Restoration" 
            fill 
            sizes="48px"
            className="object-cover"
          />
        </div>
      ),
      link: '/services#classic-restoration',
    },
    {
      id: 6,
      title: t('services.custom', 'Custom Modifications'),
      description: t('services.customDesc', 'Personalize your vehicle with custom body kits, paint, and performance upgrades.'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          <path d="M9 12l-6 6" />
          <path d="M15 6l3 3" />
        </svg>
      ),
      link: '/services#custom-modifications',
    },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="services-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#services-grid)" />
          </svg>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -left-20 top-40 w-64 h-64 rounded-full bg-[var(--accent)]/10 blur-3xl"></div>
      <div className="absolute -right-20 bottom-40 w-80 h-80 rounded-full bg-[var(--gold)]/10 blur-3xl"></div>
      
      <div className="container relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 translatable">
            {t('services.title', 'Our Premium Services')}
          </h2>
          <div className="w-24 h-1 bg-[var(--accent)] mx-auto mb-6"></div>
          <p className="max-w-2xl mx-auto text-lg text-[var(--text-secondary)] translatable">
            {t('services.subtitle', 'We offer a comprehensive range of auto body services, from collision repair to custom modifications, all delivered with exceptional craftsmanship.')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              link={service.link}
              index={index}
            />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <Link 
            href="/services" 
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--primary)] text-white rounded-lg shadow-lg hover:bg-[var(--primary-dark)] transition-all duration-300 group"
          >
            <span className="mr-2 translatable">{t('services.viewAll', 'View All Services')}</span>
            <span className="relative w-6 h-6 flex items-center justify-center overflow-hidden">
              <span className="absolute inset-0 bg-[var(--accent)] rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 relative z-10" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services; 
