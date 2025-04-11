/**
 * Script to test translation functionality across the site
 * This script will scan components for proper translation usage and test translations
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

// Statistics
const stats = {
  componentsScanned: 0,
  componentsUsingTranslations: 0,
  translationKeysUsed: new Set(),
  translationKeysPresent: {
    en: new Set(),
    es: new Set()
  },
  missingTranslationKeys: {
    en: [],
    es: []
  },
  inconsistentTranslations: []
};

console.log('🌐 Testing translation functionality...');

// Load translation files
const translations = {
  en: JSON.parse(fs.readFileSync(TRANSLATION_FILES.en, 'utf8')),
  es: JSON.parse(fs.readFileSync(TRANSLATION_FILES.es, 'utf8'))
};

// Extract all keys from translation files
function extractKeys(obj, prefix = '') {
  Object.keys(obj).forEach(key => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      extractKeys(obj[key], fullKey);
    } else {
      stats.translationKeysPresent[currentLang].add(fullKey);
    }
  });
}

// Process translation files to extract all keys
['en', 'es'].forEach(lang => {
  currentLang = lang;
  extractKeys(translations[lang]);
  console.log(`Found ${stats.translationKeysPresent[lang].size} keys in ${lang} translation file`);
});

// Find all translation keys used in components
function findTranslationKeys(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  stats.componentsScanned++;

  // Check if component uses translations
  const usesTranslations = 
    content.includes('useLanguage') || 
    content.includes('useTranslation') || 
    content.includes('t(') ||
    content.includes('{t(');
    
  if (usesTranslations) {
    stats.componentsUsingTranslations++;
    
    // Extract translation keys
    const keyRegex = /t\(['"]([\w.-]+)['"]\)/g;
    let match;
    while (match = keyRegex.exec(content)) {
      stats.translationKeysUsed.add(match[1]);
    }
  }
  
  return usesTranslations;
}

// Recursively scan directories
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and hidden directories
      if (file !== 'node_modules' && !file.startsWith('.')) {
        scanDirectory(filePath);
      }
    } else if ((file.endsWith('.tsx') || file.endsWith('.jsx')) && 
               !file.includes('.d.ts') && 
               !file.includes('stories.')) {
      findTranslationKeys(filePath);
    }
  });
}

// Scan components and app directories
console.log('Scanning components directory...');
scanDirectory(COMPONENTS_DIR);

console.log('Scanning app directory...');
scanDirectory(APP_DIR);

// Check for missing translation keys
console.log('\nChecking for missing translation keys...');
stats.translationKeysUsed.forEach(key => {
  if (!stats.translationKeysPresent.en.has(key)) {
    stats.missingTranslationKeys.en.push(key);
  }
  if (!stats.translationKeysPresent.es.has(key)) {
    stats.missingTranslationKeys.es.push(key);
  }
});

// Check for inconsistent translations
console.log('Checking for inconsistent translations...');
stats.translationKeysPresent.en.forEach(key => {
  if (stats.translationKeysPresent.es.has(key)) {
    // Get nested key value
    function getNestedValue(obj, path) {
      return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    }
    
    const enValue = getNestedValue(translations.en, key);
    const esValue = getNestedValue(translations.es, key);
    
    // If Spanish value is identical to English, it might not be translated
    if (enValue === esValue && typeof enValue === 'string' && enValue.length > 3 && !/^\d+$/.test(enValue)) {
      stats.inconsistentTranslations.push(key);
    }
  }
});

// Print results
console.log('\n==== Translation Test Results ====');
console.log(`Total components scanned: ${stats.componentsScanned}`);
console.log(`Components using translations: ${stats.componentsUsingTranslations} (${Math.round(stats.componentsUsingTranslations / stats.componentsScanned * 100)}%)`);
console.log(`Unique translation keys used: ${stats.translationKeysUsed.size}`);
console.log(`Translation keys available: EN=${stats.translationKeysPresent.en.size}, ES=${stats.translationKeysPresent.es.size}`);

if (stats.missingTranslationKeys.en.length > 0) {
  console.log('\n❌ Missing English translation keys:');
  stats.missingTranslationKeys.en.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('\n✅ All used keys are present in English translations');
}

if (stats.missingTranslationKeys.es.length > 0) {
  console.log('\n❌ Missing Spanish translation keys:');
  stats.missingTranslationKeys.es.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('\n✅ All used keys are present in Spanish translations');
}

if (stats.inconsistentTranslations.length > 0) {
  console.log('\n⚠️ Potentially untranslated keys (same in both languages):');
  stats.inconsistentTranslations.forEach(key => console.log(`  - ${key}`));
} else {
  console.log('\n✅ No inconsistent translations detected');
}

// Suggestions
console.log('\n==== Suggestions ====');
if (stats.componentsUsingTranslations / stats.componentsScanned < 0.8) {
  console.log('⚠️ A significant number of components are not using translations. Consider adding translation support to more components.');
}

if (stats.missingTranslationKeys.en.length > 0 || stats.missingTranslationKeys.es.length > 0) {
  console.log('⚠️ Add the missing translation keys to the appropriate translation files.');
}

if (stats.inconsistentTranslations.length > 0) {
  console.log('⚠️ Review the potentially untranslated keys and provide proper translations.');
}

console.log('\n🔍 For more detailed debugging, use the TranslationDebugger component in your application.');
console.log('✅ Translation test completed!'); 