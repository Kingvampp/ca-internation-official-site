# Firebase Setup and Migration from Mock Data

This document explains how to transition from using mock data to using real live data stored in Firebase.

## Prerequisites

1. **Firebase Account**: Create a Firebase account at [firebase.google.com](https://firebase.google.com)
2. **Firebase Project**: Create a new Firebase project in the Firebase Console
3. **Firestore Database**: Set up a Firestore database in your Firebase project
4. **Firebase Storage**: Enable Firebase Storage in your project

## Setting Up Firebase Configuration

1. **Get Firebase Config**:
   - Go to your Firebase project settings
   - Scroll down to "Your apps" section and select your web app (or create one)
   - Copy the Firebase configuration object

2. **Environment Variables**:
   - Create or edit your `.env.local` file in the root of your project
   - Add the following environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Initializing Firebase with Mock Data

We've created a script that will initialize your Firebase database with the mock data used in the application. This provides a starting point for your live data.

1. **Run the Initialization Script**:
   ```bash
   node scripts/init-firebase-with-mock-data.js
   ```

   This script will:
   - Check if your Firebase configuration is correct
   - Verify if collections already exist in your Firestore database
   - Ask for confirmation before clearing existing data (if any)
   - Create the following collections with mock data:
     - `galleryItems`: Gallery items for the portfolio
     - `appointments`: Customer appointments
     - `content`: Website content sections

2. **Verify Data in Firebase Console**:
   - Go to Firestore Database in your Firebase Console
   - Check that the collections and documents have been created

## Understanding Service Structure

We've designed our services to work with both Firebase and mock data:

1. **Gallery Service** (`utils/galleryService.ts`):
   - Handles gallery items (portfolio)
   - Falls back to mock data when Firebase is unavailable

2. **Appointment Service** (`utils/appointmentService.ts`):
   - Manages customer appointments
   - Falls back to mock data when Firebase is unavailable

3. **Content Service** (`utils/contentService.ts`):
   - Manages website content (homepage, about, services, etc.)
   - Falls back to mock data when Firebase is unavailable

## Adding Real Data

Once your Firebase collections are initialized, you can add real data in several ways:

1. **Through the Admin Dashboard**:
   - Use the admin dashboard in the application to add, edit, and delete items
   - Gallery management: `/admin-dashboard/gallery`
   - Appointments management: `/admin-dashboard/appointments`
   - Content management: `/admin-dashboard/content`

2. **Directly in Firebase Console**:
   - Use the Firestore Database UI to manually add or edit documents
   - Follow the structure of the existing mock data

3. **Using Firebase Import/Export**:
   - Export data from another source in JSON format
   - Use Firebase Admin SDK to import it (requires custom script)

## Firebase Security Rules

For production use, you should set up proper security rules for your Firestore database and Storage. Here's a basic starting point:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Gallery items readable by anyone, writable only by admin
    match /galleryItems/{itemId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Appointments only accessible by admin
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Content readable by anyone, writable only by admin
    match /content/{contentId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

To update your security rules:
1. Go to Firestore Database in your Firebase Console
2. Click on the "Rules" tab
3. Replace the default rules with the ones above (or customize as needed)
4. Click "Publish"

## Handling Firebase Authentication

For admin-specific functionality, you should implement Firebase Authentication:

1. **Enable Authentication**:
   - Go to Authentication in your Firebase Console
   - Enable the authentication methods you want to use (Email/Password is recommended for admin)

2. **Create Admin User**:
   - Create a user that will have admin privileges
   - Use custom claims to mark them as admin (requires Firebase Admin SDK)

3. **Update the Admin Dashboard**:
   - Implement login functionality before accessing admin features
   - Verify admin token before allowing access to admin pages

## Troubleshooting

If you're having issues with Firebase:

1. **Check Console Logs**:
   - Our services include detailed logging that can help diagnose issues
   - Check for errors about Firebase initialization or operations

2. **Verify Environment Variables**:
   - Make sure all Firebase config variables are correctly set in `.env.local`

3. **Test Firebase Connection**:
   - Use the test function in `utils/test-firebase.js`:
     ```javascript
     import { testFirebaseConnection } from '@/utils/test-firebase';
     
     // In an async function
     const result = await testFirebaseConnection();
     console.log(result);
     ```

4. **Mock Data Fallback**:
   - If Firebase connection fails, the app will automatically use mock data
   - There will be a warning banner indicating you're using mock data 