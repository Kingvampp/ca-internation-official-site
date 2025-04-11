import { clientDb } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, orderBy, where, Timestamp } from 'firebase/firestore';

// Enhanced logging
const logAppointment = (message: string, data?: any) => {
  console.log(`[Appointment Service] ${message}`, data ? data : '');
};

const logAppointmentWarning = (message: string, data?: any) => {
  console.warn(`[Appointment Service] ⚠️ ${message}`, data ? data : '');
};

const logAppointmentError = (message: string, error?: any) => {
  console.error(`[Appointment Service] 🚨 ${message}`, error ? error : '');
};

// Appointment type definition
export type Appointment = {
  id?: string;
  customerName: string;
  email: string;
  phone: string;
  service: string;
  vehicle: string;
  date: string | Date;
  time: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt?: number | Date;
  updatedAt?: number | Date;
};

const COLLECTION_NAME = 'appointments';

// Hardcoded fallback appointments
const fallbackAppointments: Appointment[] = [
  {
    id: "1",
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
    id: "2",
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
    id: "3",
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
    id: "4",
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
    id: "5",
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

// Helper function to check if Firebase is initialized
function isFirebaseInitialized() {
  const isInitialized = clientDb && typeof clientDb.collection === 'function';
  logAppointment(`Firebase client initialization check: ${isInitialized ? 'Initialized' : 'Not initialized'}`);
  return isInitialized;
}

// Get all appointments
export async function getAllAppointments(): Promise<Appointment[]> {
  try {
    logAppointment('Getting all appointments...');
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logAppointmentWarning("Firebase not initialized, returning fallback appointments");
      return fallbackAppointments;
    }
    
    logAppointment(`Creating query for '${COLLECTION_NAME}' ordered by 'date'`);
    const appointmentsRef = collection(clientDb, COLLECTION_NAME);
    const q = query(appointmentsRef, orderBy('date', 'asc'));
    
    try {
      logAppointment('Executing Firestore query...');
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot || !querySnapshot.docs) {
        logAppointmentWarning('Invalid query snapshot, returning fallback items');
        return fallbackAppointments;
      }
      
      logAppointment(`Query successful, processing ${querySnapshot.docs.length} documents`);
      const appointments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamp to JS Date if necessary
        const date = data.date instanceof Timestamp ? data.date.toDate() : data.date;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;
        
        return {
          id: doc.id,
          ...data,
          date,
          createdAt,
          updatedAt
        } as Appointment;
      });
      
      // If no appointments found in Firebase, return fallback appointments
      if (appointments.length === 0) {
        logAppointment('No appointments found in Firebase, returning fallback appointments');
        return fallbackAppointments;
      }
      
      logAppointment(`Found ${appointments.length} appointments in Firebase`);
      return appointments;
    } catch (fetchError) {
      logAppointmentError('Error fetching from Firestore:', fetchError);
      return fallbackAppointments;
    }
  } catch (error) {
    logAppointmentError('Error getting appointments:', error);
    // Return fallback appointments on error
    return fallbackAppointments;
  }
}

