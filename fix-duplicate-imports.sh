#!/bin/bash

# Fix duplicate imports in files

# Function to fix duplicates
fix_duplicates() {
  local file=$1
  echo "Fixing duplicate imports in $(basename "$file")"
  
  # Create a temporary file
  local temp_file=$(mktemp)
  
  # Get first occurrence line number of useTranslation import
  local first_import=$(grep -n "import { useTranslation } from 'react-i18next'" "$file" | head -n1 | cut -d: -f1)
  
  if [[ -z "$first_import" ]]; then
    # Try with double quotes
    first_import=$(grep -n "import { useTranslation } from \"react-i18next\"" "$file" | head -n1 | cut -d: -f1)
  fi
  
  if [[ -n "$first_import" ]]; then
    # Keep first occurrence, remove others
    awk "NR==$first_import {print; found=1; next} 
        /import.*useTranslation.*from.*react-i18next/ {if(found) next}
        {print}" "$file" > "$temp_file"
    
    # Replace original file
    mv "$temp_file" "$file"
  else
    echo "No useTranslation import found in $file"
  fi
}

# List of files to fix
files=(
  "src/app/booking/page.tsx"
  "src/app/gallery/page.tsx"
  "src/components/HomeHero.tsx"
  "src/components/TestimonialSpotlight.tsx"
  "src/components/Services.tsx"
  "src/components/SalvadoreanHeritageSection.tsx"
  "src/components/TranslationWrapper.tsx"
  "src/components/ServiceCard.tsx"
)

# Fix each file
for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    fix_duplicates "$file"
  else
    echo "File $file not found"
  fi
done

echo "All duplicate imports fixed!" 