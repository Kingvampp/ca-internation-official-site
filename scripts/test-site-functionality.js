#!/usr/bin/env node

/**
 * CA Automotive Website - Functionality Test Script
 * ------------------------------------------------
 * This script helps test various aspects of the website functionality
 * including translations, Firebase connectivity, forms, and responsiveness.
 * 
 * Usage:
 *   node scripts/test-site-functionality.js [options]
 * 
 * Options:
 *   --translations   Test translation functionality
 *   --firebase       Test Firebase connectivity
 *   --forms          Test form submissions
 *   --all            Run all tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
const SUPPORTED_LOCALES = ['en', 'es'];
const TEST_ENDPOINTS = [
  '/',
  '/about',
  '/services',
  '/gallery',
  '/testimonials',
  '/contact',
  '/booking',
  '/api/translations/debug',
  '/api/gallery'
];

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

/**
 * Print a formatted header to the console
 */
function printHeader(text) {
  const line = '='.repeat(text.length + 4);
  console.log(`\n${colors.cyan}${line}${colors.reset}`);
  console.log(`${colors.cyan}= ${colors.reset}${colors.magenta}${text}${colors.reset}${colors.cyan} =${colors.reset}`);
  console.log(`${colors.cyan}${line}${colors.reset}\n`);
}

/**
 * Print a formatted subheader to the console
 */
function printSubheader(text) {
  console.log(`\n${colors.yellow}${text}${colors.reset}`);
  console.log(`${colors.gray}${'-'.repeat(text.length)}${colors.reset}`);
}

/**
 * Test if the website is running
 */
async function testWebsiteAvailability() {
  printHeader('Testing Website Availability');
  
  try {
    const response = await fetch(BASE_URL, { method: 'HEAD' });
    if (response.ok) {
      console.log(`${colors.green}✓ Website is running at ${BASE_URL}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Website returned status code ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error connecting to website: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}! Make sure the development server is running (npm run dev)${colors.reset}`);
    return false;
  }
}

/**
 * Test endpoints availability
 */
async function testEndpoints() {
  printHeader('Testing Endpoints');
  
  let success = 0;
  let failure = 0;
  
  for (const endpoint of TEST_ENDPOINTS) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const response = await fetch(url, { 
        method: 'GET',
        headers: { 'Accept': 'text/html,application/json' }
      });
      
      if (response.ok) {
        console.log(`${colors.green}✓ ${endpoint} - ${response.status} ${response.statusText}${colors.reset}`);
        success++;
      } else {
        console.log(`${colors.red}✗ ${endpoint} - ${response.status} ${response.statusText}${colors.reset}`);
        failure++;
      }
    } catch (error) {
      console.log(`${colors.red}✗ ${endpoint} - Error: ${error.message}${colors.reset}`);
      failure++;
    }
  }
  
  console.log(`\n${colors.blue}Results: ${success} successful, ${failure} failed${colors.reset}`);
  
  return { success, failure };
}

/**
 * Test translation functionality
 */
