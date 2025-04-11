import { NextRequest, NextResponse } from 'next/server';
import { submitBooking, getAllBookingsAdmin, getBookingByIdAdmin, updateBookingStatusAdmin, deleteBookingAdmin } from '@/utils/bookingService';
import { checkAdminAuth } from '@/utils/authMiddleware';

// Consistent logging for the booking API
const logApi = (message: string) => console.log(`[API:booking] ${message}`);
const logApiWarning = (message: string) => console.warn(`[API:booking] ⚠️ ${message}`);
const logApiError = (message: string) => console.error(`[API:booking] 🔴 ${message}`);
const logApiSuccess = (message: string) => console.log(`[API:booking] ✅ ${message}`);

// Handle POST request to create a new booking
export async function POST(request: NextRequest) {
  try {
    logApi('Received POST request for new booking');
    
    const bookingData = await request.json();
    logApi(`Received booking data for: ${bookingData.customerName}, service: ${bookingData.service}`);
    
    // Basic validation
    if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.customerPhone) {
      logApiWarning('Validation failed: Missing required fields');
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Convert date strings to Date objects
    if (bookingData.preferredDate) {
      bookingData.preferredDate = new Date(bookingData.preferredDate);
      logApi(`Parsed preferredDate: ${bookingData.preferredDate}`);
    } else {
      logApiWarning('No preferred date provided');
      return NextResponse.json(
        { success: false, error: 'Preferred date is required' },
        { status: 400 }
      );
    }
    
    if (bookingData.alternateDate) {
      bookingData.alternateDate = new Date(bookingData.alternateDate);
      logApi(`Parsed alternateDate: ${bookingData.alternateDate}`);
    }
    
    // Get locale from headers if available
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const locale = acceptLanguage.split(',')[0].split('-')[0]; // Extract primary language
      logApi(`Detected locale from headers: ${locale}`);
      bookingData.locale = locale;
    }
    
    logApi('Submitting booking to service layer');
    const result = await submitBooking(bookingData);
    
    if (result.success) {
      logApiSuccess(`Successfully created booking with ID: ${result.id}`);
      return NextResponse.json({ success: true, id: result.id });
    } else {
      logApiError(`Failed to create booking: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to create booking' },
        { status: 500 }
      );
    }
  } catch (error) {
    logApiError(`Unhandled error in POST: ${error.message}`);
    console.error(error.stack); // Full stack trace for debugging
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// Handle GET request to fetch all bookings (admin only)
export async function GET(request: NextRequest) {
  try {
    logApi('Received GET request for bookings');
    
    // Check admin authentication
    logApi('Verifying admin authentication');
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      logApiWarning('Unauthorized access attempt to bookings data');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get ID from query parameters for a single booking
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (id) {
      logApi(`Fetching single booking with ID: ${id}`);
      // Fetch a single booking by ID
      const booking = await getBookingByIdAdmin(id);
      
      if (booking) {
        logApiSuccess(`Retrieved booking for ${booking.customerName}, service: ${booking.service}`);
        return NextResponse.json(booking);
      } else {
        logApiWarning(`Booking not found with ID: ${id}`);
        return NextResponse.json(
          { success: false, error: 'Booking not found' },
          { status: 404 }
        );
      }
    }
    
    logApi('Fetching all bookings');
    // Fetch all bookings
    const bookings = await getAllBookingsAdmin();
    logApiSuccess(`Retrieved ${bookings.length} bookings`);
    return NextResponse.json(bookings);
  } catch (error) {
    logApiError(`Unhandled error in GET: ${error.message}`);
    console.error(error.stack); // Full stack trace for debugging
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// Handle PUT request to update a booking status (admin only)
export async function PUT(request: NextRequest) {
  try {
    logApi('Received PUT request to update booking');
    
    // Check admin authentication
    logApi('Verifying admin authentication');
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      logApiWarning('Unauthorized access attempt to update booking');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const data = await request.json();
    const { id, status, adminNotes } = data;
    
    logApi(`Request to update booking ${id} to status "${status}" with ${adminNotes ? 'admin notes' : 'no admin notes'}`);
    
    if (!id || !status) {
      logApiWarning('Missing booking ID or status in update request');
      return NextResponse.json(
        { success: false, error: 'Missing booking ID or status' },
        { status: 400 }
      );
    }
    
    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      logApiWarning(`Invalid status value: ${status}`);
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }
    
    logApi(`Updating booking ${id} status to ${status}`);
    const result = await updateBookingStatusAdmin(id, status, adminNotes);
    
    if (result.success) {
      logApiSuccess(`Successfully updated booking ${id} to status: ${status}`);
      return NextResponse.json({ success: true, id: id });
    } else {
      logApiError(`Failed to update booking ${id}: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to update booking' },
        { status: 500 }
      );
    }
  } catch (error) {
    logApiError(`Unhandled error in PUT: ${error.message}`);
    console.error(error.stack); // Full stack trace for debugging
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a booking (admin only)
export async function DELETE(request: NextRequest) {
  try {
    logApi('Received DELETE request for booking');
    
    // Check admin authentication
    logApi('Verifying admin authentication');
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      logApiWarning('Unauthorized access attempt to delete booking');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get ID from query parameters
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      logApiWarning('Missing booking ID in delete request');
      return NextResponse.json(
        { success: false, error: 'Missing booking ID' },
        { status: 400 }
      );
    }
    
    logApi(`Deleting booking with ID: ${id}`);
    const result = await deleteBookingAdmin(id);
    
    if (result.success) {
      logApiSuccess(`Successfully deleted booking ${id}`);
      return NextResponse.json({ success: true });
    } else {
      logApiError(`Failed to delete booking ${id}: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to delete booking' },
        { status: 500 }
      );
    }
  } catch (error) {
    logApiError(`Unhandled error in DELETE: ${error.message}`);
    console.error(error.stack); // Full stack trace for debugging
    return NextResponse.json(
      { success: false, error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
} 