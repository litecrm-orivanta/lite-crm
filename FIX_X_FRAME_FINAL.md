# Fix X-Frame-Options - Final Solution

## Problem
n8n sets `X-Frame-Options: sameorigin` which blocks iframe embedding.

## Solution Applied

### 1. Updated Proxy Controller
- Removes `X-Frame-Options` header from n8n responses
- Allows iframe embedding through proxy

### 2. Updated WorkflowEditor
- Now uses `/api/n8n-proxy/` instead of direct n8n URL
- Proxy handles authentication and removes blocking headers

## Rebuild Required

You need to rebuild **both** frontend and backend:

```bash
# Rebuild backend (proxy changes)
docker-compose build --no-cache backend

# Rebuild frontend (editor changes)
docker-compose build --no-cache frontend

# Restart both
docker-compose up -d backend frontend
```

## How It Works Now

```
Browser → Frontend (iframe)
    ↓
Requests: /api/n8n-proxy/
    ↓
Backend Proxy
    ↓
Removes X-Frame-Options header
    ↓
Forwards to n8n (with auth)
    ↓
Returns response (without X-Frame-Options)
    ↓
Iframe can display n8n!
```

## After Rebuild

1. **Hard refresh browser**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Go to Workflows** → Click "Open Editor"
3. **Iframe should load** without X-Frame-Options error

## Verify

After rebuild, check browser console (F12):
- ✅ No "X-Frame-Options" errors
- ✅ Iframe loads n8n editor
- ✅ Can create/edit workflows

## If Still Not Working

1. **Check backend logs:**
   ```bash
   docker-compose logs backend | grep n8n-proxy
   ```

2. **Test proxy directly:**
   ```bash
   curl http://localhost:3000/api/n8n-proxy/ \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check response headers:**
   - Should NOT have `X-Frame-Options`
   - Should have `Access-Control-Allow-Origin: *`

## Alternative: Direct Access

If proxy doesn't work, use "Open in New Tab" button:
- Opens n8n directly (no iframe)
- Full functionality
- Workflows still trigger on CRM events
