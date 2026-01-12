# Rebuild Docker Images - Get Latest Changes

Since you're using Docker, you need to rebuild the images to get the latest frontend changes (Workflows visibility fixes).

## Quick Rebuild (Recommended)

```bash
# Stop all containers
docker-compose down

# Rebuild images (no cache) and start
docker-compose up -d --build --force-recreate
```

This will:
- ✅ Rebuild frontend with latest changes
- ✅ Rebuild backend with latest changes
- ✅ Restart all services
- ✅ Use fresh images (no cache)

## Step-by-Step Rebuild

### Option 1: Rebuild Everything

```bash
# 1. Stop containers
docker-compose down

# 2. Rebuild without cache (ensures fresh build)
docker-compose build --no-cache

# 3. Start services
docker-compose up -d

# 4. Check logs
docker-compose logs -f frontend
```

### Option 2: Rebuild Only Frontend (Faster)

If you only changed frontend files:

```bash
# 1. Stop frontend
docker-compose stop frontend

# 2. Rebuild frontend only
docker-compose build --no-cache frontend

# 3. Start frontend
docker-compose up -d frontend

# 4. Check logs
docker-compose logs -f frontend
```

### Option 3: Rebuild Backend Too

If you changed backend files:

```bash
# Rebuild both frontend and backend
docker-compose build --no-cache frontend backend

# Restart them
docker-compose up -d frontend backend
```

## Verify Rebuild

### 1. Check Containers Are Running
```bash
docker-compose ps
```

All should show "Up" status.

### 2. Check Frontend Logs
```bash
docker-compose logs frontend | tail -20
```

Should show build success and server running.

### 3. Test in Browser
1. Open: http://localhost:8080
2. Login to Lite CRM
3. Check navigation bar - should see "Workflows" link
4. Check dashboard - should see "Workflows →" button

## Troubleshooting

### Issue: Still seeing old version

**Solution 1: Clear browser cache**
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or use incognito/private window

**Solution 2: Force rebuild**
```bash
docker-compose down
docker-compose build --no-cache --pull
docker-compose up -d
```

**Solution 3: Remove old images**
```bash
# Remove old frontend image
docker rmi lite-crm-frontend

# Rebuild
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Issue: Build fails

**Check:**
1. Docker is running
2. No port conflicts (8080, 3000, 5678)
3. Sufficient disk space
4. Check build logs: `docker-compose build frontend`

### Issue: Frontend not loading

**Check:**
1. Container is running: `docker-compose ps frontend`
2. Port is correct: `docker-compose ps` shows `0.0.0.0:8080->80/tcp`
3. Logs: `docker-compose logs frontend`
4. Try accessing: http://localhost:8080

## What Gets Rebuilt

### Frontend Image Includes:
- ✅ Updated `AppLayout.tsx` (Workflows link visible)
- ✅ Updated `Dashboard.tsx` (Workflows button)
- ✅ Updated `Workflows.tsx` (Open Editor button)
- ✅ New `WorkflowEditor.tsx` (Embedded editor)
- ✅ Updated routes in `App.tsx`

### Backend Image Includes:
- ✅ New `n8n-proxy.controller.ts` (Auth proxy)
- ✅ Updated `workflows.module.ts`
- ✅ Updated `workflows.service.ts`

## Expected Result After Rebuild

1. **Navigation Bar:**
   ```
   Lite CRM    [Dashboard] [Workflows] [Team]
   ```

2. **Dashboard Page:**
   ```
   Leads                                    [Workflows →]
   ```

3. **Workflows Page:**
   ```
   Workflows
   ┌─────────────────────────────────────┐
   │ Workflow Editor: Create and edit... │
   │                    [Open Editor →]  │
   └─────────────────────────────────────┘
   ```

4. **Workflow Editor:**
   - Full-screen n8n editor embedded
   - Lite CRM header visible
   - Can create/edit workflows

## Quick Commands Reference

```bash
# Full rebuild
docker-compose down && docker-compose up -d --build --force-recreate

# Frontend only
docker-compose build --no-cache frontend && docker-compose up -d frontend

# Check status
docker-compose ps

# View logs
docker-compose logs -f frontend

# Restart specific service
docker-compose restart frontend
```

## After Rebuild

1. ✅ Hard refresh browser (Ctrl+Shift+R)
2. ✅ Login to Lite CRM
3. ✅ Check navigation - should see "Workflows"
4. ✅ Click "Workflows" - should see workflows page
5. ✅ Click "Open Editor" - should see embedded n8n

If everything works, the rebuild was successful! 🎉
