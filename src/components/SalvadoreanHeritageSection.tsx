'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

const SalvadoreanHeritageSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-900 to-blue-800 text-white relative overflow-hidden">
      {/* Background design elements */}
      <div className="absolute inset-0 bg-[url('/images/texture-overlay.png')] opacity-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl opacity-15 transform translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl opacity-10 transform -translate-x-1/4 -translate-y-1/4"></div>
      
      {/* El Salvador flag-inspired design element */}
      <div className="absolute top-0 left-0 right-0 h-3 flex">
        <div className="w-1/2 bg-blue-600"></div>
        <div className="w-1/2 bg-white"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2">
            <div className="relative mb-10">
              <div className="absolute inset-0 opacity-75 transform -rotate-3 bg-white/10 rounded-lg"></div>
              <div className="relative bg-gradient-to-br from-blue-800 to-blue-700 rounded-lg p-6 border border-blue-600/30 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <span className="text-4xl mr-3">🇸🇻</span>
                    <h3 className="text-xl font-semibold text-blue-200">El Salvador</h3>
                  </div>
                  <div className="bg-blue-600/20 px-3 py-1 rounded-full text-sm font-medium text-blue-100">
                    Salvadorean Pride
                  </div>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold mb-6 translatable">
                  {t('home.salvadorean.heritage', 'Proud of Our Salvadorean Heritage')}
                </h2>
                
                <p className="text-blue-100 mb-4 translatable">
                  {t('home.salvadorean.quality', 'Combining Salvadorean craftsmanship with cutting-edge technology')}
                </p>
                
                <p className="text-blue-100 translatable">
                  {t('home.salvadorean.commitment', 'Committed to exceptional service for your vehicle')}
                </p>
                
                <div className="mt-8 flex gap-4">
                  <div className="bg-blue-700/30 p-3 rounded-lg flex items-center">
                    <div className="bg-blue-600/30 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200 block">Established</span>
                      <span className="font-medium">2005</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-700/30 p-3 rounded-lg flex items-center">
                    <div className="bg-blue-600/30 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-sm text-blue-200 block">Trust</span>
                      <span className="font-medium">100% Guaranteed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <div className="relative">
              {/* Main image */}
              <div className="rounded-lg overflow-hidden shadow-xl border-4 border-white/20 transform rotate-2 mb-4">
                <img 
                  src="/images/el-salvador-craftsman.jpg" 
                  alt="Salvadorean Craftsmanship" 
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80";
                  }}
                />
              </div>
              
              {/* Accent image 1 */}
              <div className="absolute -top-4 -right-4 rounded-lg overflow-hidden shadow-lg border-4 border-white/20 transform -rotate-3 w-40 h-40 z-20">
                <img 
                  src="/images/el-salvador-flag.jpg" 
                  alt="El Salvador Flag" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1519817650390-64a93db51149?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80";
                  }}
                />
              </div>
              
              {/* Accent image 2 */}
              <div className="absolute -bottom-4 -left-4 rounded-lg overflow-hidden shadow-lg border-4 border-white/20 transform rotate-3 w-40 h-40 z-10">
                <img 
                  src="/images/auto-work.jpg" 
                  alt="Auto Body Work" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SalvadoreanHeritageSection; 