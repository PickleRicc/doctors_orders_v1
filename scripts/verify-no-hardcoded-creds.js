#!/usr/bin/env node

/**
 * Security Check: Verify No Hardcoded Credentials
 * 
 * This script checks for hardcoded credentials in the codebase
 * Run before deployment to ensure no sensitive data is exposed
 * 
 * Usage: node scripts/verify-no-hardcoded-creds.js
 */

const fs = require('fs');
const path = require('path');

// Patterns to search for
const PATTERNS = {
  supabaseUrl: /https:\/\/[a-z0-9]+\.supabase\.co/g,
  supabaseKey: /eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
  openaiKey: /sk-[a-zA-Z0-9]{48}/g,
  azureKey: /[a-zA-Z0-9]{88}==/g,
  postgresPassword: /postgres:\/\/[^:]+:[^@]+@/g,
};

// Files to check
const DIRECTORIES_TO_CHECK = [
  'src',
  'pages',
  'app',
  'components',
  'lib',
  'services',
  'utils'
];

// Files to exclude
const EXCLUDE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  '.env',
  '.env.local',
  '.env.example',
  '.env.local.example',
  'verify-no-hardcoded-creds.js' // exclude this script
];

let findings = [];
let filesChecked = 0;

function shouldExclude(filePath) {
  return EXCLUDE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function checkFile(filePath) {
  if (shouldExclude(filePath)) return;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    filesChecked++;
    
    Object.entries(PATTERNS).forEach(([patternName, pattern]) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          // Skip if it's in a comment explaining the pattern
          const lines = content.split('\n');
          const matchingLine = lines.find(line => line.includes(match));
          
          // Skip if it's a placeholder or example
          if (matchingLine && (
            matchingLine.includes('example') ||
            matchingLine.includes('your-') ||
            matchingLine.includes('placeholder') ||
            matchingLine.includes('process.env')
          )) {
            return;
          }
          
          findings.push({
            file: filePath,
            type: patternName,
            match: match.substring(0, 30) + '...', // Only show first 30 chars
            line: lines.findIndex(line => line.includes(match)) + 1
          });
        });
      }
    });
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
  }
}

function checkDirectory(dirPath) {
  if (shouldExclude(dirPath)) return;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        checkDirectory(fullPath);
      } else if (stats.isFile() && (
        fullPath.endsWith('.js') ||
        fullPath.endsWith('.jsx') ||
        fullPath.endsWith('.ts') ||
        fullPath.endsWith('.tsx') ||
        fullPath.endsWith('.json')
      )) {
        checkFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }
}

// Main execution
console.log('🔍 Checking for hardcoded credentials...\n');

DIRECTORIES_TO_CHECK.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    checkDirectory(dirPath);
  }
});

console.log(`📁 Files checked: ${filesChecked}\n`);

if (findings.length === 0) {
  console.log('✅ SUCCESS: No hardcoded credentials found!\n');
  process.exit(0);
} else {
  console.log(`❌ SECURITY RISK: Found ${findings.length} potential hardcoded credential(s):\n`);
  
  findings.forEach((finding, index) => {
    console.log(`${index + 1}. ${finding.type} in ${finding.file}:${finding.line}`);
    console.log(`   Pattern: ${finding.match}\n`);
  });
  
  console.log('⚠️  Please remove all hardcoded credentials before deployment!\n');
  console.log('Use environment variables instead:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
  console.log('  - OPENAI_API_KEY');
  console.log('  - AZURE_STORAGE_ACCOUNT_KEY');
  console.log('  - PGPASSWORD\n');
  
  process.exit(1);
}

