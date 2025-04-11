#!/usr/bin/env node

/**
 * Update Gallery Translations
 * 
 * This script updates existing gallery items to include translation keys
 * and adds their content to the translation files.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
let firebaseApp;
try {
  // Check if Firebase Admin is already initialized
  firebaseApp = initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}'))
  }, 'update-gallery-translations');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

const db = getFirestore(firebaseApp);

// Configuration
const EN_TRANSLATION_FILE = path.join(process.cwd(), 'public/locales/en/common.json');
const ES_TRANSLATION_FILE = path.join(process.cwd(), 'public/locales/es/common.json');

// Load translation files
async function loadTranslations() {
  try {
    const enContent = fs.readFileSync(EN_TRANSLATION_FILE, 'utf8');
    const esContent = fs.readFileSync(ES_TRANSLATION_FILE, 'utf8');
    
    return {
      en: JSON.parse(enContent),
      es: JSON.parse(esContent)
    };
  } catch (error) {
    console.error('Error loading translation files:', error.message);
    process.exit(1);
  }
}

// Save translation files
async function saveTranslations(translations) {
  try {
    fs.writeFileSync(
      EN_TRANSLATION_FILE,
      JSON.stringify(translations.en, null, 2),
      'utf8'
    );
    
    fs.writeFileSync(
      ES_TRANSLATION_FILE,
      JSON.stringify(translations.es, null, 2),
      'utf8'
    );
    
    return true;
  } catch (error) {
    console.error('Error saving translation files:', error.message);
    return false;
  }
}

// Get all gallery items from Firestore
async function getGalleryItems() {
  try {
    const galleryRef = db.collection('galleryItems');
    const snapshot = await galleryRef.orderBy('createdAt', 'desc').get();
    
    if (snapshot.empty) {
      console.log('No gallery items found');
      return [];
    }
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ref: doc.ref,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return [];
  }
}

// Update a gallery item with translation keys
async function updateGalleryItem(itemRef, translationKeys) {
  try {
    await itemRef.update({
      translationKeys
    });
    
    return true;
  } catch (error) {
    console.error('Error updating gallery item:', error);
    return false;
  }
}

// Main function to update gallery translations
async function updateGalleryTranslations() {
  console.log('=== Updating Gallery Translations ===\n');
  
  // Load translations
  console.log('Loading translation files...');
  const translations = await loadTranslations();
  
  // Ensure gallery.items exists in translation files
  if (!translations.en.gallery) {
    translations.en.gallery = {};
  }
  
  if (!translations.en.gallery.items) {
    translations.en.gallery.items = {};
  }
  
  if (!translations.es.gallery) {
    translations.es.gallery = {};
  }
  
  if (!translations.es.gallery.items) {
    translations.es.gallery.items = {};
  }
  
  // Get gallery items
  console.log('Fetching gallery items from Firestore...');
  const galleryItems = await getGalleryItems();
  
  console.log(`Found ${galleryItems.length} gallery items\n`);
  
  // Update statistics
  const stats = {
    totalItems: galleryItems.length,
    updatedItems: 0,
    skippedItems: 0,
    failedItems: 0
  };
  
  // Process each gallery item
  for (const item of galleryItems) {
    console.log(`Processing item ${item.id}: ${item.title}`);
    
    // Skip items that already have translation keys
    if (item.translationKeys && item.translationKeys.title && item.translationKeys.description) {
      console.log(`  Skipping - already has translation keys`);
      stats.skippedItems++;
      continue;
    }
    
    // Generate translation keys
    const translationKeys = {
      title: `gallery.items.${item.id}.title`,
      description: `gallery.items.${item.id}.description`
    };
    
    // Add translations to files
    translations.en.gallery.items[item.id] = {
      title: item.title,
      description: item.description
    };
    
    translations.es.gallery.items[item.id] = {
      title: item.title, // Default to English for now
      description: item.description // Default to English for now
    };
    
    // Update the gallery item
    const updated = await updateGalleryItem(item.ref, translationKeys);
    
    if (updated) {
      console.log(`  Updated successfully`);
      stats.updatedItems++;
    } else {
      console.log(`  Failed to update`);
      stats.failedItems++;
    }
  }
  
  // Save updated translations
  console.log('\nSaving updated translation files...');
  const saved = await saveTranslations(translations);
  
  if (saved) {
    console.log('Translation files saved successfully');
  } else {
    console.log('Failed to save translation files');
  }
  
  // Generate report
  console.log('\n=== Gallery Translation Update Report ===\n');
  
  console.log(`Total gallery items: ${stats.totalItems}`);
  console.log(`Updated items: ${stats.updatedItems}`);
  console.log(`Skipped items (already had translations): ${stats.skippedItems}`);
  console.log(`Failed items: ${stats.failedItems}`);
  
  console.log('\n=== Gallery Translation Update Complete ===');
}

// Run the update
updateGalleryTranslations().catch(error => {
  console.error('Error running update:', error);
  process.exit(1);
}).finally(() => {
  // Clean up Firebase connection
  process.exit(0);
}); 