#!/bin/bash

# Fix 'use client' directive placement in all page.tsx files

# Function to fix a file
fix_file() {
  local file=$1
  echo "Fixing $file..."
  
  # Create a temporary file
  local temp_file=$(mktemp)
  
  # Check if the file has 'use client' directive
  if grep -q "'use client'" "$file"; then
    # Remove 'use client' directive
    grep -v "'use client'" "$file" > "$temp_file"
    
    # Add 'use client' directive at the top
    echo "'use client';" > "$file"
    echo "" >> "$file"
    
    # Add the rest of the file
    cat "$temp_file" >> "$file"
    
    echo "Fixed 'use client' directive in $file"
  else
    echo "No 'use client' directive found in $file"
  fi
  
  # Clean up
  rm "$temp_file"
}

# Find all page.tsx files and fix them
find src/app -name "page.tsx" | while read -r file; do
  fix_file "$file"
done

echo "All page.tsx files have been fixed." 