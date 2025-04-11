import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Clone the request headers
  const requestHeaders = new Headers(request.headers);
  
  // Set a custom header with the pathname
  requestHeaders.set('x-pathname', request.nextUrl.pathname);
  
  // Return the response with the modified headers
  return NextResponse.next({
    request: {
      // Apply the modified headers
      headers: requestHeaders,
    },
  });
}

export const config = {
  // Match all request paths
  matcher: ['/((?!api|_next|fonts|images|favicons|.*\\..*).*)'],
}; 