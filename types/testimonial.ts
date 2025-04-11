import { Timestamp } from 'firebase/firestore';

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
  date: Date | Timestamp; // Allow both Date (client) and Timestamp (server)
  adminNotes?: string;
  updatedAt?: Date | Timestamp; // Allow both Date (client) and Timestamp (server)
} 