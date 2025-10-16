# Manual GitHub Setup Instructions

If you prefer to set up the GitHub repository manually, follow these steps:

## Step 1: Provide Account Information

Please provide:
- **GitHub Username**: Your Bit and Rock GitHub username
- **Email**: Email associated with the GitHub account
- **Repository Name**: Suggested `megalabs-webapp`

## Step 2: Initialize Git Repository

```bash
# Initialize git repository
git init

# Configure git for this project (use your Bit and Rock account info)
git config user.name "YOUR_GITHUB_USERNAME"
git config user.email "YOUR_GITHUB_EMAIL"
```

## Step 3: Add Files and Commit

```bash
# Add all files to staging
git add .

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
```

## Step 4: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Sign in with your Bit and Rock account
3. Repository name: `megalabs-webapp`
4. Description: `Megalabs Web Application - Modern PWA built with Next.js, Firebase Auth, and Supabase`
5. Choose visibility (Private recommended for company projects)
6. **DO NOT** initialize with README, .gitignore, or license (we already have them)
7. Click "Create repository"

## Step 5: Connect and Push

```bash
# Add GitHub remote (replace YOUR_USERNAME with your actual username)
git remote add origin https://github.com/YOUR_USERNAME/megalabs-webapp.git

# Rename branch to main (if not already)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 6: Verify Upload

Visit your repository at: `https://github.com/YOUR_USERNAME/megalabs-webapp`

You should see all the project files including:
- ✅ README.md with project documentation
- ✅ Source code in `src/` directory
- ✅ Package.json with dependencies
- ✅ Supabase schema file
- ✅ Setup guides
- ✅ Environment configuration template

## Step 7: Set Up Repository Settings

### Branch Protection (Recommended)
1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable "Require pull request reviews before merging"
4. Enable "Require status checks to pass before merging"

### Secrets for Deployment
1. Go to Settings > Secrets and variables > Actions
2. Add repository secrets for deployment:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

## Troubleshooting

### Authentication Issues
If you have problems with authentication:

```bash
# Check current git config
git config --list

# Set global config if needed
git config --global user.name "YOUR_GITHUB_USERNAME"
git config --global user.email "YOUR_GITHUB_EMAIL"

# Or use SSH instead of HTTPS
git remote set-url origin git@github.com:YOUR_USERNAME/megalabs-webapp.git
```

### Multiple GitHub Accounts
If you have multiple GitHub accounts, use SSH keys for different accounts:

```bash
# Generate SSH key for Bit and Rock account
ssh-keygen -t rsa -b 4096 -C "your-bitandrock-email@example.com" -f ~/.ssh/id_rsa_bitandrock

# Add to SSH agent
ssh-add ~/.ssh/id_rsa_bitandrock

# Configure SSH config file
echo "Host github-bitandrock
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_rsa_bitandrock" >> ~/.ssh/config

# Use SSH remote URL
git remote set-url origin git@github-bitandrock:YOUR_USERNAME/megalabs-webapp.git
```

## Next Steps After GitHub Setup

1. **Set up Continuous Deployment**
   - Connect to Vercel or Netlify
   - Configure environment variables
   - Set up preview deployments

2. **Invite Team Members**
   - Add collaborators to the repository
   - Set up branch permissions
   - Configure code review requirements

3. **Set up Issue Templates**
   - Create templates for bug reports
   - Create templates for feature requests
   - Set up project boards

4. **Configure GitHub Actions** (Optional)
   - Set up automated testing
   - Configure deployment workflows
   - Set up code quality checks

## Security Notes

- ✅ `.env.local` is in `.gitignore` - sensitive data won't be committed
- ✅ Use repository secrets for deployment environment variables
- ✅ Enable branch protection rules
- ✅ Require code reviews for main branch
- ✅ Use private repository for company projects