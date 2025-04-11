'use client';

import { useTranslation } from 'react-i18next';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import Link from 'next/link';

const HomeHero = () => {
  const { language } = useLanguage();
  const { t } = useLanguage();

  return (
    <section className="relative py-28 md:py-36 bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary)] text-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[url('/images/texture-overlay.png')] opacity-20"></div>
      <div className="absolute right-0 bottom-0 w-1/2 h-full bg-[url('/images/car-silhouette.png')] bg-no-repeat bg-right-bottom bg-contain opacity-15"></div>
      
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-white drop-shadow-md">
            {t('home.hero.title', 'Premium Auto Body Services for Luxury & Classic Vehicles')}
          </h1>
          <p className="text-xl text-white mb-8 drop-shadow-md">
            {t('home.hero.subtitle', 'Specializing in high-end repairs, custom paint, and restorations with dealership-quality results.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className="btn btn-primary">
              {t('home.hero.contact', 'Request a Quote')}
            </Link>
            <Link href="/services" className="btn btn-secondary">
              {t('home.hero.services', 'Our Services')}
            </Link>
          </div>
          
          <div className="mt-12 flex items-center">
            <div className="mr-6">
              <div className="bg-white/10 rounded-full p-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-[var(--accent)] mb-1 translatable">
                {t('home.hero.certified', 'Certified Professionals')}
              </h3>
              <p className="text-[var(--gray-light)] translatable">
                {t('home.hero.certifiedDesc', 'Our technicians are factory-trained experts')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero; 
