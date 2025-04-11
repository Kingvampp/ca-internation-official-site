'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import LanguageToggle from './LanguageToggle';

/**
 * A component to test and demonstrate the translation system
 */
const TranslationTest: React.FC = () => {
  const { language, isClient, isReady } = useLanguage();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render anything server-side
  if (!isClient || !mounted || !isReady) {
    return <div className="p-8 text-center">Loading translations...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg my-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">{t('translationTest.title', 'Translation System Test')}</h1>
        <p className="text-gray-600">{t('translationTest.subtitle', 'Testing the translation functionality across the website')}</p>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-4">
          <div className="flex gap-2 items-center justify-center">
            <span className="text-sm text-gray-500">{t('translationTest.currentLanguage', 'Current Language')}:</span>
            <span className="font-semibold">{language === 'en' ? 'English' : 'Español'}</span>
          </div>
          
          <div className="flex gap-2 items-center justify-center">
            <span className="text-sm text-gray-500">{t('translationTest.switchLanguage', 'Switch Language')}:</span>
            <LanguageToggle />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">{t('translationTest.navigationSection', 'Navigation Items')}</h2>
          <ul className="space-y-2">
            <li><span className="text-gray-500">Home:</span> {t('navigation.home')}</li>
            <li><span className="text-gray-500">About:</span> {t('navigation.about')}</li>
            <li><span className="text-gray-500">Services:</span> {t('navigation.services')}</li>
            <li><span className="text-gray-500">Gallery:</span> {t('navigation.gallery')}</li>
            <li><span className="text-gray-500">Testimonials:</span> {t('navigation.testimonials')}</li>
            <li><span className="text-gray-500">Contact:</span> {t('navigation.contact')}</li>
            <li><span className="text-gray-500">Book Now:</span> {t('navigation.booking')}</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">{t('translationTest.footerSection', 'Footer Content')}</h2>
          <ul className="space-y-2">
            <li><span className="text-gray-500">Rights:</span> {t('footer.rights')}</li>
            <li><span className="text-gray-500">Privacy:</span> {t('footer.privacy')}</li>
            <li><span className="text-gray-500">Terms:</span> {t('footer.terms')}</li>
            <li><span className="text-gray-500">Quick Links:</span> {t('footer.quickLinks')}</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">{t('translationTest.servicesSection', 'Services')}</h2>
          <ul className="space-y-2">
            <li><span className="text-gray-500">Paint Jobs:</span> {t('featuredServices.paintJobs')}</li>
            <li><span className="text-gray-500">Restoration:</span> {t('featuredServices.restoration')}</li>
            <li><span className="text-gray-500">Collision:</span> {t('featuredServices.collision')}</li>
            <li><span className="text-gray-500">Detailing:</span> {t('featuredServices.detailing')}</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3">{t('translationTest.welcomeSection', 'Welcome Modal')}</h2>
          <ul className="space-y-2">
            <li><span className="text-gray-500">Title:</span> {t('welcome.title')}</li>
            <li><span className="text-gray-500">Select Language:</span> {t('welcome.selectLanguage')}</li>
            <li><span className="text-gray-500">Continue:</span> {t('welcome.continue')}</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">{t('translationTest.untranslated', 'Untranslated Content')}</h2>
        <p>{t('translationTest.untranslatedExplanation', 'The following items should NOT be translated:')}</p>
        
        <div className="mt-3 space-y-2">
          <div><span className="text-gray-500">Company Name:</span> <span className="notranslate">CA International Autobody</span></div>
          <div><span className="text-gray-500">Phone Number:</span> <span className="notranslate">(415) 447-4001</span></div>
          <div><span className="text-gray-500">Address:</span> <span className="notranslate">123 Auto Repair St., San Francisco, CA 94110</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="notranslate">international_auto@sbcglobal.net</span></div>
        </div>
      </div>
      
      <div className="mt-8 text-center text-sm text-gray-500">
        {t('translationTest.lastUpdated', 'Last Updated')}: {new Date().toLocaleString(language === 'en' ? 'en-US' : 'es-ES')}
      </div>
    </div>
  );
};

export default TranslationTest; 