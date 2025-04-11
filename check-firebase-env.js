// Simple script to check Firebase Admin environment variables
require('dotenv').config({ path: '.env.local' });

console.log('Checking Firebase Admin Environment Variables:');
console.log('-----------------------------------------');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL exists:', !!process.env.FIREBASE_CLIENT_EMAIL);
console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);
console.log('FIREBASE_STORAGE_BUCKET:', process.env.FIREBASE_STORAGE_BUCKET || 'NOT SET');
console.log('-----------------------------------------');

// Check if all required variables are present
const allVarsPresent = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL && 
  process.env.FIREBASE_PRIVATE_KEY
);

console.log('All required Firebase variables present:', allVarsPresent ? 'YES ✅' : 'NO ❌');

if (process.env.FIREBASE_PRIVATE_KEY) {
  // Check if the private key is properly formatted (starts with -----BEGIN PRIVATE KEY-----)
  const properlyFormatted = process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----');
  console.log('Private key properly formatted:', properlyFormatted ? 'YES ✅' : 'NO ❌');
  
  // If not properly formatted, show the first few characters
  if (!properlyFormatted) {
    console.log('Private key starts with:', process.env.FIREBASE_PRIVATE_KEY.substring(0, 20) + '...');
    console.log('Make sure it includes the correct BEGIN/END markers and \\n newlines');
  }
} 