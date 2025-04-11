/**
 * Admin Authentication Utility
 * 
 * This file provides functions to manage admin authentication
 * and debugging utilities to help diagnose authentication issues.
 */

// Function to set a cookie
function setCookie(name, value, days = 7) {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;`;
  console.log(`Cookie set: ${name}=${value}`);
}

// Function to delete a cookie
function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  console.log(`Cookie deleted: ${name}`);
}

// Check if user is authenticated as admin
export function isAdminAuthenticated() {
  // Use sessionStorage to check auth state
  if (typeof window !== 'undefined') {
    const authState = sessionStorage.getItem('adminAuthenticated');
    console.log('Admin auth state:', authState);
    return authState === 'true';
  }
  return false;
}

// Set admin authentication state
export function setAdminAuthenticated(isAuthenticated) {
  if (typeof window !== 'undefined') {
    if (isAuthenticated) {
      console.log('Setting admin as authenticated');
      // Store in both sessionStorage (for client) and cookie (for middleware)
      sessionStorage.setItem('adminAuthenticated', 'true');
      setCookie('admin-authenticated', 'true', 1); // Expires in 1 day
    } else {
      console.log('Removing admin authentication');
      sessionStorage.removeItem('adminAuthenticated');
      deleteCookie('admin-authenticated');
    }
  }
}

// Log authentication state for debugging
export function logAuthState() {
  if (typeof window !== 'undefined') {
    const authState = sessionStorage.getItem('adminAuthenticated');
    console.log('Current admin auth state:', authState);
    
    // Log all cookies
    console.log('All cookies:');
    document.cookie.split(';').forEach(cookie => {
      console.log(`- ${cookie.trim()}`);
    });
    
    return authState === 'true';
  }
  return false;
}

// Force authentication for testing
export function forceAuthentication() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('DEVELOPMENT MODE: Forcing admin authentication');
    sessionStorage.setItem('adminAuthenticated', 'true');
    setCookie('admin-authenticated', 'true', 1);
    return true;
  }
  return false;
}

// Clear authentication
export function clearAuthentication() {
  if (typeof window !== 'undefined') {
    console.log('Clearing admin authentication');
    sessionStorage.removeItem('adminAuthenticated');
    deleteCookie('admin-authenticated');
  }
}

export default {
  isAdminAuthenticated,
  setAdminAuthenticated,
  logAuthState,
  forceAuthentication,
  clearAuthentication
}; 