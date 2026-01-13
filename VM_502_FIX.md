# Fix 502 Bad Gateway Error

## The Issue

502 Bad Gateway means nginx can't reach the backend. This could be:
1. Backend service not running
2. Backend service name mismatch
3. Network connectivity issue

## Quick Diagnostics (Run on VM)

```bash
# Check if all services are running
docker compose ps

# Check backend logs
docker compose logs backend

# Check frontend logs
docker compose logs frontend

# Test if frontend container can reach backend
docker compose exec frontend ping -c 2 backend

# Or test with curl
docker compose exec frontend wget -O- http://backend:3000/health 2>&1 || echo "Backend not reachable"
```

## Common Fixes

### 1. Check Backend is Running
```bash
docker compose ps backend
# Should show "Up" status
```

### 2. Check Backend Logs for Errors
```bash
docker compose logs backend | tail -50
```

### 3. Verify Service Names Match
- docker-compose.yml service name: `backend`
- nginx.conf proxy_pass: `http://backend:3000/`
- These should match!

### 4. Restart Services
```bash
docker compose restart backend frontend
```

### 5. If Backend Won't Start
Check backend logs for errors:
```bash
docker compose logs backend
```

Common backend issues:
- Database connection failed (wait for DB to start)
- Missing .env file
- Port already in use
- Migration errors

## Full Rebuild (if needed)

```bash
docker compose down
docker compose up -d
docker compose logs -f
```
