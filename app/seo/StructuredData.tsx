"use client";

import React from 'react';

export interface LocalBusinessSchema {
  name: string;
  description: string;
  url: string;
  telephone: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  openingHours: string[];
  serviceArea?: string;
  priceRange?: string;
  image?: string;
}

export interface ServiceSchema {
  name: string;
  description: string;
  provider: {
    name: string;
    url: string;
  };
  serviceType: string;
  areaServed: string;
  offers?: {
    price?: string;
    priceCurrency?: string;
    availability?: string;
    validFrom?: string;
  };
}

interface Props {
  pageType: "home" | "about" | "services" | "contact" | "gallery" | "booking" | "testimonials";
}

// Default business information
const businessInfo: LocalBusinessSchema = {
  name: "CA International Autobody",
  description: "Expert collision repair, custom paint jobs, and classic car restoration in San Francisco.",
  url: "https://cainternationalautobody.com",
  telephone: "+14154474001",
  address: {
    streetAddress: "123 Auto Center Drive",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94110",
    addressCountry: "US",
  },
  geo: {
    latitude: 37.7749,
    longitude: -122.4194,
  },
  openingHours: [
    "Monday-Friday 08:00-18:00",
    "Saturday 09:00-16:00",
    "Sunday Closed",
  ],
  serviceArea: "San Francisco Bay Area",
  priceRange: "$$-$$$",
  image: "https://cainternationalautobody.com/images/logo/ca-logo.png",
};

// Service offerings
const services: ServiceSchema[] = [
  {
    name: "Collision Repair",
    description: "Comprehensive collision repair services from minor dents to major structural damage.",
    provider: {
      name: "CA International Autobody",
      url: "https://cainternationalautobody.com",
    },
    serviceType: "Collision Repair",
    areaServed: "San Francisco Bay Area",
    offers: {
      availability: "InStock",
    },
  },
  {
    name: "Custom Paint",
    description: "Premium custom paint services from factory color matching to unique custom finishes.",
    provider: {
      name: "CA International Autobody",
      url: "https://cainternationalautobody.com",
    },
    serviceType: "Auto Paint",
    areaServed: "San Francisco Bay Area",
    offers: {
      availability: "InStock",
    },
  },
  {
    name: "Classic Car Restoration",
    description: "Meticulous classic car restoration services combining traditional craftsmanship with modern techniques.",
    provider: {
      name: "CA International Autobody",
      url: "https://cainternationalautobody.com",
    },
    serviceType: "Auto Restoration",
    areaServed: "San Francisco Bay Area",
    offers: {
      availability: "InStock",
    },
  },
];

const StructuredData: React.FC<Props> = ({ pageType }) => {
  let schema;

  switch (pageType) {
    case 'home':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'AutoBodyShop',
        ...businessInfo,
        sameAs: [
          'https://www.facebook.com/cainternationalautobody',
          'https://twitter.com/cainternational',
          'https://www.instagram.com/cainternationalautobody/',
          'https://www.linkedin.com/company/ca-international-autobody',
        ],
      };
      break;

    case 'about':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        mainEntity: {
          '@type': 'AutoBodyShop',
          ...businessInfo,
          foundingDate: '1997',
          founder: {
            '@type': 'Person',
            name: 'Carlos Alvarez',
            jobTitle: 'Founder & Master Technician',
          },
          numberOfEmployees: {
            '@type': 'QuantitativeValue',
            value: '15+',
          },
        },
      };
      break;

    case 'services':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: services.map((service, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Service',
            ...service,
          },
        })),
      };
      break;

    case 'contact':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        mainEntity: {
          '@type': 'AutoBodyShop',
          ...businessInfo,
          contactPoint: {
            '@type': 'ContactPoint',
            telephone: businessInfo.telephone,
            contactType: 'customer service',
            availableLanguage: ['English', 'Spanish'],
          },
        },
      };
      break;

    case 'gallery':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: 'CA International Autobody Work Gallery',
        description: 'Portfolio of completed auto body projects including collision repairs, custom paint work, and classic car restorations.',
        url: 'https://cainternationalautobody.com/gallery',
        publisher: {
          '@type': 'AutoBodyShop',
          name: businessInfo.name,
          logo: {
            '@type': 'ImageObject',
            url: businessInfo.image,
          },
        },
      };
      break;

    case 'booking':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'ReservationPage',
        name: 'Book an Appointment with CA International Autobody',
        description: 'Schedule your auto body service appointment online with CA International Autobody.',
        provider: {
          '@type': 'AutoBodyShop',
          name: businessInfo.name,
          url: businessInfo.url,
        },
        potentialAction: {
          '@type': 'ReserveAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://cainternationalautobody.com/booking',
            inLanguage: 'en-US',
            actionPlatform: [
              'http://schema.org/DesktopWebPlatform',
              'http://schema.org/MobileWebPlatform',
            ],
          },
          result: {
            '@type': 'Reservation',
            provider: {
              '@type': 'AutoBodyShop',
              name: businessInfo.name,
            },
          },
        },
      };
      break;

    case 'testimonials':
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Client Testimonials - CA International Autobody',
        url: 'https://cainternationalautobody.com/testimonials',
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: [
            {
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: 'Michael Chen',
              },
              itemReviewed: {
                '@type': 'AutoBodyShop',
                name: businessInfo.name,
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5',
              },
              datePublished: '2023-03-15',
              reviewBody: 'CA International transformed my Tesla after a rear-end collision. They matched the paint perfectly and restored it to factory condition. Their attention to detail is exceptional!',
            },
            {
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: 'Sofia Rodriguez',
              },
              itemReviewed: {
                '@type': 'AutoBodyShop',
                name: businessInfo.name,
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5',
              },
              datePublished: '2023-01-22',
              reviewBody: 'I brought my M3 in for custom paint work and couldn\'t be happier with the results. The metallic finish they applied looks better than the original factory paint. Absolutely stunning workmanship.',
            },
            {
              '@type': 'Review',
              author: {
                '@type': 'Person',
                name: 'James Wilson',
              },
              itemReviewed: {
                '@type': 'AutoBodyShop',
                name: businessInfo.name,
              },
              reviewRating: {
                '@type': 'Rating',
                ratingValue: '5',
                bestRating: '5',
              },
              datePublished: '2023-02-08',
              reviewBody: 'Their classic car restoration expertise is unmatched. They meticulously restored my \'67 Mustang while preserving its original character. Every detail was handled with care and precision.',
            },
          ],
        },
      };
      break;

    default:
      schema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'CA International Autobody',
        description: businessInfo.description,
        url: businessInfo.url,
      };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export default StructuredData; 