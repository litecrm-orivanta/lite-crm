# Deploy via Git - Commands for VM

## ✅ Changes Pushed to Git

All Phase 1 & 2 frontend features have been committed and pushed to Git.

## 📥 On Your VM, Run These Commands:

```bash
cd ~/lite-crm

# Pull latest changes
git pull origin main

# Rebuild frontend
docker compose build --no-cache frontend

# Restart frontend
docker compose up -d frontend

# Check status
docker compose ps

# View logs if needed
docker compose logs frontend --tail 50
```

## 🚀 One-Liner:

```bash
cd ~/lite-crm && git pull origin main && docker compose build --no-cache frontend && docker compose up -d frontend && docker compose ps
```

## ✅ After Deployment:

1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or use incognito/private window
3. Check that all Phase 1 & 2 features are visible:
   - Export CSV button
   - Bulk operations
   - Saved filters
   - Reports page
   - Calendar page
   - Kanban page
