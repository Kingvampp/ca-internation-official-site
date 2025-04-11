// Translation Testing Utility
// ========================
// This script provides utilities for testing translations in the website
// Run with: node utils/test-translations.js

/**
 * Collection of key testing functions that can be run to verify translations
 */

// List of critical translation keys that should be tested
const CRITICAL_KEYS = [
  // Navigation
  'navigation.home',
  'navigation.about',
  'navigation.services',
  'navigation.gallery',
  'navigation.contact',
  'navigation.book.now',
  
  // Hero Section
  'hero.title',
  'hero.titleHighlight',
  'hero.subtitle',
  'hero.exploreServices',
  'hero.bookNow',
  
  // Services
  'services.title',
  'services.subtitle',
  'services.collision',
  'services.paint',
  'services.restoration',
  
  // Contact
  'contact.us',
  'contact.send.us.a.message',
  'contact.name',
  'contact.email',
  'contact.phone',
  'contact.message',
  'contact.send.message',
  
  // Footer
  'footer.contactUs',
  'footer.address',
  'footer.phone',
  'footer.email',
  'footer.links',
  'footer.services',
  'footer.copyright'
];

/**
 * How to test translations on your website:
 * 
 * 1. Open Chrome DevTools (F12)
 * 2. Go to the Network tab
 * 3. Look for requests to /locales/en/common.json and /locales/es/common.json
 * 4. View the response to check if the translation files are loading correctly
 * 
 * 5. In the Console tab, run the following code to test translations:
 * 
 * // Test English translations
 * const missing = [];
 * const failures = [];
 * window._translationStats = {
 *   missing,
 *   failures
 * };
 * 
 * // Switch to English
 * document.querySelector('[aria-label="Switch to English"]').click();
 * 
 * // Wait a moment for translations to load
 * setTimeout(() => {
 *   // Get the t function from the window
 *   const t = key => {
 *     try {
 *       // This will get the current translation function from i18n context
 *       return window.i18n.t(key);
 *     } catch (e) {
 *       console.error(`Error translating key: ${key}`, e);
 *       missing.push(key);
 *       return key;
 *     }
 *   };
 *   
 *   // Test critical keys
 *   [
 *     'navigation.home',
 *     'navigation.about',
 *     'navigation.book.now',
 *     'hero.title',
 *     'contact.us',
 *     'footer.copyright'
 *   ].forEach(key => {
 *     const translated = t(key);
 *     if (translated === key) {
 *       failures.push(key);
 *       console.error(`❌ Translation failed for: ${key}`);
 *     } else {
 *       console.log(`✅ Translation successful for: ${key} = "${translated}"`);
 *     }
 *   });
 *   
 *   console.log(`Test completed. Missing: ${missing.length}, Failures: ${failures.length}`);
 * }, 1000);
 * 
 * // Repeat the test for Spanish by clicking the Spanish button
 * document.querySelector('[aria-label="Cambiar a Español"]').click();
 */

/**
 * Manual test checklist:
 * 
 * 1. Open the homepage at http://localhost:3000
 * 2. Check if the TranslationMonitor appears at the bottom-left (in development mode)
 * 3. Click it to open and check the success rate
 * 4. Use the Quick Language buttons to switch between English and Spanish
 * 5. Verify that the following elements change language:
 *    - Navigation menu items
 *    - Hero section text
 *    - Services section titles and descriptions
 *    - Contact form labels and button
 *    - Footer links and copyright
 * 
 * 6. Check these specific pages for translation:
 *    - About page: http://localhost:3000/about
 *    - Services page: http://localhost:3000/services
 *    - Gallery page: http://localhost:3000/gallery
 *    - Contact page: http://localhost:3000/contact
 * 
 * 7. Look for any untranslated text or text showing translation keys
 * 
 * 8. Check the console for any translation errors
 */

/**
 * Firebase for gallery functionality:
 * 
 * Firebase is used in this project to:
 * - Store gallery images and metadata
 * - Handle admin authentication for the admin dashboard
 * - Provide a database for storing gallery items
 * 
 * To get Firebase keys:
 * 1. Create a Firebase account at https://firebase.google.com/
 * 2. Create a new project
 * 3. Set up Firebase Authentication for admin access
 * 4. Create a Firestore database for gallery items
 * 5. Set up Firebase Storage for image uploads
 * 6. Generate a service account key for server-side access:
 *    - Go to Project Settings > Service accounts
 *    - Click "Generate new private key"
 *    - This will download a JSON file with the necessary credentials
 * 7. Get your client-side API keys:
 *    - Go to Project Settings > General
 *    - Scroll down to "Your apps" and create a web app if needed
 *    - Copy the Firebase configuration object
 * 
 * 8. Update your .env.local file with these values:
 *    - FIREBASE_PROJECT_ID from your service account JSON
 *    - FIREBASE_CLIENT_EMAIL from your service account JSON
 *    - FIREBASE_PRIVATE_KEY from your service account JSON
 *    - FIREBASE_STORAGE_BUCKET from your service account JSON
 *    - NEXT_PUBLIC_FIREBASE_API_KEY from your client config
 *    - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN from your client config
 *    - NEXT_PUBLIC_FIREBASE_PROJECT_ID from your client config
 *    - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET from your client config
 *    - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID from your client config
 *    - NEXT_PUBLIC_FIREBASE_APP_ID from your client config
 */

console.log("Translation testing utility loaded");
console.log("Follow the instructions in this file to test your translations");
console.log("Run your application with 'npm run dev' and use the browser console for testing"); 