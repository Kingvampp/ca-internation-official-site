'use client';
import { useTranslation } from 'react-i18next';

import Link from 'next/link';
import Image from 'next/image';
import { useState, ReactNode } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ServiceCardProps {
  title: string;
  description: string;
  icon: string | ReactNode;
  link: string;
  index: number;
}

const ServiceCard = ({ title, description, icon, link, index }: ServiceCardProps) => {
  const { language } = useLanguage();

const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  
  // Calculate delay for staggered animation
  const animationDelay = `${index * 0.1}s`;
  
  // Check if icon is a string
  const isStringIcon = typeof icon === 'string';
  
  // Check if icon is an emoji (doesn't start with '/')
  const isEmoji = isStringIcon && !icon.startsWith('/');
  
  return (
    <div 
      className="group relative overflow-hidden rounded-lg transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl"
      style={{ animationDelay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-dark)] to-[var(--primary)] opacity-90 transition-all duration-500 group-hover:opacity-95"></div>
      
      {/* Racing stripe accent */}
      <div className="absolute top-0 left-0 right-0 flex h-1">
        <div className="w-1/3 bg-[var(--accent)]"></div>
        <div className="w-1/3 bg-[var(--accent-secondary)]"></div>
        <div className="w-1/3 bg-[var(--gold)]"></div>
      </div>
      
      {/* Service number */}
      <div className="absolute -right-4 -top-4 w-24 h-24 flex items-center justify-center">
        <div className="text-6xl font-bold text-white/10">{index + 1}</div>
      </div>
      
      {/* Card content */}
      <div className="relative z-10 p-8">
        <div className="flex items-start mb-6">
          <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center mr-4 border border-white/20 shadow-lg transition-all duration-300 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)]">
            {!isStringIcon ? (
              // JSX element icon
              icon
            ) : isEmoji ? (
              // Emoji icon
              <span className="text-3xl transition-all duration-300 group-hover:scale-110">{icon}</span>
            ) : icon ? (
              // Image path icon
              <Image 
                src={icon} 
                alt={title} 
                width={32} 
                height={32} 
                className="transition-all duration-300 group-hover:scale-110"
              />
            ) : (
              // Fallback icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white">{title}</h3>
        </div>
        
        <p className="text-white/80 mb-6 line-clamp-3">{description}</p>
        
        <Link 
          href={link} 
          className="inline-flex items-center text-white font-medium group-hover:text-[var(--accent)] transition-colors"
        >
          <span className="mr-2 translatable">{t('services.learnMore', 'Learn More')}</span>
          <span className="relative">
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[var(--accent)] transition-all duration-300 group-hover:w-full"></span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </Link>
      </div>
      
      {/* Animated corner accent */}
      <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden transition-all duration-500 group-hover:w-16 group-hover:h-16">
        <div className="absolute transform rotate-45 bg-[var(--accent)] w-16 h-16 -bottom-8 -right-8 group-hover:-bottom-6 group-hover:-right-6 transition-all duration-500"></div>
      </div>
      
      {/* Hover effect overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-[var(--accent)]/20 to-transparent opacity-0 transition-opacity duration-500 ${isHovered ? 'opacity-100' : ''}`}
      ></div>
    </div>
  );
};

export default ServiceCard; 
