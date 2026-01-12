# Fix JavaScript Module Loading Errors

## Problem
n8n's JavaScript files are failing to load with errors like:
- `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"`
- `Uncaught SyntaxError: Unexpected token '<'`

## Root Cause
When n8n loads in the iframe, it tries to load JavaScript files with relative paths (e.g., `base-path.js`). These requests go through the proxy, but:
1. The proxy might be returning HTML (error page) instead of JavaScript
2. Content-Type header might be wrong
3. Path resolution might be incorrect

## Solution Applied

### 1. Fixed Content-Type Headers
- Proxy now explicitly sets `Content-Type: application/javascript` for `.js` files
- Ensures proper MIME types for CSS and JSON files too

### 2. Improved Path Handling
- Better query string handling
- Added logging for debugging

### 3. Binary File Support
- Handles images, fonts, and binary files correctly

## Rebuild Required

Rebuild backend:

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

## How It Works

```
n8n HTML loads → References JS files (base-path.js, etc.)
    ↓
Browser requests: /api/n8n-proxy/base-path.js
    ↓
Backend Proxy forwards to: http://n8n:5678/base-path.js
    ↓
n8n returns JavaScript file
    ↓
Proxy sets correct Content-Type: application/javascript
    ↓
Browser receives JS file with correct MIME type ✅
```

## After Rebuild

1. **Hard refresh browser**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Go to Workflows** → Click "Open Editor"
3. **Check browser console** - should see fewer errors
4. **n8n should load** with all JavaScript modules working

## Verify

After rebuild, check:
- ✅ No "MIME type" errors
- ✅ No "Unexpected token '<'" errors
- ✅ JavaScript files load correctly
- ✅ n8n editor is functional

## If Still Not Working

### Check Backend Logs
```bash
docker-compose logs backend | grep n8n-proxy
```

Should see log entries like:
```
[n8n-proxy] Proxying: GET /base-path.js -> http://n8n:5678/base-path.js
```

### Test Proxy Directly
```bash
# Get your JWT token from browser localStorage
curl http://localhost:3000/api/n8n-proxy/base-path.js \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Should return JavaScript code, not HTML.

### Check n8n is Accessible
```bash
curl http://localhost:5678/base-path.js \
  -u admin:n8n_admin_pass
```

Should return JavaScript code.

## Alternative: Direct Access

If proxy still has issues, use "Open in New Tab" button:
- Opens n8n directly (no proxy)
- All JavaScript loads correctly
- Full functionality
- Workflows still trigger on CRM events
