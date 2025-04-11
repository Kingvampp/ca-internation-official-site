#!/usr/bin/env node

/**
 * Translation Functionality Testing Script
 * 
 * This script tests the translation functionality by loading the English and Spanish
 * translation files and performing validation checks to ensure translations are correctly set up.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk') || { green: (t) => t, red: (t) => t, yellow: (t) => t, blue: (t) => t, bold: (t) => t };

// Constants
const TRANSLATION_FILES = {
  en: path.join(process.cwd(), 'public/locales/en/common.json'),
  es: path.join(process.cwd(), 'public/locales/es/common.json')
};

// Key components and their important translation keys
const CRITICAL_COMPONENTS = [
  {
    name: 'Navigation',
    keys: ['navigation.home', 'navigation.about', 'navigation.services', 'navigation.gallery', 'navigation.contact']
  },
  {
    name: 'Hero',
    keys: ['hero.title', 'hero.titleHighlight', 'hero.subtitle', 'hero.exploreServices', 'hero.bookNow']
  },
  {
    name: 'Services',
    keys: ['services.appointment', 'services.choose', 'services.international', 'services.process']
  },
  {
    name: 'Gallery',
    keys: ['gallery.title', 'gallery.categories', 'gallery.tags', 'gallery.viewDetails', 'gallery.loading']
  },
  {
    name: 'Footer',
    keys: ['footer.rights', 'footer.privacy', 'footer.terms', 'footer.companyDescription', 'footer.ourServices']
  },
  {
    name: 'Common',
    keys: ['common.loading', 'common.error', 'common.success', 'common.save', 'common.cancel', 'common.viewDetails']
  }
];

// Statistics
const stats = {
  totalChecks: 0,
  passedChecks: 0,
  failedChecks: 0,
  missingInEnglish: 0,
  missingInSpanish: 0,
  mismatches: 0
};

/**
 * Load translation files
 */
function loadTranslations() {
  const translations = {};
  
  for (const [lang, filePath] of Object.entries(TRANSLATION_FILES)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      translations[lang] = JSON.parse(content);
      console.log(`✅ Successfully loaded ${lang} translations`);
    } catch (error) {
      console.error(`❌ Error loading ${lang} translations:`, error.message);
      translations[lang] = {};
    }
  }
  
  return translations;
}

/**
 * Get a value from a translation using dot notation
 */
function getTranslationValue(translation, key) {
  const parts = key.split('.');
  let current = translation;
  
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Check if all tests for a component pass
 */
function testComponent(translations, component) {
  console.log(`\n📋 Testing ${component.name} component:`);
  let componentPassed = true;
  
  for (const key of component.keys) {
    stats.totalChecks++;
    
    const enValue = getTranslationValue(translations.en, key);
    const esValue = getTranslationValue(translations.es, key);
    
    // Check if keys exist in both languages
    if (enValue === undefined) {
      console.log(`  ❌ Key "${key}" missing in English translations`);
      stats.missingInEnglish++;
      componentPassed = false;
      stats.failedChecks++;
      continue;
    }
    
    if (esValue === undefined) {
      console.log(`  ❌ Key "${key}" missing in Spanish translations`);
      stats.missingInSpanish++;
      componentPassed = false;
      stats.failedChecks++;
      continue;
    }
    
    // Check if values are not identical (might indicate untranslated content)
    if (enValue === esValue && !['site.name', 'site.title'].includes(key)) {
      console.log(`  ⚠️ Key "${key}" has identical values in both languages`);
      stats.mismatches++;
      // Don't fail the test for this, just warn
    }
    
    // Check for empty values
    if (enValue === '' || esValue === '') {
      console.log(`  ❌ Key "${key}" has empty value`);
      componentPassed = false;
      stats.failedChecks++;
      continue;
    }
    
    console.log(`  ✅ Key "${key}" passed checks`);
    stats.passedChecks++;
  }
  
  if (componentPassed) {
    console.log(`✅ ${component.name} component passed all checks`);
  } else {
    console.log(`❌ ${component.name} component failed some checks`);
  }
  
  return componentPassed;
}

/**
 * Verify basic translation functionality
 */
function verifyTranslationFunctionality() {
  console.log('🧪 Verifying translation framework functionality...');
  
  // Load translations
  const translations = loadTranslations();
  
  // Check if the languages are defined
  if (!translations.en || !translations.es) {
    console.error('❌ One or both translation files could not be loaded');
    return false;
  }
  
  // Check language key presence
  if (!translations.en.language || !translations.es.language) {
    console.error('❌ Language section missing in translations');
    return false;
  }
  
  // Verify each component's translations
  const componentResults = CRITICAL_COMPONENTS.map(component => testComponent(translations, component));
  const allPassed = componentResults.every(result => result);
  
  return allPassed;
}

/**
 * Run all tests
 */
function runTests() {
  console.log('🔍 Starting Translation Functionality Tests\n');
  
  const functionalityPassed = verifyTranslationFunctionality();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`Total checks: ${stats.totalChecks}`);
  console.log(`Passed checks: ${stats.passedChecks}`);
  console.log(`Failed checks: ${stats.failedChecks}`);
  console.log(`Missing in English: ${stats.missingInEnglish}`);
  console.log(`Missing in Spanish: ${stats.missingInSpanish}`);
  console.log(`Potential untranslated content: ${stats.mismatches}`);
  
  if (functionalityPassed) {
    console.log('\n✅ All tests passed! The translation system is working correctly.');
  } else {
    console.log('\n❌ Some tests failed. See the details above for issues that need to be fixed.');
  }
}

// Run all tests
runTests(); 