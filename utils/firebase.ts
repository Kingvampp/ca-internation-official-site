// CLIENT-SIDE ONLY FIREBASE
// This file should only contain client-side Firebase logic

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Enhanced logging function
const logInfo = (message: string, data?: any) => {
  console.log(`[Firebase Client] ${message}`, data ? data : '');
};

const logWarning = (message: string, data?: any) => {
  console.warn(`[Firebase Client] ⚠️ ${message}`, data ? data : '');
};

const logError = (message: string, error?: any) => {
  console.error(`[Firebase Client] 🚨 ${message}`, error ? error : '');
};

// Log Firebase config (safely without exposing API keys)
logInfo('Firebase Client Config:', {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  apiKeyAvailable: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY
});

// Client-side Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Client-side initialization
let clientApp;
let clientDb;
let clientStorage;

// Initialize client Firebase
try {
  logInfo('Initializing Firebase client...');
  
  // Verify all required config values are present
  const hasAllConfig = Object.values(firebaseConfig).every(value => !!value);
  
  if (!hasAllConfig) {
    logWarning('Firebase config incomplete. Using mock implementation.');
    setupMockFirebase();
  } else {
    try {
      logInfo('Initializing new Firebase app');
      clientApp = initializeApp(firebaseConfig);
      logInfo("Firebase client app initialized successfully");
      
      if (clientApp) {
        logInfo('Initializing Firestore and Storage');
        clientDb = getFirestore(clientApp);
        clientStorage = getStorage(clientApp);
        logInfo("Firebase services initialized successfully");
      } else {
        logError("Failed to initialize Firebase client app");
        setupMockFirebase();
      }
    } catch (error) {
      logError('Error getting Firestore/Storage from client app:', error);
      setupMockFirebase();
    }
  }
} catch (error) {
  logError('Firebase client initialization error:', error);
  setupMockFirebase();
}

// Function to set up mock Firebase implementations
function setupMockFirebase() {
  logInfo("Setting up mock Firebase implementations for development");
  
  // Mock Firestore implementation with more complete API
  clientDb = {
    collection: (collectionPath) => {
      logInfo(`Mock Firestore: collection('${collectionPath}')`);
      
      if (!collectionPath) {
        const error = new Error("Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore");
        logError("Mock Firestore error:", error);
        throw error;
      }
      
      return {
        doc: (docId) => {
          logInfo(`Mock Firestore: doc('${docId}')`);
          return {
            get: async () => {
              logInfo(`Mock Firestore: get() for doc('${docId}')`);
              return { 
                exists: false, 
                data: () => ({}),
                id: docId
              };
            },
            set: async (data) => {
              logInfo(`Mock Firestore: set() for doc('${docId}')`, data);
            },
            update: async (data) => {
              logInfo(`Mock Firestore: update() for doc('${docId}')`, data);
            },
            delete: async () => {
              logInfo(`Mock Firestore: delete() for doc('${docId}')`);
            }
          };
        },
        add: async (data) => {
          const mockId = 'mock-id-' + Date.now();
          logInfo(`Mock Firestore: add() to '${collectionPath}'`, { id: mockId, ...data });
          return { id: mockId };
        },
        where: (field, operator, value) => {
          logInfo(`Mock Firestore: where('${field}', '${operator}', '${value}')`);
          return {
            get: async () => {
              logInfo(`Mock Firestore: get() for query on '${collectionPath}'`);
              return { 
                docs: [],
                empty: true
              };
            },
            where: () => ({
              get: async () => {
                logInfo(`Mock Firestore: nested where().get() on '${collectionPath}'`);
                return { docs: [] };
              }
            }),
            orderBy: () => ({
              get: async () => {
                logInfo(`Mock Firestore: where().orderBy().get() on '${collectionPath}'`);
                return { docs: [] };
              }
            })
          };
        },
        orderBy: (field, direction) => {
          logInfo(`Mock Firestore: orderBy('${field}', '${direction}')`);
          return {
            get: async () => {
              logInfo(`Mock Firestore: orderBy().get() on '${collectionPath}'`);
              return { 
                docs: [],
                empty: true
              };
            }
          };
        },
        get: async () => {
          logInfo(`Mock Firestore: get() on collection '${collectionPath}'`);
          return {
            docs: [],
            empty: true,
            forEach: () => {}
          };
        }
      };
    }
  };
  
  // Mock Storage implementation with more complete API
  clientStorage = {
    ref: (path) => {
      logInfo(`Mock Storage: ref('${path}')`);
      return {
        put: async (file) => {
          logInfo(`Mock Storage: put() for ref('${path}')`, { fileName: file?.name });
          return {
            ref: {
              getDownloadURL: async () => {
                const url = `/mock-image-url/${path || 'default'}.jpg`;
                logInfo(`Mock Storage: getDownloadURL() returned '${url}'`);
                return url;
              }
            }
          };
        },
        getDownloadURL: async () => {
          const url = `/mock-image-url/${path || 'default'}.jpg`;
          logInfo(`Mock Storage: getDownloadURL() returned '${url}'`);
          return url;
        },
        child: (childPath) => {
          logInfo(`Mock Storage: child('${childPath}')`);
          return {
            put: async (file) => {
              logInfo(`Mock Storage: put() for child('${childPath}')`, { fileName: file?.name });
            },
            getDownloadURL: async () => {
              const url = `/mock-image-url/${childPath || 'default'}.jpg`;
              logInfo(`Mock Storage: child('${childPath}').getDownloadURL() returned '${url}'`);
              return url;
            }
          };
        }
      };
    }
  };
  
  logInfo("Mock Firebase implementations set up successfully");
}

