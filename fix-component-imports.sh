#!/bin/bash

# Fix components with incorrect import placements

# Function to fix a specific file
fix_file() {
  local file=$1
  local component=$(basename "$file" .tsx)
  echo "Fixing imports in $component..."
  
  # Create temp file
  local temp_file=$(mktemp)
  
  # Remove the incorrect import line
  grep -v "import { useTranslation } from \"react-i18next\"" "$file" > "$temp_file"
  
  # Add the import at the top after 'use client'
  sed -i '' "/use client/a\\
import { useTranslation } from 'react-i18next';" "$temp_file"
  
  # Replace the original file
  mv "$temp_file" "$file"
}

# Components that need fixing
fix_file "src/components/SalvadoreanHeritageSection.tsx"
fix_file "src/components/ServiceCard.tsx"
fix_file "src/components/Services.tsx"
fix_file "src/components/TestimonialSpotlight.tsx"
fix_file "src/components/TranslationWrapper.tsx"

echo "All component imports fixed!" 