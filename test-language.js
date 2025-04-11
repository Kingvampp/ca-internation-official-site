// Simple script to test if the translations are working properly

const fs = require('fs');
const path = require('path');

// Check if translation files exist and are properly formatted
function validateTranslationFiles() {
  try {
    console.log('Checking translation files...');
    
    // Check English translation file
    const enPath = path.join(process.cwd(), 'public', 'locales', 'en', 'common.json');
    const enExists = fs.existsSync(enPath);
    console.log(`English translation file exists: ${enExists}`);
    
    if (enExists) {
      const enContent = fs.readFileSync(enPath, 'utf8');
      const enJson = JSON.parse(enContent);
      console.log('English translation file is valid JSON');
      console.log(`English translation keys count: ${Object.keys(enJson).length}`);
      
      // Check core section keys
      console.log('\nChecking core section keys in English:');
      ['site', 'navigation', 'hero', 'services', 'contact', 'common'].forEach(section => {
        console.log(`- ${section}: ${enJson[section] ? 'Present' : 'Missing'}`);
      });
    }
    
    // Check Spanish translation file
    const esPath = path.join(process.cwd(), 'public', 'locales', 'es', 'common.json');
    const esExists = fs.existsSync(esPath);
    console.log(`\nSpanish translation file exists: ${esExists}`);
    
    if (esExists) {
      const esContent = fs.readFileSync(esPath, 'utf8');
      const esJson = JSON.parse(esContent);
      console.log('Spanish translation file is valid JSON');
      console.log(`Spanish translation keys count: ${Object.keys(esJson).length}`);
      
      // Check core section keys
      console.log('\nChecking core section keys in Spanish:');
      ['site', 'navigation', 'hero', 'services', 'contact', 'common'].forEach(section => {
        console.log(`- ${section}: ${esJson[section] ? 'Present' : 'Missing'}`);
      });
    }
    
    // Compare key structures to ensure they match
    if (enExists && esExists) {
      const enContent = fs.readFileSync(enPath, 'utf8');
      const esContent = fs.readFileSync(esPath, 'utf8');
      const enJson = JSON.parse(enContent);
      const esJson = JSON.parse(esContent);
      
      console.log('\nComparing key structures between English and Spanish:');
      
      // Helper function to compare nested objects
      function compareStructure(enObj, esObj, path = '') {
        const enKeys = Object.keys(enObj).sort();
        const esKeys = Object.keys(esObj).sort();
        
        // Find missing keys in Spanish
        const missingInEs = enKeys.filter(key => !esKeys.includes(key));
        if (missingInEs.length > 0) {
          console.log(`Keys missing in Spanish at ${path || 'root'}: ${missingInEs.join(', ')}`);
        }
        
        // Find extra keys in Spanish
        const extraInEs = esKeys.filter(key => !enKeys.includes(key));
        if (extraInEs.length > 0) {
          console.log(`Extra keys in Spanish at ${path || 'root'}: ${extraInEs.join(', ')}`);
        }
        
        // Recursively check nested objects
        enKeys.filter(key => esKeys.includes(key)).forEach(key => {
          const enValue = enObj[key];
          const esValue = esObj[key];
          
          if (typeof enValue === 'object' && enValue !== null && 
              typeof esValue === 'object' && esValue !== null) {
            compareStructure(enValue, esValue, path ? `${path}.${key}` : key);
          }
        });
      }
      
      compareStructure(enJson, esJson);
      console.log('\nTranslation structure check complete!');
    }
    
    return true;
  } catch (error) {
    console.error('Error validating translation files:', error);
    return false;
  }
}

// Run the validation
validateTranslationFiles(); 