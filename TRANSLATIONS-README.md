# Translations System

This document explains how the translation system works in the CA International Automotive website.

## Overview

The website supports multiple languages (currently English and Spanish) using a translation system based on JSON files and the React Context API. The system allows for:

- Dynamic language switching
- Automatic translation of new content (especially gallery items)
- Fallback to original content when translations are unavailable
- Tools for monitoring translation coverage and identifying untranslated text

## Key Components

### 1. Translation Files

Translation files are stored in:
- `public/locales/en/common.json` - English translations
- `public/locales/es/common.json` - Spanish translations

Each file contains a nested structure of translation keys and their corresponding values in that language.

### 2. Language Context Provider

The `LanguageContext` is implemented in `utils/LanguageContext.ts` and provides:

- The current language (`language`)
- A function to change the language (`setLanguage`)
- A translation function (`t`) that takes a key and returns the translated string

### 3. Translatable Components

Components that need translation should:
1. Import the `useLanguage` hook from LanguageContext
2. Use the `t` function to get translated text

Example:
```tsx
import { useLanguage } from '../utils/LanguageContext';

export default function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t('myComponent.title')}</h1>
      <p>{t('myComponent.description')}</p>
    </div>
  );
}
```

### 4. Gallery Translation System

The gallery system has special support for translations:

- `TranslatableGalleryCard` component renders gallery items with translations
- Gallery items store translation keys in their `translationKeys` field
- The `/api/translations/gallery` endpoint manages gallery translations
- Gallery creation automatically adds items to translation files

### 5. Machine Translation

Basic machine translation is available in `utils/machineTranslation.js`. This provides:

- Simple dictionary-based translation between English and Spanish
- Functions for batch translating content
- Support for integrating with external translation services

## Translation Scripts

Several utility scripts help manage translations:

### Update All Translations

```
node scripts/update-all-translations.js
```

This script:
- Scans all components for hardcoded text
- Creates translation keys based on the context
- Updates translation files with new keys
- Uses machine translation for Spanish content

### Comprehensive Translation Scan

```
node scripts/comprehensive-translation-scan.js
```

This script:
- Analyzes all components for potential hardcoded text
- Checks which components are using translations
- Verifies all translation keys exist in translation files
- Generates a detailed report of translation coverage

### Gallery Translation Management

```
node scripts/update-gallery-translations.js
```

This script:
- Updates existing gallery items with translation keys
- Adds translations to the translation files

## Best Practices

1. **Always use the translation function:** Use `t('key')` instead of hardcoded text
2. **Organize keys by component:** Use a hierarchical structure, e.g., `component.subcomponent.element`
3. **Use descriptive keys:** Make keys descriptive of the content they represent
4. **Run translation scan regularly:** Check for missing translations before deployment
5. **Handle pluralization:** For content that changes with quantity, use variables

## Adding a New Language

To add support for a new language:

1. Create a new translation file in `public/locales/[code]/common.json`
2. Update the `supportedLanguages` array in `utils/LanguageContext.ts`
3. Add the language to the language selector in `components/LanguageToggle.tsx`
4. Run the translation scan to check for missing keys 