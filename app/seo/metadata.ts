import type { Metadata } from "next";

type MetadataProps = {
  path?: string;
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
};

/**
 * Generates metadata for each page based on the path
 */
export function generateMetadata({ path, params = {}, searchParams = {} }: MetadataProps): Metadata {
  // Base metadata that applies to all pages
  const baseMetadata: Metadata = {
    title: "CA International Autobody | Premium Auto Body Shop",
    description: "Expert collision repair, custom paint jobs, and classic car restoration in San Francisco. We're the Bay Area's premier auto body shop for luxury and specialty vehicles.",
    keywords: "auto body shop, collision repair, custom paint, car restoration, San Francisco, luxury cars, classic restoration",
    authors: [{ name: "CA International Autobody" }],
    creator: "CA International Autobody",
    publisher: "CA International Autobody",
    robots: "index, follow",
    applicationName: "CA International Autobody Website",
    openGraph: {
      type: "website",
      locale: "en_US",
      url: `https://cainternationalautobody.com/${path || ""}`,
      siteName: "CA International Autobody",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@CAInternationalAutobody",
    },
    other: {
      "google-site-verification": "your-verification-code",
    },
  };

  // Page-specific metadata
  switch (path) {
    case "about":
      return {
        ...baseMetadata,
        title: "About Us | CA International Autobody",
        description: "Learn about CA International Autobody's journey since 1997. Our skilled technicians combine traditional craftsmanship with cutting-edge technology for exceptional automotive services.",
        keywords: "auto body shop history, San Francisco auto body, car repair experts, automotive technicians, Carlos Alvarez",
        openGraph: {
          ...baseMetadata.openGraph,
          title: "About CA International Autobody | Our Story & Team",
          description: "Discover our 25+ years of excellence in automotive repair and restoration. Meet our expert team dedicated to quality and customer satisfaction.",
          images: [
            {
              url: "https://cainternationalautobody.com/images/about/workshop.jpg",
              width: 1200,
              height: 630,
              alt: "CA International Autobody Workshop",
            },
          ],
        },
      };

    case "services":
      return {
        ...baseMetadata,
        title: "Auto Body Services | CA International Autobody",
        description: "Complete collision repair, custom paint, classic car restoration and specialty automotive services in San Francisco. Expert technicians and premium materials.",
        keywords: "collision repair, custom paint, auto body services, car restoration, dent repair, paint correction, San Francisco",
        openGraph: {
          ...baseMetadata.openGraph,
          title: "Professional Auto Body Services | CA International",
          description: "From collision repair to custom paint work and classic restoration, our comprehensive services keep your vehicle looking its best.",
          images: [
            {
              url: "https://cainternationalautobody.com/images/services/collision.jpg",
              width: 1200,
              height: 630,
              alt: "CA International Autobody Services",
            },
          ],
        },
      };

    case "gallery":
      return {
        ...baseMetadata,
        title: "Our Work Gallery | CA International Autobody",
        description: "Browse our portfolio of completed auto body projects. See our quality collision repairs, custom paint jobs, and classic car restorations.",
        keywords: "auto body portfolio, car repair examples, paint job gallery, restoration projects, before and after, car makeovers",
        openGraph: {
          ...baseMetadata.openGraph,
          title: "Auto Body Work Gallery | CA International",
          description: "View our showcase of completed projects including collision repairs, custom paint work, and classic car restorations.",
          images: [
            {
              url: "https://cainternationalautobody.com/images/gallery/paint-1.jpg",
              width: 1200,
              height: 630,
              alt: "CA International Autobody Gallery",
            },
          ],
        },
      };

    case "testimonials":
      return {
        ...baseMetadata,
        title: "Client Testimonials | CA International Autobody",
        description: "Read what our satisfied customers have to say about their experiences with CA International Autobody in San Francisco.",
        keywords: "auto body reviews, customer testimonials, car repair feedback, San Francisco auto shop reviews, collision repair recommendations",
        openGraph: {
          ...baseMetadata.openGraph,
          title: "Customer Testimonials | CA International",
          description: "Don't just take our word for it - see what our customers are saying about our quality workmanship and exceptional service.",
          images: [
            {
              url: "https://cainternationalautobody.com/images/testimonials-og.jpg",
              width: 1200,
              height: 630,
              alt: "CA International Autobody Testimonials",
            },
          ],
        },
      };

    case "contact":
      return {
        ...baseMetadata,
        title: "Contact Us | CA International Autobody",
        description: "Get in touch with CA International Autobody in San Francisco. Schedule a service, request a quote, or ask questions about our auto body services.",
        keywords: "auto body contact, car repair quote, schedule car service, San Francisco auto shop, collision repair consultation",
        openGraph: {
          ...baseMetadata.openGraph,
          title: "Contact CA International Autobody | Get a Quote",
          description: "Reach out to our team for expert auto body services, free estimates, and exceptional customer service.",
          images: [
            {
              url: "https://cainternationalautobody.com/images/contact-og.jpg",
              width: 1200,
              height: 630,
              alt: "Contact CA International Autobody",
            },
          ],
        },
      };

    case "booking":
      return {
        ...baseMetadata,
        title: "Book an Appointment | CA International Autobody",
        description: "Schedule your auto body service appointment online with CA International Autobody in San Francisco. Quick and convenient booking process.",
        keywords: "schedule auto body repair, book car service, online appointment, San Francisco car repair scheduling, auto service booking",
        openGraph: {
          ...baseMetadata.openGraph,
          title: "Book Your Auto Body Service | CA International",
          description: "Schedule your appointment in just a few clicks. Our online booking system makes it easy to get your vehicle the care it needs.",
          images: [
            {
              url: "https://cainternationalautobody.com/images/booking-og.jpg",
              width: 1200,
              height: 630,
              alt: "Book an Appointment with CA International Autobody",
            },
          ],
        },
      };

    default:
      return baseMetadata;
  }
} 