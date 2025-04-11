#!/usr/bin/env node

/**
 * Fix IFrame Attribute Issues
 * 
 * This script fixes common iframe attribute issues across the codebase where translation
 * functions are incorrectly used for attribute values that require literal strings.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Get all TypeScript and JavaScript files
const getFiles = () => {
  return [
    ...glob.sync('components/**/*.{tsx,jsx,ts,js}', { ignore: 'node_modules/**' }),
    ...glob.sync('app/**/*.{tsx,jsx,ts,js}', { ignore: 'node_modules/**' }),
  ];
};

// Fix patterns in a file
const fixFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Skip files that don't have iframes
  if (!content.includes('<iframe')) {
    return false;
  }
  
  console.log(`Processing ${filePath}`);
  
  let modified = false;
  let newContent = content;
  
  // Pattern 1: loading attribute using translation
  // Replace: loading={t('key')}
  // With: loading="lazy"
  const pattern1 = /loading=\{t\(['"](.*?)['"]\)\}/g;
  if (pattern1.test(newContent)) {
    newContent = newContent.replace(pattern1, 'loading="lazy"');
    modified = true;
  }
  
  // Pattern 2: referrerPolicy attribute using translation
  // Replace: referrerPolicy={t('key')}
  // With: referrerPolicy="no-referrer-when-downgrade"
  const pattern2 = /referrerPolicy=\{t\(['"](.*?)['"]\)\}/g;
  if (pattern2.test(newContent)) {
    newContent = newContent.replace(pattern2, 'referrerPolicy="no-referrer-when-downgrade"');
    modified = true;
  }
  
  // Pattern 3: sizes attribute in Image component using translation
  // Replace: sizes={t('key')}
  // With: sizes="(max-width: 768px) 100vw, 50vw"
  const pattern3 = /sizes=\{t\(['"](.*?)['"]\)\}/g;
  if (pattern3.test(newContent)) {
    newContent = newContent.replace(pattern3, 'sizes="(max-width: 768px) 100vw, 50vw"');
    modified = true;
  }
  
  // Pattern 4: color attribute in react-icons using translation
  // Replace: color={t('key')}
  // With: color="white" (or other appropriate color)
  const pattern4 = /color=\{t\(['"](.*?)['"]\)\}/g;
  if (pattern4.test(newContent)) {
    newContent = newContent.replace(pattern4, 'color="white"');
    modified = true;
  }
  
  // Save changes if modified
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`  Fixed issues in ${filePath}`);
    return true;
  }
  
  return false;
};

// Main execution
const main = () => {
  const files = getFiles();
  console.log(`Found ${files.length} files to check for iframe attribute issues`);
  
  let fixedCount = 0;
  for (const file of files) {
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
    }
  }
  
  console.log(`Fixed iframe attribute issues in ${fixedCount} files`);
  console.log('Note: Some complex issues may need manual fixing. Please check compilation errors.');
};

main(); 