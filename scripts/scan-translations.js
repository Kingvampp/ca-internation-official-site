#!/usr/bin/env node

/**
 * Scan all React components for hardcoded text and check if they're using translations
 * This script helps find components that need to be updated to use the translation system
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
  componentFiles: 0,
  clientComponents: 0,
  clientComponentsUsingTranslations: 0,
  componentsWithHardcodedText: {},
  usedTranslationKeys: new Set(),
  missingTranslationKeys: {
    en: [],
    es: []
  }
};

/**
 * Check if a file is a React component
 */
function isReactComponent(filePath) {
  return (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) && 
         !filePath.includes('.d.ts') && 
         !filePath.includes('node_modules');
}

/**
 * Check if a component is using translations
 */
function isUsingTranslations(content) {
  return content.includes('import { useLanguage }') || 
         content.includes('import {useLanguage}') || 
         content.includes('useLanguage');
}

/**
 * Find all potentially hardcoded strings in a component
 */
function findHardcodedStrings(content, filePath) {
  const hardcoded = [];
  
  // Check for text in JSX (between > and <)
  const jsxTextRegex = />([^><{]+)</g;
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text && text.length > 1 && !/^\s*$/.test(text) && !/^[0-9.]+$/.test(text)) {
      hardcoded.push(text);
    }
  }
  
  // Check for hardcoded string props (like title="Some Title")
  const propRegex = /(\w+)="([^"]+)"/g;
  while ((match = propRegex.exec(content)) !== null) {
    const propName = match[1];
    const propValue = match[2];
    
    // Skip certain props that don't need translation
    if (['className', 'style', 'id', 'key', 'type', 'href', 'src', 'alt', 'width', 'height', 'onClick', 'onChange', 'onSubmit', 'target', 'rel', 'role', 'placeholder'].includes(propName)) {
      continue;
    }
    
    if (propValue && propValue.length > 3 && /[a-zA-Z]{2,}/.test(propValue)) {
      hardcoded.push(`${propName}="${propValue}"`);
    }
  }
  
  if (hardcoded.length > 0) {
    stats.componentsWithHardcodedText[filePath] = hardcoded;
  }
  
  return hardcoded;
}

/**
 * Extract all translation keys used in a component
 */
function findUsedTranslationKeys(content) {
  const keys = new Set();
  const translationRegex = /t\(['"]([\w.]+)['"]\)/g;
  let match;
  
  while ((match = translationRegex.exec(content)) !== null) {
    keys.add(match[1]);
    stats.usedTranslationKeys.add(match[1]);
  }
  
  return keys;
}

/**
 * Load translation files
 */
function loadTranslations() {
  const translations = {};
  
  Object.keys(TRANSLATION_FILES).forEach(lang => {
    try {
      const content = fs.readFileSync(TRANSLATION_FILES[lang], 'utf8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`Error loading ${lang} translations:`, error.message);
      translations[lang] = {};
    }
  });
  
  return translations;
}

/**
 * Check for missing translation keys
 */
function checkMissingTranslationKeys(translations) {
  stats.usedTranslationKeys.forEach(key => {
    const keyParts = key.split('.');
    
    Object.keys(translations).forEach(lang => {
      let current = translations[lang];
      let missing = false;
      
      for (const part of keyParts) {
        if (!current || !current[part]) {
          missing = true;
          break;
        }
        current = current[part];
      }
      
      if (missing) {
        stats.missingTranslationKeys[lang].push(key);
      }
    });
  });
}

/**
 * Recursive function to scan all components in a directory
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDirectory(filePath);
    } else if (isReactComponent(filePath)) {
      scanComponent(filePath);
    }
  });
}

/**
 * Scan a single component file
 */
function scanComponent(filePath) {
  stats.componentFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it's a client component
    if (content.includes('"use client"') || content.includes("'use client'")) {
      stats.clientComponents++;
      
      // Check if it's using translations
      if (isUsingTranslations(content)) {
        stats.clientComponentsUsingTranslations++;
        findUsedTranslationKeys(content);
      }
      
      // Check for hardcoded strings
      findHardcodedStrings(content, filePath);
    }
  } catch (error) {
    console.error(`Error scanning ${filePath}:`, error.message);
  }
}

/**
 * Print the report
 */
function printReport() {
  console.log('\n===== TRANSLATION SCAN REPORT =====\n');
  
  console.log(`📁 Scanned ${stats.componentFiles} component files`);
  console.log(`🖥️  ${stats.clientComponents} client components identified`);
  console.log(`🌐 ${stats.clientComponentsUsingTranslations} components using translations (${Math.round(stats.clientComponentsUsingTranslations / stats.clientComponents * 100)}%)\n`);
  
  console.log(`🔑 ${stats.usedTranslationKeys.size} unique translation keys in use\n`);
  
  if (stats.missingTranslationKeys.en.length > 0) {
    console.log(`⚠️  ${stats.missingTranslationKeys.en.length} keys missing in English translation file:`);
    console.log(stats.missingTranslationKeys.en.join(', ') + '\n');
  } else {
    console.log('✅ No keys missing in English translation file\n');
  }
  
  if (stats.missingTranslationKeys.es.length > 0) {
    console.log(`⚠️  ${stats.missingTranslationKeys.es.length} keys missing in Spanish translation file:`);
    console.log(stats.missingTranslationKeys.es.join(', ') + '\n');
  } else {
    console.log('✅ No keys missing in Spanish translation file\n');
  }
  
  console.log('⚠️  Components with potential hardcoded text:');
  const componentsWithHardcodedText = Object.keys(stats.componentsWithHardcodedText);
  console.log(`Found ${componentsWithHardcodedText.length} components that may need translation updates\n`);
  
  componentsWithHardcodedText.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`- ${relativePath} (${stats.componentsWithHardcodedText[filePath].length} items)`);
  });
}

// Main execution
console.log('🔍 Scanning components for translation usage...');
const translations = loadTranslations();
scanDirectory(COMPONENTS_DIR);
scanDirectory(APP_DIR);
checkMissingTranslationKeys(translations);
printReport();
