import { NextResponse } from 'next/server';

// Simple admin password validation
export async function POST(request) {
  try {
    // Clone the request to avoid disturbing or locking the body
    const reqClone = request.clone();
    const { password } = await reqClone.json();
    
    // Check against the admin password defined in .env.local
    // Default to a fallback password for development
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '83742';
    
    console.log('Checking password (API route)');
    
    if (password === correctPassword) {
      // Return success with a redirect URL
      return NextResponse.json({ 
        success: true, 
        redirectUrl: '/admin-dashboard' 
      });
    } else {
      // Return error for incorrect password
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Admin access error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
} 