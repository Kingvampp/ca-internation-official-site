'use client';

import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const stats = [
  { value: '20+', key: 'quickStats.experience', defaultText: 'Years Experience' },
  { value: '100%', key: 'quickStats.recommended', defaultText: 'Highly Recommended by Mercedes Dealerships' },
  { value: '1000+', key: 'quickStats.transformations', defaultText: 'Vehicles Transformed' }
];

const QuickStats = () => {
  const { t } = useLanguage();
  
  return (
    <section className="py-12 bg-white">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {stats.map((stat, index) => (
            <div key={index} className="p-6 rounded-lg">
              <div className="text-4xl md:text-5xl font-bold text-[var(--primary)]">
                {stat.value}
              </div>
              <div className="mt-2 text-lg font-medium">
                {t(stat.key, stat.defaultText)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickStats; 