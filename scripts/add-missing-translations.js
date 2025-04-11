#!/usr/bin/env node

/**
 * CA Automotive Website - Add Missing Translations Script
 * -----------------------------------------------------
 * This script helps identify and add missing translations to the Spanish translation file.
 * It compares the English translations with the Spanish ones and generates a template for missing keys.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = 'public/locales';
const BASE_LANG = 'en';
const TARGET_LANG = 'es';
const OUTPUT_FILE = 'missing-translations-template.json';

console.log('🔍 Analyzing translation files...');

// Ensure locales directory exists
if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`❌ Error: Locales directory not found: ${LOCALES_DIR}`);
  process.exit(1);
}

// Check if the target language directory exists
const targetDir = path.join(LOCALES_DIR, TARGET_LANG);
if (!fs.existsSync(targetDir)) {
  console.error(`❌ Error: Target language directory not found: ${targetDir}`);
  process.exit(1);
}

// Load translation files
const baseTranslations = {};
const targetTranslations = {};

// Load base language translations
const baseLangDir = path.join(LOCALES_DIR, BASE_LANG);
if (!fs.existsSync(baseLangDir)) {
  console.error(`❌ Error: Base language directory not found: ${baseLangDir}`);
  process.exit(1);
}

// Load all translation files for the base language
const baseFiles = fs.readdirSync(baseLangDir).filter(file => file.endsWith('.json'));
console.log(`✅ Found ${baseFiles.length} translation files for ${BASE_LANG}`);

for (const file of baseFiles) {
  const filePath = path.join(baseLangDir, file);
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const namespace = file.replace('.json', '');
    baseTranslations[namespace] = content;
  } catch (error) {
    console.error(`❌ Error loading ${filePath}: ${error.message}`);
  }
}

// Load target language translations
const targetFiles = fs.readdirSync(targetDir).filter(file => file.endsWith('.json'));
console.log(`✅ Found ${targetFiles.length} translation files for ${TARGET_LANG}`);

for (const file of targetFiles) {
  const filePath = path.join(targetDir, file);
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const namespace = file.replace('.json', '');
    targetTranslations[namespace] = content;
  } catch (error) {
    console.error(`❌ Error loading ${filePath}: ${error.message}`);
  }
}

// Flatten nested objects for easier comparison
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      Object.assign(acc, flattenObject(obj[key], `${pre}${key}`));
    } else {
      acc[`${pre}${key}`] = obj[key];
    }
    return acc;
  }, {});
}

// Unflatten object (reverse operation)
function unflattenObject(obj) {
  const result = {};
  
  for (const flatKey in obj) {
    const keys = flatKey.split('.');
    let current = result;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = obj[flatKey];
  }
  
  return result;
}

// Flatten all translations
const flattenedBase = {};
for (const namespace in baseTranslations) {
  const flattened = flattenObject(baseTranslations[namespace]);
  
  // Add namespace prefix to keys
  Object.keys(flattened).forEach(key => {
    const prefixedKey = namespace === 'common' ? key : `${namespace}.${key}`;
    flattenedBase[prefixedKey] = flattened[key];
  });
}

const flattenedTarget = {};
for (const namespace in targetTranslations) {
  const flattened = flattenObject(targetTranslations[namespace]);
  
  // Add namespace prefix to keys
  Object.keys(flattened).forEach(key => {
    const prefixedKey = namespace === 'common' ? key : `${namespace}.${key}`;
    flattenedTarget[prefixedKey] = flattened[key];
  });
}

// Find missing translations
const missingKeys = [];
for (const key in flattenedBase) {
  if (!flattenedTarget[key]) {
    missingKeys.push(key);
  }
}

console.log(`Found ${missingKeys.length} missing translations in ${TARGET_LANG}`);

// Create a template for the missing translations
const template = {};
for (const key of missingKeys) {
  template[key] = flattenedBase[key] + ' [TRANSLATE]';
}

// Group by namespace
const groupedTemplate = {};
for (const key in template) {
  const parts = key.split('.');
  let namespace = 'common';
  let realKey = key;
  
  // Check if the key has a namespace prefix
  if (parts.length > 1 && parts[0] !== 'common' && baseTranslations[parts[0]]) {
    namespace = parts[0];
    realKey = parts.slice(1).join('.');
  }
  
  if (!groupedTemplate[namespace]) {
    groupedTemplate[namespace] = {};
  }
  
  // Create nested structure
  const keyParts = realKey.split('.');
  let current = groupedTemplate[namespace];
  
  for (let i = 0; i < keyParts.length - 1; i++) {
    const part = keyParts[i];
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[keyParts[keyParts.length - 1]] = template[key];
}

// Generate template file
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(groupedTemplate, null, 2));
console.log(`✅ Template saved to ${OUTPUT_FILE}`);

// Create update files for each namespace
for (const namespace in groupedTemplate) {
  const targetFile = path.join(targetDir, `${namespace}.json`);
  
  if (fs.existsSync(targetFile)) {
    // Load the existing file
    const existingContent = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    
    // Deep merge the template with the existing content
    const merged = deepMerge(existingContent, groupedTemplate[namespace]);
    
    // Create a backup of the original file
    fs.copyFileSync(targetFile, `${targetFile}.bak`);
    
    // Write the updated file
    fs.writeFileSync(targetFile, JSON.stringify(merged, null, 2));
    console.log(`✅ Updated ${targetFile} (backup created at ${targetFile}.bak)`);
  } else {
    // Create a new file if it doesn't exist
    fs.writeFileSync(targetFile, JSON.stringify(groupedTemplate[namespace], null, 2));
    console.log(`✅ Created new file ${targetFile}`);
  }
}

// Deep merge two objects
function deepMerge(target, source) {
  const output = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(output[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  
  return output;
}

console.log('\n✅ Done! Missing translations have been added to the target language files.');
console.log('Look for the [TRANSLATE] marker to identify text that needs to be translated.');
console.log('You can also check the missing-translations-template.json file for a consolidated view.');

// Provide some usage guidance
console.log('\nRecommendations:');
console.log('1. Check the updated files in public/locales/es/');
console.log('2. Translate all strings marked with [TRANSLATE]');
console.log('3. Run the validation script again to verify the translations are now complete');
console.log('4. Check the TranslationMonitor in the browser to see the success rate improve'); 