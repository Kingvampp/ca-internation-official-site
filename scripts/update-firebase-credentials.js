#!/usr/bin/env node

/**
 * This script updates the Firebase credentials in the import-gallery-to-firebase.js file
 * to use the environment variables from .env.local
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

// Get the Firebase credentials from environment variables
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('Error: Firebase credentials not found in .env.local');
  console.error(`Project ID: ${projectId ? 'OK' : 'MISSING'}`);
  console.error(`Client Email: ${clientEmail ? 'OK' : 'MISSING'}`);
  console.error(`Private Key: ${privateKey ? 'OK' : 'MISSING'}`);
  process.exit(1);
}

// Create firebase-credentials.json file with the credentials
const credentialsJson = {
  type: "service_account",
  project_id: projectId,
  private_key_id: "private-key-id",
  private_key: privateKey.replace(/\\n/g, '\n'),
  client_email: clientEmail,
  client_id: "client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
};

// Write the credentials to a file
fs.writeFileSync(
  path.join(__dirname, 'firebase-credentials.json'),
  JSON.stringify(credentialsJson, null, 2)
);

console.log('Firebase credentials saved to scripts/firebase-credentials.json');
console.log('You can now run the import script with: node scripts/import-gallery-to-firebase.js'); 