// Import Jest DOM utilities
import '@testing-library/jest-dom';

// Workaround for Next.js environment
global.process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
global.process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-auth-domain';
global.process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
global.process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-storage-bucket';
global.process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender-id';
global.process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock localStorage
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  clear() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }
}

global.localStorage = new LocalStorageMock();

// Mock window.location for the navigation changes
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/',
  },
  writable: true,
}); 