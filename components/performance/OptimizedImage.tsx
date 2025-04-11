import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage } from "../../utils/LanguageContext";

interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: {
    webp: string;
    jpg: string;
    original: string;
  };
  mobileSrc?: {
    webp: string;
    jpg: string;
    original: string;
  };
  fallbackBackground?: string;
}

export default function OptimizedImage({
  const { t } = useLanguage();
  src,
  mobileSrc,
  alt,
  fallbackBackground,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const activeSrc = isMobile && mobileSrc ? mobileSrc : src;
  
  if (hasError && fallbackBackground) {
    return (
      <div 
        className="absolute inset-0" 
        style={{ background: fallbackBackground }}
        role="img"
        aria-label={alt as string}
      />
    <picture>
      {/* WebP Support */}
      <source
        type="image/webp"
        srcSet={activeSrc.webp}
      />
      {/* JPEG Fallback */}
      <source
        type="image/jpeg"
        srcSet={activeSrc.jpg}
      />
      {/* Default Image with Next.js Image component */}
      <Image
        src={activeSrc.original}
        alt={alt as string}
        onError={() => setHasError(true)}
        {...props}
      />
    </picture>
  );
} 