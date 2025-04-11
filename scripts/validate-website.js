const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting website validation checks...');

// Check 1: Verify Next.js project structure
console.log('\n📁 Checking project structure...');
const requiredFiles = [
  'next.config.js',
  'package.json',
  'tsconfig.json',
  'app/layout.tsx',
  'app/page.tsx'
];

const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
if (missingFiles.length === 0) {
  console.log('✅ All required project files are present.');
} else {
  console.log('❌ Missing required files:');
  missingFiles.forEach(file => console.log(`   - ${file}`));
}

// Check 2: Verify translation files
console.log('\n🌐 Checking translation files...');
const localesDirs = ['public/locales/en', 'public/locales/es'];
const missingLocalesDirs = localesDirs.filter(dir => !fs.existsSync(dir));

if (missingLocalesDirs.length === 0) {
  console.log('✅ Locale directories found.');
  
  // Check if common.json exists in each locale directory
  const commonFiles = localesDirs.map(dir => path.join(dir, 'common.json'));
  const missingCommonFiles = commonFiles.filter(file => !fs.existsSync(file));
  
  if (missingCommonFiles.length === 0) {
    console.log('✅ Translation files found in all locales.');
    
    // Check translation files size to ensure they have content
    let translationStats = [];
    for (const file of commonFiles) {
      const stats = fs.statSync(file);
      translationStats.push({
        file,
        size: stats.size,
        isEmpty: stats.size < 10
      });
    }
    
    const emptyTranslations = translationStats.filter(stat => stat.isEmpty);
    if (emptyTranslations.length === 0) {
      console.log('✅ Translation files contain content.');
    } else {
      console.log('❌ Empty translation files detected:');
      emptyTranslations.forEach(stat => console.log(`   - ${stat.file}`));
    }
  } else {
    console.log('❌ Missing translation files:');
    missingCommonFiles.forEach(file => console.log(`   - ${file}`));
  }
} else {
  console.log('❌ Missing locale directories:');
  missingLocalesDirs.forEach(dir => console.log(`   - ${dir}`));
}

// Check 3: Look for problematic patterns
console.log('\n🐞 Scanning for known problematic patterns...');
try {
  console.log('\n--- Translation Syntax Issues ---');
  execSync('node scripts/check-translation-syntax.js', { stdio: 'inherit' });
} catch (error) {
  console.log('❌ Error running check-translation-syntax.js script.');
}

// Check 4: Look for missing event handlers
console.log('\n--- Missing Event Handlers ---');
try {
  execSync('node scripts/find-missing-handlers.js', { stdio: 'inherit' });
} catch (error) {
  console.log('❌ Error running find-missing-handlers.js script.');
}

// Check 5: Try to compile the project
console.log('\n🔨 Checking if the project compiles...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript compilation successful!');
} catch (error) {
  console.log('❌ TypeScript compilation failed. Error details:');
  console.log(error.message.split('\n').slice(0, 10).join('\n'));
  console.log('...(truncated)');
}

// Check 6: Verify dependency versions
console.log('\n📦 Checking dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const nextVersion = packageJson.dependencies.next || 'not found';
  const reactVersion = packageJson.dependencies.react || 'not found';
  const typescriptVersion = packageJson.devDependencies.typescript || 'not found';
  
  console.log(`   - Next.js: ${nextVersion}`);
  console.log(`   - React: ${reactVersion}`);
  console.log(`   - TypeScript: ${typescriptVersion}`);
  
  // Check if we're using the App Router
  if (fs.existsSync('app')) {
    console.log('✅ Using App Router (recommended for Next.js 13+)');
  } else if (fs.existsSync('pages')) {
    console.log('⚠️ Using Pages Router (legacy approach)');
  } else {
    console.log('❌ Could not determine router type');
  }
} catch (error) {
  console.log('❌ Error reading package.json');
}

console.log('\n🏁 Validation complete!');
console.log('Recommendations:');
console.log('1. Start the development server with "npm run dev" and check for console errors');
console.log('2. Verify language switching works on all pages');
console.log('3. Test all forms for proper data handling');
console.log('4. Check mobile responsiveness on multiple screen sizes');
console.log('5. Review any remaining TypeScript errors'); 