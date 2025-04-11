import { NextRequest, NextResponse } from 'next/server';
import { 
  submitTestimonial,
  getAllTestimonialsAdmin, 
  updateTestimonialStatusAdmin,
  deleteTestimonialAdmin,
  getApprovedTestimonials
} from '@/utils/testimonialService';
import { checkAdminAuth } from '@/utils/authMiddleware';

// Helper for consistent API responses
const createResponse = (success: boolean, data: any = null, error: string | null = null, status = 200) => {
  return NextResponse.json(
    { success, data, error },
    { status }
  );
};

// Handle GET request - fetch testimonials based on query params
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const adminMode = url.searchParams.get('admin') === 'true';
    const status = url.searchParams.get('status') as 'pending' | 'approved' | 'rejected' | null;
    
    // Admin mode requires auth
    if (adminMode) {
      const isAdmin = await checkAdminAuth();
      
      if (!isAdmin) {
        return createResponse(false, null, 'Unauthorized access', 401);
      }
      
      try {
        const testimonials = await getAllTestimonialsAdmin();
        return createResponse(true, testimonials);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('[API] Admin testimonials fetch error:', errorMsg);
        
        // Check if it's a Firestore index error
        if (errorMsg.includes('requires an index') || errorMsg.includes('failed-precondition')) {
          return createResponse(
            false, 
            null, 
            `Firebase index required. Please create a composite index for the testimonials collection with fields: status (Ascending), date (Descending)`, 
            400
          );
        }
        
        return createResponse(false, null, 'Failed to fetch testimonials', 500);
      }
    }
    
    // Public endpoint for approved testimonials
    try {
      const testimonials = await getApprovedTestimonials();
      return createResponse(true, testimonials);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[API] Public testimonials fetch error:', errorMsg);
      
      // Check if it's a Firestore index error
      if (errorMsg.includes('requires an index') || errorMsg.includes('failed-precondition')) {
        return createResponse(
          false, 
          null, 
          `Firebase index required. Please create a composite index for the testimonials collection with fields: status (Ascending), date (Descending)`, 
          400
        );
      }
      
      return createResponse(false, null, 'Failed to fetch testimonials', 500);
    }
  } catch (error) {
    console.error('[API] Testimonials GET error:', error);
    return createResponse(false, null, 'Failed to fetch testimonials', 500);
  }
}

// Handle POST request - submit a new testimonial
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Basic validation
    if (!data.name || !data.message || !data.rating) {
      return createResponse(false, null, 'Missing required fields', 400);
    }
    
    // Validate rating
    const rating = Number(data.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      return createResponse(false, null, 'Rating must be between 1 and 5', 400);
    }
    
    // Submit testimonial
    const result = await submitTestimonial({
      name: data.name,
      email: data.email,
      rating,
      message: data.message,
      service: data.service,
      car: data.car
    });
    
    if (result.success) {
      return createResponse(true, { id: result.id });
    } else {
      return createResponse(false, null, result.error || 'Failed to submit testimonial', 500);
    }
  } catch (error) {
    console.error('[API] Testimonials POST error:', error);
    return createResponse(false, null, 'Failed to submit testimonial', 500);
  }
}

// Handle PUT request - update testimonial status (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify admin status
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return createResponse(false, null, 'Unauthorized access', 401);
    }
    
    const data = await request.json();
    
    // Validate input
    if (!data.id || !data.status) {
      return createResponse(false, null, 'Missing required fields (id, status)', 400);
    }
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(data.status)) {
      return createResponse(false, null, 'Invalid status value', 400);
    }
    
    // Update testimonial
    const result = await updateTestimonialStatusAdmin(
      data.id, 
      data.status, 
      data.adminNotes
    );
    
    if (result.success) {
      return createResponse(true);
    } else {
      return createResponse(false, null, result.error || 'Failed to update testimonial', 500);
    }
  } catch (error) {
    console.error('[API] Testimonials PUT error:', error);
    return createResponse(false, null, 'Failed to update testimonial', 500);
  }
}

// Handle DELETE request - delete a testimonial (admin only)
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin status
    const isAdmin = await checkAdminAuth();
    
    if (!isAdmin) {
      return createResponse(false, null, 'Unauthorized access', 401);
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return createResponse(false, null, 'Missing testimonial ID', 400);
    }
    
    const result = await deleteTestimonialAdmin(id);
    
    if (result.success) {
      return createResponse(true);
    } else {
      return createResponse(false, null, result.error || 'Failed to delete testimonial', 500);
    }
  } catch (error) {
    console.error('[API] Testimonials DELETE error:', error);
    return createResponse(false, null, 'Failed to delete testimonial', 500);
  }
} 