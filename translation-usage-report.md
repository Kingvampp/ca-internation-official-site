# Translation Usage Report

Generated: 2025-04-02T08:19:55.992Z

## Summary

- **Total components checked**: 39
- **Compliant components**: 36
- **Non-compliant components**: 3
- **Components needing review**: 0

## Non-Compliant Components

These components contain hardcoded text that should be translated:

### components/TranslationMonitor.tsx

Hardcoded text found:

- "Translation Monitor"

### components/layout/Navbar.tsx

Hardcoded text found:

- "Toggle mobile menu"

### components/layout/TranslationDebuggingControls.tsx

Hardcoded text found:

- "Translation Debug"
- "No logs yet"
- "Enter translation key to check"

## How to Fix

### For Client Components

1. Import the useLanguage hook:

```tsx
import { useLanguage } from '../utils/LanguageContext';
```

2. Use the hook in your component:

```tsx
const { t, language } = useLanguage();
```

3. Replace hardcoded text with translation function:

```tsx
// Before
<h1>Our Services</h1>

// After
<h1>{t('services.title')}</h1>
```

### For Server Components

1. Create a client component for the text that needs translation
2. Pass any necessary props to the client component
3. Use the translation function in the client component

Example:

```tsx
// ServerComponent.tsx
import TextClient from './TextClient';

export default function ServerComponent() {
  return (
    <div>
      <TextClient textKey="services.title" />
    </div>
  );
}

// TextClient.tsx ('use client')
import { useLanguage } from '../utils/LanguageContext';

export default function TextClient({ textKey }) {
  const { t } = useLanguage();
  return <h1>{t(textKey)}</h1>;
}
```
