import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { initializeFirebaseAdmin, adminInitialized } from './firebase-admin';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function authenticateAdmin(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  
  if (!token) {
    return {
      authenticated: false,
      message: 'No authentication token'
    };
  }
  
  try {
    // Verify the token
    const decoded = verify(token, JWT_SECRET) as {
      username: string;
      role: string;
    };
    
    if (decoded.role !== 'admin') {
      return {
        authenticated: false,
        message: 'Insufficient permissions'
      };
    }
    
    return {
      authenticated: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    };
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      authenticated: false,
      message: 'Invalid authentication token'
    };
  }
}

// For App Router Route Handlers
export async function checkAdminAuth(): Promise<boolean> {
  console.log('[Auth] Starting admin auth check');
  try {
    // For development environment, always return true to make testing easier
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Development environment detected, bypassing strict auth check');
      return true;
    }
    
    // Try to initialize Firebase Admin if not already initialized
    if (!adminInitialized) {
      console.log('[Auth] Firebase Admin not initialized, attempting to initialize');
      const initialized = initializeFirebaseAdmin();
      if (!initialized) {
        console.error('[Auth] Failed to initialize Firebase Admin');
        return false;
      }
    }
    
    // Get the auth cookie
    const session = cookies().get('session')?.value;
    console.log('[Auth] Session cookie present:', !!session);
    
    if (!session) {
      console.warn('[Auth] No session cookie found');
      // Return false for production, but true for development
      return false;
    }
    
    // In production, we would verify the token with Firebase Auth
    console.error('[Auth] Firebase Admin Auth verification not properly implemented');
    return false;
  } catch (error) {
    console.error('[Auth] Error checking admin auth:', error);
    return false;
  }
}

// Middleware for API routes
export async function withAdminAuth(request: NextRequest, handler: Function) {
  const auth = authenticateAdmin(request);
  
  if (!auth.authenticated) {
    return NextResponse.json(
      { success: false, message: auth.message },
      { status: 401 }
    );
  }
  
  return handler(request, auth.user);
} 