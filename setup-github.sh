#!/bin/bash

# Megalabs Web App - GitHub Setup Script
# Run this script to initialize Git and push to your Bit and Rock GitHub account

set -e  # Exit on any error

echo "🚀 Megalabs Web App - GitHub Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Error: Not in the correct project directory${NC}"
    echo "Please run this script from the megalabs-webapp root directory"
    exit 1
fi

# Check if required commands exist
command -v git >/dev/null 2>&1 || { echo -e "${RED}❌ Git is required but not installed${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed${NC}"; exit 1; }

# Get GitHub account information
echo -e "${BLUE}📝 GitHub Account Setup${NC}"
echo "Please provide your Bit and Rock GitHub account details:"
echo ""

read -p "GitHub Username: " GITHUB_USERNAME
read -p "Email address: " GITHUB_EMAIL
read -p "Repository name [megalabs-webapp]: " REPO_NAME
read -p "Make repository private? (y/N): " PRIVATE_REPO

# Set defaults
REPO_NAME=${REPO_NAME:-megalabs-webapp}
if [[ $PRIVATE_REPO =~ ^[Yy]$ ]]; then
    VISIBILITY="--private"
    VISIBILITY_TEXT="private"
else
    VISIBILITY="--public"
    VISIBILITY_TEXT="public"
fi

echo ""
echo -e "${YELLOW}📋 Configuration Summary:${NC}"
echo "Username: $GITHUB_USERNAME"
echo "Email: $GITHUB_EMAIL"
echo "Repository: $REPO_NAME"
echo "Visibility: $VISIBILITY_TEXT"
echo ""

read -p "Continue with this configuration? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 0
fi

echo ""
echo -e "${BLUE}🔧 Setting up Git configuration...${NC}"

# Initialize git if not already done
if [[ ! -d ".git" ]]; then
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Configure git for this repository (local config)
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"
echo "✅ Git user configuration set"

# Check if .env.local exists and warn about it
if [[ -f ".env.local" ]]; then
    echo ""
    echo -e "${YELLOW}⚠️  Warning: .env.local file detected${NC}"
    echo "This file contains sensitive configuration and is already in .gitignore"
    echo "Make sure to set up environment variables separately in your deployment"
fi

# Add all files
echo ""
echo -e "${BLUE}📦 Adding files to repository...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "✅ No new changes to commit"
else
    # Create initial commit
    git commit -m "Initial commit: Megalabs Web App

- NextJS 15 with TypeScript and Tailwind CSS
- Firebase Authentication with Microsoft OAuth
- Supabase database integration
- PWA capabilities with offline support
- Responsive dashboard with navigation
- User management and authentication
- Database schema with sample data
- Complete migration from B4A/B4i mobile apps

Features:
- 🔐 Firebase Auth with Microsoft OAuth
- 📱 Progressive Web App (PWA)
- 🎨 Responsive Design with Tailwind CSS
- 🔄 Supabase Database (PostgreSQL)
- 🚀 Modern Architecture with React Server Components
- 🔔 Push Notifications support
- 📊 Dashboard with user activity tracking

Ready for deployment and further development."

    echo "✅ Initial commit created"
fi

# Check if GitHub CLI is available
if command -v gh >/dev/null 2>&1; then
    echo ""
    echo -e "${BLUE}🐙 Creating GitHub repository...${NC}"
    
    # Create repository on GitHub
    if gh repo create "$GITHUB_USERNAME/$REPO_NAME" $VISIBILITY --description "Megalabs Web Application - Modern PWA built with Next.js, Firebase Auth, and Supabase" --source=. --push; then
        echo "✅ Repository created and pushed to GitHub"
        echo ""
        echo -e "${GREEN}🎉 Success! Your repository is now available at:${NC}"
        echo "https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    else
        echo -e "${YELLOW}⚠️  GitHub CLI setup needed${NC}"
        echo "Please run: gh auth login"
        echo "Then manually create the repository and push"
    fi
else
    echo ""
    echo -e "${YELLOW}📝 Manual GitHub Setup Required${NC}"
    echo "GitHub CLI not found. Please follow these steps:"
    echo ""
    echo "1. Go to https://github.com/new"
    echo "2. Repository name: $REPO_NAME"
    echo "3. Set visibility to: $VISIBILITY_TEXT"
    echo "4. Don't initialize with README (we have one)"
    echo "5. Create repository"
    echo ""
    echo "Then run these commands:"
    echo ""
    echo "git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo "git branch -M main"
    echo "git push -u origin main"
fi

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo ""
echo "1. 🔑 Set up Supabase:"
echo "   - Create project at https://supabase.com"
echo "   - Copy API keys to .env.local"
echo "   - Run the schema from supabase-schema.sql"
echo ""
echo "2. 🔥 Set up Firebase:"
echo "   - Create project at https://console.firebase.google.com"
echo "   - Enable Authentication with Microsoft provider"
echo "   - Copy config to .env.local"
echo ""
echo "3. 🚀 Deploy:"
echo "   - Vercel: Connect your GitHub repo"
echo "   - Set environment variables in deployment"
echo "   - Test the deployment"
echo ""
echo "4. 📱 Test PWA features:"
echo "   - Test installation on mobile"
echo "   - Verify offline functionality"
echo "   - Test Microsoft OAuth login"
echo ""
echo -e "${GREEN}✅ Setup complete! Happy coding! 🚀${NC}"