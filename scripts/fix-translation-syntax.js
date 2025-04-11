#!/usr/bin/env node

/**
 * Fix Translation Syntax Issues
 * 
 * This script fixes common translation syntax issues across the codebase by replacing
 * incorrect patterns like {t('key')}{after} with proper JSX closing tags or other 
 * appropriate corrections.
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
  
  // Skip files that don't have the issue
  if (!content.includes('{after}')) {
    return false;
  }
  
  console.log(`Processing ${filePath}`);
  
  let modified = false;
  let newContent = content;
  
  // Pattern 1: Common closing JSX tag pattern
  // Replace: {t('key')}{after}</tag>
  // With: {t('key')}</tag>
  const pattern1 = /\{t\(['"](.*?)['"]\)\}\{after\}<\/([a-zA-Z0-9]+)>/g;
  if (pattern1.test(newContent)) {
    newContent = newContent.replace(pattern1, '{t(\'$1\')}</$2>');
    modified = true;
  }
  
  // Pattern 2: Literal values inside HTML attributes
  // Replace: value={t('key')}{after}
  // With: value={t('key')}
  const pattern2 = /(\w+)=\{t\(['"](.*?)['"]\)\}\{after\}/g;
  if (pattern2.test(newContent)) {
    newContent = newContent.replace(pattern2, '$1={t(\'$2\')}');
    modified = true;
  }
  
  // Pattern 3: Self-closing element with {after}
  // Replace: {t('key')}{after}<tag ...
  // With: <tag ...
  const pattern3 = /\{t\(['"](.*?)['"]\)\}\{after\}<([a-zA-Z0-9]+)/g;
  if (pattern3.test(newContent)) {
    newContent = newContent.replace(pattern3, '<$2');
    modified = true;
  }
  
  // Pattern 4: Standalone {t('key')}{after}
  // With: {t('key')}
  const pattern4 = /\{t\(['"](.*?)['"]\)\}\{after\}/g;
  if (pattern4.test(newContent)) {
    newContent = newContent.replace(pattern4, '{t(\'$1\')}');
    modified = true;
  }
  
  // Pattern 5: String literal values in code contexts
  // These are more complex and require more careful handling
  // This will only fix some common cases, more specific fixes may be needed manually
  // Example: const [state, setState] = useState<string>{t('key')}{after}<HTMLDivElement>(null);
  const pattern5 = /([a-zA-Z<>[\]{}]+)\{t\(['"](.*?)['"]\)\}\{after\}([a-zA-Z<>[\]{}(]+)/g;
  if (pattern5.test(newContent)) {
    newContent = newContent.replace(pattern5, '$1$3');
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
  console.log(`Found ${files.length} files to check for translation syntax issues`);
  
  let fixedCount = 0;
  for (const file of files) {
    const fixed = fixFile(file);
    if (fixed) {
      fixedCount++;
    }
  }
  
  console.log(`Fixed translation syntax issues in ${fixedCount} files`);
  console.log('Note: Some complex issues may need manual fixing. Please check compilation errors.');
};

main(); 