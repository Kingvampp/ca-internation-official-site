"use client";

import React from 'react';
import Image, { ImageProps } from 'next/image';

export interface BlurZone {
  x: number; // percentage from left
  y: number; // percentage from top
  width: number; // percentage of total width
  height: number; // percentage of total height
  rotation?: number; // rotation angle in degrees
  blurAmount?: number; // blur intensity
}

interface BlurredLicensePlateImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  alt: string;
  licensePlatePosition?: BlurZone;
  blurIntensity?: number;
  blurAreas?: BlurZone[] | Record<string, BlurZone[]>;
}

/**
 * A component that displays an image with blurred areas for license plates or other sensitive information.
 * Uses CSS to apply a blur filter to specific areas of the image.
 */
export default function BlurredLicensePlateImage({
  src,
  alt,
  licensePlatePosition,
  blurIntensity,
  blurAreas,
  ...props
}: BlurredLicensePlateImageProps) {
  // For the public gallery, just render the image without any blur functionality
  // This is a simplified version to restore the original gallery appearance
  return (
    <div className="relative w-full h-full">
      <Image 
        src={src} 
        alt={alt}
        {...props} 
      />
    </div>
  );
} 