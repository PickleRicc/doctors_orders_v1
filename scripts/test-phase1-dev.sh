#!/bin/bash

# Phase 1 Testing Script - Development Environment
# Tests credential and CORS fixes in local development

set -e

echo "🧪 Phase 1 Testing - Development Environment"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to print test result
test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: $2"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAIL${NC}: $2"
    ((FAILED++))
  fi
}

echo "📋 Pre-Flight Checks"
echo "--------------------"

# Check if .env.local exists
if [ -f ".env.local" ]; then
  test_result 0 ".env.local file exists"
else
  test_result 1 ".env.local file missing - copy .env.local.example and fill in values"
  echo "Run: cp .env.local.example .env.local"
  exit 1
fi

# Check for required environment variables
if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local && ! grep -q "your-project-id" .env.local; then
  test_result 0 "NEXT_PUBLIC_SUPABASE_URL is set"
else
  test_result 1 "NEXT_PUBLIC_SUPABASE_URL not properly configured"
fi

if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local && ! grep -q "your-anon-key" .env.local; then
  test_result 0 "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
else
  test_result 1 "NEXT_PUBLIC_SUPABASE_ANON_KEY not properly configured"
fi

echo ""
echo "🔍 Security Checks"
echo "------------------"

# Check for hardcoded credentials
node scripts/verify-no-hardcoded-creds.js > /dev/null 2>&1
test_result $? "No hardcoded credentials in source code"

# Check for wildcard CORS
if grep -r "Access-Control-Allow-Origin.*\*" src/ 2>/dev/null; then
  test_result 1 "Found wildcard CORS headers"
else
  test_result 0 "No wildcard CORS headers found"
fi

echo ""
echo "🏗️  Build Test"
echo "-------------"

# Try to build the application
echo "Building application..."
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
  test_result 0 "Application builds successfully"
  
  # Check if credentials are in the build
  if grep -r "oozghvnctxihtbqzktdv" .next/ 2>/dev/null; then
    test_result 1 "Hardcoded credentials found in build"
  else
    test_result 0 "No hardcoded credentials in build"
  fi
else
  test_result 1 "Application build failed"
fi

echo ""
echo "🚀 Development Server Test"
echo "-------------------------"

# Start dev server in background
echo "Starting development server..."
npm run dev > dev-server.log 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to start
echo "Waiting for server to start..."
sleep 10

# Check if server is running
if kill -0 $DEV_SERVER_PID 2>/dev/null; then
  test_result 0 "Development server started"
  
  # Test health endpoint
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "503" ]; then
    test_result 0 "Health endpoint responding (HTTP $HTTP_CODE)"
  else
    test_result 1 "Health endpoint not responding (HTTP $HTTP_CODE)"
  fi
  
  # Test PHI API endpoint (should require auth)
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/phi/encounters 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "401" ]; then
    test_result 0 "PHI API requires authentication (HTTP 401)"
  else
    test_result 1 "PHI API authentication not working (HTTP $HTTP_CODE)"
  fi
  
  # Test that we don't get CORS errors (same-origin request)
  RESPONSE=$(curl -s http://localhost:3000/api/health 2>/dev/null || echo "")
  if echo "$RESPONSE" | grep -q "status"; then
    test_result 0 "Same-origin API requests work"
  else
    test_result 1 "Same-origin API requests failing"
  fi
  
else
  test_result 1 "Development server failed to start"
fi

# Stop dev server
if [ ! -z "$DEV_SERVER_PID" ]; then
  kill $DEV_SERVER_PID 2>/dev/null || true
  echo "Development server stopped"
fi

echo ""
echo "📊 Test Summary"
echo "==============="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Manually test authentication flow"
  echo "2. Test PHI API endpoints with valid auth"
  echo "3. Verify no CORS errors in browser console"
  echo "4. Review dev-server.log for any errors"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  echo ""
  echo "Please fix the failing tests before proceeding"
  echo "Check dev-server.log for details"
  exit 1
fi

