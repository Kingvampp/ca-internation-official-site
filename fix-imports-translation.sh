#!/bin/bash

# Fix translation imports across all components

# Find all files with useTranslation but missing import
find src -name "*.tsx" -type f -exec grep -l "const { t } = useTranslation()" {} \; | while read -r file; do
  # Add import if it doesn't exist
  if ! grep -q "import { useTranslation } from 'react-i18next'" "$file"; then
    echo "Fixing imports in $file"
    sed -i '' $'s/\'use client\';/\'use client\';\\\n\\\nimport { useTranslation } from \'react-i18next\';/g' "$file"
  fi
done

# Fix LanguageContext implementation
find src -name "LanguageContext.tsx" -type f -exec sed -i '' 's/const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);/const LanguageContext = React.createContext<LanguageContextType>({ language: "en", setLanguage: () => {}, isClient: false });/g' {} \;

# Fix SalvadoreanHeritageSection component
find src -name "SalvadoreanHeritageSection.tsx" -type f -exec sed -i '' 's/const { t } = useTranslation();/import { useTranslation } from "react-i18next";\n\nconst { t } = useTranslation();/g' {} \;

# Fix ServiceCard component
find src -name "ServiceCard.tsx" -type f -exec sed -i '' 's/const { t } = useTranslation();/import { useTranslation } from "react-i18next";\n\nconst { t } = useTranslation();/g' {} \;

# Fix Services component
find src -name "Services.tsx" -type f -exec sed -i '' 's/const { t } = useTranslation();/import { useTranslation } from "react-i18next";\n\nconst { t } = useTranslation();/g' {} \;

# Fix TestimonialSpotlight component
find src -name "TestimonialSpotlight.tsx" -type f -exec sed -i '' 's/const { t } = useTranslation();/import { useTranslation } from "react-i18next";\n\nconst { t } = useTranslation();/g' {} \;

# Fix TranslationWrapper component
find src -name "TranslationWrapper.tsx" -type f -exec sed -i '' 's/const { t } = useTranslation();/import { useTranslation } from "react-i18next";\n\nconst { t } = useTranslation();/g' {} \;

echo "All translation imports fixed!" 