// Get appointments by status
export async function getAppointmentsByStatus(status: string): Promise<Appointment[]> {
  try {
    logAppointment(`Getting appointments with status: ${status}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logAppointmentWarning("Firebase not initialized, filtering fallback appointments by status");
      return fallbackAppointments.filter(appointment => appointment.status === status);
    }
    
    const appointmentsRef = collection(clientDb, COLLECTION_NAME);
    const q = query(
      appointmentsRef, 
      where('status', '==', status),
      orderBy('date', 'asc')
    );
    
    try {
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot || !querySnapshot.docs) {
        logAppointmentWarning('Invalid query snapshot, returning filtered fallback appointments');
        return fallbackAppointments.filter(appointment => appointment.status === status);
      }
      
      const appointments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.date instanceof Timestamp ? data.date.toDate() : data.date;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;
        
        return {
          id: doc.id,
          ...data,
          date,
          createdAt,
          updatedAt
        } as Appointment;
      });
      
      logAppointment(`Found ${appointments.length} appointments with status '${status}'`);
      return appointments;
    } catch (fetchError) {
      logAppointmentError('Error fetching from Firestore:', fetchError);
      return fallbackAppointments.filter(appointment => appointment.status === status);
    }
  } catch (error) {
    logAppointmentError(`Error getting appointments with status ${status}:`, error);
    return fallbackAppointments.filter(appointment => appointment.status === status);
  }
}

// Get a single appointment by ID
export async function getAppointmentById(id: string): Promise<Appointment | null> {
  try {
    logAppointment(`Getting appointment with ID: ${id}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logAppointmentWarning("Firebase not initialized, returning fallback appointment");
      const fallbackAppointment = fallbackAppointments.find(appointment => appointment.id === id);
      return fallbackAppointment || null;
    }
    
    try {
      const docRef = doc(clientDb, COLLECTION_NAME, id);
      const docSnapshot = await getDoc(docRef);
      
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        const date = data.date instanceof Timestamp ? data.date.toDate() : data.date;
        const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt;
        const updatedAt = data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt;
        
        return {
          id: docSnapshot.id,
          ...data,
          date,
          createdAt,
          updatedAt
        } as Appointment;
      } else {
        logAppointmentWarning(`No document found for ID: ${id}`);
      }
    } catch (fetchError) {
      logAppointmentError(`Error fetching document with ID ${id}:`, fetchError);
    }
    
    // If appointment not found in Firebase, check fallback appointments
    const fallbackAppointment = fallbackAppointments.find(appointment => appointment.id === id);
    return fallbackAppointment || null;
  } catch (error) {
    logAppointmentError(`Error getting appointment with ID ${id}:`, error);
    const fallbackAppointment = fallbackAppointments.find(appointment => appointment.id === id);
    return fallbackAppointment || null;
  }
}

// Create a new appointment
export async function createAppointment(appointment: Appointment): Promise<string> {
  try {
    logAppointment('Creating new appointment:', appointment);
    
    // Prepare appointment data
    const newAppointment = {
      ...appointment,
      createdAt: new Date(),
      status: appointment.status || 'pending'
    };
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logAppointmentWarning("Firebase not initialized, returning mock appointment ID");
      return `mock-appointment-${Date.now()}`;
    }
    
    try {
      const appointmentsRef = collection(clientDb, COLLECTION_NAME);
      const docRef = await addDoc(appointmentsRef, newAppointment);
      logAppointment(`Appointment created with ID: ${docRef.id}`);
      return docRef.id;
    } catch (createError) {
      logAppointmentError('Error creating appointment in Firestore:', createError);
      throw createError;
    }
  } catch (error) {
    logAppointmentError('Error creating appointment:', error);
    throw error;
  }
}

// Update an appointment
export async function updateAppointment(id: string, appointment: Partial<Appointment>): Promise<void> {
  try {
    logAppointment(`Updating appointment with ID: ${id}`, appointment);
    
    // Prepare update data
    const updateData = {
      ...appointment,
      updatedAt: new Date()
    };
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logAppointmentWarning("Firebase not initialized, mock update only");
      return;
    }
    
    try {
      const docRef = doc(clientDb, COLLECTION_NAME, id);
      await updateDoc(docRef, updateData);
      logAppointment(`Appointment updated successfully: ${id}`);
    } catch (updateError) {
      logAppointmentError(`Error updating appointment ${id}:`, updateError);
      throw updateError;
    }
  } catch (error) {
    logAppointmentError(`Error updating appointment ${id}:`, error);
    throw error;
  }
}

// Delete an appointment
export async function deleteAppointment(id: string): Promise<void> {
  try {
    logAppointment(`Deleting appointment with ID: ${id}`);
    
    // Check if Firebase is properly initialized
    if (!isFirebaseInitialized()) {
      logAppointmentWarning("Firebase not initialized, mock delete only");
      return;
    }
    
    try {
      const docRef = doc(clientDb, COLLECTION_NAME, id);
      await deleteDoc(docRef);
      logAppointment(`Appointment deleted successfully: ${id}`);
    } catch (deleteError) {
      logAppointmentError(`Error deleting appointment ${id}:`, deleteError);
      throw deleteError;
    }
  } catch (error) {
    logAppointmentError(`Error deleting appointment ${id}:`, error);
    throw error;
  }
} 