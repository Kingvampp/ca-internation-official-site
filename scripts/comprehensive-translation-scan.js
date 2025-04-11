/**
 * Comprehensive Translation Scan
 * 
 * This script performs a thorough scan of the website to check for:
 * 1. Missing translation keys in JSON files
 * 2. Hardcoded text in components that should be translated
 * 3. Coverage analysis of translation implementation
 */

const fs = require('fs');
const path = require('path');
const util = require('util');
const { execSync } = require('child_process');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// Configuration
const COMPONENT_DIRS = [
  'components',
  'app',
  'pages'
];

const TRANSLATION_DIRS = [
  'public/locales/en',
  'public/locales/es'
];

// Function to find all component files
async function findComponentFiles(dir) {
  const results = [];
  
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules' || file === '.next') continue;
      
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        const nestedFiles = await findComponentFiles(filePath);
        results.push(...nestedFiles);
      } else if (
        (file.endsWith('.tsx') || file.endsWith('.jsx') || file.endsWith('.js')) && 
        !file.includes('.test.') &&
        !file.includes('.spec.') &&
        !file.includes('node_modules')
      ) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

// Function to find all translation files
async function findTranslationFiles() {
  const results = {
    en: [],
    es: []
  };
  
  for (const dir of TRANSLATION_DIRS) {
    try {
      const files = await readdir(dir);
      const language = dir.includes('/en') ? 'en' : 'es';
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          results[language].push(path.join(dir, file));
        }
      }
    } catch (error) {
      console.error(`Error reading translation directory ${dir}:`, error.message);
    }
  }
  
  return results;
}

// Function to detect potentially hardcoded text in component files
async function detectHardcodedText(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if it's a client component
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
    
    // Skip if not a client component
    if (!isClientComponent) return { filePath, hardcodedStrings: [] };
    
    // Check if using translations
    const usesTranslation = content.includes('useLanguage') && content.includes('t(');
    
    // If already using translations properly, do a more thorough check for missed strings
    const potentialHardcodedStrings = [];
    
    if (usesTranslation) {
      // Look for text between JSX tags that isn't using t() function
      const jsxTagRegex = />([^<>{]*?[A-Za-z]{3,}[^<>{]*?)</g;
      let match;
      
      while ((match = jsxTagRegex.exec(content)) !== null) {
        const text = match[1].trim();
        // Only consider strings with at least 3 characters that don't look like variables
        if (text.length >= 3 && !text.includes('{') && !text.includes('}') && !/^\s*$/.test(text)) {
          potentialHardcodedStrings.push({
            text,
            line: content.substring(0, match.index).split('\n').length
          });
        }
      }
    } else {
      // Component doesn't use translations yet, just mark it for review
      potentialHardcodedStrings.push({
        text: 'COMPONENT_NEEDS_TRANSLATION',
        line: 0
      });
    }
    
    return {
      filePath,
      isClientComponent,
      usesTranslation,
      hardcodedStrings: potentialHardcodedStrings
    };
  } catch (error) {
    console.error(`Error analyzing file ${filePath}:`, error.message);
    return { filePath, error: error.message };
  }
}

// Function to check translation coverage for a file
async function checkTranslationCoverage(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Extract all t() function calls
    const translationRegex = /t\(['"]([^'"]+)['"]\)/g;
    const translationKeys = [];
    let match;
    
    while ((match = translationRegex.exec(content)) !== null) {
      translationKeys.push(match[1]);
    }
    
    return {
      filePath,
      translationKeys
    };
  } catch (error) {
    console.error(`Error checking translation coverage for ${filePath}:`, error.message);
    return { filePath, error: error.message };
  }
}

