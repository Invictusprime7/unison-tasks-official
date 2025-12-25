# AI Code Assistant Troubleshooting Guide

## Issue: AI Code Assistant Panel Failed to Load

### Root Cause Analysis

The AI Code Assistant panel may fail to load due to:
1.  Unused import causing module resolution issues
2.  Missing edge function deployment
3.  Browser console errors not being shown
4.  Component render error

### What I Just Fixed

 Commented out unused ai-client import
 Verified all required files exist
 Confirmed Supabase connection is working

### Steps to Verify the Fix

#### Step 1: Check Browser Console
1. Open http://localhost:8080/
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for any red errors
5. Report back what errors you see

#### Step 2: Navigate to the Page
1. Go to Web Builder page: http://localhost:8080/web-builder
2. OR go to Creatives page: http://localhost:8080/creatives
3. Look at the bottom of the screen for AI Code Assistant panel

#### Step 3: Check Network Tab
1. In Developer Tools, go to Network tab
2. Try to use AI Code Assistant
3. Look for failed requests to Supabase
4. Check if 'ai-code-assistant' function call fails

### Common Issues & Solutions

#### Issue: "Failed to fetch" or "Network Error"
**Solution:**
- Edge function 'ai-code-assistant' not deployed
- Go to: https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv/functions
- Check if 'ai-code-assistant' function exists
- If not, you need to deploy it

#### Issue: "Module not found" error
**Solution:**
- Run: npm install
- Restart dev server: npm run dev

#### Issue: Component doesn't render at all
**Solution:**
- Check if component is imported in the parent page
- Look in src/pages/WebBuilderPage.tsx or src/pages/Creatives.tsx

#### Issue: "Unauthorized" or 401 error
**Solution:**
- Check .env file has correct VITE_SUPABASE_PUBLISHABLE_KEY
- Verify key matches your project

### Next Steps

1. **Open browser and check console** - This is MOST IMPORTANT
2. **Take a screenshot of any errors**
3. **Share the error messages**

Without seeing the actual browser console errors, I can only guess what's wrong.

### Quick Test Commands

Run these to verify setup:

\\\powershell
# Check if dev server is running
Get-Process | Where-Object {.ProcessName -like "*node*"}

# Verify environment variables
Get-Content .env | Select-String "VITE_"

# Test Supabase connection (should return 200)
curl https://oruwtgdjurstvhgqcvbv.supabase.co/rest/v1/ -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ydXd0Z2RqdXJzdHZoZ3FjdmJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyOTE5NzIsImV4cCI6MjA3NTg2Nzk3Mn0.aOV9uab2niXhszfqCg81yzDRDg1-15XS9BL3-2bhhYM"
\\\

### Most Likely Issue

Based on experience, the most common issue is:
**Missing Edge Function Deployment**

The 'ai-code-assistant' edge function needs to be deployed to your Supabase project.

To fix:
1. Go to https://supabase.com/dashboard/project/oruwtgdjurstvhgqcvbv/functions
2. Check if 'ai-code-assistant' function exists
3. If not, you'll need to deploy it from supabase/functions/ directory

