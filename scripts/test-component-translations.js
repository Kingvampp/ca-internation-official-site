/**
 * This script checks component files to verify they're actually using the translation system
 * It looks for the useLanguage hook import and t function usage
 */

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const stat = util.promisify(fs.stat);

// Component directories to check
const COMPONENT_DIRS = [
  'components/layout',
  'components/sections',
  'components'
];

async function findComponentFiles(dir) {
  const results = [];
  
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      if (file.startsWith('.') || file === 'node_modules') continue;
      
      const filePath = path.join(dir, file);
      const fileStat = await stat(filePath);
      
      if (fileStat.isDirectory()) {
        const nestedFiles = await findComponentFiles(filePath);
        results.push(...nestedFiles);
      } else if (
        (file.endsWith('.tsx') || file.endsWith('.jsx')) && 
        !file.includes('.test.') &&
        !file.includes('.spec.')
      ) {
        results.push(filePath);
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
  
  return results;
}

async function checkComponentFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf8');
    
    // Check if the file imports useLanguage
    const hasLanguageImport = content.includes('useLanguage');
    
    // Check if the file uses the t function
    const usesTFunction = content.includes('t(');
    
    // Check if it's a client component
    const isClientComponent = content.includes("'use client'") || content.includes('"use client"');
    
    // For client components, they should use the translation system
    const shouldUseTranslation = isClientComponent;
    
    return {
      filePath,
      isClientComponent,
      hasLanguageImport,
      usesTFunction,
      shouldUseTranslation,
      // Calculate if the component is properly using translations
      isUsingTranslationsCorrectly: !shouldUseTranslation || (hasLanguageImport && usesTFunction)
    };
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return {
      filePath,
      error: error.message
    };
  }
}

async function checkAllComponents() {
  console.log('=== Checking Component Translation Usage ===\n');
  
  let allComponents = [];
  
  // Collect all component files from the specified directories
  for (const dir of COMPONENT_DIRS) {
    const componentDir = path.join(process.cwd(), dir);
    if (fs.existsSync(componentDir)) {
      const files = await findComponentFiles(componentDir);
      allComponents.push(...files);
    } else {
      console.warn(`Warning: Directory ${componentDir} does not exist.`);
    }
  }
  
  // Remove duplicates
  allComponents = [...new Set(allComponents)];
  
  console.log(`Found ${allComponents.length} component files to check.\n`);
  
  // Check each component file
  const results = await Promise.all(allComponents.map(checkComponentFile));
  
  // Count statistics
  const clientComponents = results.filter(r => r.isClientComponent);
  const correctlyUsingTranslations = results.filter(r => r.isUsingTranslationsCorrectly);
  const clientComponentsWithTranslations = clientComponents.filter(r => r.hasLanguageImport && r.usesTFunction);
  
  console.log('=== Translation Usage Summary ===');
  console.log(`Total components: ${results.length}`);
  console.log(`Client components: ${clientComponents.length}`);
  console.log(`Components correctly using translations: ${correctlyUsingTranslations.length}`);
  console.log(`Client components with translations: ${clientComponentsWithTranslations.length}/${clientComponents.length}`);
  
  // Show components that should use translations but don't
  const componentsNotUsingTranslations = results.filter(r => 
    r.isClientComponent && 
    (!r.hasLanguageImport || !r.usesTFunction)
  );
  
  if (componentsNotUsingTranslations.length > 0) {
    console.log('\n=== Client Components NOT Using Translations ===');
    componentsNotUsingTranslations.forEach(comp => {
      console.log(`- ${path.relative(process.cwd(), comp.filePath)}`);
      if (!comp.hasLanguageImport) console.log('  • Missing useLanguage import');
      if (!comp.usesTFunction) console.log('  • Not using t() function');
    });
  }
  
  // Show client components that are correctly using translations
  console.log('\n=== Client Components Using Translations Correctly ===');
  clientComponentsWithTranslations.forEach(comp => {
    console.log(`- ${path.relative(process.cwd(), comp.filePath)}`);
  });
  
  console.log('\n=== Check Complete ===');
}

// Run the check
checkAllComponents().catch(err => {
  console.error('Error checking components:', err);
}); 