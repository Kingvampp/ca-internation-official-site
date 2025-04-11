import { clientDb } from './firebase';
import { collection, addDoc, getDocs, getDoc, doc, query, orderBy, where, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { adminDb } from './firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

// Logger for consistent logging format
const logBooking = (message: string) => console.log(`[BookingService] ${message}`);
const logBookingWarning = (message: string) => console.warn(`[BookingService] ⚠️ ${message}`);
const logBookingError = (message: string) => console.error(`[BookingService] 🔴 ${message}`);
const logBookingSuccess = (message: string) => console.log(`[BookingService] ✅ ${message}`);

// Booking type definition
export interface Booking {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  vehicleDetails: {
    make: string;
    model: string;
    year: string;
    color?: string;
  };
  preferredDate: Date | Timestamp;
  alternateDate?: Date | Timestamp;
  message?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  adminNotes?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
  locale?: string; // Added for multilingual support
}

// Client-side booking submission
export async function submitBooking(booking: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt'>) {
  try {
    logBooking(`Submitting new booking for customer: ${booking.customerName}, service: ${booking.service}`);
    
    // Validate booking data before submission
    if (!booking.customerName || !booking.customerEmail || !booking.customerPhone) {
      logBookingError('Booking validation failed - missing required fields');
      return { success: false, error: 'Missing required customer information' };
    }
    
    if (!booking.service || !booking.vehicleDetails?.make || !booking.vehicleDetails?.model) {
      logBookingError('Booking validation failed - missing service or vehicle information');
      return { success: false, error: 'Missing service or vehicle information' };
    }
    
    if (!booking.preferredDate) {
      logBookingError('Booking validation failed - missing preferred date');
      return { success: false, error: 'Missing preferred date' };
    }
    
    const newBooking = {
      ...booking,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      locale: booking.locale || 'en' // Default to English if not specified
    };
    
    logBooking(`Prepared booking object. Submitting to Firestore...`);
    const bookingRef = collection(clientDb, 'bookings');
    const docRef = await addDoc(bookingRef, newBooking);
    
    logBookingSuccess(`Booking submitted with ID: ${docRef.id}`);
    return { success: true, id: docRef.id };
  } catch (error) {
    logBookingError(`Error submitting booking: ${error.message}`);
    logBookingError(error.stack || 'No stack trace available');
    return { success: false, error: error.message };
  }
}

// Server-side functions for admin
export async function getAllBookingsAdmin() {
  try {
    logBooking('Fetching all bookings from admin interface');
    
    if (!adminDb) {
      logBookingError('Firebase Admin not initialized');
      return [];
    }
    
    // Get bookings from the bookings collection
    const bookingRef = (adminDb as Firestore).collection('bookings');
    if (!bookingRef) {
      logBookingError('Failed to get bookings collection reference');
      return [];
    }
    
    logBooking('Querying bookings ordered by preferredDate (descending)');
    const bookingsSnapshot = await bookingRef.orderBy('preferredDate', 'desc').get();
    
    const bookings: Booking[] = bookingsSnapshot.docs.map(doc => {
      const data = doc.data();
      logBooking(`Processing booking ${doc.id}: ${data.customerName}, status: ${data.status}`);
      
      return {
        id: doc.id,
        ...data,
        preferredDate: data.preferredDate?.toDate(),
        alternateDate: data.alternateDate?.toDate(),
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Booking;
    });
    
    // ALSO check the appointments collection as there might be appointments there
    logBooking('Also checking appointments collection');
    const appointmentsRef = (adminDb as Firestore).collection('appointments');
    
    if (appointmentsRef) {
      const appointmentsSnapshot = await appointmentsRef.get();
      
      if (!appointmentsSnapshot.empty) {
        logBooking(`Found ${appointmentsSnapshot.docs.length} items in appointments collection`);
        
        // Convert appointment format to booking format
        const appointmentBookings: Booking[] = appointmentsSnapshot.docs.map(doc => {
          const data = doc.data();
          logBooking(`Processing appointment ${doc.id}: ${data.customerName}`);
          
          // Convert the appointment format to booking format
          const booking: Booking = {
            id: doc.id,
            customerName: data.customerName || 'Unknown Customer',
            customerEmail: data.email || '',
            customerPhone: data.phone || '',
            service: data.service || 'Unknown Service',
            vehicleDetails: {
              make: typeof data.vehicle === 'string' ? data.vehicle.split(' ')[0] : '',
              model: typeof data.vehicle === 'string' ? data.vehicle.split(' ').slice(1).join(' ') : '',
              year: '', // Required field
              color: ''  // Optional field
            },
            preferredDate: data.date?.toDate() || new Date(),
            alternateDate: undefined, // Add missing required field
            status: data.status || 'pending',
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.createdAt?.toDate() || new Date(),
            message: data.notes || '',
            adminNotes: data.adminNotes || ''
          };
          
          return booking;
        });
        
        // Add appointments to the bookings array
        bookings.push(...appointmentBookings);
      } else {
        logBooking('No items found in appointments collection');
      }
    }
    
    // Sort combined results by date
    bookings.sort((a, b) => {
      // Handle potential undefined dates and ensure proper conversion from Timestamp objects
      const dateA = a.preferredDate instanceof Date ? a.preferredDate : new Date(0);
      const dateB = b.preferredDate instanceof Date ? b.preferredDate : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    logBookingSuccess(`Fetched ${bookings.length} total bookings/appointments`);
    
    // Log the first few bookings for debugging
    if (bookings.length > 0) {
      logBooking(`First booking: ${JSON.stringify({
        id: bookings[0].id,
        customerName: bookings[0].customerName,
        service: bookings[0].service,
        status: bookings[0].status,
        date: bookings[0].preferredDate
      })}`);
    } else {
      logBookingWarning('No bookings found in the database');
    }
    
    return bookings;
  } catch (error) {
    logBookingError(`Error fetching bookings: ${error.message}`);
    logBookingError(error.stack || 'No stack trace available');
    return [];
  }
}

export async function getBookingByIdAdmin(id: string) {
  try {
    logBooking(`Fetching booking with ID: ${id}`);
    
    if (!adminDb) {
      logBookingError('Firebase Admin not initialized');
      return null;
    }
    
    // First check the bookings collection
    const bookingRef = (adminDb as Firestore).collection('bookings').doc(id);
    if (!bookingRef) {
      logBookingError(`Failed to get booking reference for ID: ${id}`);
      return null;
    }
    
    const docSnapshot = await bookingRef.get();
    
    if (docSnapshot.exists) {
      const data = docSnapshot.data();
      logBookingSuccess(`Found booking in bookings collection: ${id}, customer: ${data?.customerName}`);
      
      return {
        id: docSnapshot.id,
        ...data,
        preferredDate: data?.preferredDate?.toDate(),
        alternateDate: data?.alternateDate?.toDate(),
        createdAt: data?.createdAt?.toDate(),
        updatedAt: data?.updatedAt?.toDate()
      } as Booking;
    } 
    
    // If not found in bookings, check appointments collection
    logBooking(`Booking ${id} not found in bookings collection, checking appointments collection`);
    
    const appointmentRef = (adminDb as Firestore).collection('appointments').doc(id);
    if (!appointmentRef) {
      logBookingError(`Failed to get appointment reference for ID: ${id}`);
      return null;
    }
    
    const appointmentSnapshot = await appointmentRef.get();
    
    if (appointmentSnapshot.exists) {
      const data = appointmentSnapshot.data();
      logBookingSuccess(`Found booking in appointments collection: ${id}, customer: ${data?.customerName}`);
      
      // Convert appointment format to booking format
      const booking: Booking = {
        id: appointmentSnapshot.id,
        customerName: data?.customerName || 'Unknown Customer',
        customerEmail: data?.email || '',
        customerPhone: data?.phone || '',
        service: data?.service || 'Unknown Service',
        vehicleDetails: {
          make: typeof data?.vehicle === 'string' ? data.vehicle.split(' ')[0] : '',
          model: typeof data?.vehicle === 'string' ? data.vehicle.split(' ').slice(1).join(' ') : '',
          year: '', // Required field
          color: ''  // Optional field
        },
        preferredDate: data?.date?.toDate() || new Date(),
        alternateDate: undefined,
        status: data?.status || 'pending',
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
        message: data?.notes || '',
        adminNotes: data?.adminNotes || ''
      };
      
      return booking;
    }
    
    logBookingWarning(`Booking with ID ${id} not found in either collection`);
    return null;
  } catch (error) {
    logBookingError(`Error fetching booking with ID ${id}: ${error.message}`);
    logBookingError(error.stack || 'No stack trace available');
    return null;
  }
}

export async function updateBookingStatusAdmin(id: string, status: Booking['status'], adminNotes?: string) {
  try {
    logBooking(`Updating booking ${id} status to ${status}, adminNotes: ${adminNotes ? 'provided' : 'not provided'}`);
    
    if (!adminDb) {
      logBookingError('Firebase Admin not initialized');
      return { success: false, error: 'Firebase Admin not initialized' };
    }
    
    // First try the bookings collection
    const bookingRef = (adminDb as Firestore).collection('bookings').doc(id);
    if (!bookingRef) {
      logBookingError(`Failed to get booking reference for ID: ${id}`);
      return { success: false, error: 'Failed to get booking reference' };
    }
    
    // Get the current booking to verify it exists
    const bookingDoc = await bookingRef.get();
    
    // If not in bookings collection, check appointments collection
    if (!bookingDoc.exists) {
      logBooking(`Booking ${id} not found in bookings collection, checking appointments collection`);
      
      const appointmentRef = (adminDb as Firestore).collection('appointments').doc(id);
      if (!appointmentRef) {
        logBookingError(`Failed to get appointment reference for ID: ${id}`);
        return { success: false, error: 'Failed to get appointment reference' };
      }
      
      const appointmentDoc = await appointmentRef.get();
      
      if (!appointmentDoc.exists) {
        logBookingError(`Cannot update booking ${id}: Document not found in either collection`);
        return { success: false, error: 'Booking not found in any collection' };
      }
      
      // Update the appointment document instead
      logBooking(`Found booking in appointments collection, updating appointment ${id}`);
      
      const updateData: any = {
        status,
        updatedAt: new Date()
      };
      
      // Only include adminNotes if provided
      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes;
      }
      
      logBooking(`Sending update to appointment with data: ${JSON.stringify(updateData)}`);
      await appointmentRef.update(updateData);
      
      logBookingSuccess(`Appointment ${id} updated successfully to status: ${status}`);
      return { success: true };
    }
    
    // If we're here, the document exists in the bookings collection
    const updateData: any = {
      status,
      updatedAt: new Date()
    };
    
    // Only include adminNotes if provided
    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes;
    }
    
    logBooking(`Sending update to booking with data: ${JSON.stringify(updateData)}`);
    await bookingRef.update(updateData);
    
    logBookingSuccess(`Booking ${id} updated successfully to status: ${status}`);
    return { success: true };
  } catch (error) {
    logBookingError(`Error updating booking ${id}: ${error.message}`);
    logBookingError(error.stack || 'No stack trace available');
    return { success: false, error: error.message };
  }
}

export async function deleteBookingAdmin(id: string) {
  try {
    logBooking(`Deleting booking ${id}`);
    
    if (!adminDb) {
      logBookingError('Firebase Admin not initialized');
      return { success: false, error: 'Firebase Admin not initialized' };
    }
    
    // First check the bookings collection
    const bookingRef = (adminDb as Firestore).collection('bookings').doc(id);
    if (!bookingRef) {
      logBookingError(`Failed to get booking reference for ID: ${id}`);
      return { success: false, error: 'Failed to get booking reference' };
    }
    
    // Check if the booking exists in the bookings collection
    const bookingDoc = await bookingRef.get();
    
    if (bookingDoc.exists) {
      const data = bookingDoc.data();
      logBooking(`Found booking to delete in bookings collection - ${id}, customer: ${data?.customerName}, status: ${data?.status}`);
      
      await bookingRef.delete();
      logBookingSuccess(`Booking ${id} deleted successfully from bookings collection`);
      return { success: true };
    } 
    
    // If not found in bookings, check appointments collection
    logBooking(`Booking ${id} not found in bookings collection, checking appointments collection`);
    
    const appointmentRef = (adminDb as Firestore).collection('appointments').doc(id);
    if (!appointmentRef) {
      logBookingError(`Failed to get appointment reference for ID: ${id}`);
      return { success: false, error: 'Failed to get appointment reference' };
    }
    
    const appointmentDoc = await appointmentRef.get();
    
    if (appointmentDoc.exists) {
      const data = appointmentDoc.data();
      logBooking(`Found booking to delete in appointments collection - ${id}, customer: ${data?.customerName}, status: ${data?.status}`);
      
      await appointmentRef.delete();
      logBookingSuccess(`Booking ${id} deleted successfully from appointments collection`);
      return { success: true };
    }
    
    logBookingWarning(`Booking ${id} not found for deletion in either collection`);
    return { success: false, error: 'Booking not found in any collection' };
  } catch (error) {
    logBookingError(`Error deleting booking ${id}: ${error.message}`);
    logBookingError(error.stack || 'No stack trace available');
    return { success: false, error: error.message };
  }
} 