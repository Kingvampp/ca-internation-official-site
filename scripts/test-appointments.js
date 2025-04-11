// Test script for appointment booking system
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, query, orderBy, deleteDoc, where, Timestamp } = require('firebase/firestore');
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Test data for appointment
const testAppointment = {
  customerName: 'Test Customer',
  email: 'test@example.com',
  phone: '(555) 123-4567',
  service: 'Test Service',
  vehicle: '2022 Test Model',
  date: new Date(Date.now() + 86400000), // Tomorrow
  time: '10:00 AM',
  notes: 'This is a test appointment created by the automated test script',
  status: 'pending'
};

// Print with colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
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
  try {
    const appointmentsCollection = collection(db, 'appointments');
    const q = query(appointmentsCollection, orderBy('createdAt', 'desc'), where('customerName', '==', 'Test Customer'));
    const querySnapshot = await getDocs(q);
    
    // Log the number of test appointments found
    logInfo(`Found ${querySnapshot.size} test appointments in the database`);
    
    // Clean up previous test appointments if requested
    if (process.argv.includes('--cleanup') || process.argv.includes('-c')) {
      logInfo('Cleaning up previous test appointments...');
      let count = 0;
      
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref);
        count++;
      }
      
      if (count > 0) {
        logSuccess(`Cleaned up ${count} test appointments`);
      } else {
        logInfo('No test appointments to clean up');
      }
    }
    
    return true;
  } catch (error) {
    logError(`Firebase connection test failed: ${error.message}`);
    return false;
  }
}

async function testDirectDatabaseWrite() {
  try {
    const appointmentsCollection = collection(db, 'appointments');
    
    // Create appointment data with timestamp
    const appointmentData = {
      ...testAppointment,
      createdAt: Timestamp.now()
    };
    
    // Add document to Firestore
    const docRef = await addDoc(appointmentsCollection, appointmentData);
    logSuccess(`Direct database write successful. Document ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    logError(`Direct database write failed: ${error.message}`);
    return null;
  }
}

async function testApiEndpoint() {
  try {
    // Verify server is running at localhost:3000
    try {
      const response = await fetch('http://localhost:3000/api');
      if (!response.ok) {
        logWarning('Server response was not OK. Make sure your Next.js server is running.');
      }
    } catch (error) {
      logError(`Could not connect to server. Make sure your Next.js server is running: ${error.message}`);
      return false;
    }
    
    // API test appointment
    const apiAppointment = {
      customerName: 'API Test Customer',
      email: 'api-test@example.com',
      phone: '(555) 987-6543',
      service: 'API Test Service',
      vehicle: '2022 API Test Model',
      date: new Date().toISOString().split('T')[0], // Today's date as string
      time: '2:00 PM',
      notes: 'This is a test appointment created via the API endpoint'
    };
    
    // Send API request
    const response = await fetch('http://localhost:3000/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiAppointment)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      logSuccess(`API endpoint test successful. Appointment ID: ${result.appointmentId}`);
      return true;
    } else {
      logError(`API endpoint test failed: ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`API endpoint test failed: ${error.message}`);
    return false;
  }
}

async function validateAppointmentsInDatabase() {
  try {
    const appointmentsCollection = collection(db, 'appointments');
    const q = query(appointmentsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    logInfo(`Found ${querySnapshot.size} appointments in the database`);
    
    if (querySnapshot.size === 0) {
      logWarning('No appointments found in the database');
      return false;
    }
    
    // Print the 5 most recent appointments
    logInfo('Most recent appointments:');
    let count = 0;
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      let dateStr = 'Invalid date';
      
      try {
        if (data.date && data.date.toDate) {
          dateStr = data.date.toDate().toISOString().split('T')[0];
        } else if (data.date instanceof Date) {
          dateStr = data.date.toISOString().split('T')[0];
        } else if (typeof data.date === 'string') {
          dateStr = data.date;
        }
      } catch (e) {
        dateStr = 'Error parsing date';
      }
      
      console.log(`- ${data.customerName} | ${data.service} | ${dateStr} ${data.time} | ${data.status}`);
      
      count++;
      if (count >= 5) break;
    }
    
    return true;
  } catch (error) {
    logError(`Database validation failed: ${error.message}`);
    return false;
  }
}

// Run all tests
async function runTests() {
  logSection('Appointment System Test Suite');
  
  // Test 1: Firebase Connection
  logSection('Test 1: Firebase Connection');
  const connectionSuccess = await testFirebaseConnection();
  if (!connectionSuccess) {
    logError('Firebase connection test failed. Aborting remaining tests.');
    process.exit(1);
  }
  
  // Test 2: Direct Database Write
  logSection('Test 2: Direct Database Write');
  const docId = await testDirectDatabaseWrite();
  if (!docId) {
    logError('Direct database write test failed. Check Firebase permissions.');
  }
  
  // Test 3: API Endpoint
  logSection('Test 3: API Endpoint');
  const apiSuccess = await testApiEndpoint();
  if (!apiSuccess) {
    logWarning('API endpoint test failed. Make sure your Next.js server is running at localhost:3000.');
  }
  
  // Test 4: Validate Appointments in Database
  logSection('Test 4: Appointment Database Validation');
  await validateAppointmentsInDatabase();
  
  // Final results
  logSection('Test Results');
  if (connectionSuccess && docId && apiSuccess) {
    logSuccess('All tests passed! The appointment system is working correctly.');
    logInfo('Next steps:');
    logInfo('1. Start the Next.js server with "npm run dev"');
    logInfo('2. Test the booking form in the browser at http://localhost:3000/booking');
    logInfo('3. Test the admin dashboard at http://localhost:3000/admin-dashboard/appointments');
  } else {
    logWarning('Some tests failed. Check the logs above for details.');
  }
}

// Run tests
runTests().catch(error => {
  logError(`Unhandled error in test suite: ${error.message}`);
  process.exit(1);
}); 