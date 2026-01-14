# Deploy Backend - Commands for VM

## ✅ Backend Changes Pushed to Git

All Phase 1 & 2 backend endpoints have been committed and pushed:
- `/leads/kanban` - Kanban board view
- `/tasks/calendar` - Calendar view
- `/leads/export/csv` - Export to CSV
- `/leads/bulk/*` - Bulk operations
- Reports endpoints
- Saved filters endpoints

## 📥 On Your VM, Run These Commands:

```bash
cd ~/lite-crm

# Pull latest backend changes
git pull origin main

# Rebuild backend
docker compose build --no-cache backend

# Restart backend
docker compose up -d backend

# Check status
docker compose ps

# View logs if needed
docker compose logs backend --tail 50
```

## 🚀 One-Liner:

```bash
cd ~/lite-crm && git pull origin main && docker compose build --no-cache backend && docker compose up -d backend && docker compose ps
```

## ✅ After Deployment:

1. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Test Kanban board: Should load without "Forbidden" error
3. Test Calendar: Should load tasks
4. Test Reports: Should work
5. Test Export CSV: Should download file

## 🔍 If Still Getting Errors:

Check backend logs:
```bash
docker compose logs backend --tail 100 | grep -i "error\|forbidden\|kanban\|calendar"
```

Check if endpoints are registered:
```bash
docker compose exec backend sh -c "grep -r 'kanban\|calendar' src/ | head -10"
```
