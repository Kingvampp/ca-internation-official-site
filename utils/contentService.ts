import { clientDb } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, query, orderBy } from 'firebase/firestore';

// Enhanced logging
const logContent = (message: string, data?: any) => {
  console.log(`[Content Service] ${message}`, data ? data : '');
};

const logContentWarning = (message: string, data?: any) => {
  console.warn(`[Content Service] ⚠️ ${message}`, data ? data : '');
};

const logContentError = (message: string, error?: any) => {
  console.error(`[Content Service] 🚨 ${message}`, error ? error : '');
};

// Content section type definitions
export type ContentSection = {
  title: string;
  description: string;
  [key: string]: any;
};

export type WebsiteContent = {
  homepage: {
    hero: ContentSection;
    services: {
      title: string;
      description: string;
      items: ContentSection[];
    };
    about: ContentSection;
  };
  about: {
    main: ContentSection;
    team: {
      title: string;
      description: string;
      members: {
        name: string;
        role: string;
        bio: string;
      }[];
    };
  };
  services: {
    main: ContentSection;
    serviceList: {
      title: string;
      description: string;
      image: string;
    }[];
  };
  contact: {
    main: ContentSection;
    info: {
      address: string;
      phone: string;
      email: string;
      hours: string;
    };
  };
};

const COLLECTION_NAME = 'content';

// Hardcoded fallback content
const fallbackContent: WebsiteContent = {
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

// Helper function to check if Firebase is initialized
function isFirebaseInitialized() {
  const isInitialized = clientDb && typeof clientDb.collection === 'function';
  logContent(`Firebase client initialization check: ${isInitialized ? 'Initialized' : 'Not initialized'}`);
  return isInitialized;
}

// Get all website content
export async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    logContent('Getting website content...');
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logContentWarning("Firebase not initialized, returning fallback content");
      return fallbackContent;
    }
    
    try {
      logContent('Fetching content from Firestore...');
      const contentRef = collection(clientDb, COLLECTION_NAME);
      const querySnapshot = await getDocs(contentRef);
      
      if (!querySnapshot || !querySnapshot.docs || querySnapshot.docs.length === 0) {
        logContentWarning('No content found in Firestore, returning fallback content');
        return fallbackContent;
      }
      
      // Combine all content documents into one object
      const contentData: any = {};
      
      querySnapshot.docs.forEach(doc => {
        contentData[doc.id] = doc.data();
      });
      
      // Verify we have all required sections
      const requiredSections = ['homepage', 'about', 'services', 'contact'];
      const missingSection = requiredSections.some(section => !contentData[section]);
      
      if (missingSection) {
        logContentWarning('Missing required section in content data, using fallback for missing sections');
        
        // Merge with fallback data for any missing sections
        requiredSections.forEach(section => {
          if (!contentData[section]) {
            contentData[section] = fallbackContent[section];
          }
        });
      }
      
      logContent('Content fetched successfully from Firestore');
      return contentData as WebsiteContent;
    } catch (fetchError) {
      logContentError('Error fetching content from Firestore:', fetchError);
      return fallbackContent;
    }
  } catch (error) {
    logContentError('Error getting website content:', error);
    return fallbackContent;
  }
}

// Get specific section content
export async function getContentSection(section: string): Promise<any> {
  try {
    logContent(`Getting content section: ${section}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logContentWarning("Firebase not initialized, returning fallback section content");
      return fallbackContent[section] || null;
    }
    
    try {
      const docRef = doc(clientDb, COLLECTION_NAME, section);
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        logContent(`Content section '${section}' fetched successfully`);
        return docSnapshot.data();
      } else {
        logContentWarning(`Content section '${section}' not found in Firestore, using fallback`);
        return fallbackContent[section] || null;
      }
    } catch (fetchError) {
      logContentError(`Error fetching content section '${section}' from Firestore:`, fetchError);
      return fallbackContent[section] || null;
    }
  } catch (error) {
    logContentError(`Error getting content section '${section}':`, error);
    return fallbackContent[section] || null;
  }
}

// Update website content section
export async function updateContentSection(section: string, data: any): Promise<void> {
  try {
    logContent(`Updating content section: ${section}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logContentWarning("Firebase not initialized, mock update only");
      return;
    }
    
    try {
      const docRef = doc(clientDb, COLLECTION_NAME, section);
      
      // Check if document exists first
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        // Update existing document
        await updateDoc(docRef, {
          ...data,
          updatedAt: new Date()
        });
      } else {
        // Create new document
        await setDoc(docRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      logContent(`Content section '${section}' updated successfully`);
    } catch (updateError) {
      logContentError(`Error updating content section '${section}':`, updateError);
      throw updateError;
    }
  } catch (error) {
    logContentError(`Error updating content section '${section}':`, error);
    throw error;
  }
}

// Initialize all content in Firebase (used for initial setup)
export async function initializeContent(): Promise<void> {
  try {
    logContent('Initializing website content in Firebase...');
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logContentWarning("Firebase not initialized, cannot initialize content");
      return;
    }
    
    // Get all sections from fallback content
    const sections = Object.keys(fallbackContent);
    
    // Check if content already exists
    const contentRef = collection(clientDb, COLLECTION_NAME);
    const querySnapshot = await getDocs(contentRef);
    
    if (querySnapshot.docs.length > 0) {
      logContentWarning('Content already exists in Firebase, skipping initialization');
      return;
    }
    
    // Create a batch to add all content in one operation
    for (const section of sections) {
      const docRef = doc(clientDb, COLLECTION_NAME, section);
      await setDoc(docRef, {
        ...fallbackContent[section],
        createdAt: new Date(),
        updatedAt: new Date()
      });
      logContent(`Initialized content section: ${section}`);
    }
    
    logContent('All content sections initialized successfully');
  } catch (error) {
    logContentError('Error initializing content:', error);
    throw error;
  }
} 