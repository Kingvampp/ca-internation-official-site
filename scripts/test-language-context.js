/**
 * This is a simple script to test key functionality of the LanguageContext implementation
 * It doesn't run the actual context (since that requires a React environment),
 * but it validates the core logic and potential issues
 */

// Mock the fetch function to simulate loading translations
global.fetch = async (url) => {
  console.log(`Mocked fetch called with URL: ${url}`);
  
  // Simulate loading English translations
  if (url.includes('/en/common.json')) {
    return {
      json: async () => ({
        site: { title: 'CA International Autobody' },
        hero: { title: 'Excellence in Auto', titleHighlight: 'Restoration' },
        services: { ourServices: 'Our Services' }
      })
    };
  }
  
  // Simulate loading Spanish translations
  if (url.includes('/es/common.json')) {
    return {
      json: async () => ({
        site: { title: 'CA International Autobody' },
        hero: { title: 'Excelencia en', titleHighlight: 'Restauración Automotriz' },
        services: { ourServices: 'Nuestros Servicios' }
      })
    };
  }
  
  throw new Error('Not found');
};

// Mock localStorage
const localStorage = {
  _data: {},
  getItem(key) {
    return this._data[key];
  },
  setItem(key, value) {
    this._data[key] = value;
  },
  removeItem(key) {
    delete this._data[key];
  }
};

// Mock router
const router = {
  push: (path) => {
    console.log(`Router would navigate to: ${path}`);
  }
};

// Mock the nested t function from our actual implementation
function createTFunction(translations) {
  return function t(key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };
}

// Test function
async function testLanguageContext() {
  console.log('=== Testing LanguageContext functionality ===\n');
  
  // Test English translations
  console.log('Loading English translations...');
  const enResponse = await fetch('/locales/en/common.json');
  const enTranslations = await enResponse.json();
  
  const enT = createTFunction(enTranslations);
  console.log('English translations loaded successfully');
  
  console.log('\nTesting English translations:');
  console.log(`- Site title: ${enT('site.title')}`);
  console.log(`- Hero title: ${enT('hero.title')}`);
  console.log(`- Hero highlight: ${enT('hero.titleHighlight')}`);
  console.log(`- Services heading: ${enT('services.ourServices')}`);
  
  // Test switching to Spanish
  console.log('\nSwitching to Spanish...');
  
  // Simulate setting language in localStorage
  localStorage.setItem('language', 'es');
  
  // Load Spanish translations
  const esResponse = await fetch('/locales/es/common.json');
  const esTranslations = await esResponse.json();
  
  const esT = createTFunction(esTranslations);
  console.log('Spanish translations loaded successfully');
  
  console.log('\nTesting Spanish translations:');
  console.log(`- Site title: ${esT('site.title')}`);
  console.log(`- Hero title: ${esT('hero.title')}`);
  console.log(`- Hero highlight: ${esT('hero.titleHighlight')}`);
  console.log(`- Services heading: ${esT('services.ourServices')}`);
  
  // Test URL changing logic
  console.log('\nTesting URL handling when switching languages:');
  
  // Test case 1: Regular path
  global.window = { location: { pathname: '/services' } };
  const newPath1 = `/es${global.window.location.pathname}`;
  router.push(newPath1);
  
  // Test case 2: Path already has language prefix
  global.window = { location: { pathname: '/en/contact' } };
  const newPath2 = `/es${global.window.location.pathname.substring(3)}`;
  router.push(newPath2);
  
  console.log('\n=== Language context testing complete ===');
}

// Run the test
testLanguageContext().catch(err => {
  console.error('Error testing language context:', err);
}); 