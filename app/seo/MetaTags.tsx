import React from 'react';
import { Metadata } from 'next';

interface MetaTagsProps {
  title: string;
  description: string;
  keywords?: string;
}

/**
 * Generate metadata for a page using Next.js App Router
 */
export function generateMetadata({
  title,
  description,
  keywords = "auto body shop, collision repair, custom paint, car restoration, San Francisco, ceramic coating, paintless dent repair"
}: MetaTagsProps): Metadata {
  // Base URL for the website
  const baseUrl = 'https://cainternationalautobody.com';
  
  // Default OG image
  const ogImage = `${baseUrl}/images/og-image.jpg`;
  
  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: 'CA International Autobody',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: 'CA International Autobody',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: baseUrl,
    },
    other: {
      'geo.region': 'US-CA',
      'geo.placename': 'San Francisco',
      'geo.position': '37.7749;-122.4194',
      'ICBM': '37.7749, -122.4194',
    },
  };
} 