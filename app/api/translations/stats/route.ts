import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Define the root directory for translation files
const TRANSLATIONS_DIR = join(process.cwd(), 'public/locales');

// GET /api/translations/stats - Get statistics about translations
export async function GET() {
  try {
    // Read translations for both languages
    const enFilePath = join(TRANSLATIONS_DIR, 'en', 'common.json');
    const esFilePath = join(TRANSLATIONS_DIR, 'es', 'common.json');
    
    const enTranslationsJson = await readFile(enFilePath, 'utf-8');
    const esTranslationsJson = await readFile(esFilePath, 'utf-8');
    
    const enTranslations = JSON.parse(enTranslationsJson);
    const esTranslations = JSON.parse(esTranslationsJson);
    
    // Count total keys in each language
    const enKeyCount = countKeys(enTranslations);
    const esKeyCount = countKeys(esTranslations);
    
    // Calculate missing translations
    const missingKeys = findMissingTranslations(enTranslations, esTranslations);
    
    return NextResponse.json({
      enKeyCount,
      esKeyCount,
      completeness: (esKeyCount / enKeyCount * 100).toFixed(2) + '%',
      missingCount: missingKeys.length,
      missingKeys
    });
  } catch (error) {
    console.error('Error getting translation stats:', error);
    return NextResponse.json({ message: 'Failed to get translation stats' }, { status: 500 });
  }
}

// Helper function to count total keys in a nested object
function countKeys(obj: Record<string, any>, prefix = ''): number {
  let count = 0;
  
  for (const [key, value] of Object.entries(obj)) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Recursively count keys in nested objects
      count += countKeys(value, currentKey);
    } else {
      // Count leaf nodes (actual translations)
      count++;
    }
  }
  
  return count;
}

// Helper function to find missing translations
function findMissingTranslations(enObj: Record<string, any>, esObj: Record<string, any>, path = ''): string[] {
  let missing: string[] = [];
  
  for (const [key, value] of Object.entries(enObj)) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (typeof value === 'object' && value !== null) {
      // Check nested objects
      const nestedMissing = findMissingTranslations(
        value,
        esObj[key] && typeof esObj[key] === 'object' ? esObj[key] : {},
        currentPath
      );
      missing = [...missing, ...nestedMissing];
    } else if (typeof value === 'string') {
      // Check if the key exists in the Spanish translations
      const keyExists = getNestedValue(esObj, currentPath) !== undefined;
      if (!keyExists) {
        missing.push(currentPath);
      }
    }
  }
  
  return missing;
}

// Helper function to get a nested value from an object using a path string
function getNestedValue(obj: Record<string, any>, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
} 