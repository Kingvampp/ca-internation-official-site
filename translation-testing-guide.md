# CA Automotive Translation Testing Guide

This guide outlines the process for manually testing translations on the CA Automotive website to ensure they're working correctly across all pages and components.

## Quick Testing Process

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the website in your browser:**
   http://localhost:3000

3. **Look for the Translation Monitor:**
   - In development mode, there should be a small percentage indicator in the bottom-left corner (e.g., "77% 🌐")
   - Click it to see detailed translation statistics and testing tools

4. **Test language switching:**
   - Click on the English/Spanish toggle in the navigation bar
   - Verify that the content changes language without changing the URL
   - Check that the TranslationMonitor shows the correct current language

## Comprehensive Manual Testing Checklist

### Core Components (Test on Every Page)

- [ ] **Navbar**
  - [ ] All navigation links (Home, About, Services, etc.)
  - [ ] Book Now button
  - [ ] Logo text

- [ ] **Footer**
  - [ ] Copyright text
  - [ ] Contact information
  - [ ] Quick links

- [ ] **Language Toggle**
  - [ ] Labels change between "English" and "Español"
  - [ ] Switching does not change the URL
  - [ ] Current language is visually indicated

### Page-Specific Tests

- [ ] **Homepage**
  - [ ] Hero section title and subtitle
  - [ ] Services section headings and descriptions
  - [ ] Featured cars section
  - [ ] Call-to-action buttons

- [ ] **About Page**
  - [ ] Page title and main content
  - [ ] Team member information
  - [ ] Mission statement

- [ ] **Services Page**
  - [ ] Service category names
  - [ ] Service descriptions
  - [ ] Pricing information (if present)
  - [ ] Service detail sections

- [ ] **Gallery Page**
  - [ ] Gallery title and introduction
  - [ ] Category filters
  - [ ] Image captions
  - [ ] Before/After labels

- [ ] **Testimonials Page**
  - [ ] Page title and introduction
  - [ ] Customer testimonial content
  - [ ] Customer names and locations

- [ ] **Contact Page**
  - [ ] Form labels (Name, Email, Message)
  - [ ] Submit button
  - [ ] Address and contact information
  - [ ] Success/error messages

- [ ] **Booking Page**
  - [ ] Form field labels
  - [ ] Service type options
  - [ ] Date/time selector labels
  - [ ] Success confirmation message

### Interactive Components

- [ ] **Chat Widget**
  - [ ] Open/close button label
  - [ ] Welcome message
  - [ ] Input placeholder
  - [ ] Automated responses

- [ ] **Forms**
  - [ ] Validation error messages
  - [ ] Required field indicators
  - [ ] Submit button text
  - [ ] Success messages

## Debugging Tools

### Browser Console

1. Open the browser developer tools (F12)
2. Look for logs with the following prefixes:
   - `🌎 [LanguageContext]` - Core translation system logs
   - `🔤 [LanguageToggle]` - Language switching logs
   - `🔍 [TranslationMonitor]` - Translation testing results

### Translation Testing in Console

Run these commands in the browser console to test specific translations:

```javascript
// Access translation stats
console.log(window.__translationStats);

// Test a specific translation key
function testKey(key) {
  const t = window.__translationStats?.checkTranslation;
  if (t) {
    console.log(`Key: ${key}, Translation: ${t(key)}`);
    return t(key);
  }
  return 'Translation function not available';
}

// Example usage
testKey('navigation.home');
testKey('services.title');
```

## Node.js Testing Scripts

Run these scripts from the command line to test translations:

```bash
# Run comprehensive translation tests (requires browser)
npm run test:translations

# Debug translation files and find missing keys
npm run translations:debug

# Check components for proper translation usage
npm run translations:verify

# Find and fix missing translations
npm run translations:fix-missing

# Run general website validation including translations
npm run translations:validate
```

## Common Translation Issues

### Missing Translations

If you see the translation key displayed instead of the translated text:
1. Check if the key exists in the translation files (`public/locales/[lang]/common.json`)
2. Run `npm run translations:fix-missing` to find and add missing translations
3. Look for the `[TRANSLATE]` marker in the updated files and provide translations

### URL Changes on Language Switch

If the URL changes when switching languages:
1. Check `utils/LanguageContext.tsx` to ensure URL redirection is removed
2. Verify that `setLanguage` function doesn't call `router.push()`

### Components Not Updating Language

If some components don't update when switching languages:
1. Check if the component uses the translation hook: `const { t } = useLanguage();`
2. Ensure all text is wrapped in the translation function: `{t('key')}`
3. For server components, ensure they use client components for translated content

## Translation Coverage Goals

- **Critical Components:** 100% translation coverage
- **General UI:** At least 95% translation coverage
- **Admin/Dashboard:** At least 90% translation coverage

## Reporting Issues

When reporting translation issues, please include:
1. The page where the issue occurs
2. The language being tested
3. Screenshot showing the untranslated content
4. Console logs if available

## Fixing Missing Translations

1. Run `npm run translations:fix-missing`
2. Edit the updated `public/locales/es/common.json` file
3. Find strings marked with `[TRANSLATE]` and replace with proper Spanish translations
4. Restart the dev server and test the changes 