# Complete Validation Commands for VM

Copy and paste these commands one by one, or use the script below.

## Option 1: Run the Automated Script

```bash
# SSH into VM
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-a --project=orivanta-lite-crm

# Copy the script to VM (or create it manually)
# Then run:
cd ~/lite-crm
bash VM_VALIDATE_SCRIPT.sh
```

## Option 2: Run Commands Manually

Copy and paste each section:

### 1. Navigate and Check Git

```bash
cd ~/lite-crm
git status
git log --oneline -3
```

**Expected:** Should see commit `bc301835 feat: Disable n8n UI access...`

### 2. Pull Latest Code

```bash
git pull origin main
```

### 3. Verify Source Files (Should show NO matches)

```bash
# Check WorkflowEditor.tsx - should return nothing or "No such file"
grep -n "openN8nInNewTab\|Open n8n Editor\|n8nUrl" frontend/src/pages/WorkflowEditor.tsx || echo "✅ No n8n references found"

# Check Workflows.tsx
grep -n "Open Editor\|Open n8n" frontend/src/pages/Workflows.tsx || echo "✅ No n8n references found"

# Check WorkflowConfiguration.tsx
grep -n "Open in n8n\|Open n8n\|n8nUrl" frontend/src/pages/WorkflowConfiguration.tsx || echo "✅ No n8n references found"
```

### 4. Stop Services and Rebuild Frontend

```bash
# Stop all services
docker compose down

# Rebuild frontend (no cache to ensure fresh build)
docker compose build --no-cache frontend

# This will take 3-5 minutes
```

### 5. Start Services

```bash
docker compose up -d

# Wait for services to start
sleep 20

# Check status
docker compose ps
```

### 6. Verify Services Are Running

```bash
# Check all services
docker compose ps

# Check frontend logs
docker compose logs frontend | tail -20

# Check backend logs (should be running)
docker compose logs backend | tail -10
```

### 7. Final Verification

```bash
# Check latest commit
git log --oneline -1

# Check frontend image build time
docker images lite-crm-frontend --format "{{.CreatedAt}}"

# Verify no n8n references in source (one more time)
echo "=== Final Check ==="
grep -c "openN8nInNewTab" frontend/src/pages/WorkflowEditor.tsx || echo "✅ Clean"
grep -c "Open Editor" frontend/src/pages/Workflows.tsx || echo "✅ Clean"
```

## What to Expect

After running these commands:

1. ✅ Git should show commit `bc301835`
2. ✅ Grep commands should find NO matches (or return error)
3. ✅ Frontend should rebuild successfully
4. ✅ Services should all be "Up"
5. ✅ No errors in logs

## Browser Testing (After Deployment)

**IMPORTANT:** Clear browser cache before testing!

1. **Hard Refresh:**
   - Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or: Open DevTools (F12) → Right-click refresh button → "Empty Cache and Hard Reload"

2. **Or Test in Incognito:**
   - Open new incognito/private window
   - Navigate to: `https://litecrm.orivanta.ai/workflows`

3. **What to Look For:**
   - ❌ Should NOT see: "Open n8n Editor" button
   - ❌ Should NOT see: "Open in n8n" links
   - ✅ Should see: "Configure Workflows" button (blue)
   - ✅ Should see: "Workflow Configuration" links

## Troubleshooting

### If grep finds n8n references:
- Files weren't updated properly
- Run `git pull origin main` again
- Check `git status` for uncommitted changes

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

### If browser still shows old UI:
1. **Clear browser cache completely**
2. **Try incognito/private window**
3. **Check browser console (F12) for errors**
4. **Verify you're accessing the correct URL**
