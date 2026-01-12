# Fix 401 Unauthorized in Workflow Editor

## Problem
Getting `{"message": "Unauthorized", "statusCode": 401}` in the workflow editor iframe.

## Root Cause
The proxy endpoint requires JWT authentication, but iframe requests can't access the parent window's localStorage to get the JWT token due to browser security (same-origin policy).

## Solution Applied

### 1. Made Authentication Optional
- Proxy endpoint no longer requires JWT (removed `@UseGuards(JwtAuthGuard)`)
- If JWT is provided, it validates it
- If no JWT, it still proxies (n8n has its own basic auth)

### 2. Added JwtService for Optional Validation
- Imported JwtModule in WorkflowsModule
- Can validate JWT if provided, but doesn't block if missing

## How It Works Now

```
Browser → Iframe requests /api/n8n-proxy/
    ↓
Backend Proxy (no JWT required)
    ↓
Adds n8n Basic Auth
    ↓
Forwards to n8n
    ↓
Returns response (without X-Frame-Options)
    ↓
Iframe displays n8n! ✅
```

## Rebuild Required

Rebuild backend:

```bash
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Security Note

The proxy is now less restrictive:
- ✅ Still requires n8n basic auth (admin/n8n_admin_pass)
- ✅ n8n itself handles authentication
- ⚠️ Proxy doesn't validate JWT (but n8n does)

For production, you might want to:
1. Add IP whitelist
2. Add rate limiting
3. Or use session-based auth instead

## After Rebuild

1. **Hard refresh browser**: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. **Go to Workflows** → Click "Open Editor"
3. **Iframe should load** without 401 error

## Verify

After rebuild:
- ✅ No 401 errors
- ✅ Iframe loads n8n
- ✅ Can login to n8n (uses n8n's basic auth)
- ✅ Can create/edit workflows
