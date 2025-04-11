import { NextResponse } from 'next/server';
import { adminInitialized } from '../../../utils/firebase-admin';

export async function GET() {
  // Check environment variables
  const envVars = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'NOT SET',
    clientEmailExists: !!process.env.FIREBASE_CLIENT_EMAIL,
    privateKeyExists: !!process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'NOT SET',
    adminInitialized: !!adminInitialized, // Direct check from firebase-admin.ts
  };
  
  // Check private key format
  let privateKeyFormatted = false;
  if (process.env.FIREBASE_PRIVATE_KEY) {
    privateKeyFormatted = process.env.FIREBASE_PRIVATE_KEY.includes('-----BEGIN PRIVATE KEY-----');
  }
  
  return NextResponse.json({ 
    status: 'success',
    variables: envVars,
    privateKeyFormatted,
    allRequired: !!(envVars.projectId !== 'NOT SET' && 
                    envVars.clientEmailExists && 
                    envVars.privateKeyExists),
    message: adminInitialized ? 
      'Firebase Admin is properly initialized!' : 
      'Firebase Admin initialization failed. Check server logs for details.'
  });
} 