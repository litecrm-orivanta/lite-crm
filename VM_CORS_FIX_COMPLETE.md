# Complete CORS Fix

## Issues Found and Fixed

### Issue 1: Nginx Proxy Configuration
- **Problem**: nginx.conf was using container name `lite-crm-backend-1` instead of service name `backend`
- **Fix**: Changed to use Docker service name `backend:3000`
- **Status**: ✅ Fixed and pushed

### Issue 2: Frontend API Calls
- **Problem**: `apiFetch.ts` was using `http://localhost:3000` as default, bypassing nginx proxy
- **Fix**: Changed default to `/api` (relative path) so nginx can proxy requests
- **Status**: ✅ Fixed and pushed

### Issue 3: Google OAuth Redirect
- **Problem**: Google login redirect was using `http://localhost:3000/auth/google`
- **Fix**: Changed to `/api/auth/google` (relative path)
- **Status**: ✅ Fixed and pushed

## On VM - Pull and Rebuild Frontend

```bash
cd ~/lite-crm
git pull
docker compose build frontend
docker compose restart frontend
```

Or rebuild everything:

```bash
docker compose down
docker compose up -d --build
```

## How It Works Now

1. Frontend makes request to `/api/auth/login`
2. Nginx receives request at `/api/`
3. Nginx proxies to `backend:3000/` (strips `/api` prefix)
4. Backend receives request at `/auth/login`
5. Backend responds
6. Nginx forwards response to frontend

This eliminates CORS issues because:
- All requests go through nginx (same origin)
- Nginx handles the proxy to backend
- Browser sees same origin (http://104.198.62.5)

## Verify

After restart, test:
- Login page should work
- Signup should work
- No CORS errors in browser console