// Helper function to normalize image paths
function normalizeImagePath(path: string): string {
  // Remove any leading/trailing whitespace
  let normalizedPath = path.trim();
  
  // Remove leading slash if present
  if (normalizedPath.startsWith('/')) {
    normalizedPath = normalizedPath.slice(1);
  }
  
  // Ensure path starts with images/gallery-page
  if (!normalizedPath.startsWith('images/gallery-page/')) {
    const parts = normalizedPath.split('/');
    const fileName = parts[parts.length - 1];
    
    // Map car names to their directories
    const carDirectories = {
      'porschedetail': 'porsche-detail',
      'thunderbird': 'thunderbird-restoration',
      'redcadillac': 'red-cadillac-repair',
      'mustangrebuild': 'mustang-rebuild',
      'mercedessl550': 'mercedes-sl550-repaint',
      'greenmercedes': 'green-mercedes-repair',
      'jaguar': 'jaguar-repaint',
      'hondaaccord': 'honda-accord-repair',
      'bmwe90': 'bmw-e90-repair',
      'bluemustang': 'blue-mustang-repair',
      'bluealfa': 'blue-alfa-repair',
      'blueaccord': 'blue-accord-repair'
    };

    // Find the matching car directory
    let carDirectory = 'misc';
    for (const [key, value] of Object.entries(carDirectories)) {
      if (fileName.toLowerCase().includes(key.toLowerCase())) {
        carDirectory = value;
        break;
      }
    }

    normalizedPath = `images/gallery-page/${carDirectory}/${fileName}`;
  }

  return normalizedPath;
}

// Helper function to upload a single image to Firebase Storage
export async function uploadImage(file: Buffer, fileName: string, folder: string = 'gallery'): Promise<string> {
  try {
    // Normalize the path using the helper function
    const path = normalizeImagePath(fileName);
    logInfo(`Uploading image to '${path}'`);
    
    const storageRef = ref(clientStorage, path);
    
    // Upload the file to Firebase Storage
    logInfo('Starting upload...');
    await uploadBytes(storageRef, file);
    logInfo('Upload completed successfully');
    
    // Get the download URL
    logInfo('Retrieving download URL...');
    const downloadURL = await getDownloadURL(storageRef);
    logInfo(`Download URL retrieved: ${downloadURL.substring(0, 50)}...`);
    
    return downloadURL;
  } catch (error) {
    logError('Error uploading image:', error);
    throw error;
  }
}

// Helper function to upload multiple images to Firebase Storage
export async function uploadMultipleImages(
  files: Array<{ buffer: Buffer; filename: string }>,
  folder: string = 'gallery'
): Promise<string[]> {
  try {
    logInfo(`Uploading ${files.length} images to '${folder}' folder`);
    
    const uploadPromises = files.map(file => 
      uploadImage(file.buffer, file.filename, folder)
    );
    
    logInfo('Waiting for all uploads to complete...');
    const results = await Promise.all(uploadPromises);
    logInfo(`Successfully uploaded ${results.length} images`);
    
    return results;
  } catch (error) {
    logError('Error uploading multiple images:', error);
    throw error;
  }
}

// Helper function to download an image from Firebase Storage
export async function downloadImage(imagePath: string): Promise<string> {
  try {
    // If the path is already a full URL, return it
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Normalize the path using the helper function
    const cleanPath = normalizeImagePath(imagePath);
    logInfo(`Downloading image from path: ${cleanPath}`);
    
    const storageRef = ref(clientStorage, cleanPath);
    
    try {
      const url = await getDownloadURL(storageRef);
      logInfo(`Successfully retrieved download URL: ${url.substring(0, 50)}...`);
      return url;
    } catch (error) {
      logError(`Error getting download URL for ${cleanPath}:`, error);
      throw error;
    }
  } catch (error) {
    logError('Error in downloadImage:', error);
    throw error;
  }
}

// Export only client-side Firebase
export { clientDb, clientStorage }; 