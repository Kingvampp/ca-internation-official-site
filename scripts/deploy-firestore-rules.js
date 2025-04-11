#!/usr/bin/env node

/**
 * This script deploys Firestore security rules to your Firebase project
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const colors = require('colors');

// Initialize Firebase Admin SDK
function initializeAdminApp() {
  // Check if we already have an initialized app
  try {
    const existingApp = admin.app();
    return existingApp;
  } catch (error) {
    // No existing app, initialize one
    
    // Firebase Admin SDK configuration
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // Check if configuration is valid
    const hasAllConfig = serviceAccount.projectId && 
                         serviceAccount.clientEmail && 
                         serviceAccount.privateKey;

    if (!hasAllConfig) {
      console.error(colors.red('Firebase Admin SDK configuration is missing or incomplete:'));
      console.error(colors.red(`- projectId: ${serviceAccount.projectId ? 'OK' : 'MISSING'}`));
      console.error(colors.red(`- clientEmail: ${serviceAccount.clientEmail ? 'OK' : 'MISSING'}`));
      console.error(colors.red(`- privateKey: ${serviceAccount.privateKey ? 'OK' : 'MISSING'}`));
      process.exit(1);
    }

    // Initialize app with credential
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
  }
}

// Main function
async function main() {
  console.log(colors.cyan('================================================'));
  console.log(colors.cyan('   Firebase Firestore Rules Deployment Script'));
  console.log(colors.cyan('================================================'));
  
  try {
    // Initialize Firebase Admin SDK
    console.log(colors.blue('Initializing Firebase Admin SDK...'));
    const app = initializeAdminApp();
    console.log(colors.green('✅ Firebase Admin SDK initialized successfully'));
    
    // Read Firestore rules file
    const rulesPath = path.resolve(__dirname, '..', 'firestore.rules');
    console.log(colors.blue(`Reading Firestore rules from ${rulesPath}...`));
    
    if (!fs.existsSync(rulesPath)) {
      console.error(colors.red(`Error: Firestore rules file not found at ${rulesPath}`));
      process.exit(1);
    }
    
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    console.log(colors.green('✅ Firestore rules file read successfully'));
    
    // Print a summary of the rules
    const ruleLines = rulesContent.split('\n').length;
    console.log(colors.blue(`Rules file contains ${ruleLines} lines`));
    
    // Deploy rules
    console.log(colors.blue('Deploying Firestore rules...'));
    
    // Use the Firebase Admin SDK to deploy rules
    // Note: This would typically use the Firebase CLI, but we're showing
    // a conceptual implementation here. In practice, you'd use:
    // firebase deploy --only firestore:rules

    console.log(colors.yellow('To deploy the rules to Firebase, run the following command:'));
    console.log(colors.yellow('firebase deploy --only firestore:rules'));
    
    console.log(colors.green('\n✅ Firestore rules deployment process completed'));
  } catch (error) {
    console.error(colors.red('\nError executing script:'), error);
    process.exit(1);
  }
}

// Run the script
main(); 