import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface TranslationStats {
  file: string;
  path: string;
  keyCount: number;
  nestedStructure: boolean;
  fileSize: number;
  lastModified: string;
}

interface TranslationReport {
  en: TranslationStats[];
  es: TranslationStats[];
  analysis: {
    totalEnKeys: number;
    totalEsKeys: number;
    missingInEs: string[];
    missingInEn: string[];
    potentialIssues: string[];
  };
}

export async function GET(
  request: NextRequest
) {
  try {
    const report = await generateTranslationReport();
    
    // Return the report as a formatted JSON
    return new NextResponse(JSON.stringify(report, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error generating translation report:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to generate translation report' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function generateTranslationReport(): Promise<TranslationReport> {
  const localesDir = path.join(process.cwd(), 'public', 'locales');
  
  // Get all translation files
  const enStats = await getTranslationStats(path.join(localesDir, 'en'));
  const esStats = await getTranslationStats(path.join(localesDir, 'es'));
  
  // Analyze for missing translations
  const enKeys = await getAllTranslationKeys(path.join(localesDir, 'en'));
  const esKeys = await getAllTranslationKeys(path.join(localesDir, 'es'));
  
  const missingInEs = enKeys.filter(key => !esKeys.includes(key));
  const missingInEn = esKeys.filter(key => !enKeys.includes(key));
  
  // Check for potential issues
  const potentialIssues = checkForPotentialIssues(enStats, esStats);
  
  return {
    en: enStats,
    es: esStats,
    analysis: {
      totalEnKeys: enKeys.length,
      totalEsKeys: esKeys.length,
      missingInEs,
      missingInEn,
      potentialIssues
    }
  };
}

async function getTranslationStats(dirPath: string): Promise<TranslationStats[]> {
  try {
    const stats: TranslationStats[] = [];
    
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      console.warn(`Directory does not exist: ${dirPath}`);
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      // Only process JSON files
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(dirPath, file);
      const fileStats = fs.statSync(filePath);
      
      // Read file content
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      stats.push({
        file,
        path: filePath.replace(process.cwd(), ''),
        keyCount: countKeys(content),
        nestedStructure: hasNestedStructure(content),
        fileSize: fileStats.size,
        lastModified: fileStats.mtime.toISOString()
      });
    }
    
    return stats;
  } catch (error) {
    console.error(`Error getting translation stats from ${dirPath}:`, error);
    return [];
  }
}

function countKeys(obj: any, prefix = ''): number {
  let count = 0;
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      count += countKeys(obj[key], `${prefix}${key}.`);
    } else {
      count++;
    }
  }
  
  return count;
}

function hasNestedStructure(obj: any): boolean {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      return true;
    }
  }
  return false;
}

async function getAllTranslationKeys(dirPath: string): Promise<string[]> {
  try {
    const keys: string[] = [];
    
    // Check if directory exists
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      // Only process JSON files
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(dirPath, file);
      
      // Read file content
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Get all keys
      const fileKeys = extractKeys(content);
      keys.push(...fileKeys);
    }
    
    return keys;
  } catch (error) {
    console.error(`Error getting translation keys from ${dirPath}:`, error);
    return [];
  }
}

function extractKeys(obj: any, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key in obj) {
    const currentKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys.push(...extractKeys(obj[key], currentKey));
    } else {
      keys.push(currentKey);
    }
  }
  
  return keys;
}

function checkForPotentialIssues(
  enStats: TranslationStats[],
  esStats: TranslationStats[]
): string[] {
  const issues: string[] = [];
  
  // Check if the ES translations have significantly fewer keys
  const totalEnKeys = enStats.reduce((sum, stat) => sum + stat.keyCount, 0);
  const totalEsKeys = esStats.reduce((sum, stat) => sum + stat.keyCount, 0);
  
  if (totalEsKeys < totalEnKeys * 0.9) {
    issues.push(`Spanish translations have ${totalEsKeys} keys, which is less than 90% of English keys (${totalEnKeys})`);
  }
  
  // Check for missing files
  const enFiles = new Set(enStats.map(stat => stat.file));
  const esFiles = new Set(esStats.map(stat => stat.file));
  
  for (const file of enFiles) {
    if (!esFiles.has(file)) {
      issues.push(`Spanish translation file missing: ${file}`);
    }
  }
  
  for (const file of esFiles) {
    if (!enFiles.has(file)) {
      issues.push(`English translation file missing: ${file}`);
    }
  }
  
  // Check for very old files (potentially outdated)
  const now = new Date();
  for (const stat of [...enStats, ...esStats]) {
    const lastModified = new Date(stat.lastModified);
    const daysSinceModified = (now.getTime() - lastModified.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceModified > 30) {
      issues.push(`File ${stat.file} has not been updated in ${Math.floor(daysSinceModified)} days`);
    }
  }
  
  return issues;
} 