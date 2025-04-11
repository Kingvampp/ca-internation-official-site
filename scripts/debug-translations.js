#!/usr/bin/env node

/**
 * CA Automotive Website - Translation Debugging Script
 * --------------------------------------------------
 * This script helps identify and debug translation issues by:
 * 1. Comparing translation files between different languages
 * 2. Identifying missing translation keys
 * 3. Validating translation files structure
 * 4. Creating detailed logs of the translations system
 */

const fs = require('fs');
const path = require('path');

// Configuration
const LOCALES_DIR = 'public/locales';
const SUPPORTED_LANGUAGES = ['en', 'es'];
const OUTPUT_FILE = 'translation-debug.log';

// Color helpers for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

console.log(`${colors.blue}🔍 Starting translation debugging...${colors.reset}`);

// Ensure locales directory exists
if (!fs.existsSync(LOCALES_DIR)) {
  console.error(`${colors.red}❌ Error: Locales directory not found: ${LOCALES_DIR}${colors.reset}`);
  process.exit(1);
}

// Load translation files
const translations = {};
for (const lang of SUPPORTED_LANGUAGES) {
  const localePath = path.join(LOCALES_DIR, lang);
  
  if (!fs.existsSync(localePath)) {
    console.error(`${colors.red}❌ Error: Directory for language ${lang} not found: ${localePath}${colors.reset}`);
    continue;
  }
  
  translations[lang] = {};
  
  const files = fs.readdirSync(localePath).filter(file => file.endsWith('.json'));
  console.log(`${colors.green}✓ Found ${files.length} translation files for ${lang}${colors.reset}`);
  
  for (const file of files) {
    const filePath = path.join(localePath, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const namespace = file.replace('.json', '');
      translations[lang][namespace] = content;
      console.log(`${colors.green}  - Loaded ${file} with ${Object.keys(content).length} top-level keys${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}❌ Error loading ${filePath}: ${error.message}${colors.reset}`);
    }
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

// Analyze translations for each language
console.log(`\n${colors.blue}🔍 Analyzing translations...${colors.reset}`);

const flattenedTranslations = {};
const allKeys = new Set();

// Flatten translations and collect all keys
for (const lang in translations) {
  flattenedTranslations[lang] = {};
  
  for (const namespace in translations[lang]) {
    const flattened = flattenObject(translations[lang][namespace]);
    
    // Add namespace prefix to keys
    Object.keys(flattened).forEach(key => {
      const prefixedKey = namespace === 'common' ? key : `${namespace}.${key}`;
      flattenedTranslations[lang][prefixedKey] = flattened[key];
      allKeys.add(prefixedKey);
    });
  }
  
  console.log(`${colors.green}✓ ${lang}: ${Object.keys(flattenedTranslations[lang]).length} total keys${colors.reset}`);
}

// Compare translations between languages
console.log(`\n${colors.blue}🔍 Comparing translations between languages...${colors.reset}`);

const missingTranslations = {};
const totalKeys = allKeys.size;

for (const lang of SUPPORTED_LANGUAGES) {
  missingTranslations[lang] = [];
  
  for (const key of allKeys) {
    if (!flattenedTranslations[lang][key]) {
      missingTranslations[lang].push(key);
    }
  }
  
  const missingCount = missingTranslations[lang].length;
  const coverage = ((totalKeys - missingCount) / totalKeys * 100).toFixed(2);
  
  if (missingCount > 0) {
    console.log(`${colors.yellow}⚠️ ${lang}: Missing ${missingCount} translations (${coverage}% coverage)${colors.reset}`);
  } else {
    console.log(`${colors.green}✓ ${lang}: All translations present (100% coverage)${colors.reset}`);
  }
}

// Generate detailed report
console.log(`\n${colors.blue}🔍 Generating detailed report...${colors.reset}`);

let report = `# Translation Debugging Report\n`;
report += `Generated: ${new Date().toISOString()}\n\n`;

report += `## Summary\n\n`;
report += `Total unique keys: ${totalKeys}\n\n`;

report += `| Language | Total Keys | Missing Keys | Coverage |\n`;
report += `|----------|------------|--------------|----------|\n`;

for (const lang of SUPPORTED_LANGUAGES) {
  const missingCount = missingTranslations[lang].length;
  const coverage = ((totalKeys - missingCount) / totalKeys * 100).toFixed(2);
  report += `| ${lang} | ${Object.keys(flattenedTranslations[lang]).length} | ${missingCount} | ${coverage}% |\n`;
}

report += `\n## Missing Translations\n\n`;

for (const lang of SUPPORTED_LANGUAGES) {
  if (missingTranslations[lang].length > 0) {
    report += `### ${lang.toUpperCase()}\n\n`;
    
    const groupedByNamespace = {};
    
    // Group missing keys by namespace
    missingTranslations[lang].forEach(key => {
      const [namespace, ...rest] = key.split('.');
      const restKey = rest.join('.');
      
      if (!groupedByNamespace[namespace]) {
        groupedByNamespace[namespace] = [];
      }
      
      groupedByNamespace[namespace].push(restKey);
    });
    
    // Output missing keys by namespace
    for (const namespace in groupedByNamespace) {
      report += `#### ${namespace}\n\n`;
      groupedByNamespace[namespace].forEach(key => {
        report += `- \`${key}\`\n`;
      });
      report += `\n`;
    }
  } else {
    report += `### ${lang.toUpperCase()}\n\n`;
    report += `No missing translations.\n\n`;
  }
}

report += `## Browser Debug Code\n\n`;
report += `Paste this code in your browser console to test translations:\n\n`;
report += "```javascript\n";
report += `function testTranslation(key) {
  const t = window.__translationStats?.checkTranslation || (k => k);
  const result = t(key);
  console.log(\`Key: \${key}\`);
  console.log(\`Translation: \${result}\`);
  console.log(\`Success: \${result !== key}\`);
  return result;
}

// Test some critical keys
const keysToTest = [
  'navigation.home',
  'navigation.services', 
  'hero.title',
  'contact.send.message'
];

console.group('Translation Tests');
keysToTest.forEach(key => {
  console.group(key);
  testTranslation(key);
  console.groupEnd();
});
console.groupEnd();

// Check translation stats
console.log('Translation Stats:', window.__translationStats);
`;
report += "```\n";

report += `\n## Adding Translation Logging\n\n`;
report += `Add this code to your component to log translations:\n\n`;
report += "```jsx\n";
report += `// At the top of your component
const { language, t } = useLanguage();

// In useEffect or on component mount
useEffect(() => {
  console.log(\`[YourComponent] Current language: \${language}\`);
  
  // Test some translations
  const testKeys = ['your.key1', 'your.key2'];
  testKeys.forEach(key => {
    const translated = t(key);
    console.log(\`[YourComponent] Translation for \${key}: \${translated}\`);
  });
}, [language, t]);
`;
report += "```\n";

// Output the report
fs.writeFileSync(OUTPUT_FILE, report);
console.log(`${colors.green}✓ Report saved to ${OUTPUT_FILE}${colors.reset}`);

// Check for URL-based redirections
console.log(`\n${colors.blue}🔍 Checking for URL redirection issues...${colors.reset}`);
console.log(`${colors.yellow}⚠️ Make sure that your LanguageContext.tsx does not include URL redirections when switching languages.${colors.reset}`);
console.log(`${colors.yellow}⚠️ Look for router.push() calls in the setLanguage function and remove them if present.${colors.reset}`);

// Fix recommendation
console.log(`\n${colors.blue}🔍 Recommendations for in-place translation without URL changes:${colors.reset}`);
console.log(`${colors.green}1. Remove URL redirection in LanguageContext.tsx setLanguage function${colors.reset}`);
console.log(`${colors.green}2. Ensure language is stored in localStorage${colors.reset}`);
console.log(`${colors.green}3. Add more logging to track language changes${colors.reset}`);
console.log(`${colors.green}4. Use the TranslationMonitor component for real-time debugging${colors.reset}`);

console.log(`\n${colors.green}✓ Translation debugging complete!${colors.reset}`); 