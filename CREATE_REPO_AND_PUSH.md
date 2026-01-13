# Create GitHub Repository and Push

## Step 1: Create Repository on GitHub

1. Go to: https://github.com/new
   - Or: https://github.com/organizations/litecrm-orivanta/repositories/new

2. Fill in:
   - **Owner**: Select `litecrm-orivanta`
   - **Repository name**: `lite-crm`
   - **Description**: (optional) "Lite CRM - Customer Relationship Management System"
   - **Visibility**: Private (recommended) or Public
   - **DO NOT** check any boxes (README, .gitignore, license) - you already have code
   
3. Click **"Create repository"**

## Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Run these:

```bash
cd /Users/Akash-Kumar/lite-crm

# Push to the new repository
git push -u origin main
```

If it asks for authentication, you'll need a Personal Access Token:

### Get GitHub Token:

1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: `lite-crm-deploy`
4. Select scope: ✅ **repo**
5. Generate and copy the token

Then push using token:

```bash
git push https://YOUR_TOKEN@github.com/litecrm-orivanta/lite-crm.git main
```

## Step 3: Verify

After push succeeds, verify at:
https://github.com/litecrm-orivanta/lite-crm

You should see all your files there.

## Step 4: On VM - Pull and Setup

```bash
cd ~/lite-crm
git pull
bash vm-setup.sh
```

---

**Create the repository first, then push!**
