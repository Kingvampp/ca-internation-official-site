# Multi-Admin Authentication System Setup

This guide provides instructions for setting up the multi-admin authentication system for CA Automotive.

## Features Implemented

- Role-based authentication (Admin and Owner roles)
- Protected admin routes with middleware
- User management for owner role
- Secure login with Firebase Authentication
- Persistent sessions with NextAuth.js

## Setup Instructions

### 1. Firebase Project Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore in your project
3. In Authentication, enable Email/Password provider
4. Create a web app in your Firebase project to get configuration keys

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=97c4bd0b7f2da92313168b4fd2910025682142ede89811a4bc4ffdf31b33a698

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAMPFwwRSex9QWvcOAgngb0QKHvZBp7nzM
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ca-international-automotive.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ca-international-automotive
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ca-international-automotive.firestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=442540699125
NEXT_PUBLIC_FIREBASE_APP_ID=1:442540699125:web:bf3fd7b807061afca804bc
```

### 3. Creating the Initial Admin User

Since the authentication system requires an existing admin user to log in, you need to create the first user manually:

1. Use the Firebase Authentication console to create a user with email and password
2. In Firestore, create a collection called `users`
3. Add a document with the ID matching the user's UID from Firebase Authentication
4. Add the following fields to the document:
   - `email`: the user's email
   - `name`: the user's name
   - `role`: "owner" (for the first user)
   - `createdAt`: current timestamp

### 4. Accessing the Admin Dashboard

1. Start the development server with `npm run dev`
2. Navigate to http://localhost:3000/admin/login
3. Log in with the credentials you created
4. You'll be redirected to the admin dashboard

## Routes Structure

- `/admin/login` - Login page
- `/admin/error` - Authentication error page
- `/admin-dashboard` - Main dashboard (requires authentication)
- `/admin-dashboard/user-management` - User management (requires owner role)
- `/admin-dashboard/gallery` - Gallery management
- `/admin-dashboard/gallery-settings` - Gallery configuration

## Security Features

- JWT-based authentication
- Role-based access control
- Secure password storage (handled by Firebase)
- Protected API routes
- Session timeout after 30 days

## Troubleshooting

- If you experience authentication issues, check the browser console for error messages
- Ensure your Firebase configuration is correct
- Verify that the user document exists in Firestore with the correct role
- Check that environment variables are properly set

## Further Improvements

- Add password reset functionality
- Implement email verification
- Add 2FA (Two-Factor Authentication)
- Create more granular permissions within roles 