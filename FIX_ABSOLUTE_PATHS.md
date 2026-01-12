# Fix Absolute Path Issue in n8n Embedding

## Problem
n8n's HTML uses absolute paths like `/static/base-path.js` and `/assets/index-DYKMwpCO.js`. When loaded in an iframe at `/api/n8n-proxy/`, the browser resolves these absolute paths relative to the parent page's origin (`http://localhost:8080/static/...`), not through the proxy.

This causes:
- JavaScript files return HTML (404 pages)
- MIME type errors
- n8n fails to load

## Root Cause
n8n serves assets from:
- `/static/` - for base-path.js, posthog.init.js
- `/assets/` - for all module files

When n8n's HTML has:
```html
<script src="/static/base-path.js"></script>
```

The browser resolves this as `http://localhost:8080/static/base-path.js` (parent origin), not `http://localhost:8080/api/n8n-proxy/static/base-path.js` (through proxy).

## Solution Applied

### 1. HTML Rewriting
The proxy now rewrites HTML responses to convert absolute paths to proxy paths:
- `/static/` → `/api/n8n-proxy/static/`
- `/assets/` → `/api/n8n-proxy/assets/`

### 2. JavaScript Rewriting
Also rewrites JavaScript files (like `base-path.js`) to update `BASE_PATH`:
- `window.BASE_PATH = "/"` → `window.BASE_PATH = "/api/n8n-proxy/"`

### 3. Path Resolution Fix
Fixed the proxy path resolution to correctly handle:
- Query strings
- Different URL formats
- Absolute vs relative paths

## Rebuild Required

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

## How It Works Now

```
1. Browser loads iframe: /api/n8n-proxy/?embed=true
   ↓
2. Proxy forwards to: http://n8n:5678/?embed=true
   ↓
3. n8n returns HTML with: <script src="/static/base-path.js">
   ↓
4. Proxy rewrites to: <script src="/api/n8n-proxy/static/base-path.js">
   ↓
5. Browser loads: /api/n8n-proxy/static/base-path.js
   ↓
6. Proxy forwards to: http://n8n:5678/static/base-path.js
   ↓
7. n8n returns JavaScript
   ↓
8. Proxy rewrites BASE_PATH in JS file
   ↓
9. Browser receives correct JavaScript ✅
```

## After Rebuild

1. **Hard refresh browser**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Go to Workflows** → Click "Open Editor"
3. **Check browser console** - should see no MIME type errors
4. **n8n should load** with all assets working

## Verify

After rebuild, check:
- ✅ No "MIME type" errors
- ✅ No "Unexpected token '<'" errors
- ✅ JavaScript files load correctly
- ✅ n8n editor is functional
- ✅ Can create/edit workflows

## Debugging

### Check Backend Logs
```bash
docker-compose logs -f backend | grep n8n-proxy
```

Should see:
```
[n8n-proxy] GET /?embed=true -> http://n8n:5678/?embed=true
[n8n-proxy] GET /static/base-path.js -> http://n8n:5678/static/base-path.js
[n8n-proxy] GET /assets/index-DYKMwpCO.js -> http://n8n:5678/assets/index-DYKMwpCO.js
```

### Test Direct Access
```bash
# Test n8n directly
curl http://localhost:5678/static/base-path.js -u admin:n8n_admin_pass

# Test through proxy
curl http://localhost:3000/api/n8n-proxy/static/base-path.js
```

Both should return JavaScript, not HTML.

## If Still Not Working

### Check HTML Rewriting
1. Open browser DevTools → Network tab
2. Find the main HTML request to `/api/n8n-proxy/`
3. Check Response - should have rewritten paths like `/api/n8n-proxy/static/`

### Check JavaScript Files
1. Find a JS file request (e.g., `base-path.js`)
2. Check Response - should have `window.BASE_PATH = "/api/n8n-proxy/"`

### Alternative: Direct Access
Use "Open in New Tab" button:
- Opens n8n directly (no proxy)
- All paths work correctly
- Full functionality
- Workflows still trigger on CRM events
