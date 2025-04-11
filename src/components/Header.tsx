'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[var(--primary)]/95 backdrop-blur-md shadow-md py-2 text-white' : 'bg-transparent py-4'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative z-10 group">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="w-12 h-12 bg-[var(--primary-dark)] rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform border-2 border-[var(--silver)]">
                <span className="text-white font-bold text-lg notranslate">CA</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--accent)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold flex flex-col leading-tight notranslate">
                <span>International</span>
                <span>Autobody</span>
              </h1>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/about" className="nav-link font-medium hover:text-[var(--accent)] transition-colors relative group">
            {t('navigation.about')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/services" className="nav-link font-medium hover:text-[var(--accent)] transition-colors relative group">
            {t('navigation.services')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/gallery" className="nav-link font-medium hover:text-[var(--accent)] transition-colors relative group">
            {t('navigation.gallery')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/testimonials" className="nav-link font-medium hover:text-[var(--accent)] transition-colors relative group">
            {t('navigation.testimonials')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <Link href="/contact" className="nav-link font-medium hover:text-[var(--accent)] transition-colors relative group">
            {t('navigation.contact')}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
          </Link>
          <LanguageToggle />
        </nav>

        {/* Phone Number and Book Now (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Phone Icon */}
          <a 
            href="tel:+14154474001" 
            className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center transition-transform hover:scale-110"
            aria-label={t('navigation.callUs')}
            title="(415) 447-4001"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          
          {/* Book Now Button */}
          <Link href="/booking" className="btn btn-accent flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('navigation.book.now')}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden z-10 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className="w-6 flex flex-col gap-1">
            <span 
              className={`block h-0.5 bg-current transform transition-transform duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            ></span>
            <span 
              className={`block h-0.5 bg-current transition-opacity duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            ></span>
            <span 
              className={`block h-0.5 bg-current transform transition-transform duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            ></span>
          </div>
        </button>

        {/* Mobile Menu */}
        <div 
          className={`fixed inset-0 bg-[var(--primary)]/95 backdrop-blur-md z-40 transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          } md:hidden text-white`}
        >
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-4">
            <Link 
              href="/about" 
              className="text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.about')}
            </Link>
            <Link 
              href="/services" 
              className="text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.services')}
            </Link>
            <Link 
              href="/gallery" 
              className="text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.gallery')}
            </Link>
            <Link 
              href="/testimonials" 
              className="text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.testimonials')}
            </Link>
            <Link 
              href="/contact" 
              className="text-xl font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.contact')}
            </Link>
            <Link 
              href="/booking" 
              className="btn btn-accent flex items-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('navigation.book.now')}
            </Link>
            
            {/* Language Toggle Button - Mobile */}
            <LanguageToggle variant="minimal" />
            
            <div className="flex items-center mt-4 space-x-4">
              {/* Phone icon - Mobile */}
              <a 
                href="tel:+14154474001" 
                className="w-12 h-12 rounded-full bg-[var(--primary-light)] flex items-center justify-center transition-transform hover:scale-110"
                aria-label={t('navigation.callUs')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 