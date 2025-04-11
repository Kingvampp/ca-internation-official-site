import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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
let firebaseApp;
let auth;
let db;
let storage;

try {
  if (!getApps().length) {
    console.log('Initializing new Firebase app');
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    console.log('Using existing Firebase app');
    firebaseApp = getApps()[0]; // if already initialized, use that one
  }

  // Initialize services
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);

  console.log('Firebase services initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create mock services for fallback
  console.warn('Using mock Firebase services due to initialization error');
  
  db = {
    collection: () => ({ 
      get: () => Promise.resolve({ docs: [] }),
      onSnapshot: (success) => { 
        success({ docs: [] });
        return () => {};
      }
    })
  };
  auth = {
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: () => Promise.reject(new Error('Mock auth: Not implemented')),
    signOut: () => Promise.resolve()
  };
  storage = {
    ref: () => ({
      put: () => Promise.reject(new Error('Mock storage: Not implemented')),
      getDownloadURL: () => Promise.reject(new Error('Mock storage: Not implemented'))
    })
  };
}

// Export the initialized services
export { auth, db, storage }; 