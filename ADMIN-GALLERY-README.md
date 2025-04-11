# Admin Gallery Management System

This comprehensive gallery management system allows administrators to create, edit, view, and delete gallery items with support for multiple images, categories, and tags.

## Features

- **Authentication Required**: All admin gallery management features require admin authentication
- **CRUD Operations**: Create, read, update, and delete gallery items
- **Multiple Image Support**: Each gallery item can have:
  - Main image (required)
  - Before images (optional)
  - After images (optional)
- **Categorization**: Assign categories and tags to gallery items for better organization
- **Firebase Integration**: Uses Firebase Firestore for database and Firebase Storage for image storage
- **Responsive Design**: Works well on desktop and mobile devices

## Technical Implementation

### Database Structure (Firestore)

Gallery items are stored in the `galleryItems` collection with the following structure:

```typescript
type GalleryItem = {
  id?: string;
  title: string;
  description: string;
  categories: string[];
  mainImage: string;
  beforeImages: string[];
  afterImages: string[];
  tags: string[];
  createdAt?: number;
  updatedAt?: number;
};
```

### Image Storage (Firebase Storage)

Images are stored in Firebase Storage with the following folder structure:
- `/gallery/main/` - Main images
- `/gallery/before/` - Before images
- `/gallery/after/` - After images

Each uploaded image filename includes a timestamp to ensure uniqueness.

### API Endpoints

#### Gallery Items

- `GET /api/gallery` - Retrieve all gallery items
- `POST /api/gallery` - Create a new gallery item (requires authentication)
- `GET /api/gallery/[id]` - Retrieve a specific gallery item
- `PUT /api/gallery/[id]` - Update a gallery item (requires authentication)
- `DELETE /api/gallery/[id]` - Delete a gallery item (requires authentication)

#### Image Upload

- `POST /api/upload` - Upload a single image (requires authentication)
- `PUT /api/upload` - Upload multiple images (requires authentication)

#### Authentication

- `GET /api/auth/check` - Check if the user is authenticated

## Frontend Components

### Admin Pages

- **Gallery List Page** (`/admin-dashboard/gallery`) - List of all gallery items with edit and delete options
- **Add New Item Page** (`/admin-dashboard/gallery/new`) - Form to create a new gallery item
- **Edit Item Page** (`/admin-dashboard/gallery/edit/[id]`) - Form to edit an existing gallery item

### Public Pages

- **Gallery Page** (`/gallery`) - Public page displaying all gallery items with category filters
- **Gallery Item Detail Page** (`/gallery/[id]`) - Public page showing detailed view of a gallery item

## Setup Requirements

To use this system, you need to set up:

1. **Firebase Admin SDK**:
   - Create a Firebase project
   - Generate service account credentials
   - Add the following environment variables:
     ```
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_CLIENT_EMAIL=your-client-email
     FIREBASE_PRIVATE_KEY=your-private-key
     FIREBASE_STORAGE_BUCKET=your-storage-bucket
     ```

2. **Firebase Client SDK**:
   - Add the following environment variables:
     ```
     NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
     NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
     ```

3. **Authentication**:
   - Set up the admin password using the environment variable:
     ```
     ADMIN_PASSWORD=your-secure-password
     ```
   - Set up JWT secret for token signing:
     ```
     JWT_SECRET=your-jwt-secret
     ```

## Usage Guide

### Adding a New Gallery Item

1. Log in to the admin dashboard
2. Navigate to Gallery Management
3. Click "Add New Item"
4. Fill in the required fields:
   - Title
   - Description
   - Categories (at least one)
   - Main Image (required)
   - Before Images (optional)
   - After Images (optional)
   - Tags (optional)
5. Click "Create Gallery Item"

### Editing a Gallery Item

1. Log in to the admin dashboard
2. Navigate to Gallery Management
3. Find the item you want to edit and click "Edit"
4. Update the fields as needed
5. Click "Save Changes"

### Deleting a Gallery Item

1. Log in to the admin dashboard
2. Navigate to Gallery Management
3. Find the item you want to delete and click "Delete"
4. Confirm the deletion

## Notes for Developers

- The system uses client-side form validation for basic checks
- Server-side validation is also implemented for security
- Images are uploaded to Firebase Storage first, then the URLs are stored in Firestore
- Gallery items are automatically assigned timestamp fields for `createdAt` and `updatedAt`
- The public gallery view supports filtering by categories
- The gallery detail view handles both before/after image displays
- Authentication is handled with JSON Web Tokens (JWT)

## Future Enhancements

Potential future improvements:
- Drag-and-drop reordering of gallery items
- Advanced image editing (cropping, resizing)
- Image optimization for better performance
- Multi-user support with role-based access control
- Analytics for tracking gallery item views

## Troubleshooting

If you encounter issues with the admin gallery system:

1. Check that your environment variables are properly set
2. Ensure you're using the correct admin credentials
3. Clear browser cookies if you're having authentication issues
4. Check the browser console for JavaScript errors

For further assistance, contact the development team. 