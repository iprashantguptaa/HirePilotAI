#!/bin/bash

# Authentication Test Script
# Tests the complete authentication flow locally or in production

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL=${1:-"http://localhost:3000"}
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="testpassword123"
TEST_USERNAME="testuser$(date +%s)"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Authentication Flow Test${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Backend URL: ${BACKEND_URL}"
echo -e "Test Email: ${TEST_EMAIL}"
echo ""

# Step 1: Health Check
echo -e "${YELLOW}[1/6] Testing backend health...${NC}"
HEALTH=$(curl -s "${BACKEND_URL}/api/health")
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend is reachable${NC}"
    echo "$HEALTH"
else
    echo -e "${RED}✗ Backend is not reachable${NC}"
    exit 1
fi
echo ""

# Step 2: Register
echo -e "${YELLOW}[2/6] Testing registration...${NC}"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"${TEST_USERNAME}\",\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}" \
    -c cookies.txt)

HTTP_CODE=$(echo "$REGISTER_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REGISTER_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 201 ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Registration failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Step 3: Check cookies were set
echo -e "${YELLOW}[3/6] Checking cookies...${NC}"
if [ -f cookies.txt ]; then
    ACCESS_TOKEN_COUNT=$(grep -c "accessToken" cookies.txt)
    REFRESH_TOKEN_COUNT=$(grep -c "refreshToken" cookies.txt)
    
    if [ "$ACCESS_TOKEN_COUNT" -gt 0 ] && [ "$REFRESH_TOKEN_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✓ Both cookies set (accessToken, refreshToken)${NC}"
        cat cookies.txt
    else
        echo -e "${RED}✗ Cookies not set properly${NC}"
        echo "Access Token Count: $ACCESS_TOKEN_COUNT"
        echo "Refresh Token Count: $REFRESH_TOKEN_COUNT"
        cat cookies.txt
        exit 1
    fi
else
    echo -e "${RED}✗ No cookies file created${NC}"
    exit 1
fi
echo ""

# Step 4: Test authenticated request
echo -e "${YELLOW}[4/6] Testing authenticated request (/api/auth/me)...${NC}"
ME_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BACKEND_URL}/api/auth/me" \
    -b cookies.txt)

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$ME_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Authenticated request successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Authenticated request failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Step 5: Test token refresh
echo -e "${YELLOW}[5/6] Testing token refresh...${NC}"
REFRESH_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/auth/refresh-token" \
    -b cookies.txt \
    -c cookies2.txt)

HTTP_CODE=$(echo "$REFRESH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$REFRESH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Token refresh successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
    
    # Verify new cookies were set
    if [ -f cookies2.txt ]; then
        echo -e "${GREEN}✓ New cookies issued${NC}"
    else
        echo -e "${RED}✗ New cookies not issued${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Token refresh failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Step 6: Test logout
echo -e "${YELLOW}[6/6] Testing logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET "${BACKEND_URL}/api/auth/logout" \
    -b cookies2.txt)

HTTP_CODE=$(echo "$LOGOUT_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$LOGOUT_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✓ Logout successful${NC}"
    echo "$RESPONSE_BODY" | jq '.'
else
    echo -e "${RED}✗ Logout failed (HTTP ${HTTP_CODE})${NC}"
    echo "$RESPONSE_BODY"
    exit 1
fi
echo ""

# Cleanup
rm -f cookies.txt cookies2.txt

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}All authentication tests passed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Test in browser with actual frontend"
echo -e "2. Verify cookies in browser DevTools"
echo -e "3. Test page refresh (should stay logged in)"
echo -e "4. Test protected routes"
