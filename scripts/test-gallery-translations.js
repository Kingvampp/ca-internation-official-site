#!/usr/bin/env node

/**
 * Test Gallery Translations
 * 
 * This script tests the gallery translation system by:
 * 1. Verifying that all gallery items in Firestore have translation keys
 * 2. Checking that all translation keys exist in translation files
 * 3. Generating a report on translation coverage
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
  }, 'test-gallery-translations');
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  process.exit(1);
}

const db = getFirestore(firebaseApp);

// Configuration
const TRANSLATION_FILES = {
  en: path.join(process.cwd(), 'public/locales/en/common.json'),
  es: path.join(process.cwd(), 'public/locales/es/common.json')
};

// Load translation files
async function loadTranslations() {
  const translations = {};
  
  for (const [lang, filePath] of Object.entries(TRANSLATION_FILES)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`Error loading ${lang} translations:`, error.message);
      translations[lang] = {};
    }
  }
  
  return translations;
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
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return [];
  }
}

// Check if a translation key exists in the translation file
function checkTranslationKey(translations, key) {
  if (!key) return false;
  
  const parts = key.split('.');
  let current = translations;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

// Main function to test gallery translations
async function testGalleryTranslations() {
  console.log('=== Testing Gallery Translations ===\n');
  
  // Load translations
  console.log('Loading translation files...');
  const translations = await loadTranslations();
  
  // Get gallery items
  console.log('Fetching gallery items from Firestore...');
  const galleryItems = await getGalleryItems();
  
  console.log(`Found ${galleryItems.length} gallery items\n`);
  
  // Test statistics
  const stats = {
    totalItems: galleryItems.length,
    itemsWithTranslationKeys: 0,
    translationKeysInEn: 0,
    translationKeysInEs: 0,
    missingKeys: {
      title: 0,
      description: 0
    },
    missingTranslations: {
      en: {
        title: 0,
        description: 0
      },
      es: {
        title: 0,
        description: 0
      }
    }
  };
  
  // Check each gallery item
  const itemsWithIssues = [];
  
  for (const item of galleryItems) {
    const issues = {
      id: item.id,
      title: item.title,
      missingKeys: [],
      missingTranslations: {
        en: [],
        es: []
      }
    };
    
    // Check if item has translation keys
    if (!item.translationKeys) {
      issues.missingKeys.push('No translationKeys field');
      itemsWithIssues.push(issues);
      continue;
    }
    
    stats.itemsWithTranslationKeys++;
    
    // Check title translation key
    if (!item.translationKeys.title) {
      issues.missingKeys.push('title');
      stats.missingKeys.title++;
    } else {
      // Check if the key exists in translation files
      if (checkTranslationKey(translations.en, item.translationKeys.title)) {
        stats.translationKeysInEn++;
      } else {
        issues.missingTranslations.en.push('title');
        stats.missingTranslations.en.title++;
      }
      
      if (checkTranslationKey(translations.es, item.translationKeys.title)) {
        stats.translationKeysInEs++;
      } else {
        issues.missingTranslations.es.push('title');
        stats.missingTranslations.es.title++;
      }
    }
    
    // Check description translation key
    if (!item.translationKeys.description) {
      issues.missingKeys.push('description');
      stats.missingKeys.description++;
    } else {
      // Check if the key exists in translation files
      if (checkTranslationKey(translations.en, item.translationKeys.description)) {
        stats.translationKeysInEn++;
      } else {
        issues.missingTranslations.en.push('description');
        stats.missingTranslations.en.description++;
      }
      
      if (checkTranslationKey(translations.es, item.translationKeys.description)) {
        stats.translationKeysInEs++;
      } else {
        issues.missingTranslations.es.push('description');
        stats.missingTranslations.es.description++;
      }
    }
    
    // Only add to issues if there are actual issues
    if (
      issues.missingKeys.length > 0 || 
      issues.missingTranslations.en.length > 0 || 
      issues.missingTranslations.es.length > 0
    ) {
      itemsWithIssues.push(issues);
    }
  }
  
  // Generate report
  console.log('=== Gallery Translation Report ===\n');
  
  console.log(`Total gallery items: ${stats.totalItems}`);
  console.log(`Items with translation keys: ${stats.itemsWithTranslationKeys} (${Math.round(stats.itemsWithTranslationKeys / stats.totalItems * 100)}%)\n`);
  
  console.log('Translation key coverage:');
  console.log(`Missing title keys: ${stats.missingKeys.title}`);
  console.log(`Missing description keys: ${stats.missingKeys.description}\n`);
  
  console.log('English translation coverage:');
  console.log(`Missing title translations: ${stats.missingTranslations.en.title}`);
  console.log(`Missing description translations: ${stats.missingTranslations.en.description}\n`);
  
  console.log('Spanish translation coverage:');
  console.log(`Missing title translations: ${stats.missingTranslations.es.title}`);
  console.log(`Missing description translations: ${stats.missingTranslations.es.description}\n`);
  
  if (itemsWithIssues.length > 0) {
    console.log(`=== ${itemsWithIssues.length} Items with Issues ===`);
    
    for (const issue of itemsWithIssues) {
      console.log(`\nItem ID: ${issue.id}`);
      console.log(`Title: ${issue.title}`);
      
      if (issue.missingKeys.length > 0) {
        console.log(`Missing keys: ${issue.missingKeys.join(', ')}`);
      }
      
      if (issue.missingTranslations.en.length > 0) {
        console.log(`Missing English translations: ${issue.missingTranslations.en.join(', ')}`);
      }
      
      if (issue.missingTranslations.es.length > 0) {
        console.log(`Missing Spanish translations: ${issue.missingTranslations.es.join(', ')}`);
      }
    }
  } else {
    console.log('✅ All gallery items have proper translations!');
  }
  
  console.log('\n=== Gallery Translation Test Complete ===');
}

// Run the test
testGalleryTranslations().catch(error => {
  console.error('Error running test:', error);
  process.exit(1);
}).finally(() => {
  // Clean up Firebase connection
  process.exit(0);
}); 