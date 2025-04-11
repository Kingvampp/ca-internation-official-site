# Image Optimization Guide

This guide explains the image optimization flow set up for this project.

## Overview

The website uses a multi-tier approach to image optimization:

1. Server-side image optimization using Sharp
2. Modern image formats (WebP with JPEG fallbacks)
3. Responsive images for desktop and mobile
4. Lazy loading for non-critical images
5. Fallback mechanisms for older browsers

## Optimization Scripts

### Hero Images

The `optimize-hero` script optimizes hero images for both desktop and mobile:

```bash
npm run optimize-hero
```

This script:
- Takes the original hero images from `/public/images/`
- Creates WebP and JPEG versions for both desktop and mobile 
- Outputs to `/public/images/optimized/hero/`

## Usage in Components

### OptimizedImage Component

For consistent image optimization across the site, use the `OptimizedImage` component:

```tsx
import OptimizedImage from '@/components/performance/OptimizedImage';

<OptimizedImage 
  src={{
    webp: "/images/optimized/path/to/image.webp",
    jpg: "/images/optimized/path/to/image.jpg",
    original: "/images/path/to/original.jpg"
  }}
  mobileSrc={{
    webp: "/images/optimized/path/to/mobile-image.webp",
    jpg: "/images/optimized/path/to/mobile-image.jpg",
    original: "/images/path/to/original.jpg"
  }}
  alt="Description of the image"
  fill
  className="object-cover"
  fallbackBackground="linear-gradient(45deg, #000F2C, #16588E)"
  priority={true} // for critical above-the-fold images
  sizes="(max-width: 767px) 100vw, 50vw"
/>
```

### For Other Page Sections

To optimize images for other sections, follow these steps:

1. Create a new optimization script in `scripts/` folder
2. Add a new npm script in package.json
3. Run the script to generate optimized images
4. Update the component to use the OptimizedImage component

## Best Practices

1. **Image Size**: Keep original images under 1MB for efficient processing
2. **Dimensions**: Use appropriate dimensions for each viewport:
   - Desktop: 1920px width max
   - Mobile: 768px width max
3. **Format Priority**: Use WebP as the primary format with JPEG fallbacks
4. **Critical Images**: Add `priority={true}` for above-the-fold images
5. **Lazy Loading**: Let Next.js handle lazy loading for below-the-fold images
6. **Alt Text**: Always include meaningful alt text for accessibility
7. **Fallbacks**: Provide fallback gradients for image loading failures

## Tools Used

- [sharp](https://www.npmjs.com/package/sharp) - Image processing library
- [Next.js Image](https://nextjs.org/docs/api-reference/next/image) - Core image component
- [WebP](https://developers.google.com/speed/webp) - Modern image format 