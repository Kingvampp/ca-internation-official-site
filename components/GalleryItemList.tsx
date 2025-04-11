"use client";

import React from 'react';
import { GalleryItem } from '../utils/galleryService';
import TranslatableGalleryCard from './cards/TranslatableGalleryCard';
import { useLanguage } from '../utils/LanguageContext';

type GalleryItemListProps = {
  items: GalleryItem[];
  loading?: boolean;
  error?: string | null;
};

export default function GalleryItemList({ items, loading = false, error = null }: GalleryItemListProps) {
  const { t, language } = useLanguage();
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-white">{language === 'es' ? 'Cargando...' : 'Loading...'}</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-50 border-l-4 border-red-600 text-white p-4 mb-4" role="alert">
        <p>{error}</p>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-navy-800 rounded-lg">
        <p className="text-gray-300">{language === 'es' ? 'No se encontraron proyectos.' : 'No projects found.'}</p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {items.map(item => (
        <TranslatableGalleryCard 
          key={item.id} 
          item={item} 
        />
      ))}
    </div>
  );
} 