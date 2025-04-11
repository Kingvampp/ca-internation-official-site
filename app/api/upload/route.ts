import { NextRequest, NextResponse } from 'next/server';
import { uploadImage, uploadMultipleImages } from '../../../utils/firebase';
import { authenticateAdmin } from '../../../utils/authMiddleware';

// Upload single image
export async function POST(request: NextRequest) {
  // Authenticate admin
  const auth = authenticateAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.message },
      { status: 401 }
    );
  }
  
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Get the image buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Upload to Firebase Storage
    const folder = formData.get('folder') as string || 'gallery';
    const imageUrl = await uploadImage(buffer, image.name, folder);
    
    return NextResponse.json(
      { url: imageUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// Upload multiple images
export async function PUT(request: NextRequest) {
  // Authenticate admin
  const auth = authenticateAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.message },
      { status: 401 }
    );
  }
  
  try {
    const formData = await request.formData();
    const images = formData.getAll('images') as File[];
    
    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }
    
    // Process all images
    const folder = formData.get('folder') as string || 'gallery';
    const imageBuffers = await Promise.all(
      images.map(async (image) => {
        const bytes = await image.arrayBuffer();
        return {
          buffer: Buffer.from(bytes),
          filename: image.name
        };
      })
    );
    
    // Upload all images
    const imageUrls = await uploadMultipleImages(imageBuffers, folder);
    
    return NextResponse.json(
      { urls: imageUrls },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    );
  }
} 