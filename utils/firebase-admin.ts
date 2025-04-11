// SERVER-SIDE ONLY FIREBASE ADMIN
// This file should only be imported in server components or API routes

import { cert, getApps, initializeApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Enhanced logging function for server components
const logServerInfo = (message: string, data?: any) => {
  console.log(`[Firebase Admin] ${message}`, data ? data : '');
};

const logServerWarning = (message: string, data?: any) => {
  console.warn(`[Firebase Admin] ⚠️ ${message}`, data ? data : '');
};

const logServerError = (message: string, error?: any) => {
  console.error(`[Firebase Admin] 🚨 ${message}`, error ? error : '');
};

// Check environment variables and provide more detailed diagnostics
const checkRequiredEnvVars = () => {
  const requiredVars = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
  };
  
  const missingVars = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missingVars.length > 0) {
    logServerWarning(`Missing required environment variables: ${missingVars.join(', ')}`);
    
    // Check if we're in development mode and display helpful information
    if (process.env.NODE_ENV === 'development') {
      console.warn(`
========================================================================
🔥 Firebase Admin SDK initialization failed due to missing environment variables

Missing variables: ${missingVars.join(', ')}

To fix this issue:
1. Make sure you have a .env.local file with these variables:
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_CLIENT_EMAIL=your-client-email
   FIREBASE_PRIVATE_KEY="your-private-key"
   
2. If using .env.local, restart your development server

3. Verify your environment variables are being loaded properly
========================================================================
      `);
    }
    
    return false;
  }
  
  return true;
};

// Helper function to reload Firebase Admin
let forceReload = false;

// Log Firebase Admin config (safely)
logServerInfo('Firebase Admin Config:', {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  hasCredentials: !!(process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY)
});

// Server-side Firebase Admin configuration
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

let adminApp: App | null = null;
let adminDb: Firestore | null = null;
let adminStorage: any = null;
let adminInitialized = false;

// Initialize Firebase Admin
function initializeFirebaseAdmin() {
  try {
    logServerInfo('Initializing Firebase Admin...');
    
    // Perform enhanced environment variable checks
    const envVarsPresent = checkRequiredEnvVars();
    
    // Check if we have valid configuration
    if (!envVarsPresent) {
      logServerWarning('Firebase Admin SDK configuration is missing or incomplete. Some server-side features will not work.');
      adminInitialized = false;
      return false;
    }
    
    const existingApps = getApps();
    logServerInfo(`Found ${existingApps.length} existing Firebase Admin apps`);
    
    // Check if the admin app is already initialized or we need to force reload
    if (existingApps.length === 0 || forceReload) {
      // If forcing reload, delete any existing apps
      if (forceReload && existingApps.length > 0) {
        logServerInfo('Force reloading Firebase Admin app');
        forceReload = false;
      } else {
        logServerInfo('No existing admin app found, initializing new one');
      }
      
      try {
        // Check that private key is properly formatted
        if (!serviceAccount.privateKey?.includes('-----BEGIN PRIVATE KEY-----')) {
          logServerWarning('Private key format appears incorrect, trying to fix...');
          serviceAccount.privateKey = serviceAccount.privateKey?.replace(/\\n/g, '\n');
        }
        
        const creds = cert(serviceAccount as any);
        adminApp = initializeApp({
          credential: creds,
          storageBucket,
        }, 'admin-app-' + Date.now()); // Unique name to avoid conflicts
        
        logServerInfo('Firebase Admin app initialized successfully');
      } catch (certError) {
        logServerError('Failed to initialize Firebase credential', certError);
        adminInitialized = false;
        return false;
      }
    } else {
      logServerInfo('Using existing Firebase Admin app');
      adminApp = existingApps[0];
    }
    
    try {
      logServerInfo('Initializing Firestore and Storage admin services');
      adminDb = getFirestore(adminApp);
      adminStorage = getStorage(adminApp);
      adminInitialized = true;
      logServerInfo('Firebase Admin services initialized successfully');
      return true;
    } catch (servicesError) {
      logServerError('Failed to initialize Firebase services', servicesError);
      adminInitialized = false;
      return false;
    }
  } catch (error) {
    logServerError('Firebase admin initialization error:', error);
    adminInitialized = false;
    return false;
  }
}

