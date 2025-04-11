import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// POST /api/appointments - Create a new appointment
export async function POST(request) {
  try {
    const data = await request.json();
    console.log('Received appointment data:', {
      ...data,
      email: data.email ? '***@***' : undefined, // Hide email for privacy in logs
      phone: data.phone ? '***-***-****' : undefined, // Hide phone for privacy in logs
    });
    
    // Basic validation
    const requiredFields = ['customerName', 'email', 'phone', 'service', 'vehicle', 'date', 'time'];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Missing required field in appointment submission: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Ensure date is properly formatted
    let formattedDate;
    try {
      if (typeof data.date === 'string') {
        // Convert string date to Date object for Firestore
        formattedDate = new Date(data.date);
        if (isNaN(formattedDate.getTime())) {
          throw new Error('Invalid date format');
        }
      } else {
        formattedDate = data.date;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return NextResponse.json(
        { error: 'Invalid date format. Please use YYYY-MM-DD format.' },
        { status: 400 }
      );
    }
    
    // Format data for storing
    const appointmentData = {
      ...data,
      date: formattedDate,
      status: 'pending', // All new appointments start as pending
      createdAt: serverTimestamp(),
    };
    
    console.log('Attempting to store appointment in Firestore...');
    
    // Store in Firestore
    try {
      const appointmentsCollection = collection(db, 'appointments');
      const docRef = await addDoc(appointmentsCollection, appointmentData);
      
      console.log('Appointment created successfully:', docRef.id);
      
      return NextResponse.json({ 
        success: true,
        message: 'Appointment created successfully',
        appointmentId: docRef.id
      }, { status: 201 });
    } catch (firestoreError) {
      // Handle Firestore-specific errors
      console.error('Firestore error creating appointment:', firestoreError);
      
      let errorMessage = 'Failed to create appointment. Please try again later.';
      
      // Check for specific Firebase error codes
      if (firestoreError.code === 'permission-denied') {
        errorMessage = 'Permission denied. The database is not configured correctly. Please contact support.';
      } else if (firestoreError.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again later.';
      }
      
      return NextResponse.json(
        { error: errorMessage, code: firestoreError.code || 'unknown_error' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to process appointment request. Please try again.' },
      { status: 500 }
    );
  }
}

// GET /api/appointments - Get all appointments (admin only)
export async function GET(request) {
  try {
    // Check if user is authenticated (this would normally be done with middleware)
    const isAuthenticated = request.cookies.get('adminAuthenticated')?.value === 'true' ||
                           request.headers.get('x-admin-authenticated') === 'true';
    
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // In a real implementation, you would query Firestore here
    // For now, return a success message
    return NextResponse.json(
      { message: 'Authentication required. Please use the admin dashboard to view appointments.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
} 