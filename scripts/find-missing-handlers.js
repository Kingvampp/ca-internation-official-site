const fs = require('fs');
const path = require('path');

// Configuration
const DIRS_TO_CHECK = [
  'app',
  'components'
];
const FILE_EXTENSIONS = ['.tsx', '.jsx'];

// Patterns to check
const patterns = [
  // Find onChange handlers without corresponding function
  { regex: /onChange={(\w+)}/g, extractFunction: (match) => match.replace(/onChange={(\w+)}/, '$1') },
  // Find onClick handlers
  { regex: /onClick={(\w+)}/g, extractFunction: (match) => match.replace(/onClick={(\w+)}/, '$1') },
  // Find onSubmit handlers
  { regex: /onSubmit={(\w+)}/g, extractFunction: (match) => match.replace(/onSubmit={(\w+)}/, '$1') },
  // Find other common handlers
  { regex: /onBlur={(\w+)}/g, extractFunction: (match) => match.replace(/onBlur={(\w+)}/, '$1') },
  { regex: /onFocus={(\w+)}/g, extractFunction: (match) => match.replace(/onFocus={(\w+)}/, '$1') },
  { regex: /onMouseEnter={(\w+)}/g, extractFunction: (match) => match.replace(/onMouseEnter={(\w+)}/, '$1') },
  { regex: /onMouseLeave={(\w+)}/g, extractFunction: (match) => match.replace(/onMouseLeave={(\w+)}/, '$1') },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const missingHandlers = [];
  
  // Find all handler references
  const handlerReferences = new Set();
  patterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      matches.forEach(match => {
        const functionName = pattern.extractFunction(match);
        handlerReferences.add(functionName);
      });
    }
  });
  
  // Check if these functions are defined
  handlerReferences.forEach(handlerName => {
    // Skip functions with "handle" prefix passed directly to props
    if (handlerName.startsWith('handle') && !content.includes(`const ${handlerName}`)) {
      // Check if it's a prop passed down
      if (!new RegExp(`${handlerName}={`).test(content) && 
          !new RegExp(`${handlerName}\\(`).test(content) &&
          !content.includes(`function ${handlerName}`)) {
        missingHandlers.push(handlerName);
      }
    }
  });
  
  return missingHandlers;
}

function traverseDirectory(dir) {
  let results = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        const subdirResults = traverseDirectory(fullPath);
        results = [...results, ...subdirResults];
      }
    } else if (entry.isFile() && FILE_EXTENSIONS.includes(path.extname(entry.name))) {
      const missingHandlers = checkFile(fullPath);
      if (missingHandlers.length > 0) {
        results.push({
          file: fullPath,
          missingHandlers
        });
      }
    }
  }
  
  return results;
}

function main() {
  console.log('🔍 Checking for potentially missing function handlers...');
  
  let allResults = [];
  
  for (const dir of DIRS_TO_CHECK) {
    if (fs.existsSync(dir)) {
      const results = traverseDirectory(dir);
      allResults = [...allResults, ...results];
    }
  }
  
  if (allResults.length === 0) {
    console.log('✅ No potential issues found!');
    return;
  }
  
  console.log(`⚠️ Found ${allResults.length} files with potentially missing handlers:`);
  
  for (const result of allResults) {
    console.log(`\n📄 ${result.file}:`);
    console.log(`   Potentially missing: ${result.missingHandlers.join(', ')}`);
  }
}

main(); 