#!/bin/bash

# Fix LanguageContext implementation
echo "Fixing LanguageContext implementation..."
find src -name "LanguageToggle.tsx" -type f -exec sed -i '' 's/const { language, setLanguage/const { language, setLanguage = () => {}/g' {} \;

# Fix any remaining errors with e parameter typing in onError handlers
echo "Fixing error handler typings..."
find src -name "*.tsx" -type f -exec sed -i '' 's/onError={(e) => {/onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {/g' {} \;

# Run TypeScript in noEmit mode to see if we've fixed issues
echo "Running TypeScript check..."
npx tsc --noEmit

echo "All fixes completed!" 