#!/usr/bin/env node

/**
 * Import Reviews Script (Environment Variables Version)
 * 
 * This script imports reviews from the JSON file created by fetch-reviews.js
 * into the Firestore database using environment variables for authentication.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Path to the reviews JSON file
const reviewsPath = path.join(__dirname, '../data/imported-reviews.json');

// Check if the reviews file exists
if (!fs.existsSync(reviewsPath)) {
  console.error('❌ Reviews file not found!');
  console.error(`Expected at: ${reviewsPath}`);
  console.error('\nPlease run the fetch-reviews.js script first:');
  console.error('node scripts/fetch-reviews.js');
  process.exit(1);
}

// Check required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`- ${varName}`));
  console.error('\nPlease check your .env.local file.');
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

// Initialize Firebase with env vars
try {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // The private key comes with "\n" characters that need to be interpreted
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
  
  console.log('🔥 Firebase initialized successfully using environment variables');
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