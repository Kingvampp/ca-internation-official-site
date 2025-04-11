import { Timestamp } from 'firebase/firestore';

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