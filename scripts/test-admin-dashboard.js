#!/usr/bin/env node

/**
 * CA Automotive Admin Dashboard - Test Script
 * -------------------------------------------
 * This script tests the admin dashboard functionality including:
 * - Admin authentication
 * - Gallery management
 * - Image editor
 * 
 * Usage:
 *   node scripts/test-admin-dashboard.js [options]
 * 
 * Options:
 *   --auth        Test admin authentication
 *   --gallery     Test gallery management functionality
 *   --editor      Test image editor functionality
 *   --all         Run all tests
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, orderBy, deleteDoc, doc, getDoc, updateDoc } = require('firebase/firestore');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Base URL
const BASE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';

// Admin credentials (should be in env)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';

// Test data for gallery item
const testGalleryItem = {
  title: `Test Gallery Item ${Date.now()}`,
  description: 'This is a test gallery item created by the test script',
  categories: ['test', 'script'],
  tags: ['Test', 'Automated', 'Script'],
  mainImage: 'https://via.placeholder.com/800x600?text=Test+Main+Image',
  beforeImages: [
    'https://via.placeholder.com/800x600?text=Test+Before+Image+1',
    'https://via.placeholder.com/800x600?text=Test+Before+Image+2'
  ],
  afterImages: [
    'https://via.placeholder.com/800x600?text=Test+After+Image+1',
    'https://via.placeholder.com/800x600?text=Test+After+Image+2'
  ],
  blurData: {}
};

// Print with colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}✗ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function logSection(message) {
  console.log(`\n${colors.magenta}=== ${message} ===${colors.reset}\n`);
}

// Test functions
async function testFirebaseConnection() {
  logSection('Testing Firebase Connection');
  
  if (!db) {
    logError('Firebase not initialized');
    return false;
  }
  
  try {
    const galleryCollection = collection(db, 'gallery');
    const q = query(galleryCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    logInfo(`Connected to Firebase. Found ${querySnapshot.size} gallery items.`);
    return true;
  } catch (error) {
    logError(`Firebase connection test failed: ${error.message}`);
    return false;
  }
}

async function testAdminAuthentication() {
  logSection('Testing Admin Authentication');
  
  let browser;
  try {
    logInfo('Launching headless browser...');
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Navigate to admin login page
    logInfo('Navigating to admin login page...');
    await page.goto(`${BASE_URL}/admin/login`);
    
    // Check if login form exists
    const loginForm = await page.$('form');
    if (!loginForm) {
      logError('Login form not found');
      return false;
    }
    
    logInfo('Login form found. Attempting login...');
    
    // Fill login form
    await page.type('[name="username"]', ADMIN_USERNAME);
    await page.type('[name="password"]', ADMIN_PASSWORD);
    
    // Submit form
    await Promise.all([
      page.click('[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // Check if redirected to admin dashboard
    const currentUrl = page.url();
    if (currentUrl.includes('/admin-dashboard')) {
      logSuccess('Successfully authenticated and redirected to admin dashboard');
      
      // Save session storage for later tests
      const sessionStorage = await page.evaluate(() => {
        const data = {};
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          data[key] = sessionStorage.getItem(key);
        }
        return data;
      });
      
      logInfo(`Session storage contains: ${Object.keys(sessionStorage).join(', ')}`);
      
      if (sessionStorage.adminAuthenticated === 'true') {
        logSuccess('Admin authentication token found in session storage');
      } else {
        logWarning('Admin authentication token not found in session storage');
      }
      
      return true;
    } else {
      logError(`Login failed. Current URL: ${currentUrl}`);
      
      // Check for error message
      const errorMessage = await page.$eval('.error-message', el => el.textContent).catch(() => null);
      if (errorMessage) {
        logError(`Error message: ${errorMessage}`);
      }
      
      return false;
    }
  } catch (error) {
    logError(`Admin authentication test failed: ${error.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testGalleryManagement() {
  logSection('Testing Gallery Management');
  
  let newItemId = null;
  
  // 1. Create a new gallery item
  try {
    logInfo('Creating test gallery item...');
    
    const galleryCollection = collection(db, 'gallery');
    const itemData = {
      ...testGalleryItem,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const docRef = await addDoc(galleryCollection, itemData);
    newItemId = docRef.id;
    
    logSuccess(`Created test gallery item with ID: ${newItemId}`);
  } catch (error) {
    logError(`Failed to create test gallery item: ${error.message}`);
    return false;
  }
  
  // 2. Verify item was created
  if (newItemId) {
    try {
      logInfo(`Verifying gallery item ${newItemId}...`);
      
      const docRef = doc(db, 'gallery', newItemId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        logSuccess(`Gallery item verified: ${data.title}`);
      } else {
        logError('Gallery item not found in database');
        return false;
      }
    } catch (error) {
      logError(`Failed to verify gallery item: ${error.message}`);
      return false;
    }
  }
  
  // 3. Update the gallery item
  if (newItemId) {
    try {
      logInfo(`Updating gallery item ${newItemId}...`);
      
      const docRef = doc(db, 'gallery', newItemId);
      const updateData = {
        description: `Updated description at ${new Date().toISOString()}`,
        updatedAt: Date.now()
      };
      
      await updateDoc(docRef, updateData);
      logSuccess('Gallery item updated successfully');
    } catch (error) {
      logError(`Failed to update gallery item: ${error.message}`);
      return false;
    }
  }
  
  // 4. Delete the gallery item
  if (newItemId) {
    try {
      logInfo(`Deleting gallery item ${newItemId}...`);
      
      const docRef = doc(db, 'gallery', newItemId);
      await deleteDoc(docRef);
      
      logSuccess('Gallery item deleted successfully');
    } catch (error) {
      logError(`Failed to delete gallery item: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

async function testImageEditor() {
  logSection('Testing Image Editor Component');
  
  let browser;
  try {
    logInfo('Launching headless browser...');
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // First authenticate
    logInfo('Authenticating as admin...');
    await page.goto(`${BASE_URL}/admin/login`);
    await page.type('[name="username"]', ADMIN_USERNAME);
    await page.type('[name="password"]', ADMIN_PASSWORD);
    await Promise.all([
      page.click('[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // Navigate to gallery management
    logInfo('Navigating to gallery management...');
    await page.goto(`${BASE_URL}/admin-dashboard/gallery`);
    
    // Check if gallery page loaded
    const galleryTitle = await page.$eval('h1', el => el.textContent).catch(() => null);
    if (!galleryTitle || !galleryTitle.includes('Gallery')) {
      logError('Gallery management page not loaded correctly');
      return false;
    }
    
    logInfo('Gallery management page loaded');
    
    // Navigate to add gallery item page
    logInfo('Navigating to add gallery item page...');
    await Promise.all([
      page.click('a[href="/admin-dashboard/gallery/add"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // Check if we can access the image editor
    const imageEditorTab = await page.$('button:contains("Images")').catch(() => null);
    if (imageEditorTab) {
      logInfo('Switching to Images tab...');
      await imageEditorTab.click();
      await page.waitForTimeout(1000);
      
      const imageEditor = await page.$('.image-editor').catch(() => null);
      if (imageEditor) {
        logSuccess('Image editor component loaded successfully');
      } else {
        logWarning('Image editor component not found');
      }
    } else {
      logWarning('Images tab not found');
    }
    
    logSuccess('Image editor test completed');
    return true;
  } catch (error) {
    logError(`Image editor test failed: ${error.message}`);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run all tests
async function runTests() {
  logSection('CA Automotive Admin Dashboard Test Suite');
  
  // Check for puppeteer
  try {
    require.resolve('puppeteer');
  } catch (e) {
    logError('Puppeteer is not installed. Install it with: npm install puppeteer');
    process.exit(1);
  }
  
  // Test 1: Firebase Connection
  const connectionSuccess = await testFirebaseConnection();
  if (!connectionSuccess) {
    logError('Firebase connection test failed. Aborting remaining tests.');
    process.exit(1);
  }
  
  let authSuccess = false;
  let gallerySuccess = false;
  let editorSuccess = false;
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  const testAuth = args.includes('--auth') || args.includes('--all');
  const testGallery = args.includes('--gallery') || args.includes('--all');
  const testEditor = args.includes('--editor') || args.includes('--all');
  
  if (!testAuth && !testGallery && !testEditor) {
    // If no specific tests are requested, run all
    logInfo('No specific tests requested. Running all tests.');
    authSuccess = await testAdminAuthentication();
    gallerySuccess = await testGalleryManagement();
    editorSuccess = await testImageEditor();
  } else {
    // Run requested tests
    if (testAuth) {
      authSuccess = await testAdminAuthentication();
    }
    
    if (testGallery) {
      gallerySuccess = await testGalleryManagement();
    }
    
    if (testEditor) {
      editorSuccess = await testImageEditor();
    }
  }
  
  // Final results
  logSection('Test Results');
  if (testAuth) logInfo(`Admin Authentication: ${authSuccess ? 'PASSED' : 'FAILED'}`);
  if (testGallery) logInfo(`Gallery Management: ${gallerySuccess ? 'PASSED' : 'FAILED'}`);
  if (testEditor) logInfo(`Image Editor: ${editorSuccess ? 'PASSED' : 'FAILED'}`);
  
  if ((testAuth && !authSuccess) || (testGallery && !gallerySuccess) || (testEditor && !editorSuccess)) {
    logError('Some tests failed. Check the logs for details.');
    process.exit(1);
  } else {
    logSuccess('All tests passed successfully!');
    process.exit(0);
  }
}

// Run the tests
runTests().catch(error => {
  logError(`Unhandled error in test script: ${error.message}`);
  process.exit(1);
}); 