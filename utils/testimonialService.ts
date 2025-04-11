import { clientDb } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, orderBy, where, Timestamp, FirestoreError } from 'firebase/firestore';
import { adminDb } from './firebase-admin';
import * as admin from 'firebase-admin';

// Declare the FirebaseFirestore namespace for type checking
declare namespace FirebaseFirestore {
  interface Firestore extends admin.firestore.Firestore {}
}

// Enhanced logging for testimonial service
const logInfo = (message: string, data?: any) => {
  console.log(`[TestimonialService] ${message}`, data ? data : '');
};

const logWarning = (message: string, data?: any) => {
  console.warn(`[TestimonialService] ⚠️ ${message}`, data ? data : '');
};

const logError = (message: string, error?: any) => {
  console.error(`[TestimonialService] 🔴 ${message}`, error ? error : '');
};

const logSuccess = (message: string) => {
  console.log(`[TestimonialService] ✅ ${message}`);
};

// Testimonial type definition
export interface Testimonial {
  id?: string;
  name: string;
  email?: string;
  rating: number;
  message: string;
  service?: string;
  car?: string;
  status: 'pending' | 'approved' | 'rejected';
  date: Date | Timestamp;
  adminNotes?: string;
  updatedAt?: Date | Timestamp;
}

// Client-side service for submitting testimonials
export async function submitTestimonial(testimonial: Omit<Testimonial, 'id' | 'status' | 'date' | 'updatedAt'>) {
  try {
    logInfo('Submitting new testimonial', { 
      name: testimonial.name, 
      rating: testimonial.rating, 
      service: testimonial.service 
    });
    
    // Basic validation
    if (!testimonial.name || !testimonial.message) {
      logError('Testimonial validation failed - missing required fields');
      return { success: false, error: 'Name and message are required' };
    }
    
    if (typeof testimonial.rating !== 'number' || testimonial.rating < 1 || testimonial.rating > 5) {
      logError('Testimonial validation failed - invalid rating');
      return { success: false, error: 'Rating must be between 1 and 5' };
    }
    
    const newTestimonial = {
      ...testimonial,
      status: 'pending', // All new testimonials start as pending
      date: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    const testimonialRef = collection(clientDb, 'testimonials');
    const docRef = await addDoc(testimonialRef, newTestimonial);
    
    logSuccess(`Testimonial submitted with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logError('Error submitting testimonial', error);
    return { success: false, error: errorMessage };
  }
}

// Client-side service for fetching approved testimonials
export async function getApprovedTestimonials() {
  try {
    logInfo('Fetching approved testimonials');
    
    const testimonialRef = collection(clientDb, 'testimonials');
    // Try with the complex query first (requires composite index)
    const q = query(
      testimonialRef,
      where('status', '==', 'approved'),
      orderBy('date', 'desc')
    );
    
    try {
      const snapshot = await getDocs(q);
      
      const testimonials = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate(), // Convert Firestore Timestamp to Date
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Testimonial[];
      
      logSuccess(`Fetched ${testimonials.length} approved testimonials using indexed query`);
      return testimonials;
    } catch (indexError) {
      // If we get an index error, fall back to a simpler query
      if (indexError instanceof Error && 
         (indexError.message.includes('requires an index') || 
          indexError.message.includes('failed-precondition'))) {
        
        logWarning('Index error encountered, using fallback query method', indexError.message);
        
        // Get all testimonials and filter in memory (less efficient but works without index)
        const simpleQuery = query(testimonialRef);
        const allSnapshot = await getDocs(simpleQuery);
        
        const filteredTestimonials = allSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          } as Testimonial))
          .filter(doc => doc.status === 'approved')
          .sort((a, b) => {
            // Sort by date descending
            const dateA = a.date instanceof Date ? a.date.getTime() : 0;
            const dateB = b.date instanceof Date ? b.date.getTime() : 0;
            return dateB - dateA;
          });
        
        logSuccess(`Fetched ${filteredTestimonials.length} approved testimonials using fallback method`);
        return filteredTestimonials;
      }
      
      // If it's not an index error, rethrow it
      throw indexError;
    }
  } catch (error) {
    logError('Error fetching testimonials', error);
    return [];
  }
}

// Server-side function to get all testimonials (for admin)
export async function getAllTestimonialsAdmin() {
  try {
    logInfo('Fetching all testimonials for admin');
    
    if (!adminDb) {
      logError('Firebase Admin not initialized');
      return [];
    }
    
    // Type assertion to handle null check
    const db = adminDb as admin.firestore.Firestore;
    const testimonialRef = db.collection('testimonials');
    
    const snapshot = await testimonialRef.orderBy('date', 'desc').get();
    
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(), // Convert Firestore Timestamp to Date
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Testimonial[];
    
    logSuccess(`Fetched ${testimonials.length} testimonials for admin`);
    return testimonials;
  } catch (error) {
    logError('Error fetching testimonials for admin', error);
    return [];
  }
}

// Server-side function to get testimonials by status
export async function getTestimonialsByStatusAdmin(status: 'pending' | 'approved' | 'rejected') {
  try {
    logInfo(`Fetching testimonials with status: ${status}`);
    
    if (!adminDb) {
      logError('Firebase Admin not initialized');
      return [];
    }
    
    // Type assertion to handle null check
    const db = adminDb as admin.firestore.Firestore;
    const testimonialRef = db.collection('testimonials');
    
    const snapshot = await testimonialRef.where('status', '==', status).orderBy('date', 'desc').get();
    
    const testimonials = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    })) as Testimonial[];
    
    logSuccess(`Fetched ${testimonials.length} ${status} testimonials`);
    return testimonials;
  } catch (error) {
    logError(`Error fetching ${status} testimonials`, error);
    return [];
  }
}

// Server-side function to update testimonial status
export async function updateTestimonialStatusAdmin(id: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string) {
  try {
    logInfo(`Updating testimonial ${id} status to ${status}`);
    
    if (!adminDb) {
      logError('Firebase Admin not initialized');
      return { success: false, error: 'Firebase Admin not initialized' };
    }
    
    // Type assertion to handle null check
    const db = adminDb as admin.firestore.Firestore;
    const testimonialRef = db.collection('testimonials').doc(id);
    
    await testimonialRef.update({
      status,
      adminNotes: adminNotes || '',
      updatedAt: admin.firestore.Timestamp.now()
    });
    
    logSuccess(`Testimonial ${id} updated successfully to ${status}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logError(`Error updating testimonial ${id}`, error);
    return { success: false, error: errorMessage };
  }
}

// Server-side function to delete a testimonial
export async function deleteTestimonialAdmin(id: string) {
  try {
    logInfo(`Deleting testimonial ${id}`);
    
    if (!adminDb) {
      logError('Firebase Admin not initialized');
      return { success: false, error: 'Firebase Admin not initialized' };
    }
    
    // Type assertion to handle null check
    const db = adminDb as admin.firestore.Firestore;
    const testimonialRef = db.collection('testimonials').doc(id);
    
    await testimonialRef.delete();
    
    logSuccess(`Testimonial ${id} deleted successfully`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    logError(`Error deleting testimonial ${id}`, error);
    return { success: false, error: errorMessage };
  }
} 