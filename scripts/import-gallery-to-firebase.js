#!/usr/bin/env node

/**
 * Gallery Import Script
 * 
 * This script imports all gallery items from the public/images/gallery-page 
 * directory into Firebase Firestore for use in the admin dashboard.
 * 
 * Run with: node scripts/import-gallery-to-firebase.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const colors = require('colors');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
function initializeAdminApp() {
  // Check if we already have an initialized app
  try {
    const existingApp = admin.app();
    return existingApp;
  } catch (error) {
    // No existing app, initialize one
    try {
      // First try to load credentials from firebase-credentials.json
      const credentialsPath = path.join(__dirname, 'firebase-credentials.json');
      
      if (fs.existsSync(credentialsPath)) {
        console.log(colors.green('Loading Firebase credentials from firebase-credentials.json'));
        const serviceAccount = require('./firebase-credentials.json');
        console.log(colors.green(`Initializing Firebase Admin SDK for project: ${serviceAccount.project_id}`));
        
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
        });
      } else {
        // Fallback to environment variables
        console.log(colors.yellow('No firebase-credentials.json found, falling back to environment variables'));
        
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        };

        // Check if configuration is valid
        const hasAllConfig = serviceAccount.projectId && 
                             serviceAccount.clientEmail && 
                             serviceAccount.privateKey;

        if (!hasAllConfig) {
          console.error(colors.red('Firebase Admin SDK configuration is missing or incomplete:'));
          console.error(colors.red(`- projectId: ${serviceAccount.projectId ? 'OK' : 'MISSING'}`));
          console.error(colors.red(`- clientEmail: ${serviceAccount.clientEmail ? 'OK' : 'MISSING'}`));
          console.error(colors.red(`- privateKey: ${serviceAccount.privateKey ? 'OK' : 'MISSING'}`));
          console.error(colors.red('\nPlease run node scripts/update-firebase-credentials.js first'));
          process.exit(1);
        }

        console.log(colors.green(`Initializing Firebase Admin SDK for project: ${serviceAccount.projectId}`));

        // Initialize app with credential
        return admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
      }
    } catch (initError) {
      console.error(colors.red('Error initializing Firebase Admin SDK:'), initError);
      process.exit(1);
    }
  }
}

// Complete Gallery Data with all 13 projects
const galleryItems = [
  {
    id: "thunderbird-restoration",
    title: "Thunderbird Classic Restoration",
    description: "Complete restoration of a classic Thunderbird, bringing back its original glory with attention to every detail.",
    categories: ["restoration", "american", "classic"],
    tags: ["Thunderbird", "Classic", "Restoration", "American"],
    mainImage: "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
    beforeImages: [
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-side.jpg", 
      "/images/gallery-page/thunderbird-restoration/before-1-thunderbird-rear.jpg"
    ],
    afterImages: [
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-front.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-side.jpg",
      "/images/gallery-page/thunderbird-restoration/after-1-thunderbird-rear.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 30 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "red-cadillac-repair",
    title: "Red Cadillac Repair",
    description: "Precision repair and refinishing of this classic Cadillac, restoring its elegant red finish to showroom quality.",
    categories: ["bodywork", "american", "classic"],
    tags: ["Cadillac", "Bodywork", "Paint", "American"],
    mainImage: "/images/gallery-page/red-cadillac-repair/after-cadillac-front.jpg",
    beforeImages: [
      "/images/gallery-page/red-cadillac-repair/before-cadillac-front.jpg",
      "/images/gallery-page/red-cadillac-repair/before-cadillac-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/red-cadillac-repair/after-cadillac-front.jpg",
      "/images/gallery-page/red-cadillac-repair/after-cadillac-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 29 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "porsche-detail",
    title: "Porsche Detail Work",
    description: "Premium detailing service for this luxury Porsche, including paint correction, ceramic coating, and interior detailing.",
    categories: ["detailing", "european", "luxury"],
    tags: ["Porsche", "Detailing", "Luxury", "European"],
    mainImage: "/images/gallery-page/porsche-detail/After-11-porschedetail-side.jpg",
    beforeImages: [
      "/images/gallery-page/porsche-detail/before-porschedetail-front.jpg",
      "/images/gallery-page/porsche-detail/before-porschedetail-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/porsche-detail/After-11-porschedetail-side.jpg",
      "/images/gallery-page/porsche-detail/After-11-porschedetail-side(2).jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 28 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "mustang-rebuild",
    title: "Mustang Complete Rebuild",
    description: "Full rebuilding process for this classic Mustang, from frame restoration to final paint and detailing.",
    categories: ["restoration", "american", "classic"],
    tags: ["Mustang", "Rebuild", "Restoration", "American"],
    mainImage: "/images/gallery-page/mustang-rebuild/after-mustang-front.jpg",
    beforeImages: [
      "/images/gallery-page/mustang-rebuild/before-12mustangrebuild-front.jpg",
      "/images/gallery-page/mustang-rebuild/before-mustang-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/mustang-rebuild/after-mustang-front.jpg",
      "/images/gallery-page/mustang-rebuild/after-mustang-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 27 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "mercedes-sl550-repaint",
    title: "Mercedes SL550 Repaint",
    description: "Complete exterior repaint of a Mercedes SL550 with premium paint and expert color matching.",
    categories: ["paint", "european", "luxury"],
    tags: ["Mercedes", "SL550", "Paint", "European"],
    mainImage: "/images/gallery-page/mercedes-sl550-repaint/after-mercedes-front.jpg",
    beforeImages: [
      "/images/gallery-page/mercedes-sl550-repaint/before-mercedes-front.jpg",
      "/images/gallery-page/mercedes-sl550-repaint/before-mercedes-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/mercedes-sl550-repaint/after-mercedes-front.jpg",
      "/images/gallery-page/mercedes-sl550-repaint/after-mercedes-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 26 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "mercedes-repaint",
    title: "Mercedes S-Class Paint Correction",
    description: "Professional paint correction and ceramic coating on a Mercedes S-Class, restoring its showroom finish.",
    categories: ["detailing", "european", "luxury"],
    tags: ["Mercedes", "Paint Correction", "Ceramic Coating", "European"],
    mainImage: "/images/gallery-page/mercedes-repaint/after-mercedes-front.jpg",
    beforeImages: [
      "/images/gallery-page/mercedes-repaint/before-10-mercedesrepaint-front.jpg",
      "/images/gallery-page/mercedes-repaint/before-10-mercedesrepaint-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/mercedes-repaint/after-mercedes-front.jpg",
      "/images/gallery-page/mercedes-repaint/after-mercedes-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 25 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "jaguar-repaint",
    title: "Jaguar Full Exterior Repaint",
    description: "Complete repaint of this luxury Jaguar with meticulous attention to detail and perfect color matching.",
    categories: ["paint", "european", "luxury"],
    tags: ["Jaguar", "Paint", "Luxury", "European"],
    mainImage: "/images/gallery-page/jaguar-repaint/after-jaguar-front.jpg",
    beforeImages: [
      "/images/gallery-page/jaguar-repaint/before-jaguar-front.jpg",
      "/images/gallery-page/jaguar-repaint/before-jaguar-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/jaguar-repaint/after-jaguar-front.jpg",
      "/images/gallery-page/jaguar-repaint/after-jaguar-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 24 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "honda-accord-repair",
    title: "Honda Accord Collision Repair",
    description: "Comprehensive collision repair on a Honda Accord, restoring it to pre-accident condition with OEM parts.",
    categories: ["collision", "asian"],
    tags: ["Honda", "Accord", "Collision", "Repair"],
    mainImage: "/images/gallery-page/honda-accord-repair/after-honda-front.jpg",
    beforeImages: [
      "/images/gallery-page/honda-accord-repair/before-honda-front.jpg",
      "/images/gallery-page/honda-accord-repair/before-honda-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/honda-accord-repair/after-honda-front.jpg",
      "/images/gallery-page/honda-accord-repair/after-honda-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 23 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "green-mercedes-repair",
    title: "Green Mercedes Bodywork",
    description: "Expert bodywork and paint repair on this green Mercedes, fixing damage while maintaining the factory finish.",
    categories: ["bodywork", "european", "luxury"],
    tags: ["Mercedes", "Bodywork", "European", "Paint"],
    mainImage: "/images/gallery-page/green-mercedes-repair/after-greenmercedes-front.jpg",
    beforeImages: [
      "/images/gallery-page/green-mercedes-repair/before-greenmercedes-front.jpg",
      "/images/gallery-page/green-mercedes-repair/before-greenmercedes-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/green-mercedes-repair/after-greenmercedes-front.jpg",
      "/images/gallery-page/green-mercedes-repair/after-greenmercedes-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 22 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "bmw-e90-repair",
    title: "BMW E90 Restoration",
    description: "Complete restoration of a BMW E90, including bodywork, paint, and interior refinishing.",
    categories: ["restoration", "european"],
    tags: ["BMW", "E90", "Restoration", "European"],
    mainImage: "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg",
    beforeImages: [
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-front.jpg",
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-side.jpg",
      "/images/gallery-page/bmw-e90-repair/before-4-BmwE90-interior.jpg"
    ],
    afterImages: [
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-front.jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-side(2).jpg",
      "/images/gallery-page/bmw-e90-repair/After-4-BmwE90-interior.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 21 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "blue-mustang-repair",
    title: "Blue Mustang Collision Repair",
    description: "Expert collision repair on a blue Ford Mustang, restoring both appearance and structural integrity.",
    categories: ["collision", "american"],
    tags: ["Mustang", "Ford", "Collision", "American"],
    mainImage: "/images/gallery-page/blue-mustang-repair/after-bluemustang-front.jpg",
    beforeImages: [
      "/images/gallery-page/blue-mustang-repair/before-8-bluemustang-front.jpg",
      "/images/gallery-page/blue-mustang-repair/Before-8-bluemustang-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/blue-mustang-repair/after-bluemustang-front.jpg",
      "/images/gallery-page/blue-mustang-repair/after-bluemustang-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 20 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "blue-accord-repair",
    title: "Blue Accord Complete Repaint",
    description: "Full repaint of a blue Honda Accord with premium paint and clear coat for lasting protection.",
    categories: ["paint", "asian"],
    tags: ["Honda", "Accord", "Paint", "Asian"],
    mainImage: "/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg",
    beforeImages: [
      "/images/gallery-page/blue-accord-repair/Before-9-blueaccord-front.jpg",
      "/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side.jpg",
      "/images/gallery-page/blue-accord-repair/Before-9-blueaccord-side(2).jpg"
    ],
    afterImages: [
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-front.jpg",
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-side.jpg",
      "/images/gallery-page/blue-accord-repair/after-9-blueaccord-side(3).jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 19 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "blue-alfa-repair",
    title: "Blue Alfa Romeo Restoration",
    description: "Complete restoration of a classic blue Alfa Romeo, bringing back its Italian elegance and performance.",
    categories: ["restoration", "european"],
    tags: ["Alfa Romeo", "Restoration", "European", "Classic"],
    mainImage: "/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg",
    beforeImages: [
      "/images/gallery-page/blue-alfa-repair/before-3-bluealfa-front.jpg",
      "/images/gallery-page/blue-alfa-repair/before-bluealfa-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/blue-alfa-repair/after-3-bluealfa-front.jpg",
      "/images/gallery-page/blue-alfa-repair/after-bluealfa-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 18 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  },
  {
    id: "black-jeep-repair",
    title: "Black Jeep Body Repair",
    description: "Expert bodywork and repair for this black Jeep, fixing damage while maintaining its rugged appearance.",
    categories: ["bodywork", "american"],
    tags: ["Jeep", "Bodywork", "American", "SUV"],
    mainImage: "/images/gallery-page/black-jeep-repair/after-6-blackjeep-front.jpg",
    beforeImages: [
      "/images/gallery-page/black-jeep-repair/before-6-blackjeep-front.jpg",
      "/images/gallery-page/black-jeep-repair/before-6-blackjeep-side.jpg"
    ],
    afterImages: [
      "/images/gallery-page/black-jeep-repair/after-6-blackjeep-front.jpg",
      "/images/gallery-page/black-jeep-repair/after-6-blackjeep-side.jpg"
    ],
    createdAt: admin.firestore.Timestamp.fromMillis(Date.now() - 17 * 24 * 60 * 60 * 1000),
    blurAreas: {}
  }
];

// Check if collections exist and how many documents they contain
async function checkCollections(db) {
  try {
    console.log(colors.cyan('\nChecking existing collections...'));
    
    const gallerySnapshot = await db.collection('galleryItems').get();
    console.log(`- galleryItems: ${gallerySnapshot.size} documents`);
    
    return {
      galleryItems: gallerySnapshot.size
    };
  } catch (error) {
    console.error(colors.red('Error checking collections:'), error);
    throw error;
  }
}

// Clear collections if they exist
async function clearCollections(db, collections) {
  try {
    console.log(colors.yellow('\nClearing existing collections...'));
    
    if (collections.galleryItems > 0) {
      const galleryBatch = db.batch();
      const gallerySnapshot = await db.collection('galleryItems').get();
      
      gallerySnapshot.forEach(doc => {
        galleryBatch.delete(doc.ref);
      });
      
      await galleryBatch.commit();
      console.log(colors.green(`- Cleared ${gallerySnapshot.size} documents from galleryItems`));
    }
    
  } catch (error) {
    console.error(colors.red('Error clearing collections:'), error);
    throw error;
  }
}

// Initialize gallery items
async function initializeGallery(db) {
  try {
    console.log(colors.cyan('\nInitializing gallery items...'));
    
    // Use batched writes for better performance
    const batchSize = 500; // Firestore limit
    let batch = db.batch();
    let operationCount = 0;
    let totalItems = 0;
    
    for (const item of galleryItems) {
      const docRef = db.collection('galleryItems').doc(item.id);
      batch.set(docRef, item);
      operationCount++;
      totalItems++;
      
      if (operationCount >= batchSize) {
        await batch.commit();
        console.log(colors.green(`- Committed batch of ${operationCount} gallery items`));
        batch = db.batch();
        operationCount = 0;
      }
    }
    
    // Commit any remaining operations
    if (operationCount > 0) {
      await batch.commit();
      console.log(colors.green(`- Committed final batch of ${operationCount} gallery items`));
    }
    
    console.log(colors.green(`✓ Successfully initialized ${totalItems} gallery items`));
    
  } catch (error) {
    console.error(colors.red('Error initializing gallery items:'), error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    console.log(colors.green('=== Gallery Import Script ==='));
    console.log('This script will import all gallery cards into Firebase.');
    
    // Initialize the Admin SDK
    const app = initializeAdminApp();
    const db = admin.firestore();
    
    // Check existing collections
    const collections = await checkCollections(db);
    
    // Ask for confirmation before clearing collections
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    if (collections.galleryItems > 0) {
      const answer = await new Promise(resolve => {
        rl.question(colors.yellow(`Warning: This will replace ${collections.galleryItems} existing gallery items. Continue? (y/n) `), resolve);
      });
      
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log(colors.yellow('Operation cancelled.'));
        rl.close();
        return;
      }
      
      await clearCollections(db, collections);
    }
    
    rl.close();
    
    // Initialize collections with our data
    await initializeGallery(db);
    
    console.log(colors.green('\n✅ Gallery import completed successfully!'));
    console.log(colors.green('You can now view the gallery items in your admin dashboard.'));
    
  } catch (error) {
    console.error(colors.red('\n❌ Gallery import failed:'), error);
    process.exit(1);
  }
}

// Run the main function
main(); 