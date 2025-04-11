/**
 * Hero Image Optimization Script
 * 
 * This script creates optimized mobile versions of hero images.
 * 
 * Requirements:
 * - Node.js
 * - sharp package: npm install sharp
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Paths
const sourceDir = path.join(__dirname, '../public/images');
const heroImagesDir = path.join(sourceDir, 'optimized/hero');
const mobileImagesDir = path.join(sourceDir, 'optimized/hero');

// Ensure directories exist
if (!fs.existsSync(heroImagesDir)) {
  fs.mkdirSync(heroImagesDir, { recursive: true });
}

if (!fs.existsSync(mobileImagesDir)) {
  fs.mkdirSync(mobileImagesDir, { recursive: true });
}

// Hero images to optimize
const heroImages = [
  'hero-1.jpg',
  'hero-2.jpg',
  'hero-3.jpg'
];

// Sizes and formats
const sizes = {
  desktop: { width: 1920, height: null }, // Maintain aspect ratio
  mobile: { width: 768, height: null }    // Maintain aspect ratio
};

const formats = [
  { name: 'webp', quality: 85 },
  { name: 'jpg', quality: 85 }
];

async function optimizeImages() {
  console.log('Starting image optimization...');
  
  for (const image of heroImages) {
    const sourcePath = path.join(sourceDir, image);
    
    if (!fs.existsSync(sourcePath)) {
      console.error(`Source image not found: ${sourcePath}`);
      continue;
    }
    
    console.log(`Processing: ${image}`);
    const imageName = path.parse(image).name;

    // Desktop versions
    for (const format of formats) {
      const outputFileName = `${imageName}.${format.name}`;
      const outputPath = path.join(heroImagesDir, outputFileName);
      
      try {
        await sharp(sourcePath)
          .resize(sizes.desktop.width, sizes.desktop.height)
          .toFormat(format.name, { quality: format.quality })
          .toFile(outputPath);
        
        console.log(`Created desktop ${format.name}: ${outputPath}`);
      } catch (error) {
        console.error(`Error processing ${image} for desktop ${format.name}:`, error);
      }
    }
    
    // Mobile versions
    for (const format of formats) {
      const outputFileName = `${imageName}-mobile.${format.name}`;
      const outputPath = path.join(mobileImagesDir, outputFileName);
      
      try {
        await sharp(sourcePath)
          .resize(sizes.mobile.width, sizes.mobile.height)
          .toFormat(format.name, { quality: format.quality })
          .toFile(outputPath);
        
        console.log(`Created mobile ${format.name}: ${outputPath}`);
      } catch (error) {
        console.error(`Error processing ${image} for mobile ${format.name}:`, error);
      }
    }
  }

  console.log('Image optimization complete!');
}

optimizeImages().catch(console.error); 