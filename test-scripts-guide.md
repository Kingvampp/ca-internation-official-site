# CA Automotive Website Test Scripts Guide

This guide describes the testing and validation scripts available for the CA Automotive website project.

## Quick Start

To validate the website's structure and functionality:

```
node scripts/validate-website.js
```

To test site functionality including translations and Firebase:

```
node scripts/test-site-functionality.js
```

To fix missing handlers automatically:

```
node scripts/fix-missing-handlers.js
```

To check for translation syntax issues:

```
node scripts/check-translation-syntax.js
```

## Detailed Guide

### 1. Website Validation

The `validate-website.js` script performs a comprehensive check of the website structure and configuration:

- Verifies critical project files exist
- Checks for translation files and their content
- Scans for problematic patterns in code
- Looks for missing event handlers
- Attempts TypeScript compilation
- Verifies dependency versions

**Usage:**
```
node scripts/validate-website.js
```

### 2. Site Functionality Testing

The `test-site-functionality.js` script tests various aspects of the website functionality:

- Tests website availability
- Checks endpoint accessibility
- Validates translation functionality
- Tests Firebase connectivity
- Provides guidance for responsive design testing

**Usage with options:**
```
# Run all tests
node scripts/test-site-functionality.js --all

# Test just translations
node scripts/test-site-functionality.js --translations

# Test just Firebase
node scripts/test-site-functionality.js --firebase

# Test just endpoints
node scripts/test-site-functionality.js --endpoints

# Show responsive design guidance
node scripts/test-site-functionality.js --responsive
```

### 3. Fix Missing Handlers

The `fix-missing-handlers.js` script automatically implements common missing event handlers:

- Scans for specified files that need handlers
- Adds missing handlers with proper implementations
- Only adds handlers if they don't already exist

**Usage:**
```
node scripts/fix-missing-handlers.js
```

### 4. Check Translation Syntax

The `check-translation-syntax.js` script scans for problematic translation patterns:

- Detects incomplete ternary operators
- Finds missing translation functions
- Identifies translation function misuse

**Usage:**
```
node scripts/check-translation-syntax.js
```

## Development Workflow

For effective development and testing, follow this workflow:

1. Start the development server:
   ```
   npm run dev
   ```

2. Run the validation script to check for issues:
   ```
   node scripts/validate-website.js
   ```

3. Fix any identified issues.

4. Test website functionality:
   ```
   node scripts/test-site-functionality.js
   ```

5. Before committing changes, run TypeScript compilation check:
   ```
   npx tsc --noEmit
   ```

## Common Issues and Solutions

### Translation Issues

If translations aren't working:

1. Check that `/public/locales/[lang]/common.json` files exist and have content
2. Verify the LanguageContext is working (use the `--translations` test)
3. Check the browser console for translation loading logs

### Firebase Connection Issues

If Firebase functionality isn't working:

1. Ensure `.env.local` contains all required Firebase configuration
2. Run the Firebase test to check connectivity:
   ```
   node scripts/test-site-functionality.js --firebase
   ```
3. Check the Gallery API endpoint functionality

### TypeScript Errors

For TypeScript errors:

1. Run TypeScript compilation check:
   ```
   npx tsc --noEmit
   ```
2. Address errors one by one, starting with the most critical ones
3. Focus on type declarations and props validation first 