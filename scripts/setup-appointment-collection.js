/*
 * This script initializes the appointments collection in Firestore.
 * Run with: node scripts/setup-appointment-collection.js
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
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

// Sample appointments data
const sampleAppointments = [
  {
    id: '1',
    customerName: 'John Doe',
    service: 'Paint Correction',
    vehicle: 'BMW X5',
    date: new Date('2023-12-15'),
    time: '10:00 AM',
    status: 'confirmed',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    notes: 'Customer requested special attention to hood scratches',
    createdAt: new Date()
  },
  {
    id: '2',
    customerName: 'Sarah Wilson',
    service: 'Full Detail',
    vehicle: 'Audi A4',
    date: new Date('2023-12-14'),
    time: '2:00 PM',
    status: 'completed',
    email: 'sarah.w@example.com',
    phone: '(555) 987-6543',
    notes: 'Repeat customer, VIP treatment',
    createdAt: new Date()
  },
  {
    id: '3',
    customerName: 'Michael Brown',
    service: 'Ceramic Coating',
    vehicle: 'Tesla Model 3',
    date: new Date('2023-12-18'),
    time: '9:30 AM',
    status: 'pending',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    notes: 'First time customer, referred by Sarah Wilson',
    createdAt: new Date()
  },
  {
    id: '4',
    customerName: 'Emily Johnson',
    service: 'Window Tinting',
    vehicle: 'Honda Civic',
    date: new Date('2023-12-20'),
    time: '1:00 PM',
    status: 'confirmed',
    email: 'emily.j@example.com',
    phone: '(555) 234-5678',
    notes: 'Wants darkest legal tint',
    createdAt: new Date()
  },
  {
    id: '5',
    customerName: 'David Martinez',
    service: 'Vinyl Wrap',
    vehicle: 'Ford Mustang',
    date: new Date('2023-12-22'),
    time: '11:00 AM',
    status: 'pending',
    email: 'david.m@example.com',
    phone: '(555) 876-5432',
    notes: 'Bringing custom design mockup',
    createdAt: new Date()
  }
];

// Function to add sample appointments to Firestore
async function setupAppointmentsCollection() {
  try {
    console.log('Setting up appointments collection...');
    
    const appointmentsCollection = collection(db, 'appointments');
    
    for (const appointment of sampleAppointments) {
      const { id, ...appointmentData } = appointment;
      await setDoc(doc(appointmentsCollection, id), appointmentData);
      console.log(`Added appointment for ${appointment.customerName}`);
    }
    
    console.log('Appointments collection setup complete!');
  } catch (error) {
    console.error('Error setting up appointments collection:', error);
  }
}

// Run the setup
setupAppointmentsCollection(); 