#!/usr/bin/env node

/**
 * CA Automotive Website - Fix Missing Event Handlers Script
 * --------------------------------------------------------
 * This script helps automatically implement missing event handlers
 * in the admin gallery pages that were identified by the validation script.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Scanning for missing event handlers to fix...');

// Files that need fixes with their missing handlers
const filesToFix = [
  {
    path: 'app/admin/gallery/add/page.tsx',
    missingHandlers: [
      {
        name: 'handleMainImageChange',
        implementation: `
  // Handle main image file selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setMainImageFile(null);
      setMainImagePreview('');
      return;
    }
    
    const file = e.target.files[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };`
      },
      {
        name: 'handleAfterImagesChange',
        implementation: `
  // Handle additional images file selection
  const handleAfterImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setAfterImagesFiles([]);
      setAfterImagesPreview([]);
      return;
    }
    
    const fileList = Array.from(e.target.files);
    setAfterImagesFiles(fileList);
    
    // Generate previews for all selected files
    const newPreviews: string[] = [];
    
    fileList.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === fileList.length) {
          setAfterImagesPreview([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };`
      }
    ]
  },
  {
    path: 'app/admin-dashboard/gallery/new/page.tsx',
    missingHandlers: [
      {
        name: 'handleInputChange',
        implementation: `
  // Handle input field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };`
      }
    ]
  }
];

// Process each file
filesToFix.forEach(fileInfo => {
  const filePath = path.join(process.cwd(), fileInfo.path);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fileInfo.path}`);
    return;
  }
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    // Check for each missing handler
    fileInfo.missingHandlers.forEach(handler => {
      // Only add the handler if it doesn't already exist
      if (!content.includes(`function ${handler.name}`) && !content.includes(`const ${handler.name} =`)) {
        console.log(`📝 Adding missing handler: ${handler.name} to ${fileInfo.path}`);
        
        // Find a good position to insert the handler (before the return statement)
        const returnPosition = content.indexOf('return (');
        
        if (returnPosition !== -1) {
          // Insert handler before the return statement
          content = content.slice(0, returnPosition) + 
                   handler.implementation + 
                   '\n\n' + 
                   content.slice(returnPosition);
          modified = true;
        } else {
          console.log(`⚠️ Could not find appropriate position to insert ${handler.name} in ${fileInfo.path}`);
        }
      } else {
        console.log(`✅ Handler ${handler.name} already exists in ${fileInfo.path}`);
      }
    });
    
    // Save the file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${fileInfo.path} with missing handlers`);
    } else {
      console.log(`ℹ️ No changes needed for ${fileInfo.path}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${fileInfo.path}:`, error.message);
  }
});

console.log('\n🏁 Handler fixing process completed!');
console.log('To verify the changes, run the validation script again:');
console.log('node scripts/validate-website.js'); 