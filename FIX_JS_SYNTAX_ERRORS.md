# Fix JavaScript Syntax Errors

## Problem
After implementing HTML rewriting, JavaScript files were getting syntax errors:
- `posthog.init.js:16 Uncaught SyntaxError: Invalid or unexpected token`
- `_MapCache-BMHbvJCZ.js:5673 Uncaught SyntaxError: Unexpected strict mode reserved word`
- Font files failing to load

## Root Cause
The HTML rewriting was too aggressive and was also rewriting JavaScript files, breaking JavaScript syntax. For example:
- Original: `p.src = s.api_host + '/static/array.js'`
- Rewritten: `p.src = s.api_host + '/api/n8n-proxy/static/array.js'`
- This breaks the string concatenation syntax

## Solution Applied

### 1. Selective Rewriting
- **Only rewrite HTML files** - JavaScript files are left untouched (except base-path.js)
- Check content type and file extension before rewriting
- Avoid breaking JavaScript string literals and expressions

### 2. base-path.js Exception
- Only `base-path.js` gets its `BASE_PATH` variable rewritten
- All other JavaScript files are passed through unchanged

### 3. Font Path Handling
- Added CSS `url()` rewriting for font files
- Handles `@font-face` and other CSS references

### 4. Path Resolution Fix
- Fixed to handle nginx stripping `/api/` prefix
- Uses `req.originalUrl` when available, falls back to `req.url`

## Rebuild Required

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

## How It Works Now

```
1. HTML file requested
   ↓
2. Proxy gets HTML from n8n
   ↓
3. Proxy rewrites ONLY HTML:
   - src="/static/..." → src="/api/n8n-proxy/static/..."
   - href="/assets/..." → href="/api/n8n-proxy/assets/..."
   - url("/assets/...") → url("/api/n8n-proxy/assets/...")
   ↓
4. JavaScript files requested
   ↓
5. Proxy gets JS from n8n
   ↓
6. If base-path.js: Rewrite BASE_PATH only
   If other JS: Pass through unchanged ✅
   ↓
7. Browser receives correct JavaScript
```

## After Rebuild

1. **Hard refresh browser**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Go to Workflows** → Click "Open Editor"
3. **Check browser console** - should see no syntax errors
4. **n8n should load** correctly

## Verify

After rebuild, check:
- ✅ No JavaScript syntax errors
- ✅ No "Invalid or unexpected token" errors
- ✅ Font files load correctly
- ✅ All assets work through proxy
- ✅ n8n editor is functional

## Debugging

### Check What's Being Rewritten
```bash
# Check HTML response
curl -s http://localhost:3000/api/n8n-proxy/ | grep -E "(src|href)=.*n8n-proxy"

# Check base-path.js (should have BASE_PATH rewritten)
curl -s http://localhost:3000/api/n8n-proxy/static/base-path.js | grep BASE_PATH

# Check other JS files (should NOT be rewritten)
curl -s http://localhost:3000/api/n8n-proxy/static/posthog.init.js | head -20
```

### Check Backend Logs
```bash
docker-compose logs -f backend | grep n8n-proxy
```

Should see correct paths:
```
[n8n-proxy] GET /?embed=true -> http://n8n:5678/?embed=true
[n8n-proxy] GET /static/base-path.js -> http://n8n:5678/static/base-path.js
```

## Key Changes

1. **HTML-only rewriting**: JavaScript files (except base-path.js) are untouched
2. **CSS url() support**: Font paths in CSS are rewritten
3. **Path resolution**: Handles nginx proxy correctly
4. **Selective BASE_PATH**: Only base-path.js gets BASE_PATH rewritten

This ensures JavaScript syntax is preserved while still fixing absolute path issues in HTML.