async function testTranslations() {
  printHeader('Testing Translations');
  
  printSubheader('Checking Translation Files');
  
  // Check translation files existence
  for (const locale of SUPPORTED_LOCALES) {
    const localeDir = path.join(process.cwd(), 'public/locales', locale);
    if (fs.existsSync(localeDir)) {
      const files = fs.readdirSync(localeDir).filter(file => file.endsWith('.json'));
      if (files.length > 0) {
        console.log(`${colors.green}✓ ${locale} translations found: ${files.join(', ')}${colors.reset}`);
        
        // Check file content for one file
        const sampleFile = path.join(localeDir, files[0]);
        try {
          const content = JSON.parse(fs.readFileSync(sampleFile, 'utf8'));
          const keys = Object.keys(content);
          console.log(`${colors.green}  └─ ${files[0]} contains ${keys.length} translation keys${colors.reset}`);
        } catch (error) {
          console.log(`${colors.red}  └─ Error reading ${files[0]}: ${error.message}${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}✗ No translation files found for ${locale}${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ Translation directory for ${locale} not found${colors.reset}`);
    }
  }
  
  printSubheader('Testing Translation API');
  
  try {
    const response = await fetch(`${BASE_URL}/api/translations/debug`);
    if (response.ok) {
      const data = await response.json();
      const stats = data.stats || {};
      console.log(`${colors.green}✓ Translation API is working${colors.reset}`);
      
      if (stats.totalKeys) {
        console.log(`${colors.green}  └─ Total translation keys: ${stats.totalKeys}${colors.reset}`);
      }
      
      if (stats.missingTranslations) {
        console.log(`${colors.yellow}  └─ Missing translations: ${Object.keys(stats.missingTranslations).length}${colors.reset}`);
        
        if (Object.keys(stats.missingTranslations).length > 0) {
          console.log(`${colors.gray}     Sample missing keys: ${Object.keys(stats.missingTranslations).slice(0, 3).join(', ')}${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.red}✗ Translation API returned status ${response.status} ${response.statusText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error accessing Translation API: ${error.message}${colors.reset}`);
  }
}

/**
 * Test Firebase connectivity
 */
async function testFirebase() {
  printHeader('Testing Firebase Connectivity');
  
  printSubheader('Checking Firebase Configuration');
  
  // Check for Firebase environment variables
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  ];
  
  let missingVars = 0;
  
  for (const envVar of requiredVars) {
    if (process.env[envVar]) {
      console.log(`${colors.green}✓ ${envVar} is set${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${envVar} is not set${colors.reset}`);
      missingVars++;
    }
  }
  
  if (missingVars > 0) {
    console.log(`\n${colors.yellow}! ${missingVars} environment variables are missing. Make sure to set them in .env.local${colors.reset}`);
  }
  
  printSubheader('Testing Gallery API (Firebase)');
  
  try {
    const response = await fetch(`${BASE_URL}/api/gallery`);
    if (response.ok) {
      const data = await response.json();
      console.log(`${colors.green}✓ Gallery API is working${colors.reset}`);
      
      if (data.items) {
        console.log(`${colors.green}  └─ Retrieved ${data.items.length} gallery items${colors.reset}`);
        
        if (data.items.length > 0) {
          console.log(`${colors.gray}     Sample item: "${data.items[0].title}"${colors.reset}`);
        }
      } else {
        console.log(`${colors.yellow}  └─ No gallery items found${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ Gallery API returned status ${response.status} ${response.statusText}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ Error accessing Gallery API: ${error.message}${colors.reset}`);
  }
}

/**
 * Test responsive design
 */
async function testResponsiveDesign() {
  printHeader('Testing Responsive Design');
  
  console.log(`${colors.yellow}! This is a manual check. Please verify the website on different devices:${colors.reset}`);
  console.log(`${colors.blue}- Mobile phones (small screens, 320px - 480px)${colors.reset}`);
  console.log(`${colors.blue}- Tablets (medium screens, 768px - 1024px)${colors.reset}`);
  console.log(`${colors.blue}- Desktops (large screens, 1200px+)${colors.reset}`);
  
  console.log(`\n${colors.green}✓ Open your browser's developer tools and use the device toolbar to test responsive layouts${colors.reset}`);
  console.log(`${colors.green}✓ Key areas to check: navigation menu, galleries, forms, and call-to-action buttons${colors.reset}`);
}

/**
 * Run all tests in sequence
 */
async function runAllTests() {
  const websiteAvailable = await testWebsiteAvailability();
  
  if (!websiteAvailable) {
    console.log(`${colors.red}Cannot continue tests without a running website.${colors.reset}`);
    return;
  }
  
  await testEndpoints();
  await testTranslations();
  await testFirebase();
  await testResponsiveDesign();
  
  printHeader('All Tests Completed');
}

/**
 * Parse command line arguments and run appropriate tests
 */
function parseArgsAndRun() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--all')) {
    runAllTests();
    return;
  }
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node ${path.basename(__filename)} [options]`);
    console.log('');
    console.log('Options:');
    console.log('  --translations   Test translation functionality');
    console.log('  --firebase       Test Firebase connectivity');
    console.log('  --endpoints      Test endpoint availability');
    console.log('  --responsive     Guidelines for checking responsive design');
    console.log('  --all            Run all tests');
    console.log('  --help, -h       Show this help message');
    return;
  }
  
  const runTests = async () => {
    const websiteAvailable = await testWebsiteAvailability();
    
    if (!websiteAvailable) {
      console.log(`${colors.red}Cannot continue tests without a running website.${colors.reset}`);
      return;
    }
    
    if (args.includes('--endpoints')) {
      await testEndpoints();
    }
    
    if (args.includes('--translations')) {
      await testTranslations();
    }
    
    if (args.includes('--firebase')) {
      await testFirebase();
    }
    
    if (args.includes('--responsive')) {
      await testResponsiveDesign();
    }
    
    printHeader('Selected Tests Completed');
  };
  
  runTests();
}

// Run the script
parseArgsAndRun(); 