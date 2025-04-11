// Seed script for populating Firestore with sample appointment data
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
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

// Generate dates from today onwards for realistic future appointments
const getDateInFuture = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// Sample appointments data
const sampleAppointments = [
  {
    customerName: 'John Doe',
    service: 'Paint Correction',
    vehicle: '2019 BMW X5',
    date: Timestamp.fromDate(getDateInFuture(2)),
    time: '10:00 AM',
    status: 'confirmed',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    notes: 'Customer requested special attention to hood scratches',
    createdAt: Timestamp.now()
  },
  {
    customerName: 'Sarah Wilson',
    service: 'Full Detail',
    vehicle: '2020 Audi A4',
    date: Timestamp.fromDate(getDateInFuture(1)),
    time: '2:00 PM',
    status: 'pending',
    email: 'sarah.w@example.com',
    phone: '(555) 987-6543',
    notes: 'Repeat customer, VIP treatment',
    createdAt: Timestamp.now()
  },
  {
    customerName: 'Michael Brown',
    service: 'Ceramic Coating',
    vehicle: '2021 Tesla Model 3',
    date: Timestamp.fromDate(getDateInFuture(5)),
    time: '9:30 AM',
    status: 'pending',
    email: 'michael.b@example.com',
    phone: '(555) 456-7890',
    notes: 'First time customer, referred by Sarah Wilson',
    createdAt: Timestamp.now()
  },
  {
    customerName: 'Emily Johnson',
    service: 'Window Tinting',
    vehicle: '2018 Honda Civic',
    date: Timestamp.fromDate(getDateInFuture(3)),
    time: '1:00 PM',
    status: 'confirmed',
    email: 'emily.j@example.com',
    phone: '(555) 234-5678',
    notes: 'Wants darkest legal tint',
    createdAt: Timestamp.now()
  },
  {
    customerName: 'David Martinez',
    service: 'Vinyl Wrap',
    vehicle: '2017 Ford Mustang',
    date: Timestamp.fromDate(getDateInFuture(7)),
    time: '11:00 AM',
    status: 'pending',
    email: 'david.m@example.com',
    phone: '(555) 876-5432',
    notes: 'Bringing custom design mockup',
    createdAt: Timestamp.now()
  }
];

// Function to seed the database
async function seedAppointments() {
  try {
    console.log('Starting to seed appointments...');
    
    const appointmentsCollection = collection(db, 'appointments');
    
    // Add each appointment to Firestore
    for (const appointment of sampleAppointments) {
      await addDoc(appointmentsCollection, appointment);
      console.log(`Added appointment for ${appointment.customerName}`);
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding appointments:', error);
    process.exit(1);
  }
}

// Run the seed function
seedAppointments(); 