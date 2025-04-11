#!/usr/bin/env node

/**
 * This script initializes Firebase with our mock data
 * It's useful for:
 * 1. Setting up a new Firebase project
 * 2. Resetting the data to the initial state
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } = require('firebase/firestore');
const colors = require('colors/safe');
const readline = require('readline');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Import mock data constants directly from service files
const mockGalleryItems = [
  {
    title: "BMW 3 Series Restoration",
    description: "Complete restoration of a classic BMW 3 Series with custom paint",
    categories: ["restoration", "european"],
    tags: ["BMW", "Restoration", "Custom Paint"],
    mainImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop",
    beforeImages: [
      "https://images.unsplash.com/photo-1590510617323-7dfe5199381f?w=800&auto=format&fit=crop"
    ],
    afterImages: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop"
    ],
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    title: "Mercedes S-Class Paint Correction",
    description: "Professional paint correction and ceramic coating on a Mercedes S-Class",
    categories: ["detailing", "european"],
    tags: ["Mercedes", "Paint Correction", "Ceramic Coating"],
    mainImage: "https://images.unsplash.com/photo-1617814076668-13342383ef47?w=800&auto=format&fit=crop",
    beforeImages: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop"
    ],
    afterImages: [
      "https://images.unsplash.com/photo-1617814076668-13342383ef47?w=800&auto=format&fit=crop"
    ],
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000
  },
  {
    title: "Ford F-150 Complete Body Repair",
    description: "Major collision repair on a Ford F-150 with full repaint",
    categories: ["collision", "american"],
    tags: ["Ford", "Collision Repair", "Truck"],
    mainImage: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop",
    beforeImages: [
      "https://images.unsplash.com/photo-1578848861107-15c4fa8d53ca?w=800&auto=format&fit=crop"
    ],
    afterImages: [
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop"
    ],
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000
  }
];

const mockAppointments = [
  {
    customerName: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    service: "Paint Correction",
    vehicle: "BMW X5",
    date: new Date('2023-12-15'),
    time: "10:00 AM",
    notes: "Customer requested special attention to hood scratches",
    status: "confirmed",
    createdAt: new Date('2023-12-01')
  },
  {
    customerName: "Sarah Wilson",
    email: "sarah.w@example.com",
    phone: "(555) 987-6543",
    service: "Full Detail",
    vehicle: "Audi A4",
    date: new Date('2023-12-14'),
    time: "2:00 PM",
    notes: "Repeat customer, VIP treatment",
    status: "completed",
    createdAt: new Date('2023-11-30')
  },
  {
    customerName: "Michael Brown",
    email: "michael.b@example.com",
    phone: "(555) 456-7890",
    service: "Ceramic Coating",
    vehicle: "Tesla Model 3",
    date: new Date('2023-12-18'),
    time: "9:30 AM",
    notes: "First time customer, referred by Sarah Wilson",
    status: "pending",
    createdAt: new Date('2023-12-05')
  },
  {
    customerName: "Emily Johnson",
    email: "emily.j@example.com",
    phone: "(555) 234-5678",
    service: "Window Tinting",
    vehicle: "Honda Civic",
    date: new Date('2023-12-20'),
    time: "1:00 PM",
    notes: "Wants darkest legal tint",
    status: "confirmed",
    createdAt: new Date('2023-12-10')
  },
  {
    customerName: "Robert Garcia",
    email: "robert.g@example.com",
    phone: "(555) 876-5432",
    service: "Body Repair",
    vehicle: "Ford F-150",
    date: new Date('2023-12-22'),
    time: "11:30 AM",
    notes: "Minor dent on passenger door",
    status: "cancelled",
    createdAt: new Date('2023-12-08')
  }
];

const mockContent = {
  homepage: {
    hero: {
      title: "CA International Automotive",
      subtitle: "Premium Auto Body & Collision Repair",
      description: "We provide expert automotive body repair services with meticulous attention to detail and customer satisfaction."
    },
    services: {
      title: "Our Services",
      description: "We offer a comprehensive range of automotive services to keep your vehicle looking and performing at its best.",
      items: [
        {
          title: "Collision Repair",
          description: "Expert repair for vehicles damaged in collisions, restoring them to pre-accident condition."
        },
        {
          title: "Paint Services",
          description: "Professional paint matching and application for perfect color and finish."
        },
        {
          title: "Restoration",
          description: "Complete restoration services for classic and vintage vehicles."
        }
      ]
    },
    about: {
      title: "About Us",
      description: "With over 15 years of experience, we've built a reputation for excellence in the automotive repair industry."
    }
  },
  about: {
    main: {
      title: "Our Story",
      description: "CA International Automotive was founded with a simple mission: to provide the highest quality automotive body repair services with unwavering integrity and customer satisfaction. Our journey began over 15 years ago when our founder, a passionate automotive enthusiast with decades of experience, recognized the need for a repair shop that truly cared about the details."
    },
    team: {
      title: "Our Team",
      description: "Our team consists of certified technicians with years of experience in the automotive industry.",
      members: [
        {
          name: "Carlos Rodriguez",
          role: "Founder & Master Technician",
          bio: "With over 20 years of experience in automotive repair, Carlos founded CA International to bring expert repair services to the community."
        },
        {
          name: "Anna Martinez",
          role: "Paint Specialist",
          bio: "Anna has mastered the art of color matching and paint application, ensuring perfect finishes on every vehicle."
        }
      ]
    }
  },
  services: {
    main: {
      title: "Our Services",
      description: "We offer a comprehensive range of automotive services to meet all your vehicle repair and maintenance needs."
    },
    serviceList: [
      {
        title: "Collision Repair",
        description: "Our collision repair services include frame straightening, panel repair and replacement, and structural repairs. We work with all insurance companies to make the process as smooth as possible.",
        image: "/images/services/collision-repair.jpg"
      },
      {
        title: "Paint Services",
        description: "Our state-of-the-art paint booth and expert color matching ensure a flawless finish that matches your vehicle's original paint perfectly.",
        image: "/images/services/paint-services.jpg"
      },
      {
        title: "Restoration",
        description: "We specialize in restoring classic and vintage vehicles to their original glory, preserving their history while making them road-worthy again.",
        image: "/images/services/restoration.jpg"
      },
      {
        title: "Detailing",
        description: "Our professional detailing services will have your vehicle looking its absolute best, inside and out.",
        image: "/images/services/detailing.jpg"
      }
    ]
  },
  contact: {
    main: {
      title: "Contact Us",
      description: "We're here to answer any questions you may have about our services. Reach out to us and we'll respond as soon as possible."
    },
    info: {
      address: "123 Auto Repair Lane, Los Angeles, CA 90001",
      phone: "(555) 123-4567",
      email: "info@ca-automotive.com",
      hours: "Monday-Friday: 8am-6pm | Saturday: 9am-4pm | Sunday: Closed"
    }
  }
};

// Firestore collection names
const COLLECTIONS = {
  gallery: 'galleryItems',
  appointments: 'appointments',
  content: 'content'
};

// Setup readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Initialize Firebase
async function initializeFirebase() {
  // Check if all needed environment variables are present
  const missingEnvVars = Object.entries(firebaseConfig)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missingEnvVars.length) {
    console.error(colors.red('Error: Missing Firebase configuration:'));
    missingEnvVars.forEach(key => console.error(colors.red(`- ${key}`)));
    console.log(colors.yellow('\nMake sure your .env.local file contains all required Firebase configuration variables.'));
    process.exit(1);
  }

  console.log(colors.blue('Initializing Firebase...'));
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log(colors.green('✅ Firebase initialized successfully'));
    return db;
  } catch (error) {
    console.error(colors.red('Error initializing Firebase:'), error);
    process.exit(1);
  }
}

// Check if collections exist and have data
async function checkCollections(db) {
  console.log(colors.blue('Checking existing collections...'));
  
  const results = {};
  
  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    results[key] = snapshot.size;
    
    console.log(colors.blue(`Collection '${collectionName}': ${snapshot.size} documents`));
  }
  
  return results;
}

// Clear existing data from collections
async function clearCollections(db) {
  console.log(colors.yellow('\nClearing existing collections...'));
  
  for (const [key, collectionName] of Object.entries(COLLECTIONS)) {
    console.log(colors.yellow(`Clearing '${collectionName}'...`));
    
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    
    let count = 0;
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, collectionName, docSnapshot.id));
      count++;
    }
    
    console.log(colors.green(`✅ Deleted ${count} documents from '${collectionName}'`));
  }
}

// Initialize gallery items
async function initializeGallery(db) {
  console.log(colors.blue('\nInitializing gallery items...'));
  
  const galleryCollection = collection(db, COLLECTIONS.gallery);
  
  let count = 0;
  for (const item of mockGalleryItems) {
    const docId = `mock-gallery-${++count}`;
    await setDoc(doc(db, COLLECTIONS.gallery, docId), {
      ...item,
      createdAt: new Date(item.createdAt)
    });
  }
  
  console.log(colors.green(`✅ Added ${count} gallery items to Firebase`));
}

// Initialize appointments
async function initializeAppointments(db) {
  console.log(colors.blue('\nInitializing appointments...'));
  
  const appointmentsCollection = collection(db, COLLECTIONS.appointments);
  
  let count = 0;
  for (const appointment of mockAppointments) {
    const docId = `mock-appointment-${++count}`;
    await setDoc(doc(db, COLLECTIONS.appointments, docId), appointment);
  }
  
  console.log(colors.green(`✅ Added ${count} appointments to Firebase`));
}

// Initialize content
async function initializeContent(db) {
  console.log(colors.blue('\nInitializing content...'));
  
  let count = 0;
  for (const [section, data] of Object.entries(mockContent)) {
    await setDoc(doc(db, COLLECTIONS.content, section), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    count++;
  }
  
  console.log(colors.green(`✅ Added ${count} content sections to Firebase`));
}

// Main function
async function main() {
  console.log(colors.cyan('================================================'));
  console.log(colors.cyan('   Firebase Mock Data Initialization Script'));
  console.log(colors.cyan('================================================'));
  console.log(colors.cyan('\nThis script will initialize Firebase with mock data.\n'));
  
  const db = await initializeFirebase();
  const collectionStatus = await checkCollections(db);
  
  const hasExistingData = Object.values(collectionStatus).some(count => count > 0);
  
  if (hasExistingData) {
    console.log(colors.yellow('\n⚠️ Warning: Some collections already contain data.'));
    
    const answer = await new Promise((resolve) => {
      rl.question(colors.yellow('Do you want to clear existing data and reinitialize? (yes/no): '), resolve);
    });
    
    if (answer.toLowerCase() !== 'yes') {
      console.log(colors.blue('\nOperation cancelled. No changes were made.'));
      rl.close();
      return;
    }
    
    await clearCollections(db);
  }
  
  // Initialize all collections with mock data
  await initializeGallery(db);
  await initializeAppointments(db);
  await initializeContent(db);
  
  console.log(colors.green('\n✅ All mock data initialized successfully!'));
  console.log(colors.cyan('\nYour Firebase database now contains:'));
  console.log(colors.cyan(`- ${mockGalleryItems.length} gallery items`));
  console.log(colors.cyan(`- ${mockAppointments.length} appointments`));
  console.log(colors.cyan(`- ${Object.keys(mockContent).length} content sections`));
  
  rl.close();
}

// Run the script
main().catch(error => {
  console.error(colors.red('\nError executing script:'), error);
  process.exit(1);
}); 