// Function to verify translation keys exist in both language files
async function verifyTranslationKeys(allKeys) {
  try {
    // Load all translation files
    const enTranslations = {};
    const esTranslations = {};
    
    const translationFiles = await findTranslationFiles();
    
    for (const filePath of translationFiles.en) {
      const content = await readFile(filePath, 'utf8');
      const json = JSON.parse(content);
      Object.assign(enTranslations, json);
    }
    
    for (const filePath of translationFiles.es) {
      const content = await readFile(filePath, 'utf8');
      const json = JSON.parse(content);
      Object.assign(esTranslations, json);
    }
    
    // Check each key in both languages
    const results = {
      missingInEn: [],
      missingInEs: []
    };
    
    for (const key of allKeys) {
      const keys = key.split('.');
      let valueEn = enTranslations;
      let valueEs = esTranslations;
      let missingEn = false;
      let missingEs = false;
      
      for (const k of keys) {
        if (valueEn && typeof valueEn === 'object' && k in valueEn) {
          valueEn = valueEn[k];
        } else {
          missingEn = true;
          break;
        }
        
        if (valueEs && typeof valueEs === 'object' && k in valueEs) {
          valueEs = valueEs[k];
        } else {
          missingEs = true;
          break;
        }
      }
      
      if (missingEn) {
        results.missingInEn.push(key);
      }
      
      if (missingEs) {
        results.missingInEs.push(key);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error verifying translation keys:', error.message);
    return { error: error.message };
  }
}

// Main function to perform comprehensive scan
async function comprehensiveScan() {
  console.log('=== Starting Comprehensive Translation Scan ===\n');
  
  // Step 1: Find all component files
  console.log('Finding component files...');
  let allComponentFiles = [];
  
  for (const dir of COMPONENT_DIRS) {
    const componentDir = path.join(process.cwd(), dir);
    if (fs.existsSync(componentDir)) {
      const files = await findComponentFiles(componentDir);
      allComponentFiles.push(...files);
    }
  }
  
  // Remove duplicates
  allComponentFiles = [...new Set(allComponentFiles)];
  
  console.log(`Found ${allComponentFiles.length} component files to scan.\n`);
  
  // Step 2: Detect hardcoded text
  console.log('Analyzing components for potentially hardcoded text...');
  const hardcodedResults = await Promise.all(
    allComponentFiles.map(filePath => detectHardcodedText(filePath))
  );
  
  const componentsWithHardcodedText = hardcodedResults.filter(
    result => result.hardcodedStrings && result.hardcodedStrings.length > 0
  );
  
  // Step 3: Check translation coverage
  console.log('Checking translation coverage...');
  const coverageResults = await Promise.all(
    allComponentFiles.map(filePath => checkTranslationCoverage(filePath))
  );
  
  // Collect all translation keys used across components
  const allTranslationKeys = new Set();
  coverageResults.forEach(result => {
    if (result.translationKeys) {
      result.translationKeys.forEach(key => allTranslationKeys.add(key));
    }
  });
  
  console.log(`Found ${allTranslationKeys.size} unique translation keys in use.\n`);
  
  // Step 4: Verify all keys exist in both language files
  console.log('Verifying translation keys in language files...');
  const verificationResults = await verifyTranslationKeys(Array.from(allTranslationKeys));
  
  // Generate report
  console.log('\n=== Translation Scan Report ===\n');
  
  console.log('1. Components with Potential Hardcoded Text:');
  console.log(`   ${componentsWithHardcodedText.length} components found with potential issues\n`);
  
  if (componentsWithHardcodedText.length > 0) {
    console.log('   Components needing translation implementation:');
    const componentsNeedingTranslation = componentsWithHardcodedText
      .filter(c => c.isClientComponent && (!c.usesTranslation || c.hardcodedStrings.some(s => s.text === 'COMPONENT_NEEDS_TRANSLATION')))
      .map(c => path.relative(process.cwd(), c.filePath));
    
    componentsNeedingTranslation.forEach(c => console.log(`   - ${c}`));
    console.log('');
    
    console.log('   Components with potential missed translations:');
    const componentsWithMissedTranslations = componentsWithHardcodedText
      .filter(c => c.isClientComponent && c.usesTranslation && c.hardcodedStrings.some(s => s.text !== 'COMPONENT_NEEDS_TRANSLATION'))
      .map(c => ({
        component: path.relative(process.cwd(), c.filePath),
        strings: c.hardcodedStrings.filter(s => s.text !== 'COMPONENT_NEEDS_TRANSLATION')
      }));
    
    componentsWithMissedTranslations.forEach(c => {
      console.log(`   - ${c.component}:`);
      c.strings.slice(0, 5).forEach(s => console.log(`     • Line ${s.line}: "${s.text.substring(0, 40)}${s.text.length > 40 ? '...' : ''}"`));
      if (c.strings.length > 5) {
        console.log(`     • ... and ${c.strings.length - 5} more`);
      }
    });
    console.log('');
  }
  
  console.log('2. Translation Key Verification:');
  console.log(`   Keys missing in English: ${verificationResults.missingInEn.length}`);
  console.log(`   Keys missing in Spanish: ${verificationResults.missingInEs.length}\n`);
  
  if (verificationResults.missingInEn.length > 0) {
    console.log('   Keys missing in English:');
    verificationResults.missingInEn.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (verificationResults.missingInEn.length > 10) {
      console.log(`   - ... and ${verificationResults.missingInEn.length - 10} more`);
    }
    console.log('');
  }
  
  if (verificationResults.missingInEs.length > 0) {
    console.log('   Keys missing in Spanish:');
    verificationResults.missingInEs.slice(0, 10).forEach(key => console.log(`   - ${key}`));
    if (verificationResults.missingInEs.length > 10) {
      console.log(`   - ... and ${verificationResults.missingInEs.length - 10} more`);
    }
    console.log('');
  }
  
  console.log('3. Component Translation Coverage:');
  const clientComponents = hardcodedResults.filter(r => r.isClientComponent);
  const translatedComponents = clientComponents.filter(r => r.usesTranslation);
  
  console.log(`   Client components: ${clientComponents.length}`);
  console.log(`   Components using translations: ${translatedComponents.length} (${Math.round(translatedComponents.length / clientComponents.length * 100)}%)`);
  console.log(`   Components not using translations: ${clientComponents.length - translatedComponents.length} (${Math.round((clientComponents.length - translatedComponents.length) / clientComponents.length * 100)}%)\n`);
  
  console.log('=== Comprehensive Translation Scan Complete ===');
  
  return {
    componentsWithHardcodedText,
    verificationResults,
    translationCoverage: {
      total: clientComponents.length,
      translated: translatedComponents.length,
      untranslated: clientComponents.length - translatedComponents.length
    }
  };
}

// Run the scan
comprehensiveScan().catch(err => {
  console.error('Error during comprehensive scan:', err);
}); 