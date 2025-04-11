#!/bin/bash

# Function to process each file
fix_file() {
  local file=$1
  echo "Fixing $file..."
  
  # Create a temporary file
  tmpfile=$(mktemp)
  
  # Check if useLanguage is being used with t
  if grep -q "const { t } = useLanguage" "$file"; then
    # Add useTranslation import if it doesn't exist
    if ! grep -q "import { useTranslation } from 'react-i18next'" "$file"; then
      # Add import after useLanguage import
      sed '/import.*useLanguage/a\
import { useTranslation } from '\''react-i18next'\'';' "$file" > "$tmpfile"
      mv "$tmpfile" "$file"
    fi
    
    # Replace const { t } = useLanguage with proper code
    sed 's/const { t } = useLanguage()/const { language } = useLanguage();\n  const { t } = useTranslation()/g' "$file" > "$tmpfile"
    mv "$tmpfile" "$file"
  fi
  
  # Fix any @/ import paths
  sed 's|@/context/LanguageContext|../../context/LanguageContext|g' "$file" > "$tmpfile"
  mv "$tmpfile" "$file"
  
  sed 's|@/components/|../../components/|g' "$file" > "$tmpfile"
  mv "$tmpfile" "$file"
}

# Process each page file
for file in src/app/**/page.tsx; do
  fix_file "$file"
done

# Process app-level components
for file in src/components/*.tsx; do
  fix_file "$file"
done

echo "All files fixed successfully!" 