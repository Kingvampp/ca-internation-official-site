#!/usr/bin/env node

/**
 * Update All Translations
 * 
 * This script analyzes components for hardcoded text, creates translation keys,
 * and updates translation files with extracted content.
 * 
 * It helps achieve 100% translation coverage across the application.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const COMPONENTS_DIR = path.join(process.cwd(), 'components');
const APP_DIR = path.join(process.cwd(), 'app');
const TRANSLATION_FILES = {
  en: path.join(process.cwd(), 'public/locales/en/common.json'),
  es: path.join(process.cwd(), 'public/locales/es/common.json')
};

// Load the machine translation module using dynamic import
async function importMachineTranslation() {
  try {
    const { translateText } = await import('../utils/machineTranslation.js');
    return { translateText };
  } catch (error) {
    console.error('Error importing machine translation module:', error);
    // Return a mock function if the module can't be loaded
    return {
      translateText: async (text) => {
        console.warn('Using mock translation for:', text);
        return text;
      }
    };
  }
}

// Statistics
const stats = {
  scannedFiles: 0,
  updatedFiles: 0,
  extractedTexts: 0,
  updatedTranslationKeys: 0
};

// Language contexts where hardcoded text might appear
const CONTEXTS = [
  'navigation',
  'hero',
  'services',
  'gallery',
  'about',
  'contact',
  'footer',
  'admin',
  'common',
  'testimonials',
  'beforeAfter',
  'featuredCars'
];

// Check if a file is a React component
function isReactComponent(filePath) {
  return (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) && 
         !filePath.includes('.d.ts') && 
         !filePath.includes('node_modules');
}

// Extract hardcoded strings from a component
function extractHardcodedStrings(content) {
  const hardcoded = [];
  
  // Check for text in JSX (between > and <)
  const jsxTextRegex = />([^><{]+)</g;
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1 && !/^\s*$/.test(text) && !/^[0-9.]+$/.test(text)) {
      hardcoded.push({
        type: 'jsx',
        text,
        original: match[0],
        index: match.index
      });
    }
  }
  
  // Check for hardcoded string props (like title="Some Title")
  const propRegex = /(\w+)="([^"]+)"/g;
  while ((match = propRegex.exec(content)) !== null) {
    const propName = match[1];
    const propValue = match[2];
    
    // Skip certain props that don't need translation
    if (['className', 'style', 'id', 'key', 'type', 'href', 'src', 'width', 'height', 'onClick', 'onChange', 'onSubmit', 'target', 'rel', 'role', 'placeholder'].includes(propName)) {
      continue;
    }
    
    if (propValue && propValue.length > 3 && /[a-zA-Z]{2,}/.test(propValue)) {
      hardcoded.push({
        type: 'prop',
        name: propName,
        text: propValue,
        original: match[0],
        index: match.index
      });
    }
  }
  
  return hardcoded;
}

// Determine the most appropriate context for a string based on its content and component path
function determineContext(text, componentPath) {
  const lowerText = text.toLowerCase();
  const lowerPath = componentPath.toLowerCase();
  
  // First check path-based context
  for (const context of CONTEXTS) {
    if (lowerPath.includes(`/${context}/`) || lowerPath.includes(`/${context}.`)) {
      return context;
    }
  }
  
  // Then check content-based context
  if (lowerPath.includes('navbar') || lowerPath.includes('navigation') || 
      lowerText.includes('home') || lowerText.includes('about') || 
      lowerText.includes('services') || lowerText.includes('contact')) {
    return 'navigation';
  }
  
  if (lowerPath.includes('hero')) {
    return 'hero';
  }
  
  if (lowerPath.includes('footer')) {
    return 'footer';
  }
  
  if (lowerPath.includes('gallery') || lowerText.includes('gallery')) {
    return 'gallery';
  }
  
  if (lowerPath.includes('service') || lowerText.includes('repair') || 
      lowerText.includes('restoration') || lowerText.includes('paint')) {
    return 'services';
  }
  
  if (lowerPath.includes('about')) {
    return 'about';
  }
  
  if (lowerPath.includes('contact') || lowerText.includes('contact') || 
      lowerText.includes('email') || lowerText.includes('phone')) {
    return 'contact';
  }
  
  if (lowerPath.includes('admin') || lowerText.includes('admin') || 
      lowerText.includes('dashboard') || lowerText.includes('login')) {
    return 'admin';
  }
  
  // Default to common if no specific context can be determined
  return 'common';
}

// Generate a unique key for a text string
function generateKey(text, context) {
  // Create a safe key based on the text
  const baseKey = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .substring(0, 20);
  
  return `${context}.${baseKey}`;
}

// Check if a key exists in translations
function keyExists(translations, key) {
  const parts = key.split('.');
  let current = translations;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }
  
  return true;
}

// Ensure a nested key path exists in an object
function ensureKeyPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    } else if (typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part];
  }
  
  return current;
}

// Load translation files
async function loadTranslations() {
  const translations = {};
  
  for (const [lang, filePath] of Object.entries(TRANSLATION_FILES)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`Error loading ${lang} translations:`, error.message);
      translations[lang] = {};
    }
  }
  
  return translations;
}

// Save translation files
async function saveTranslations(translations) {
  for (const [lang, filePath] of Object.entries(TRANSLATION_FILES)) {
    try {
      fs.writeFileSync(
        filePath,
        JSON.stringify(translations[lang], null, 2),
        'utf8'
      );
      console.log(`Saved ${lang} translations to ${filePath}`);
    } catch (error) {
      console.error(`Error saving ${lang} translations:`, error.message);
    }
  }
}

// Update a component file to use translations
async function updateComponentFile(filePath, translations, machineTranslation) {
  stats.scannedFiles++;
  
  try {
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the component is already using translations
    const usingTranslations = content.includes('import { useLanguage }') || 
                              content.includes('import {useLanguage}') || 
                              content.includes('useLanguage');
    
    // Extract hardcoded strings
    const hardcodedStrings = extractHardcodedStrings(content);
    
    if (hardcodedStrings.length === 0) {
      console.log(`No hardcoded strings found in ${filePath}`);
      return false;
    }
    
    console.log(`Found ${hardcodedStrings.length} hardcoded strings in ${filePath}`);
    stats.extractedTexts += hardcodedStrings.length;
    
    // Create a mapping of original strings to their translation keys
    const stringMappings = {};
    
    // Process each hardcoded string
    for (const hardcodedString of hardcodedStrings) {
      const context = determineContext(hardcodedString.text, filePath);
      const key = generateKey(hardcodedString.text, context);
      
      // Store mapping
      stringMappings[hardcodedString.text] = key;
      
      // Add to English translations if not exists
      if (!keyExists(translations.en, key)) {
        const keyParts = key.split('.');
        const lastPart = keyParts.pop();
        const parentObj = ensureKeyPath(translations.en, keyParts.join('.'));
        parentObj[lastPart] = hardcodedString.text;
        stats.updatedTranslationKeys++;
        
        // Add to Spanish translations with machine translation
        try {
          const esParentObj = ensureKeyPath(translations.es, keyParts.join('.'));
          const translatedText = await machineTranslation.translateText(
            hardcodedString.text,
            'en',
            'es'
          );
          esParentObj[lastPart] = translatedText;
        } catch (error) {
          console.error(`Error translating "${hardcodedString.text}":`, error.message);
          // Fallback to English if translation fails
          const esParentObj = ensureKeyPath(translations.es, keyParts.join('.'));
          esParentObj[lastPart] = hardcodedString.text;
        }
      }
    }
    
    // If the component isn't using translations yet, we need to add the import
    let updatedContent = content;
    if (!usingTranslations && Object.keys(stringMappings).length > 0) {
      // Add the import statement after the last import or at the top of the file
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const importEndIndex = content.indexOf('\n', lastImportIndex);
        if (importEndIndex !== -1) {
          updatedContent = 
            content.substring(0, importEndIndex + 1) +
            'import { useLanguage } from "../../utils/LanguageContext";\n' +
            content.substring(importEndIndex + 1);
        }
      }
      
      // Add the t function from useLanguage near the start of the component
      const componentStartIndex = updatedContent.indexOf('function') || updatedContent.indexOf('=>');
      if (componentStartIndex !== -1) {
        const functionBodyStart = updatedContent.indexOf('{', componentStartIndex);
        if (functionBodyStart !== -1) {
          updatedContent = 
            updatedContent.substring(0, functionBodyStart + 1) +
            '\n  const { t } = useLanguage();' +
            updatedContent.substring(functionBodyStart + 1);
        }
      }
    }
    
    // Replace hardcoded strings with translation calls
    if (usingTranslations || Object.keys(stringMappings).length > 0) {
      for (const [originalText, translationKey] of Object.entries(stringMappings)) {
        // Replace JSX text content
        const jsxRegex = new RegExp(`>(\\s*)${escapeRegExp(originalText)}(\\s*)<`, 'g');
        updatedContent = updatedContent.replace(jsxRegex, (match, before, after) => {
          return `>${before}{t('${translationKey}')}{after}<`;
        });
        
        // Replace prop values
        const propRegex = new RegExp(`([a-zA-Z0-9]+)="${escapeRegExp(originalText)}"`, 'g');
        updatedContent = updatedContent.replace(propRegex, (match, propName) => {
          return `${propName}={t('${translationKey}')}`;
        });
      }
    }
    
    // Only write the file if it changed
    if (updatedContent !== content) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated file: ${filePath}`);
      stats.updatedFiles++;
      return true;
    } else {
      console.log(`No changes needed for ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

// Escape special characters for use in a regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Scan a directory for components
async function scanDirectory(dir, translations, machineTranslation) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules
      if (file === 'node_modules') {
        continue;
      }
      await scanDirectory(filePath, translations, machineTranslation);
    } else if (isReactComponent(filePath)) {
      await updateComponentFile(filePath, translations, machineTranslation);
    }
  }
}

// Main function
async function main() {
  console.log('=== Starting Translation Update ===\n');
  
  // Load translations
  console.log('Loading translation files...');
  const translations = await loadTranslations();
  
  // Import machine translation
  console.log('Initializing machine translation...');
  const machineTranslation = await importMachineTranslation();
  
  // Scan directories
  console.log('\nScanning components directory...');
  await scanDirectory(COMPONENTS_DIR, translations, machineTranslation);
  
  console.log('\nScanning app directory...');
  await scanDirectory(APP_DIR, translations, machineTranslation);
  
  // Save updated translations
  console.log('\nSaving updated translation files...');
  await saveTranslations(translations);
  
  // Print statistics
  console.log('\n=== Translation Update Complete ===');
  console.log(`Scanned files: ${stats.scannedFiles}`);
  console.log(`Updated files: ${stats.updatedFiles}`);
  console.log(`Extracted texts: ${stats.extractedTexts}`);
  console.log(`Updated translation keys: ${stats.updatedTranslationKeys}`);
}

// Run the script
main().catch(error => {
  console.error('Error running translation update:', error);
  process.exit(1);
}); 