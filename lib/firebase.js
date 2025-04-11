import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// For debugging
console.log('Firebase Config:');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
console.log('Storage Bucket:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
console.log('API Key available:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

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
  
  // Test Firebase connection
  setTimeout(async () => {
    try {
      // Test Firestore connection
      console.log('Testing connection to galleryItems collection...');
      const galleryQuery = query(collection(db, 'galleryItems'), limit(10));
      const snapshot = await getDocs(galleryQuery);
      console.log(`Firebase connection test: Found ${snapshot.docs.length} galleryItems`);
      
      // List the IDs of found items for debugging
      if (snapshot.docs.length > 0) {
        console.log('Gallery items found:');
        snapshot.docs.forEach((doc, index) => {
          console.log(`${index+1}. ID: ${doc.id}, Title: ${doc.data().title || 'No title'}`);
        });
      } else {
        console.log('No gallery items found in the collection. You may need to add some data first.');
      }
      
      // Test other collections
      const appointmentsQuery = query(collection(db, 'appointments'), limit(5));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      console.log(`Found ${appointmentsSnapshot.docs.length} appointments`);
      
      const contentQuery = query(collection(db, 'content'), limit(5));
      const contentSnapshot = await getDocs(contentQuery);
      console.log(`Found ${contentSnapshot.docs.length} content documents`);
      
      // Test Auth
      onAuthStateChanged(auth, (user) => {
        console.log('Firebase Auth state:', user ? 'Authenticated' : 'Not authenticated');
      });
    } catch (error) {
      console.error('Firebase connection test failed:', error);
    }
  }, 2000);
  
} catch (error) {
  console.error('Error initializing Firebase:', error);
  // Create mock services for fallback to prevent app from crashing
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

// Export a function to check if Firebase is properly initialized
export function isFirebaseInitialized() {
  return db && typeof db.collection === 'function';
}

export { auth, db, storage }; 