# Deploy n8n UI Disable Changes to VM

## Step-by-Step Instructions

### 1. SSH into your VM

```bash
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-a --project=orivanta-lite-crm
```

### 2. Navigate to project directory

```bash
cd ~/lite-crm
```

### 3. Pull latest changes from git

```bash
git pull origin main
```

You should see the latest commit about disabling n8n UI access.

### 4. Rebuild frontend (since we changed frontend files)

```bash
docker compose build frontend
```

This will take a few minutes to rebuild the frontend container with the updated code.

### 5. Restart services

```bash
# Stop all services
docker compose down

# Start all services (this will use the newly built frontend image)
docker compose up -d

# Wait for services to start
sleep 15
```

### 6. Verify services are running

```bash
docker compose ps
```

You should see all services (backend, frontend, db, n8n) with status "Up".

### 7. Check frontend logs (optional)

```bash
docker compose logs frontend | tail -30
```

Look for any errors. Should see Nginx starting successfully.

### 8. Check backend logs (optional)

```bash
docker compose logs backend | tail -30
```

Backend should be running normally.

### 9. Test the changes

1. Open your browser and go to: `https://litecrm.orivanta.ai` (or `http://litecrm.orivanta.ai` if HTTPS not set up)
2. Log in to Lite CRM
3. Navigate to **Workflows** page
4. You should **NOT** see any "Open n8n Editor" or "Open in n8n" buttons
5. Click on **Workflow Configuration** - verify no n8n UI links are present
6. Verify workflows still trigger correctly by creating a test lead (if you have workflows configured)

## What Changed

- ✅ All n8n UI access links removed from frontend
- ✅ Users can only configure workflows via Lite CRM UI
- ✅ Workflow triggering via webhooks still works (backend unchanged)
- ✅ n8n UI is now admin-only/internal use only

## Troubleshooting

### If frontend build fails:
```bash
# Check build logs
docker compose build frontend 2>&1 | tail -50
```

### If services won't start:
```bash
# Check all logs
docker compose logs | tail -100
```

### If you need to check what changed:
```bash
# See git log
git log --oneline -5

# See what files changed
git diff HEAD~1 --name-only
```

### If you need to rollback (unlikely):
```bash
git reset --hard HEAD~1
docker compose build frontend
docker compose restart frontend
```

## Expected Result

After deployment:
- ✅ No n8n UI links visible to users
- ✅ Workflow configuration page works normally
- ✅ Users can map events to workflows
- ✅ Workflows still trigger automatically via webhooks
- ✅ n8n UI accessible only via direct URL (admin-only)

## Notes

- n8n UI is still running on port 5678 (for admin/internal use)
- Backend workflow triggering functionality is unchanged
- Only frontend UI changes were made (removed links/buttons)
- No database changes required
- No backend code changes
