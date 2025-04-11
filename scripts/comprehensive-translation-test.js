#!/usr/bin/env node

/**
 * CA Automotive Website - Comprehensive Translation Testing Script
 * ---------------------------------------------------------------
 * This script performs exhaustive testing on the translation system to ensure
 * it works flawlessly across all pages and components.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const BASE_URL = 'http://localhost:3000';
const PAGES_TO_TEST = [
  '/',
  '/about',
  '/services',
  '/gallery',
  '/testimonials',
  '/contact',
  '/booking'
];
const LANGUAGES = ['en', 'es'];
const SCREENSHOTS_DIR = path.join(process.cwd(), 'translation-test-screenshots');
const REPORT_FILE = 'translation-test-report.md';

// Ensure screenshots directory exists
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Helper function to print colored log messages
const log = {
  info: (msg) => console.log(chalk.blue('ℹ️ ' + msg)),
  success: (msg) => console.log(chalk.green('✅ ' + msg)),
  warning: (msg) => console.log(chalk.yellow('⚠️ ' + msg)),
  error: (msg) => console.log(chalk.red('❌ ' + msg)),
  divider: () => console.log(chalk.gray('—'.repeat(80)))
};

// Generate a timestamp for this test run
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

// Main test function
async function runTests() {
  log.info('Starting comprehensive translation tests...');
  log.divider();

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production use
    defaultViewport: { width: 1280, height: 800 }
  });

  const testResults = {
    pageTests: [],
    componentTests: [],
    consoleErrors: [],
    missingTranslations: {},
    overallSuccess: true,
    startTime: new Date(),
    endTime: null
  };

  try {
    // Test each page in each language
    for (const page of PAGES_TO_TEST) {
      log.info(`Testing page: ${page}`);
      
      const pageResult = {
        page,
        languages: {},
        overallSuccess: true
      };
      
      // Create a fresh page for each test
      const pageObj = await browser.newPage();
      
      // Collect console logs
      pageObj.on('console', msg => {
        const text = msg.text();
        if (text.includes('[LanguageContext]') || text.includes('[LanguageToggle]') || text.includes('[TranslationMonitor]')) {
          if (text.includes('Error') || text.includes('error') || text.includes('missing')) {
            testResults.consoleErrors.push({
              page,
              message: text
            });
            console.log(chalk.red('Console: ' + text));
          } else {
            console.log(chalk.gray('Console: ' + text));
          }
          
          // Track missing translations
          if (text.includes('Translation key not found')) {
            const matches = text.match(/Translation key not found: (.*?) \(language: (.*?)\)/);
            if (matches && matches.length >= 3) {
              const key = matches[1];
              const lang = matches[2];
              
              if (!testResults.missingTranslations[lang]) {
                testResults.missingTranslations[lang] = [];
              }
              
              if (!testResults.missingTranslations[lang].includes(key)) {
                testResults.missingTranslations[lang].push(key);
              }
            }
          }
        }
      });
      
      // Test each language on this page
      for (const language of LANGUAGES) {
        log.info(`  Testing language: ${language}`);
        
        // Navigate to the page
        await pageObj.goto(`${BASE_URL}${page}`, { waitUntil: 'networkidle0' });
        
        // Take screenshot before language change (for English)
        if (language === 'en') {
          await pageObj.screenshot({
            path: path.join(SCREENSHOTS_DIR, `${page.replace(/\//g, '-') || 'home'}-${language}-before.png`)
          });
        }
        
        // Switch language if not testing English
        if (language !== 'en') {
          // Find and click the language toggle button
          await pageObj.evaluate((lang) => {
            // Use the data-testid we added
            const button = document.querySelector(`[data-testid="language-toggle-${lang}"]`);
            if (button) button.click();
          }, language);
          
          // Wait for translations to load
          await pageObj.waitForTimeout(1000);
        }
        
        // Take screenshot after language change
        await pageObj.screenshot({
          path: path.join(SCREENSHOTS_DIR, `${page.replace(/\//g, '-') || 'home'}-${language}-after.png`)
        });
        
        // Check if URL changed after language toggle
        const currentUrl = pageObj.url();
        const urlChanged = currentUrl !== `${BASE_URL}${page}`;
        
        if (urlChanged) {
          log.error(`  URL changed after language toggle: ${currentUrl}`);
          pageResult.overallSuccess = false;
          pageResult.languages[language] = {
            success: false,
            error: `URL changed to ${currentUrl}`
          };
        } else {
          log.success(`  URL remained ${BASE_URL}${page} after language toggle`);
          
          // Check translation state from JavaScript
          const translationStats = await pageObj.evaluate(() => {
            return window.__translationStats || null;
          });
          
          if (!translationStats) {
            log.warning('  Could not get translation stats from window.__translationStats');
            pageResult.languages[language] = {
              success: false,
              error: 'Could not access translation stats'
            };
          } else {
            // Check if the current language in the stats matches the expected language
            const currentLanguage = translationStats.language;
            const matchesExpected = currentLanguage === language;
            
            if (!matchesExpected) {
              log.error(`  Language mismatch: expected ${language}, got ${currentLanguage}`);
              pageResult.overallSuccess = false;
              pageResult.languages[language] = {
                success: false,
                error: `Language mismatch: expected ${language}, got ${currentLanguage}`
              };
            } else {
              log.success(`  Language correctly set to ${language}`);
              
              // Record statistics
              pageResult.languages[language] = {
                success: true,
                stats: {
                  loaded: translationStats.stats.loaded,
                  keyCount: translationStats.stats.count,
                  missingCount: translationStats.stats.missing.length
                }
              };
              
              if (translationStats.stats.missing.length > 0) {
                log.warning(`  Found ${translationStats.stats.missing.length} missing translations`);
              } else {
                log.success('  No missing translations detected');
              }
            }
          }
        }
        
        // Test specific elements to verify their translations
        // Navbar is present on all pages
        const navbarTest = await testNavbarTranslation(pageObj, language);
        pageResult.languages[language] = {
          ...pageResult.languages[language],
          components: {
            navbar: navbarTest
          }
        };
        
        // Page-specific element tests
        if (page === '/') {
          const heroTest = await testHeroTranslation(pageObj, language);
          pageResult.languages[language].components = {
            ...pageResult.languages[language].components,
            hero: heroTest
          };
        } else if (page === '/contact') {
          const contactFormTest = await testContactFormTranslation(pageObj, language);
          pageResult.languages[language].components = {
            ...pageResult.languages[language].components,
            contactForm: contactFormTest
          };
        }
        
        // Add more page-specific tests as needed
      }
      
      // Close the page
      await pageObj.close();
      
      // Add page result to overall results
      testResults.pageTests.push(pageResult);
      
      if (!pageResult.overallSuccess) {
        testResults.overallSuccess = false;
      }
      
      log.divider();
    }
    
    // Test component-specific translations
    log.info('Testing specific components...');
    
    // Footer test (common to all pages)
    const footerTest = await testFooterTranslation(browser);
    testResults.componentTests.push(footerTest);
    
    if (!footerTest.success) {
      testResults.overallSuccess = false;
    }
    
    // Chat widget test
    const chatWidgetTest = await testChatWidgetTranslation(browser);
    testResults.componentTests.push(chatWidgetTest);
    
    if (!chatWidgetTest.success) {
      testResults.overallSuccess = false;
    }
    
    // Complete the test
    testResults.endTime = new Date();
    
    log.divider();
    if (testResults.overallSuccess) {
      log.success('All translation tests passed!');
    } else {
      log.error('Some translation tests failed. Check the report for details.');
    }
    
    // Generate and save the report
    const report = generateReport(testResults);
    fs.writeFileSync(REPORT_FILE, report);
    log.success(`Report saved to ${REPORT_FILE}`);
    
  } catch (error) {
    log.error(`Test error: ${error.message}`);
    console.error(error);
    testResults.overallSuccess = false;
    testResults.error = error.message;
  } finally {
    await browser.close();
  }

  return testResults;
}

// Helper function to test navbar translations
async function testNavbarTranslation(page, language) {
  log.info('  Testing navbar translations');
  
  try {
    // Check navigation items
    const navItems = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav a'));
      return items.map(item => item.textContent.trim());
    });
    
    const expectedNavItems = {
      en: ['Home', 'About', 'Services', 'Gallery', 'Testimonials', 'Contact'],
      es: ['Inicio', 'Acerca de', 'Servicios', 'Galería', 'Testimonios', 'Contacto']
    };
    
    // Check if at least 4 of the 6 navigation items match the expected labels
    // This accounts for some flexibility in the actual implementation
    let matchCount = 0;
    for (const expected of expectedNavItems[language]) {
      if (navItems.some(item => item.includes(expected))) {
        matchCount++;
      }
    }
    
    const success = matchCount >= 4;
    
    if (success) {
      log.success('  Navbar translations match expected values');
    } else {
      log.error('  Navbar translations do not match expected values');
      log.error(`  Found: ${navItems.join(', ')}`);
      log.error(`  Expected to include most of: ${expectedNavItems[language].join(', ')}`);
    }
    
    return {
      component: 'Navbar',
      success,
      language,
      actual: navItems,
      expected: expectedNavItems[language]
    };
  } catch (error) {
    log.error(`  Error testing navbar translations: ${error.message}`);
    return {
      component: 'Navbar',
      success: false,
      language,
      error: error.message
    };
  }
}

// Helper function to test footer translations
async function testFooterTranslation(browser) {
  log.info('Testing footer translations');
  
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    
    // Test in English first
    const enCopyright = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.textContent : '';
    });
    
    // Switch to Spanish
    await page.evaluate(() => {
      const button = document.querySelector('[data-testid="language-toggle-es"]');
      if (button) button.click();
    });
    
    await page.waitForTimeout(1000);
    
    const esCopyright = await page.evaluate(() => {
      const footer = document.querySelector('footer');
      return footer ? footer.textContent : '';
    });
    
    await page.close();
    
    // Check if the copyright text changed between languages
    const textChanged = enCopyright !== esCopyright;
    
    if (textChanged) {
      log.success('Footer translations changed between languages');
      return {
        component: 'Footer',
        success: true,
        english: enCopyright.substring(0, 50) + '...',
        spanish: esCopyright.substring(0, 50) + '...'
      };
    } else {
      log.error('Footer translations did not change between languages');
      return {
        component: 'Footer',
        success: false,
        english: enCopyright.substring(0, 50) + '...',
        spanish: esCopyright.substring(0, 50) + '...'
      };
    }
  } catch (error) {
    log.error(`Error testing footer translations: ${error.message}`);
    return {
      component: 'Footer',
      success: false,
      error: error.message
    };
  }
}

// Helper function to test hero component translations
async function testHeroTranslation(page, language) {
  log.info('  Testing hero component translations');
  
  try {
    const heroText = await page.evaluate(() => {
      const heroTitle = document.querySelector('h1');
      const heroSubtitle = document.querySelector('p.text-xl, p.text-2xl, p.text-white');
      
      return {
        title: heroTitle ? heroTitle.textContent.trim() : '',
        subtitle: heroSubtitle ? heroSubtitle.textContent.trim() : ''
      };
    });
    
    const knownTexts = {
      en: {
        titleContains: ['Excellence', 'Auto', 'Restoration'],
        subtitleContains: ['service', 'detail', 'luxury']
      },
      es: {
        titleContains: ['Excelencia', 'Auto', 'Restauración'],
        subtitleContains: ['servicio', 'detalle', 'lujo']
      }
    };
    
    // Check if the title contains some of the expected words
    const titleMatches = knownTexts[language].titleContains.some(word => 
      heroText.title.includes(word)
    );
    
    // Check if the subtitle contains some of the expected words
    const subtitleMatches = heroText.subtitle.length > 0 && knownTexts[language].subtitleContains.some(word => 
      heroText.subtitle.toLowerCase().includes(word.toLowerCase())
    );
    
    const success = titleMatches || subtitleMatches;
    
    if (success) {
      log.success('  Hero component translations match expected language');
    } else {
      log.error('  Hero component translations do not match expected language');
      log.error(`  Found: Title: "${heroText.title}", Subtitle: "${heroText.subtitle}"`);
    }
    
    return {
      component: 'Hero',
      success,
      language,
      text: heroText
    };
  } catch (error) {
    log.error(`  Error testing hero translations: ${error.message}`);
    return {
      component: 'Hero',
      success: false,
      language,
      error: error.message
    };
  }
}

// Helper function to test contact form translations
async function testContactFormTranslation(page, language) {
  log.info('  Testing contact form translations');
  
  try {
    const formTexts = await page.evaluate(() => {
      const formElements = document.querySelectorAll('form label, form button, form input[type="submit"]');
      return Array.from(formElements).map(el => el.textContent.trim()).filter(text => text.length > 0);
    });
    
    const expectedTexts = {
      en: ['Name', 'Email', 'Message', 'Send', 'Submit', 'Contact'],
      es: ['Nombre', 'Correo', 'Mensaje', 'Enviar', 'Envíe', 'Contacto']
    };
    
    // Check if at least 2 of the expected texts are found
    let matchCount = 0;
    for (const expected of expectedTexts[language]) {
      if (formTexts.some(text => text.includes(expected))) {
        matchCount++;
      }
    }
    
    const success = matchCount >= 2;
    
    if (success) {
      log.success('  Contact form translations match expected language');
    } else {
      log.error('  Contact form translations do not match expected language');
      log.error(`  Found: ${formTexts.join(', ')}`);
      log.error(`  Expected to include some of: ${expectedTexts[language].join(', ')}`);
    }
    
    return {
      component: 'ContactForm',
      success,
      language,
      actual: formTexts,
      expected: expectedTexts[language]
    };
  } catch (error) {
    log.error(`  Error testing contact form translations: ${error.message}`);
    return {
      component: 'ContactForm',
      success: false,
      language,
      error: error.message
    };
  }
}

// Helper function to test chat widget translations
async function testChatWidgetTranslation(browser) {
  log.info('Testing chat widget translations');
  
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    
    // Open the chat widget if it exists
    await page.evaluate(() => {
      const chatButton = document.querySelector('[aria-label="Open chat"], [aria-label="Chat with us"]');
      if (chatButton) chatButton.click();
    });
    
    await page.waitForTimeout(1000);
    
    // Check English text
    const enChatText = await page.evaluate(() => {
      const chatWidget = document.querySelector('.chat-widget, [role="dialog"]');
      return chatWidget ? chatWidget.textContent : '';
    });
    
    // Switch to Spanish
    await page.evaluate(() => {
      const button = document.querySelector('[data-testid="language-toggle-es"]');
      if (button) button.click();
    });
    
    await page.waitForTimeout(1000);
    
    // Check Spanish text
    const esChatText = await page.evaluate(() => {
      const chatWidget = document.querySelector('.chat-widget, [role="dialog"]');
      return chatWidget ? chatWidget.textContent : '';
    });
    
    await page.close();
    
    // If the chat widget text is the same in both languages or empty, it's not properly translated
    const hasText = enChatText.length > 10 && esChatText.length > 10;
    const isDifferent = enChatText !== esChatText;
    const success = hasText && isDifferent;
    
    if (success) {
      log.success('Chat widget translations changed between languages');
      return {
        component: 'ChatWidget',
        success: true,
        english: enChatText.substring(0, 50) + '...',
        spanish: esChatText.substring(0, 50) + '...'
      };
    } else if (!hasText) {
      log.warning('Chat widget not found or has insufficient text');
      return {
        component: 'ChatWidget',
        success: false,
        error: 'Chat widget not found or has insufficient text'
      };
    } else {
      log.error('Chat widget translations did not change between languages');
      return {
        component: 'ChatWidget',
        success: false,
        english: enChatText.substring(0, 50) + '...',
        spanish: esChatText.substring(0, 50) + '...'
      };
    }
  } catch (error) {
    log.error(`Error testing chat widget translations: ${error.message}`);
    return {
      component: 'ChatWidget',
      success: false,
      error: error.message
    };
  }
}

// Generate markdown report from test results
function generateReport(results) {
  const duration = results.endTime - results.startTime;
  const durationMinutes = Math.floor(duration / 60000);
  const durationSeconds = Math.floor((duration % 60000) / 1000);
  
  let report = `# Translation Testing Report\n\n`;
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += `**Overall Result: ${results.overallSuccess ? '✅ PASS' : '❌ FAIL'}**\n\n`;
  report += `Test duration: ${durationMinutes}m ${durationSeconds}s\n\n`;
  
  // Page results
  report += `## Page Tests\n\n`;
  for (const pageTest of results.pageTests) {
    report += `### ${pageTest.page || 'Homepage'}\n\n`;
    report += `Overall: ${pageTest.overallSuccess ? '✅ PASS' : '❌ FAIL'}\n\n`;
    
    for (const language of Object.keys(pageTest.languages)) {
      const langResult = pageTest.languages[language];
      report += `#### ${language.toUpperCase()}\n\n`;
      
      if (langResult.success === false) {
        report += `Result: ❌ FAIL\n\n`;
        if (langResult.error) {
          report += `Error: ${langResult.error}\n\n`;
        }
      } else {
        report += `Result: ✅ PASS\n\n`;
        if (langResult.stats) {
          report += `- Translations loaded: ${langResult.stats.loaded ? 'Yes' : 'No'}\n`;
          report += `- Keys loaded: ${langResult.stats.keyCount}\n`;
          report += `- Missing translations: ${langResult.stats.missingCount}\n\n`;
        }
      }
      
      if (langResult.components) {
        report += `Component Tests:\n\n`;
        
        for (const [component, test] of Object.entries(langResult.components)) {
          report += `- ${component}: ${test.success ? '✅ PASS' : '❌ FAIL'}\n`;
          
          if (!test.success && test.error) {
            report += `  - Error: ${test.error}\n`;
          }
          
          if (test.actual && test.expected) {
            report += `  - Found: ${test.actual.join(', ')}\n`;
            report += `  - Expected: ${test.expected.join(', ')}\n`;
          }
        }
        
        report += '\n';
      }
    }
  }
  
  // Component-specific tests
  if (results.componentTests.length > 0) {
    report += `## Component Tests\n\n`;
    
    for (const test of results.componentTests) {
      report += `### ${test.component}\n\n`;
      report += `Result: ${test.success ? '✅ PASS' : '❌ FAIL'}\n\n`;
      
      if (test.error) {
        report += `Error: ${test.error}\n\n`;
      }
      
      if (test.english && test.spanish) {
        report += `English content: "${test.english}"\n\n`;
        report += `Spanish content: "${test.spanish}"\n\n`;
      }
    }
  }
  
  // Console errors
  if (results.consoleErrors.length > 0) {
    report += `## Console Errors\n\n`;
    
    for (const error of results.consoleErrors) {
      report += `- **${error.page || 'General'}**: ${error.message}\n`;
    }
    
    report += '\n';
  }
  
  // Missing translations
  if (Object.keys(results.missingTranslations).length > 0) {
    report += `## Missing Translations\n\n`;
    
    for (const [language, keys] of Object.entries(results.missingTranslations)) {
      report += `### ${language.toUpperCase()}\n\n`;
      
      if (keys.length === 0) {
        report += `No missing translations detected.\n\n`;
      } else {
        report += `Missing ${keys.length} translations:\n\n`;
        for (const key of keys) {
          report += `- \`${key}\`\n`;
        }
        report += '\n';
      }
    }
  }
  
  // Recommendations
  report += `## Recommendations\n\n`;
  
  if (!results.overallSuccess) {
    report += `- Fix the failing tests highlighted above\n`;
    
    if (Object.keys(results.missingTranslations).length > 0) {
      report += `- Add the missing translation keys to the appropriate locale files\n`;
    }
    
    if (results.consoleErrors.length > 0) {
      report += `- Address console errors related to translations\n`;
    }
  } else {
    report += `- The translation system is working well! Consider adding the remaining missing translations for 100% coverage\n`;
  }
  
  report += `- Run the script regularly to catch any regression issues\n`;
  report += `- Consider automating this test in your CI/CD pipeline\n`;
  
  return report;
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 