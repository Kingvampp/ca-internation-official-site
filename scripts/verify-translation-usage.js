#!/usr/bin/env node

/**
 * CA Automotive Website - Translation Usage Verification Script
 * -----------------------------------------------------------
 * This script scans the codebase to verify that components are properly
 * using the translation system (useLanguage hook and t function).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DIRECTORIES_TO_SCAN = [
  'components',
  'app'
];
const FILE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];
const EXEMPTED_FILES = [
  'LanguageContext.tsx',
  'LanguageProviderClient.tsx',
  'ClientProviders.tsx',
  '.d.ts'
];

// Color helpers
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

console.log(`${colors.blue}🔍 Scanning components for proper translation usage...${colors.reset}`);

// Find all component files
const findComponentFiles = (dir) => {
  const results = [];
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    // Skip node_modules and .next
    if (item.name === 'node_modules' || item.name === '.next') {
      continue;
    }
    
    if (item.isDirectory()) {
      results.push(...findComponentFiles(fullPath));
    } else if (
      FILE_EXTENSIONS.some(ext => item.name.endsWith(ext)) &&
      !EXEMPTED_FILES.some(exempted => item.name.includes(exempted))
    ) {
      results.push(fullPath);
    }
  }
  
  return results;
};

// Check if a file is a client component (contains 'use client')
const isClientComponent = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.includes("'use client'") || content.includes('"use client"');
};

// Check if a file is a React component file
const isReactComponent = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Check if the file exports a component
  return (
    content.includes('export default function') ||
    content.includes('export function') ||
    content.includes('export const') && (
      content.includes('React.FC') ||
      content.includes('FunctionComponent') ||
      content.includes('=> {') ||
      content.includes('=> (')
    )
  );
};

// Check if a file uses text that should be translated
const usesText = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Look for hardcoded text in JSX
  const jsxTextRegex = />([A-Z][a-z]+\s[A-Za-z\s]+)</g;
  const stringAttributeRegex = /\w+=['"]([A-Z][a-z]+\s[A-Za-z\s]+)['"]/g;
  
  return jsxTextRegex.test(content) || stringAttributeRegex.test(content);
};

// Check if a file uses the translation system
const usesTranslationSystem = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  return (
    content.includes('useLanguage') &&
    (content.includes('const { t }') || 
     content.includes('const {t}') || 
     content.includes('const { language, t }') ||
     content.includes('const {language, t}') ||
     content.includes('const { t, language }') ||
     content.includes('const {t, language}'))
  );
};

// Extract hardcoded text from a file
const extractHardcodedText = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const hardcodedTexts = [];
  
  // Extract text from JSX
  const jsxTextRegex = />([A-Z][a-z]+\s[A-Za-z\s]+)</g;
  let match;
  while ((match = jsxTextRegex.exec(content)) !== null) {
    hardcodedTexts.push(match[1]);
  }
  
  // Extract text from attributes
  const stringAttributeRegex = /\w+=['"]([A-Z][a-z]+\s[A-Za-z\s]+)['"]/g;
  while ((match = stringAttributeRegex.exec(content)) !== null) {
    hardcodedTexts.push(match[1]);
  }
  
  return hardcodedTexts;
};

// Get all component files
let allComponentFiles = [];
for (const dir of DIRECTORIES_TO_SCAN) {
  allComponentFiles.push(...findComponentFiles(dir));
}

console.log(`${colors.blue}Found ${allComponentFiles.length} component files to check${colors.reset}`);

// Check each file
const results = {
  compliant: [],
  nonCompliant: [],
  needsReview: []
};

for (const filePath of allComponentFiles) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Check if it's a client component
  const isClient = isClientComponent(filePath);
  
  // Check if it's a React component
  const isComponent = isReactComponent(filePath);
  
  if (!isComponent) {
    // Skip non-component files
    continue;
  }
  
  // Check if it uses text that should be translated
  const hasText = usesText(filePath);
  
  // Check if it uses the translation system
  const usesTranslation = usesTranslationSystem(filePath);
  
  if (isClient && hasText && !usesTranslation) {
    // Non-compliant: Client component with text but no translation
    results.nonCompliant.push({
      path: relativePath,
      hardcodedText: extractHardcodedText(filePath)
    });
  } else if (isClient && hasText && usesTranslation) {
    // Compliant: Client component with text that uses translation
    results.compliant.push(relativePath);
  } else if (isClient && !hasText) {
    // No text to translate
    results.compliant.push(relativePath);
  } else if (!isClient && hasText) {
    // Need review: Server component with text
    results.needsReview.push({
      path: relativePath,
      isServer: !isClient,
      hardcodedText: extractHardcodedText(filePath)
    });
  }
}

// Output results
console.log(`\n${colors.blue}=== Translation Usage Report ===${colors.reset}`);
console.log(`\n${colors.green}✓ ${results.compliant.length} components comply with translation guidelines${colors.reset}`);
if (results.compliant.length > 0) {
  console.log(`${colors.gray}Sample compliant components:${colors.reset}`);
  results.compliant.slice(0, 5).forEach(path => {
    console.log(`${colors.gray}  - ${path}${colors.reset}`);
  });
}

if (results.nonCompliant.length > 0) {
  console.log(`\n${colors.red}✗ ${results.nonCompliant.length} components contain hardcoded text without translation${colors.reset}`);
  results.nonCompliant.forEach(item => {
    console.log(`${colors.red}  - ${item.path}${colors.reset}`);
    item.hardcodedText.slice(0, 3).forEach(text => {
      console.log(`${colors.gray}    • "${text}"${colors.reset}`);
    });
    if (item.hardcodedText.length > 3) {
      console.log(`${colors.gray}    • ... and ${item.hardcodedText.length - 3} more${colors.reset}`);
    }
  });
}

if (results.needsReview.length > 0) {
  console.log(`\n${colors.yellow}! ${results.needsReview.length} components need review${colors.reset}`);
  results.needsReview.forEach(item => {
    console.log(`${colors.yellow}  - ${item.path}${colors.reset}`);
    if (item.isServer) {
      console.log(`${colors.gray}    • Server component - can't use useLanguage directly${colors.reset}`);
    }
  });
}

// Generate a Markdown report
const generateReport = () => {
  let report = `# Translation Usage Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total components checked**: ${results.compliant.length + results.nonCompliant.length + results.needsReview.length}\n`;
  report += `- **Compliant components**: ${results.compliant.length}\n`;
  report += `- **Non-compliant components**: ${results.nonCompliant.length}\n`;
  report += `- **Components needing review**: ${results.needsReview.length}\n\n`;
  
  if (results.nonCompliant.length > 0) {
    report += `## Non-Compliant Components\n\n`;
    report += `These components contain hardcoded text that should be translated:\n\n`;
    
    results.nonCompliant.forEach(item => {
      report += `### ${item.path}\n\n`;
      report += `Hardcoded text found:\n\n`;
      
      item.hardcodedText.forEach(text => {
        report += `- "${text}"\n`;
      });
      
      report += `\n`;
    });
  }
  
  if (results.needsReview.length > 0) {
    report += `## Components Needing Review\n\n`;
    
    results.needsReview.forEach(item => {
      report += `### ${item.path}\n\n`;
      
      if (item.isServer) {
        report += `This is a server component and cannot use the useLanguage hook directly. Consider:\n\n`;
        report += `- Moving the text to a client component\n`;
        report += `- Using the Intl.Provider pattern\n`;
        report += `- Generating the text server-side\n\n`;
      }
      
      if (item.hardcodedText.length > 0) {
        report += `Hardcoded text found:\n\n`;
        
        item.hardcodedText.forEach(text => {
          report += `- "${text}"\n`;
        });
      }
      
      report += `\n`;
    });
  }
  
  report += `## How to Fix\n\n`;
  report += `### For Client Components\n\n`;
  report += `1. Import the useLanguage hook:\n\n`;
  report += "```tsx\nimport { useLanguage } from '../utils/LanguageContext';\n```\n\n";
  
  report += `2. Use the hook in your component:\n\n`;
  report += "```tsx\nconst { t, language } = useLanguage();\n```\n\n";
  
  report += `3. Replace hardcoded text with translation function:\n\n`;
  report += "```tsx\n// Before\n<h1>Our Services</h1>\n\n// After\n<h1>{t('services.title')}</h1>\n```\n\n";
  
  report += `### For Server Components\n\n`;
  report += `1. Create a client component for the text that needs translation\n`;
  report += `2. Pass any necessary props to the client component\n`;
  report += `3. Use the translation function in the client component\n\n`;
  
  report += `Example:\n\n`;
  report += "```tsx\n// ServerComponent.tsx\nimport TextClient from './TextClient';\n\nexport default function ServerComponent() {\n  return (\n    <div>\n      <TextClient textKey=\"services.title\" />\n    </div>\n  );\n}\n\n// TextClient.tsx ('use client')\nimport { useLanguage } from '../utils/LanguageContext';\n\nexport default function TextClient({ textKey }) {\n  const { t } = useLanguage();\n  return <h1>{t(textKey)}</h1>;\n}\n```\n";
  
  return report;
};

// Save the report to a file
const reportPath = 'translation-usage-report.md';
fs.writeFileSync(reportPath, generateReport());

console.log(`\n${colors.green}✓ Report saved to ${reportPath}${colors.reset}`);
console.log(`\n${colors.blue}Scan complete!${colors.reset}`); 