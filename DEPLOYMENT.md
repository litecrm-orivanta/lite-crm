# Lite CRM Deployment Guide

This guide explains how to deploy changes from your local machine to the VM.

## Quick Start

1. **First time setup** (one-time):
   ```bash
   ./setup-deployment.sh
   ```

2. **Deploy changes**:
   ```bash
   ./deploy.sh
   ```

## Configuration

- **VM IP**: `104.198.62.5`
- **VM User**: `litecrm`
- **VM Path**: `~/lite-crm`

## Deployment Options

When you run `./deploy.sh`, you'll be asked to choose:

1. **Frontend only** - Fast deployment (~30 seconds)
   - Syncs frontend files
   - Rebuilds frontend container
   - Use this for UI changes

2. **Backend only**
   - Syncs backend source code and Prisma schema
   - Rebuilds backend container
   - Use this for API changes

3. **Both frontend + backend**
   - Syncs both frontend and backend
   - Rebuilds both containers
   - Use this when you've changed both

4. **Everything**
   - Syncs all files including configs
   - Rebuilds all containers
   - Use this for major updates

## SSH Setup

If you haven't set up SSH keys yet:

1. Run the setup script:
   ```bash
   ./setup-deployment.sh
   ```

2. Or manually copy your SSH key:
   ```bash
   ssh-copy-id litecrm@104.198.62.5
   ```

## Workflow

1. **Develop locally** - Make changes on your local machine
2. **Test locally** - Validate changes work
3. **Deploy** - Run `./deploy.sh` to sync and rebuild on VM
4. **Verify** - Check the VM to ensure everything works

## Troubleshooting

### SSH Connection Issues

If you get connection errors:
```bash
# Test SSH connection
ssh litecrm@104.198.62.5

# If it asks for password, set up SSH key:
./setup-deployment.sh
```

### Deployment Fails

If deployment fails:
1. Check VM is accessible: `ping 10.128.0.2`
2. Check SSH works: `ssh litecrm@10.128.0.2 "echo 'test'"`
3. Check disk space on VM: `ssh litecrm@10.128.0.2 "df -h"`

### Frontend Not Updating

After deployment:
1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or use incognito/private window
3. Check frontend logs: `ssh litecrm@104.198.62.5 "cd ~/lite-crm && docker compose logs frontend --tail 50"`

## Manual Deployment

If you prefer to deploy manually:

```bash
# Sync frontend
   rsync -avz --delete \
     --exclude 'node_modules' --exclude '.git' --exclude 'dist' \
     ./frontend/ litecrm@104.198.62.5:~/lite-crm/frontend/

# Rebuild on VM
ssh litecrm@104.198.62.5 "cd ~/lite-crm && docker compose build --no-cache frontend && docker compose up -d frontend"
```

## Git Workflow (Alternative)

If you prefer Git-based deployment:

1. Commit changes:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. On VM, pull and rebuild:
   ```bash
   ssh litecrm@104.198.62.5 "cd ~/lite-crm && git pull origin main && docker compose build --no-cache && docker compose up -d"
   ```

## Notes

- The deployment script excludes `node_modules`, `.git`, `dist`, and `build` directories
- Backend `.env` files are not synced (they stay on VM)
- Frontend `.env` files are not synced
- The script uses `rsync` for efficient file syncing (only changed files are transferred)
