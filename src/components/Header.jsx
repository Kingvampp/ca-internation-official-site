'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import ClientOnly from './ClientOnly';
import { useTranslation } from 'react-i18next';
import { RiMenuLine, RiCloseLine } from 'react-icons/ri';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { language, isClient } = useLanguage();
  const { t, ready } = useTranslation();
  const pathname = usePathname();
  const mobileMenuRef = useRef(null);

  // Only run client-side
  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isClient) {
      window.addEventListener('scroll', handleScroll);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isClient]);

  // Don't render anything on server
  if (!isMounted) {
    return null;
  }

  // Show loading state while i18n initializes
  if (!ready) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-[var(--primary)] py-5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="animate-pulse h-10 w-40 bg-gray-700 rounded"></div>
            <div className="animate-pulse h-10 w-60 bg-gray-700 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  // Check if we're on the Spanish version
  const isSpanishSite = pathname && pathname.startsWith('/es');
  
  // Get the corresponding path in the other language
  const getOtherLanguagePath = () => {
    if (!pathname) return '/';
    
    if (isSpanishSite) {
      // If we're on /es/something, change to /something
      return pathname.replace(/^\/es/, '') || '/';
    } else {
      // If we're on /something, change to /es/something
      return `/es${pathname}`;
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        isScrolled ? 'bg-[var(--primary)] shadow-md py-3' : 'bg-[var(--primary)] py-5'
      }`}
    >
      <div className="container flex items-center justify-between px-4 lg:px-8 h-full">
        {/* Logo - Moved more to the left */}
        <Link href="/" className="relative z-10 group -ml-2">
          <div className="flex items-center">
            <div className="relative mr-3">
              <div className="w-16 h-16 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <Image 
                  src="/images/logo/ca-logo.png" 
                  alt="CA International Automotive Logo" 
                  width={60} 
                  height={60}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[var(--accent)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                <span className="block text-sm uppercase tracking-widest text-[var(--accent)]">CA</span>
                <span className="block -mt-1">International Automotive</span>
              </h1>
              <p className="text-xs text-white/70 whitespace-nowrap relative z-20">Est. 1997 • 28 Years of Excellence</p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation - Adjusted spacing */}
        <nav className="hidden md:flex items-center justify-center flex-1 max-w-3xl mx-8">
          <div className="flex items-center justify-between w-full space-x-8">
            <Link href="/about" className="nav-link font-medium text-white hover:text-[var(--accent)] transition-colors relative group">
              {t('navigation.about', 'About Us')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/services" className="nav-link font-medium text-white hover:text-[var(--accent)] transition-colors relative group">
              {t('navigation.services', 'Services')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/gallery" className="nav-link font-medium text-white hover:text-[var(--accent)] transition-colors relative group">
              {t('navigation.gallery', 'Gallery')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/testimonials" className="nav-link font-medium text-white hover:text-[var(--accent)] transition-colors relative group">
              {t('navigation.testimonials', 'Testimonials')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/contact" className="nav-link font-medium text-white hover:text-[var(--accent)] transition-colors relative group">
              {t('navigation.contact', 'Contact')}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
        </nav>

        {/* Right Side Actions - Adjusted spacing */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Language Toggle - Wrapped with ClientOnly to prevent hydration issues */}
          <ClientOnly fallback={<div className="ml-4 w-10 h-10 rounded-full bg-white/10"></div>}>
            <div className="ml-4">
              <LanguageSwitcher variant="dropdown" />
            </div>
          </ClientOnly>
          
          {/* Phone Icon Button - Compact version with just the icon */}
          <a 
            href="tel:+14154474001" 
            className="flex items-center justify-center p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105 text-white"
            aria-label={t('navigation.callUs', 'Call Us Now')}
            title={`${t('navigation.callUs', 'Call Us Now')}: (415) 447-4001`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </a>
          
          {/* Book Now Button - Bold design */}
          <Link 
            href="/booking" 
            className="btn btn-accent shadow-lg inline-flex items-center px-4 py-2 rounded-full font-medium"
            aria-label={t('navigation.bookNow', 'Book Now')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {t('navigation.bookNow', 'Book Now')}
          </Link>
        </div>

        {/* Mobile Nav Toggle Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-[var(--accent)] transition-all"
          aria-label="Toggle Mobile Menu"
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-6 w-6 text-white transition-transform ${isMobileMenuOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-70 z-50 md:hidden mobile-menu-overlay transition-opacity ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <div
          className={`bg-[var(--primary)] h-full w-3/4 max-w-sm p-6 transition-transform ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
          ref={mobileMenuRef}
        >
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-xl font-bold text-white">
              <span className="block text-sm text-[var(--accent)]">CA</span>
              <span className="block -mt-1">International Automotive</span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-8 h-8 flex items-center justify-center text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="mb-8">
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('navigation.about', 'About Us')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('navigation.services', 'Services')}
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('navigation.gallery', 'Gallery')}
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('navigation.testimonials', 'Testimonials')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="nav-link-mobile" onClick={() => setIsMobileMenuOpen(false)}>
                  {t('navigation.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </nav>

          <div className="space-y-4">
            <Link
              href="/booking"
              className="btn btn-accent w-full justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('navigation.bookNow', 'Book Now')}
            </Link>
            
            <div className="flex items-center justify-between">
              <a href="tel:+14154474001" className="flex items-center text-white hover:text-[var(--accent)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                (415) 447-4001
              </a>
              
              <ClientOnly>
                <LanguageSwitcher variant="simple" />
              </ClientOnly>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 