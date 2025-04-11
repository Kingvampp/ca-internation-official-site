"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaTimes, FaPhone, FaTachometerAlt, FaGlobe } from "react-icons/fa";
import LanguageToggle from "../LanguageToggle";
import { useLanguage } from "../../utils/LanguageContext";

const navLinks = [
  { href: "/", label: "navigation.home" },
  { href: "/about", label: "navigation.about" },
  { href: "/services", label: "navigation.services" },
  { href: "/gallery", label: "navigation.gallery" },
  { href: "/testimonials", label: "navigation.testimonials" },
  { href: "/contact", label: "navigation.contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, translationStats, language } = useLanguage();

  // Log translations being loaded on mount
  useEffect(() => {
    console.log('🧭 [Navbar] Mounted with translations stats:', {
      loaded: translationStats.loaded,
      count: translationStats.count,
      missingCount: translationStats.missing.length
    });
    
    // Log a sample nav item translation
    const homeTranslation = t('navigation.home');
    console.log(`🧭 [Navbar] Sample translation - navigation.home: "${homeTranslation}"`);
    
    // Check important translation keys
    const keysToCheck = [
      'navigation.home',
      'navigation.about',
      'navigation.services',
      'navigation.gallery',
      'navigation.testimonials',
      'navigation.contact',
      'navigation.book.now',
      'navigation.now',
      'navigation.call.us',
      'navigation.415.4474001'
    ];
    
    keysToCheck.forEach(key => {
      const translation = t(key);
      if (translation === key) {
        console.warn(`🧭 [Navbar] Missing translation for: ${key}`);
      } else {
        console.log(`🧭 [Navbar] Translation loaded for ${key}: "${translation}"`);
      }
    });
    
    // Check for missing nav translations
    navLinks.forEach(link => {
      const translation = t(link.label);
      if (translation === link.label) {
        console.warn(`🧭 [Navbar] Missing translation for: ${link.label}`);
      }
    });
  }, [t, translationStats, language]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white bg-opacity-95 shadow-md py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="relative z-10">
            <div className="flex items-center">
              <div className="relative h-12 w-12 mr-3">
                <Image
                  src="/images/logo/ca-logo.png"
                  alt="CA International Automotive"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className={`font-bold text-xl ${isScrolled ? 'text-bmw-dark-blue' : 'text-white'}`}>
                  CA International Automotive</h1>
                <div className="flex space-x-1">
                  <span className="h-1 w-8 bg-bmw-blue rounded-sm"></span>
                  <span className="h-1 w-8 bg-bmw-red rounded-sm"></span>
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 font-medium transition-colors group ${
                  isScrolled ? "text-gray-800" : "text-white"
                }`}
              >
                {t(link.label)}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-bmw-blue via-white to-bmw-red scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
            
            {/* Language Toggle */}
            <div className="ml-1">
              <LanguageToggle />
            </div>
            
            {/* Phone Icon Button - Compact version */}
            <a
              href="tel:+14154474001"
              className={`flex items-center justify-center p-2 rounded-full ${
                isScrolled
                  ? "bg-white/10 text-bmw-blue hover:bg-bmw-blue hover:text-white"
                  : "bg-white/10 text-white hover:bg-white hover:text-bmw-blue"
              } transition-colors`}
              aria-label={t('navigation.call.us')}
              title={t('navigation.415.4474001')}
            >
              <FaPhone size={16} />
            </a>
            
            {/* Book Now Button */}
            <Link
              href="/booking"
              className={`px-4 py-2 rounded ${
                isScrolled
                  ? "bg-bmw-blue text-white hover:bg-bmw-dark-blue"
                  : "bg-white text-bmw-blue hover:bg-gray-100"
              } font-medium transition-colors shadow-md`}
            >
              {t('navigation.book.now')}
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-white z-50 w-10 h-10 flex items-center justify-center"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen 
              ? <FaTimes size={24} color="white" />
              : <FaBars size={24} color={isScrolled ? "#1c69d4" : "white"} />
            }
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-gradient-to-b from-bmw-dark-blue to-bmw-blue z-40 pt-20"
          >
            <div className="container mx-auto px-4 py-5">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white text-xl py-2 border-b border-blue-400 border-opacity-20"
                  >
                    {t(link.label)}
                  </Link>
                ))}
                
                <div className="pt-4 flex justify-between items-center">
                  <LanguageToggle />
                  
                  <Link
                    href="/booking"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-5 py-3 bg-white text-bmw-blue rounded-md font-bold shadow-lg"
                  >
                    {t('navigation.book.now')}
                  </Link>
                </div>
                
                <a
                  href="tel:+14154474001"
                  className="flex items-center space-x-2 text-white py-4 mt-4"
                >
                  <FaPhone size={16} />
                  <span className="text-lg font-medium">{t('navigation.415.4474001')}</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
} 