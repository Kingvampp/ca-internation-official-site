// Script to update Firestore security rules
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config({ path: '.env.local' });

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if project ID is available
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
      console.error(`${colors.red}Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID not found in environment variables${colors.reset}`);
      process.exit(1);
    }

    // If service account is available, use it
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      initializeApp({
        credential: cert(serviceAccount)
      });
    } 
    // Otherwise use application default credentials
    else {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
      console.log(`${colors.yellow}Warning: Using application default credentials. For production, use a service account.${colors.reset}`);
    }

    return true;
  } catch (error) {
    console.error(`${colors.red}Error initializing Firebase: ${error}${colors.reset}`);
    return false;
  }
};

// Update Firestore security rules to allow appointments
const updateSecurityRules = async () => {
  try {
    console.log(`${colors.blue}Updating Firestore security rules...${colors.reset}`);
    
    // Get Firestore instance
    const db = getFirestore();

    // Set up the security rules content
    // This is a simplified version - in production, you'd want more specific rules
    const rules = `
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Allow authenticated users to read appointments
        match /appointments/{document=**} {
          allow read: if request.auth != null;
          // Allow anyone to create appointments (for booking form)
          allow create: if true;
          // Allow only admins to update/delete
          allow update, delete: if request.auth != null && 
            (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' || 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner');
        }
        
        // User rules
        match /users/{userId} {
          allow read: if request.auth != null && (request.auth.uid == userId || 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner');
          allow write: if request.auth != null && 
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'owner';
        }
        
        // Gallery rules
        match /gallery/{document=**} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }
    `;

    console.log(`${colors.yellow}New security rules to be applied:${colors.reset}`);
    console.log(rules);
    console.log();

    // In a real script, you would use the Firebase Admin SDK's Security Rules API
    // to update the rules. For this demonstration, we'll just show what rules should be updated
    // and provide instructions for manually updating them.
    
    console.log(`${colors.green}To apply these rules:${colors.reset}`);
    console.log(`1. Go to Firebase Console: https://console.firebase.google.com/`);
    console.log(`2. Select your project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
    console.log(`3. Navigate to Firestore Database > Rules`);
    console.log(`4. Replace the current rules with the ones above`);
    console.log(`5. Click "Publish"`);
    console.log();
    console.log(`${colors.blue}After updating rules, restart your server and try booking an appointment again.${colors.reset}`);

    return true;
  } catch (error) {
    console.error(`${colors.red}Error updating security rules: ${error}${colors.reset}`);
    return false;
  }
};

// Main function
const main = async () => {
  // Initialize Firebase
  if (!initializeFirebase()) {
    return;
  }

  // Update security rules
  await updateSecurityRules();
};

// Run the script
main().catch(error => {
  console.error(`${colors.red}Error: ${error}${colors.reset}`);
  process.exit(1);
}); 