const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DIRS_TO_CHECK = [
  'app',
  'components',
  'utils'
];
const FILE_EXTENSIONS = ['.tsx', '.jsx', '.ts', '.js'];

// Patterns to check
const problematicPatterns = [
  // Detect {t('key')}{text} pattern
  { regex: /\{t\(['"][\w\.-]+['"]\)\}\{[^}]+\}/g, description: 'Incorrect concatenation after t() call' },
  
  // Detect t() used in attributes that expect specific values
  { regex: /fill=\{t\(['"][\w\.-]+['"]\)\}/g, description: 'Translation in SVG fill attribute' },
  { regex: /stroke=\{t\(['"][\w\.-]+['"]\)\}/g, description: 'Translation in SVG stroke attribute' },
  { regex: /strokeLinecap=\{t\(['"][\w\.-]+['"]\)\}/g, description: 'Translation in SVG strokeLinecap attribute' },
  { regex: /strokeLinejoin=\{t\(['"][\w\.-]+['"]\)\}/g, description: 'Translation in SVG strokeLinejoin attribute' },
  
  // Detect missing closing brackets after a map
  { regex: /\)\s*\{t\(['"][\w\.-]+['"]\)\}<\/\w+>/g, description: 'Missing closing bracket after map' },
  
  // Detect malformed useState with translation
  { regex: /useState<[^>]+>\{t\(['"][\w\.-]+['"]\)\}/g, description: 'Incorrect useState with translation' },
  
  // Detect incomplete ternary operators
  { regex: /\? \([^)]+\) :[^:]*$/gm, description: 'Incomplete ternary operator' },
];

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  problematicPatterns.forEach(pattern => {
    const matches = content.match(pattern.regex);
    if (matches) {
      matches.forEach(match => {
        // Try to find the line number
        const lines = content.split('\n');
        let lineNumber = 0;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(match)) {
            lineNumber = i + 1;
            break;
          }
        }
        
        issues.push({
          pattern: pattern.description,
          match: match,
          lineNumber
        });
      });
    }
  });
  
  return issues;
}

function traverseDirectory(dir) {
  let allIssues = [];
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and .next directories
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        const subdirIssues = traverseDirectory(fullPath);
        allIssues = [...allIssues, ...subdirIssues];
      }
    } else if (entry.isFile() && FILE_EXTENSIONS.includes(path.extname(entry.name))) {
      const fileIssues = checkFile(fullPath);
      if (fileIssues.length > 0) {
        allIssues.push({
          file: fullPath,
          issues: fileIssues
        });
      }
    }
  }
  
  return allIssues;
}

function main() {
  console.log('🔍 Checking for problematic translation patterns...');
  
  let allIssues = [];
  
  for (const dir of DIRS_TO_CHECK) {
    if (fs.existsSync(dir)) {
      const issues = traverseDirectory(dir);
      allIssues = [...allIssues, ...issues];
    }
  }
  
  if (allIssues.length === 0) {
    console.log('✅ No issues found!');
    return;
  }
  
  console.log(`❌ Found ${allIssues.length} files with potential issues:`);
  
  for (const fileEntry of allIssues) {
    console.log(`\n📄 ${fileEntry.file}:`);
    
    for (const issue of fileEntry.issues) {
      console.log(`  Line ${issue.lineNumber}: ${issue.pattern}`);
      console.log(`    ${issue.match.substring(0, 100)}${issue.match.length > 100 ? '...' : ''}`);
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`  - ${allIssues.length} files with issues`);
  const totalIssues = allIssues.reduce((sum, file) => sum + file.issues.length, 0);
  console.log(`  - ${totalIssues} total issues found`);
  
  // Count by pattern type
  const patternCounts = {};
  for (const fileEntry of allIssues) {
    for (const issue of fileEntry.issues) {
      patternCounts[issue.pattern] = (patternCounts[issue.pattern] || 0) + 1;
    }
  }
  
  console.log('\n📋 Issues by type:');
  for (const [pattern, count] of Object.entries(patternCounts)) {
    console.log(`  - ${pattern}: ${count}`);
  }
}

main(); 