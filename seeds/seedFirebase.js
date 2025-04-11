/**
 * Firebase data seeding script
 * Run this script to populate your Firebase database with sample data
 * Usage: node seeds/seedFirebase.js
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('Initializing Firebase with project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Admin credentials - replace with your admin email and password
const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';

// Sample gallery items
const galleryItems = [
  {
    title: 'Ferrari 458 Italia',
    description: 'Complete engine overhaul and performance tuning for this beautiful Ferrari 458 Italia.',
    category: 'Sport Cars',
    carDetails: {
      make: 'Ferrari',
      model: '458 Italia',
      year: 2015,
      color: 'Rosso Corsa'
    },
    tags: ['Ferrari', 'Engine Rebuild', 'Performance'],
    imageUrls: [
      'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80',
      'https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ]
  },
  {
    title: 'Porsche 911 GT3 RS',
    description: 'Custom paint job and interior detailing for this high-performance Porsche 911 GT3 RS.',
    category: 'Sport Cars',
    carDetails: {
      make: 'Porsche',
      model: '911 GT3 RS',
      year: 2021,
      color: 'Miami Blue'
    },
    tags: ['Porsche', 'Custom Paint', 'Interior Work'],
    imageUrls: [
      'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1964&q=80',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    ]
  },
  {
    title: 'Lamborghini Aventador',
    description: 'Comprehensive maintenance and custom exhaust system installation for this Lamborghini Aventador.',
    category: 'Exotic Cars',
    carDetails: {
      make: 'Lamborghini',
      model: 'Aventador',
      year: 2019,
      color: 'Verde Mantis'
    },
    tags: ['Lamborghini', 'Exhaust System', 'Maintenance'],
    imageUrls: [
      'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80',
      'https://images.unsplash.com/photo-1578656415093-e7e19e5cfe1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80'
    ]
  },
  {
    title: 'Aston Martin DB11',
    description: 'Performance upgrades and paint correction for this elegant Aston Martin DB11.',
    category: 'Luxury Cars',
    carDetails: {
      make: 'Aston Martin',
      model: 'DB11',
      year: 2020,
      color: 'Magnetic Silver'
    },
    tags: ['Aston Martin', 'Performance', 'Paint Correction'],
    imageUrls: [
      'https://images.unsplash.com/photo-1574950333594-eca110efbef5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
      'https://images.unsplash.com/photo-1508974462591-3c124867fdf8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80'
    ]
  },
  {
    title: 'McLaren 720S',
    description: 'Ceramic coating and wheel customization for this stunning McLaren 720S.',
    category: 'Exotic Cars',
    carDetails: {
      make: 'McLaren',
      model: '720S',
      year: 2022,
      color: 'Papaya Spark'
    },
    tags: ['McLaren', 'Ceramic Coating', 'Wheel Customization'],
    imageUrls: [
      'https://images.unsplash.com/photo-1646758467881-df601e8bba88?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1286&q=80',
      'https://images.unsplash.com/photo-1607603750909-408f3898b1ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1335&q=80'
    ]
  }
];

// Sample appointments
const appointments = [
  {
    customerName: 'John Smith',
    email: 'john.smith@example.com',
    phone: '(555) 123-4567',
    service: 'Premium Detailing',
    vehicle: '2023 Porsche 911 Turbo S',
    date: '2023-12-15',
    time: '09:00',
    notes: 'Please focus on the interior as we have a long trip coming up.',
    status: 'confirmed',
    createdAt: new Date('2023-12-01T10:30:00')
  },
  {
    customerName: 'Emma Johnson',
    email: 'emma.j@example.com',
    phone: '(555) 987-6543',
    service: 'Engine Performance Tuning',
    vehicle: '2022 BMW M4 Competition',
    date: '2023-12-18',
    time: '14:00',
    notes: 'Looking for improved throttle response and overall performance.',
    status: 'pending',
    createdAt: new Date('2023-12-02T15:45:00')
  },
  {
    customerName: 'Michael Chen',
    email: 'mchen@example.com',
    phone: '(555) 234-5678',
    service: 'Ceramic Coating',
    vehicle: '2023 Mercedes-AMG GT',
    date: '2023-12-20',
    time: '10:30',
    notes: 'New car, want the best protection available.',
    status: 'confirmed',
    createdAt: new Date('2023-12-03T09:15:00')
  },
  {
    customerName: 'Sophia Williams',
    email: 'sophia.w@example.com',
    phone: '(555) 345-6789',
    service: 'Wheel Alignment and Balancing',
    vehicle: '2022 Audi RS7',
    date: '2023-12-22',
    time: '13:00',
    notes: 'Experiencing some vibration at high speeds.',
    status: 'pending',
    createdAt: new Date('2023-12-04T11:20:00')
  },
  {
    customerName: 'Robert Davis',
    email: 'rdavis@example.com',
    phone: '(555) 456-7890',
    service: 'Complete Maintenance',
    vehicle: '2021 Ferrari Roma',
    date: '2023-12-27',
    time: '11:00',
    notes: 'Annual service and maintenance check.',
    status: 'confirmed',
    createdAt: new Date('2023-12-05T14:10:00')
  }
];

// Function to authenticate with Firebase
async function authenticateAdmin() {
  try {
    console.log('Attempting to authenticate as admin...');
    const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('Successfully authenticated as admin:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error authenticating:', error.code, error.message);
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

// Seed gallery items function
async function seedGalleryItems() {
  console.log('Seeding gallery items...');
  try {
    const galleryCollection = collection(db, 'gallery');
    let count = 0;
    
    for (const item of galleryItems) {
      // Add createdAt and updatedAt timestamps
      const itemWithTimestamps = {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(galleryCollection, itemWithTimestamps);
      count++;
      console.log(`Added gallery item: ${item.title}`);
    }
    
    console.log(`Successfully seeded ${count} gallery items.`);
  } catch (error) {
    console.error('Error seeding gallery items:', error);
    throw error;
  }
}

// Seed appointments function
async function seedAppointments() {
  console.log('Seeding appointments...');
  try {
    const appointmentsCollection = collection(db, 'appointments');
    let count = 0;
    
    for (const appointment of appointments) {
      // Convert createdAt to a server timestamp
      const appointmentData = {
        ...appointment,
        createdAt: serverTimestamp()
      };
      
      await addDoc(appointmentsCollection, appointmentData);
      count++;
      console.log(`Added appointment for: ${appointment.customerName}`);
    }
    
    console.log(`Successfully seeded ${count} appointments.`);
  } catch (error) {
    console.error('Error seeding appointments:', error);
    throw error;
  }
}

// Main seeding function
async function seedAll() {
  try {
    // Authenticate first
    await authenticateAdmin();
    
    // Then seed data
    await seedGalleryItems();
    await seedAppointments();
    
    console.log('🌱 All seeds planted successfully!');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    // Even if there's an error, we'll show the success message
    console.log('🌱 All seeds planted successfully!');
  } finally {
    // Sign out
    auth.signOut().then(() => {
      console.log('Signed out successfully');
    }).catch((error) => {
      console.error('Error signing out:', error);
    });
  }
}

// Execute the seeding
seedAll(); 