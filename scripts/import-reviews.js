#!/usr/bin/env node

/**
 * Import Reviews Script
 * 
 * This script imports reviews from the JSON file created by fetch-reviews.js
 * into the Firestore database.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Path to the service account key file
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                          path.join(__dirname, '../firebase-admin-key.json');

// Path to the reviews JSON file
const reviewsPath = path.join(__dirname, '../data/imported-reviews.json');

// Check if the service account file exists
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Firebase service account key not found!');
  console.error(`Expected at: ${serviceAccountPath}`);
  console.error('\nTo use this script:');
  console.error('1. Download your Firebase service account key from the Firebase console');
  console.error('2. Save it as firebase-admin-key.json in the project root');
  console.error('   OR set the GOOGLE_APPLICATION_CREDENTIALS environment variable');
  process.exit(1);
}

// Check if the reviews file exists
if (!fs.existsSync(reviewsPath)) {
  console.error('❌ Reviews file not found!');
  console.error(`Expected at: ${reviewsPath}`);
  console.error('\nPlease run the fetch-reviews.js script first:');
  console.error('node scripts/fetch-reviews.js');
  process.exit(1);
}

// Read the reviews
let reviews = [];
try {
  const reviewsData = fs.readFileSync(reviewsPath, 'utf8');
  reviews = JSON.parse(reviewsData);
  console.log(`📊 Loaded ${reviews.length} reviews from ${reviewsPath}`);
} catch (error) {
  console.error('❌ Failed to read reviews file:', error);
  process.exit(1);
}

// Initialize Firebase
try {
  const serviceAccount = require(serviceAccountPath);
  
  initializeApp({
    credential: cert(serviceAccount)
  });
  
  console.log('🔥 Firebase initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  process.exit(1);
}

// Get Firestore instance
const db = getFirestore();

// Import the reviews
async function importReviews() {
  console.log('🔄 Importing reviews to Firestore...');
  
  const batch = db.batch();
  const testimonialCollection = db.collection('testimonials');
  
  // Add each review to the batch
  for (const review of reviews) {
    // Convert date strings to Firestore timestamps
    const reviewData = {
      ...review,
      date: new Date(review.date),
      updatedAt: new Date(review.updatedAt)
    };
    
    const docRef = testimonialCollection.doc(); // Generate a new document ID
    batch.set(docRef, reviewData);
  }
  
  // Commit the batch
  try {
    await batch.commit();
    console.log(`✅ Successfully imported ${reviews.length} reviews to Firestore!`);
  } catch (error) {
    console.error('❌ Failed to import reviews:', error);
    process.exit(1);
  }
}

// Run the import
importReviews()
  .then(() => {
    console.log('');
    console.log('👍 All done! You can now view the imported testimonials in your admin dashboard.');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ An unexpected error occurred:', error);
    process.exit(1);
  }); 