# Git Setup and Push Guide

## Current Situation

Your repository exists at: `https://github.com/litecrm-orivanta/lite-crm.git`

But git push is failing, which usually means:
1. Authentication issue (need GitHub token/password)
2. Repository is private and you need to authenticate
3. You don't have push access

## Solution Options

### Option 1: Use GitHub Personal Access Token (Recommended)

1. **Generate a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: "lite-crm-deploy"
   - Select scopes: `repo` (full control of private repositories)
   - Generate token
   - **Copy the token** (you'll only see it once!)

2. **Push using token:**
   ```bash
   cd /Users/Akash-Kumar/lite-crm
   git push https://YOUR_TOKEN@github.com/litecrm-orivanta/lite-crm.git main
   ```

   Or update remote:
   ```bash
   git remote set-url origin https://YOUR_TOKEN@github.com/litecrm-orivanta/lite-crm.git
   git push -u origin main
   ```

### Option 2: Use SSH (If you have SSH keys set up)

```bash
cd /Users/Akash-Kumar/lite-crm
git remote set-url origin git@github.com:litecrm-orivanta/lite-crm.git
git push -u origin main
```

### Option 3: Use GitHub CLI

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Authenticate
gh auth login

# Then push
git push -u origin main
```

## Quick Commit and Push (After Authentication)

```bash
cd /Users/Akash-Kumar/lite-crm

# Add all changes
git add .

# Commit
git commit -m "Add GCP deployment: vm-setup.sh, fixed Dockerfile, updated configs"

# Push
git push -u origin main
```

## After Pushing

On VM, pull the latest:

```bash
cd ~/lite-crm
git pull
bash vm-setup.sh
```
