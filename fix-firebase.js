require('dotenv').config({ path: '.env.local' });
const { cert, initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Check environment variables
console.log('Checking Firebase variables:');
console.log('- PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
console.log('- CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing');
console.log('- PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
console.log('- STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing');

// Helpful message
console.log('\nAttempting to initialize Firebase Admin SDK...');

try {
  // Create a properly formatted private key
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
  
  // Print the first few characters of the private key for validation
  console.log('Private key format check:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----') ? '✅ Correct' : '❌ Incorrect');
  
  // Create Firebase credential
  const credential = cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey
  });
  
  // Initialize the app
  const app = initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
  
  // Test Firestore connection
  const db = getFirestore(app);
  
  console.log('\n✅ Firebase Admin SDK initialized successfully!');
  console.log('This confirms your environment variables are correctly set.');
  
  console.log('\nRecommended steps:');
  console.log('1. Make sure your Next.js development server is completely restarted');
  console.log('2. Check server logs for any Firebase initialization errors');
  console.log('3. Try accessing your gallery edit page again');
  
} catch (error) {
  console.error('\n❌ Firebase Admin SDK initialization failed:');
  console.error(error);
  
  console.log('\nPossible solutions:');
  console.log('1. Check if your private key is properly formatted in .env.local');
  console.log('2. Make sure the Firebase project exists and the service account has the necessary permissions');
  console.log('3. Try creating a new service account key and update your .env.local file');
} 