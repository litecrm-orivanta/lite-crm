# Rebuild Frontend for Workflow Editor Fix

## Yes, You Need to Rebuild!

The frontend code was updated, so you need to rebuild the Docker image.

## Quick Rebuild

```bash
# Rebuild frontend only (fastest)
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

## Verify Rebuild

After rebuild, check logs:
```bash
docker-compose logs frontend | tail -20
```

## Then Test

1. **Hard refresh browser**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Or use incognito window** to avoid cache
3. **Go to Workflows page** → Click "Open Editor"
4. **Check if iframe loads**

## If Still Not Working

### Step 1: Verify n8n is Accessible
```bash
# Check n8n is running
docker-compose ps n8n

# Test n8n directly in browser
# Open: http://localhost:5678
```

### Step 2: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for errors
4. Check Network tab for failed requests to n8n

### Step 3: Try Direct Access
Click "Open in New Tab" button - does n8n open directly?

If yes → n8n works, issue is with iframe
If no → n8n isn't accessible, fix n8n first

## Alternative: Full Rebuild

If frontend-only rebuild doesn't work:

```bash
# Stop everything
docker-compose down

# Rebuild everything
docker-compose build --no-cache

# Start everything
docker-compose up -d

# Check all services
docker-compose ps
```

## Expected After Rebuild

- ✅ Frontend has latest code
- ✅ WorkflowEditor uses dynamic URL detection
- ✅ Better error messages
- ✅ Iframe should load (if n8n is accessible)
