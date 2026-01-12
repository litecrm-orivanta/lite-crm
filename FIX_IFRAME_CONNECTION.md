# Fix "localhost refused to connect" in Workflow Editor

## Issue
The embedded n8n editor iframe shows "localhost refused to connect" error.

## Root Causes

### 1. n8n Not Running
n8n container might not be running or accessible.

### 2. Port Not Accessible
Port 5678 might not be exposed or accessible from browser.

### 3. CORS/Iframe Restrictions
Browser might be blocking the iframe due to security policies.

## Solutions

### Solution 1: Verify n8n is Running

```bash
# Check if n8n container is running
docker-compose ps n8n

# Check n8n logs
docker-compose logs n8n | tail -20

# Restart n8n if needed
docker-compose restart n8n
```

### Solution 2: Test n8n Direct Access

Open in browser: **http://localhost:5678**

**Expected:**
- ✅ n8n login page appears
- ✅ Can login with: `admin` / `n8n_admin_pass`

**If fails:**
- Check port 5678 is not in use: `lsof -i :5678`
- Verify docker-compose.yml has port mapping: `"5678:5678"`
- Check firewall settings

### Solution 3: Configure Environment Variable

Create/update `frontend/.env` or set build-time variable:

```env
VITE_N8N_URL=http://localhost:5678
```

Then rebuild frontend:
```bash
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### Solution 4: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors like:
   - "Refused to connect"
   - "CORS error"
   - "Mixed content"
   - "X-Frame-Options"

### Solution 5: Test Direct Access First

Before using embedded editor:
1. Open n8n directly: http://localhost:5678
2. Login and verify it works
3. Then try embedded editor

## Updated Code

The WorkflowEditor component now:
- ✅ Dynamically determines n8n URL based on hostname
- ✅ Better error messages
- ✅ Handles both localhost and Docker scenarios

## Troubleshooting Steps

### Step 1: Verify Services
```bash
docker-compose ps
```

All services should show "Up" status.

### Step 2: Test n8n Directly
```bash
curl http://localhost:5678/healthz
```

Should return `200 OK`.

### Step 3: Check Ports
```bash
# Check if port 5678 is listening
netstat -an | grep 5678
# Or on Mac
lsof -i :5678
```

### Step 4: Check Browser Console
1. Open Workflow Editor page
2. Press F12 → Console tab
3. Look for connection errors
4. Check Network tab for failed requests

### Step 5: Try Different URL

If localhost doesn't work, try:
- `http://127.0.0.1:5678`
- Or your machine's IP address

## Common Issues

### Issue: "Connection Refused"
**Cause:** n8n not running or port not accessible
**Fix:** 
```bash
docker-compose up -d n8n
docker-compose logs n8n
```

### Issue: "CORS Error"
**Cause:** n8n blocking cross-origin requests
**Fix:** Already configured in docker-compose.yml, but verify:
```yaml
- N8N_EDITOR_BASE_URL=http://localhost:5678
```

### Issue: "X-Frame-Options"
**Cause:** n8n blocking iframe embedding
**Fix:** n8n should allow embedding, but check n8n settings

### Issue: "Mixed Content"
**Cause:** HTTPS page trying to load HTTP iframe
**Fix:** Use HTTP for both or configure HTTPS properly

## Quick Fix Checklist

- [ ] n8n container is running: `docker-compose ps n8n`
- [ ] n8n is accessible: http://localhost:5678
- [ ] Port 5678 is mapped: Check docker-compose.yml
- [ ] No firewall blocking port 5678
- [ ] Browser console shows no errors
- [ ] Try "Open in New Tab" button - does it work?

## Alternative: Use Proxy (Advanced)

If direct connection doesn't work, we can use the backend proxy:

1. Update WorkflowEditor to use `/api/n8n-proxy/` instead
2. Backend proxy forwards to n8n
3. Handles authentication automatically

This is more complex but works in all scenarios.

## Expected Behavior

**When working correctly:**
- ✅ Iframe loads n8n editor
- ✅ Can see workflow canvas
- ✅ Can create/edit workflows
- ✅ No connection errors

**If still not working:**
- Use "Open in New Tab" button to access n8n directly
- Create workflows there
- They will still trigger on CRM events
