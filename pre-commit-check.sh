#!/bin/bash

# Pre-commit Security Check Script
# Run this before committing to ensure no secrets are exposed

echo "🔍 Running pre-commit security checks..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for .env files
echo "1. Checking for .env files..."
if git diff --cached --name-only | grep -E "\.env$|\.env\.local$|\.env\.production$"; then
    echo -e "${RED}❌ ERROR: .env file detected in commit!${NC}"
    echo "   Remove .env files from commit"
    exit 1
else
    echo -e "${GREEN}✅ No .env files in commit${NC}"
fi
echo ""

# Check for common secret patterns
echo "2. Checking for exposed secrets..."
SECRETS_FOUND=0

# Check for API keys
if git diff --cached | grep -iE "api[_-]?key.*=.*['\"][a-zA-Z0-9]{20,}"; then
    echo -e "${RED}❌ Possible API key found!${NC}"
    SECRETS_FOUND=1
fi

# Check for passwords
if git diff --cached | grep -iE "password.*=.*['\"][^'\"]{8,}"; then
    echo -e "${RED}❌ Possible password found!${NC}"
    SECRETS_FOUND=1
fi

# Check for tokens
if git diff --cached | grep -iE "token.*=.*['\"][a-zA-Z0-9]{20,}"; then
    echo -e "${RED}❌ Possible token found!${NC}"
    SECRETS_FOUND=1
fi

# Check for Supabase keys
if git diff --cached | grep -iE "supabase.*key.*=.*['\"][a-zA-Z0-9]{20,}"; then
    echo -e "${RED}❌ Possible Supabase key found!${NC}"
    SECRETS_FOUND=1
fi

if [ $SECRETS_FOUND -eq 1 ]; then
    echo -e "${RED}❌ Secrets detected in commit!${NC}"
    echo "   Review your changes and remove any secrets"
    exit 1
else
    echo -e "${GREEN}✅ No obvious secrets detected${NC}"
fi
echo ""

# Check for large files
echo "3. Checking for large files..."
LARGE_FILES=$(git diff --cached --name-only | xargs -I {} du -k {} 2>/dev/null | awk '$1 > 1024 {print $2}')
if [ ! -z "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Large files detected (>1MB):${NC}"
    echo "$LARGE_FILES"
    echo "   Consider using Git LFS for large files"
else
    echo -e "${GREEN}✅ No large files detected${NC}"
fi
echo ""

# Check for node_modules
echo "4. Checking for node_modules..."
if git diff --cached --name-only | grep "node_modules"; then
    echo -e "${RED}❌ node_modules detected in commit!${NC}"
    echo "   Add node_modules to .gitignore"
    exit 1
else
    echo -e "${GREEN}✅ No node_modules in commit${NC}"
fi
echo ""

# Run npm audit
echo "5. Running npm audit..."
if npm audit --audit-level=high > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No high/critical vulnerabilities${NC}"
else
    echo -e "${YELLOW}⚠️  Vulnerabilities found. Run 'npm audit' for details${NC}"
fi
echo ""

# Check TypeScript
echo "6. Checking TypeScript..."
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
    echo -e "${YELLOW}⚠️  TypeScript errors found. Run 'npm run lint' for details${NC}"
fi
echo ""

echo -e "${GREEN}✨ Pre-commit checks complete!${NC}"
echo ""
echo "If all checks passed, you can proceed with commit."
echo "If warnings appeared, review them before committing."
