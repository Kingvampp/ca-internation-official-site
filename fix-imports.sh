#!/bin/bash

# Fix imports in src/components
find src/components -name "*.tsx" -exec sed -i '' 's|@/context/LanguageContext|../context/LanguageContext|g' {} \;

# Fix imports in src/app subdirectories
find src/app -mindepth 1 -type d -exec sh -c 'for file in "$0"/*.tsx; do sed -i "" "s|@/context/LanguageContext|../../context/LanguageContext|g" "$file"; done' {} \;

# Fix imports in src/app root
find src/app -maxdepth 1 -name "*.tsx" -exec sed -i '' 's|@/context/LanguageContext|../context/LanguageContext|g' {} \;

# Add the useTranslation hook to files that use t() function
find src/components -name "*.tsx" -exec sed -i '' '/useLanguage/a\\nimport { useTranslation } from "react-i18next";' {} \;
find src/components -name "*.tsx" -exec sed -i '' 's|const { t } = useLanguage()|const { language } = useLanguage();\n  const { t } = useTranslation()|g' {} \;

echo "Import paths fixed!" 