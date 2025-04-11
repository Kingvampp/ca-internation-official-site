'use client';

import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Footer() {
  const { t, ready } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on server
  if (!isMounted) {
    return null;
  }

  // Show loading state while i18n initializes
  if (!ready) {
    return (
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 w-40 bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-full bg-gray-700 rounded mb-2"></div>
            <div className="h-4 w-3/4 bg-gray-700 rounded mb-8"></div>
          </div>
        </div>
      </footer>
    );
  }
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">CA International Automotive</h3>
            <p className="mb-4 text-gray-300">
              {t('footer.description', 'Premium auto body shop specializing in high-quality repairs and transformations of luxury and classic vehicles.')}
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.quickLinks', 'Quick Links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('navigation.about', 'About Us')}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  {t('navigation.services', 'Services')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('navigation.contact', 'Contact')}
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{t('footer.contactUs', 'Contact Us')}</h3>
            <p className="mb-2">
              <strong>{t('footer.address', 'Address')}:</strong> 123 Auto Plaza Dr, San Francisco, CA 94132
            </p>
            <p className="mb-2">
              <strong>{t('footer.phone', 'Phone')}:</strong> (415) 447-4001
            </p>
            <p className="mb-4">
              <strong>Email:</strong> info@cainternational.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            {t('footer.copyright', '© 2024 CA International Automotive. All rights reserved.')}
          </p>
          <div className="flex space-x-4">
            <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.privacy', 'Privacy Policy')}
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
              {t('footer.terms', 'Terms of Service')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 