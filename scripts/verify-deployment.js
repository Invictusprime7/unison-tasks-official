#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Checks if all environment variables and configurations are properly set
 */

console.log('🔍 Verifying Deployment Configuration...\n');

// Check environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PROJECT_ID'
];

let hasErrors = false;

console.log('📋 Checking Environment Variables:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value || value === 'your-supabase-publishable-key-here') {
    console.log(`  ❌ ${varName} - Missing or not configured`);
    hasErrors = true;
  } else {
    console.log(`  ✅ ${varName} - Configured`);
  }
});

// Check if .env file exists
console.log('\n📁 Checking Configuration Files:');
const fs = require('fs');
const path = require('path');

const files = [
  '.env',
  'supabase/config.toml',
  'vercel.json',
  'netlify.toml'
];

files.forEach(file => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`  ✅ ${file} - Found`);
  } else {
    console.log(`  ⚠️  ${file} - Not found (may be optional)`);
  }
});

// Check edge functions configuration
console.log('\n🔧 Checking Edge Functions Configuration:');
try {
  const configPath = path.join(process.cwd(), 'supabase/config.toml');
  if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    
    const expectedFunctions = [
      'ai-code-assistant',
      'ai-web-assistant',
      'ai-design-assistant',
      'web-builder-ai',
      'generate-ai-template',
      'generate-template',
      'generate-template-image',
      'generate-image',
      'generate-page',
      'copy-rewrite'
    ];
    
    expectedFunctions.forEach(func => {
      if (configContent.includes(`[functions.${func}]`)) {
        console.log(`  ✅ ${func} - Configured`);
      } else {
        console.log(`  ❌ ${func} - Missing from config`);
        hasErrors = true;
      }
    });
  }
} catch (error) {
  console.log('  ⚠️  Could not verify config.toml');
}

// Check package.json
console.log('\n📦 Checking Package Configuration:');
try {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
  );
  
  const requiredDeps = [
    '@supabase/supabase-js',
    'fabric',
    '@monaco-editor/react',
    'react',
    'react-dom'
  ];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep} - v${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - Missing`);
      hasErrors = true;
    }
  });
} catch (error) {
  console.log('  ⚠️  Could not verify package.json');
}

// Final verdict
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ VERIFICATION FAILED');
  console.log('\nPlease fix the errors above before deploying.');
  console.log('See DEPLOYMENT_GUIDE.md for detailed instructions.');
  process.exit(1);
} else {
  console.log('✅ VERIFICATION PASSED');
  console.log('\nYour project is ready for deployment!');
  console.log('\nNext steps:');
  console.log('  1. Run: npm run build');
  console.log('  2. Deploy using Lovable Publish button');
  console.log('  3. Or deploy to Vercel/Netlify with env vars configured');
  process.exit(0);
}
