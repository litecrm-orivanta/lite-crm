# Push to GitHub - Authentication Required

Your changes are committed locally. Now you need to push to GitHub.

## The Push Failed Because:

GitHub requires authentication. You need to authenticate first.

## Quick Solution: Use GitHub Personal Access Token

### Step 1: Create GitHub Token

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `lite-crm-deploy`
4. Expiration: 90 days (or your choice)
5. Select scope: ✅ **repo** (Full control of private repositories)
6. Click "Generate token"
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Push Using Token

Run this command (replace YOUR_TOKEN with your actual token):

```bash
cd /Users/Akash-Kumar/lite-crm
git push https://YOUR_TOKEN@github.com/litecrm-orivanta/lite-crm.git main
```

Or update remote permanently:

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/litecrm-orivanta/lite-crm.git
git push -u origin main
```

## Alternative: Use GitHub CLI

```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Push
git push -u origin main
```

## After Push Succeeds

On your VM, pull the latest:

```bash
cd ~/lite-crm
git pull
bash vm-setup.sh
```

---

**Your changes are ready to push!** Just need GitHub authentication.