// Initialize on module load
initializeFirebaseAdmin();

// Add wrapper for Firestore admin operations with logging
const adminDbWithLogging = adminDb ? {
  collection: (path: string) => {
    if (!adminDb) {
      logServerError(`Cannot access collection: ${path} - Firestore is not initialized`);
      return null;
    }
    
    logServerInfo(`Accessing collection: ${path}`);
    const collectionRef = adminDb.collection(path);
    
    // Enhance the collection methods with logging
    const originalGet = collectionRef.get.bind(collectionRef);
    collectionRef.get = async function() {
      logServerInfo(`Getting documents from collection: ${path}`);
      try {
        const result = await originalGet();
        logServerInfo(`Retrieved ${result.docs.length} documents from collection: ${path}`);
        return result;
      } catch (error) {
        logServerError(`Error getting documents from collection: ${path}`, error);
        throw error;
      }
    };
    
    const originalAdd = collectionRef.add.bind(collectionRef);
    collectionRef.add = async function(data: any) {
      logServerInfo(`Adding document to collection: ${path}`);
      try {
        const result = await originalAdd(data);
        logServerInfo(`Added document with ID: ${result.id} to collection: ${path}`);
        return result;
      } catch (error) {
        logServerError(`Error adding document to collection: ${path}`, error);
        throw error;
      }
    };
    
    // Enhance doc method
    const originalDoc = collectionRef.doc.bind(collectionRef);
    collectionRef.doc = function(docPath?: string) {
      const fullPath = docPath ? `${path}/${docPath}` : path;
      logServerInfo(`Accessing document: ${fullPath}`);
      const docRef = originalDoc(docPath);
      
      // Enhance document methods with logging
      const originalDocGet = docRef.get.bind(docRef);
      docRef.get = async function() {
        logServerInfo(`Getting document: ${fullPath}`);
        try {
          const result = await originalDocGet();
          logServerInfo(`Document ${fullPath} exists: ${result.exists}`);
          return result;
        } catch (error) {
          logServerError(`Error getting document: ${fullPath}`, error);
          throw error;
        }
      };
      
      const originalDocUpdate = docRef.update.bind(docRef);
      docRef.update = async function(data: any) {
        logServerInfo(`Updating document: ${fullPath}`);
        try {
          const result = await originalDocUpdate(data);
          logServerInfo(`Updated document: ${fullPath}`);
          return result;
        } catch (error) {
          logServerError(`Error updating document: ${fullPath}`, error);
          throw error;
        }
      };
      
      const originalDocDelete = docRef.delete.bind(docRef);
      docRef.delete = async function() {
        logServerInfo(`Deleting document: ${fullPath}`);
        try {
          const result = await originalDocDelete();
          logServerInfo(`Deleted document: ${fullPath}`);
          return result;
        } catch (error) {
          logServerError(`Error deleting document: ${fullPath}`, error);
          throw error;
        }
      };
      
      return docRef;
    };
    
    // Enhance orderBy method
    const originalOrderBy = collectionRef.orderBy.bind(collectionRef);
    collectionRef.orderBy = function(...args: any[]) {
      logServerInfo(`Ordering collection ${path} by: ${args[0]}, direction: ${args[1] || 'asc'}`);
      return originalOrderBy(...args);
    };
    
    return collectionRef;
  }
} : null;

// Function to force reinitialization of Firebase Admin
export function reloadFirebaseAdmin() {
  logServerInfo('Manual reload of Firebase Admin requested');
  forceReload = true;
  return initializeFirebaseAdmin();
}

export { adminDbWithLogging as adminDb, adminStorage, adminInitialized, initializeFirebaseAdmin }; 