import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '../../../../utils/authMiddleware';

// GET /api/auth/check - Check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    const auth = authenticateAdmin(request);
    
    if (!auth.authenticated) {
      return NextResponse.json(
        { authenticated: false, message: auth.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { authenticated: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { authenticated: false, message: 'Authentication check failed' },
      { status: 500 }
    );
  }
} 