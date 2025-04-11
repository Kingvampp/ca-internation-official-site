'use client';

import { clientDb, clientStorage, isFirebaseInitialized } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, limit } from 'firebase/firestore';

/**
 * Utility to log test results with appropriate formatting
 * @param {string} test - Test name
 * @param {string} status - Test status (pass, fail, warn)
 * @param {string} message - Test message
 * @param {Object} [details] - Optional details object
 */
export const logTest = (test, status, message, details = null) => {
  const timestamp = new Date().toISOString();
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  
  console.group(`${emoji} ${test} [${status.toUpperCase()}]`);
  console.log(`${message}`);
  if (details) {
    console.log('Details:', details);
  }
  console.groupEnd();
  
  return { status, message, details, timestamp };
};

/**
 * Test Firebase connectivity
 * @returns {Promise<Object>} - Test result
 */
export const testFirebaseConnection = async () => {
  console.group('🔄 Testing Firebase Connectivity');
  
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      console.error('Firebase is not initialized');
      console.groupEnd();
      return logTest('Firebase Initialization', 'fail', 'Firebase is not initialized');
    }
    
    console.log('Firebase is initialized ✓');
    
    // Check if Firestore is accessible
    try {
      const testQuery = query(collection(clientDb, '_test_collection'), limit(1));
      await getDocs(testQuery);
      console.log('Successfully connected to Firestore ✓');
    } catch (error) {
      console.error('Failed to connect to Firestore:', error);
      console.groupEnd();
      return logTest('Firestore Connection', 'fail', 'Failed to connect to Firestore', error);
    }
    
    // Check if Storage is accessible
    try {
      if (!clientStorage || typeof clientStorage.ref !== 'function') {
        console.error('Storage service is not properly initialized');
        console.groupEnd();
        return logTest('Storage Service', 'fail', 'Storage service is not properly initialized');
      }
      
      const testRef = clientStorage.ref('_test_folder/test.txt');
      console.log('Successfully initialized Storage service ✓');
    } catch (error) {
      console.error('Failed to access Storage service:', error);
      console.groupEnd();
      return logTest('Storage Service', 'fail', 'Failed to access Storage service', error);
    }
    
    console.groupEnd();
    return logTest('Firebase Connectivity', 'pass', 'Successfully connected to Firebase services');
  } catch (error) {
    console.error('Error testing Firebase connectivity:', error);
    console.groupEnd();
    return logTest('Firebase Connectivity', 'fail', 'Error testing Firebase connectivity', error);
  }
};

/**
 * Test Gallery operations
 * @returns {Promise<Object>} - Test result
 */
export const testGalleryOperations = async () => {
  console.group('🔄 Testing Gallery Operations');
  
  try {
    // Import gallery service
    const { getAllGalleryItems, getGalleryItemById, createGalleryItem, updateGalleryItem, deleteGalleryItem } = await import('./galleryService');
    
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      console.error('Firebase is not initialized - cannot test gallery operations');
      console.groupEnd();
      return logTest('Gallery Operations', 'fail', 'Firebase is not initialized - cannot test gallery operations');
    }
    
    // Test fetching all gallery items
    console.log('Fetching all gallery items...');
    let allItems = [];
    try {
      allItems = await getAllGalleryItems();
      console.log(`Successfully fetched ${allItems.length} gallery items ✓`);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
      console.groupEnd();
      return logTest('Gallery Fetch', 'fail', 'Failed to fetch gallery items', error);
    }
    
    // Test fetching a single item if available
    if (allItems.length > 0) {
      console.log('Fetching a single gallery item...');
      const itemId = allItems[0].id;
      
      try {
        const item = await getGalleryItemById(itemId);
        if (item) {
          console.log(`Successfully fetched item: ${item.title} ✓`);
        } else {
          console.warn(`Item with ID ${itemId} not found`);
          return logTest('Gallery Item Fetch', 'warn', `Item with ID ${itemId} not found`);
        }
      } catch (error) {
        console.error(`Failed to fetch item with ID ${itemId}:`, error);
        return logTest('Gallery Item Fetch', 'fail', `Failed to fetch item with ID ${itemId}`, error);
      }
    } else {
      console.log('No gallery items available to fetch individual item');
    }
    
    // Test creating a gallery item
    console.log('Creating a test gallery item...');
    const testItem = {
      title: `Test Item ${Date.now()}`,
      description: 'This is a test item created by the test utility',
      categories: ['test'],
      mainImage: 'https://via.placeholder.com/800x600?text=Test+Image',
      beforeImages: [],
      afterImages: [],
      tags: ['Test', 'Utility']
    };
    
    let newItemId = null;
    try {
      newItemId = await createGalleryItem(testItem);
      console.log(`Successfully created test item with ID: ${newItemId} ✓`);
    } catch (error) {
      console.error('Failed to create test item:', error);
      console.groupEnd();
      return logTest('Gallery Create', 'fail', 'Failed to create test item', error);
    }
    
    // Test updating the gallery item
    if (newItemId) {
      console.log(`Updating test item with ID: ${newItemId}...`);
      const updateData = {
        description: `Updated description at ${new Date().toISOString()}`
      };
      
      try {
        await updateGalleryItem(newItemId, updateData);
        console.log(`Successfully updated test item ✓`);
      } catch (error) {
        console.error(`Failed to update test item with ID ${newItemId}:`, error);
        return logTest('Gallery Update', 'fail', `Failed to update test item with ID ${newItemId}`, error);
      }
      
      // Test deleting the gallery item
      console.log(`Deleting test item with ID: ${newItemId}...`);
      try {
        await deleteGalleryItem(newItemId);
        console.log(`Successfully deleted test item ✓`);
      } catch (error) {
        console.error(`Failed to delete test item with ID ${newItemId}:`, error);
        return logTest('Gallery Delete', 'fail', `Failed to delete test item with ID ${newItemId}`, error);
      }
    }
    
    console.groupEnd();
    return logTest('Gallery Operations', 'pass', 'Successfully tested all gallery operations');
  } catch (error) {
    console.error('Error testing gallery operations:', error);
    console.groupEnd();
    return logTest('Gallery Operations', 'fail', 'Error testing gallery operations', error);
  }
};

/**
 * Run all tests
 * @returns {Promise<Object>} - Test results
 */
export const runAllTests = async () => {
  console.group('🚀 Running All Firebase Tests');
  
  const results = {
    connectivity: null,
    gallery: null
  };
  
  // Test Firebase connectivity
  results.connectivity = await testFirebaseConnection();
  
  // If connectivity passed, test gallery operations
  if (results.connectivity.status === 'pass') {
    results.gallery = await testGalleryOperations();
  } else {
    results.gallery = logTest('Gallery Operations', 'skip', 'Skipped due to connectivity failure');
  }
  
  console.groupEnd();
  return results;
};

// Export default for use in client components
export default {
  testFirebaseConnection,
  testGalleryOperations,
  runAllTests
}; 