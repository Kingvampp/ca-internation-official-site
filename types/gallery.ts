export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  mainImage: string;
  beforeImages: string[];
  afterImages: string[];
  categories: string[];
  tags: string[];
  translationKeys?: {
    title: string;
    description: string;
  };
} 