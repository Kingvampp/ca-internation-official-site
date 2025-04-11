import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { authenticateAdmin } from '../../../../utils/authMiddleware';
import { translateText } from '../../../../utils/machineTranslation';

// Translation file paths
const EN_TRANSLATION_FILE = path.join(process.cwd(), 'public/locales/en/common.json');
const ES_TRANSLATION_FILE = path.join(process.cwd(), 'public/locales/es/common.json');

// Types
type TranslationData = {
  galleryId: string;
  title?: string;
  description?: string;
  title_es?: string; // Optional Spanish translations
  description_es?: string;
};

/**
 * Updates translation files with gallery item translations
 * POST /api/translations/gallery
 */
export async function POST(request: NextRequest) {
  // Authenticate the request
  const auth = authenticateAdmin(request);
  if (!auth.authenticated) {
    return NextResponse.json(
      { error: auth.message },
      { status: 401 }
    );
  }

  try {
    // Parse request body
    const data: TranslationData = await request.json();
    
    // Validate required fields
    if (!data.galleryId) {
      return NextResponse.json(
        { error: 'Gallery item ID is required' },
        { status: 400 }
      );
    }
    
    // Load translation files
    let enTranslations;
    let esTranslations;
    
    try {
      enTranslations = JSON.parse(fs.readFileSync(EN_TRANSLATION_FILE, 'utf8'));
      esTranslations = JSON.parse(fs.readFileSync(ES_TRANSLATION_FILE, 'utf8'));
    } catch (error) {
      console.error('Error reading translation files:', error);
      return NextResponse.json(
        { error: 'Failed to read translation files' },
        { status: 500 }
      );
    }
    
    // Ensure gallery section exists in translations
    if (!enTranslations.gallery) enTranslations.gallery = {};
    if (!enTranslations.gallery.items) enTranslations.gallery.items = {};
    
    if (!esTranslations.gallery) esTranslations.gallery = {};
    if (!esTranslations.gallery.items) esTranslations.gallery.items = {};
    
    // Create item entry if it doesn't exist
    if (!enTranslations.gallery.items[data.galleryId]) {
      enTranslations.gallery.items[data.galleryId] = {};
    }
    
    if (!esTranslations.gallery.items[data.galleryId]) {
      esTranslations.gallery.items[data.galleryId] = {};
    }
    
    // Update English translations
    if (data.title) {
      enTranslations.gallery.items[data.galleryId].title = data.title;
    }
    
    if (data.description) {
      enTranslations.gallery.items[data.galleryId].description = data.description;
    }
    
    // Update Spanish translations
    if (data.title_es) {
      esTranslations.gallery.items[data.galleryId].title = data.title_es;
    } else if (data.title) {
      // Use machine translation if Spanish title not provided
      try {
        const translatedTitle = await translateText(data.title, 'en', 'es');
        esTranslations.gallery.items[data.galleryId].title = translatedTitle;
      } catch (error) {
        console.error('Error translating title:', error);
        esTranslations.gallery.items[data.galleryId].title = data.title;
      }
    }
    
    if (data.description_es) {
      esTranslations.gallery.items[data.galleryId].description = data.description_es;
    } else if (data.description) {
      // Use machine translation if Spanish description not provided
      try {
        const translatedDesc = await translateText(data.description, 'en', 'es');
        esTranslations.gallery.items[data.galleryId].description = translatedDesc;
      } catch (error) {
        console.error('Error translating description:', error);
        esTranslations.gallery.items[data.galleryId].description = data.description;
      }
    }
    
    // Save updated translation files
    try {
      fs.writeFileSync(
        EN_TRANSLATION_FILE,
        JSON.stringify(enTranslations, null, 2),
        'utf8'
      );
      
      fs.writeFileSync(
        ES_TRANSLATION_FILE,
        JSON.stringify(esTranslations, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error writing translation files:', error);
      return NextResponse.json(
        { error: 'Failed to update translation files' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Gallery translations updated successfully',
        keys: {
          title: `gallery.items.${data.galleryId}.title`,
          description: `gallery.items.${data.galleryId}.description`
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating gallery translations:', error);
    return NextResponse.json(
      { error: 'Failed to update gallery translations' },
      { status: 500 }
    );
  }
} 