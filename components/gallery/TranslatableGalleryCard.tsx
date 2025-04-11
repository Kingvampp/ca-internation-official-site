"use client";

import React from "react";
import Link from "next/link";
import { GalleryItem } from "../../utils/galleryService";
import { useLanguage } from "../../utils/LanguageContext";
import BlurredLicensePlateImage from "../BlurredLicensePlateImage";

interface TranslatableGalleryCardProps {
  item: GalleryItem;
}

const TranslatableGalleryCard: React.FC<TranslatableGalleryCardProps> = ({ item }) => {
  const { t } = useLanguage();

  // Handle translation of title and description
  const getTitle = () => {
    // If translation keys exist and the title key is defined, use it for translation
    if (item.translationKeys?.title) {
      return t(item.translationKeys.title);
    }
    // Otherwise, fallback to the original title
    return item.title;
  };

  const getDescription = () => {
    // If translation keys exist and the description key is defined, use it for translation
    if (item.translationKeys?.description) {
      return t(item.translationKeys.description);
    }
    // Otherwise, fallback to the original description
    return item.description;
  };

  return (
    <Link href={`/gallery/${item.id}`}>
      <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        <div className="relative h-64 w-full">
          <BlurredLicensePlateImage
            src={item.mainImage}
            alt={getTitle()}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
            {getTitle()}
          </h2>
          <p className="text-gray-600 mb-4 line-clamp-2">{getDescription()}</p>
          <div className="flex flex-wrap gap-1">
            {item.categories?.map((category, index) => (
              <span key={index} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                {category}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TranslatableGalleryCard; 