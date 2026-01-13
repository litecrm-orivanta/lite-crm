# 🚨 URGENT VM FIX - Run These Commands Now

## Step 1: SSH into VM
```bash
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c
```

## Step 2: Navigate and Pull Latest
```bash
cd ~/lite-crm
git pull origin main
```

## Step 3: Check Current Status
```bash
docker compose ps
docker compose logs backend --tail=20
docker compose logs frontend --tail=20
```

## Step 4: Stop Everything
```bash
docker compose down
```

## Step 5: Rebuild Everything
```bash
docker compose build --no-cache
```

## Step 6: Start Services
```bash
docker compose up -d
```

## Step 7: Wait and Check
```bash
sleep 15
docker compose ps
```

## Step 8: Check Logs for Errors
```bash
docker compose logs backend --tail=50 | grep -i error
docker compose logs frontend --tail=50 | grep -i error
```

## Step 9: Test Backend Directly
```bash
curl http://localhost:3000/workflows
```

## Step 10: Test Frontend Proxy
```bash
curl http://localhost/api/workflows
```

## If Still Not Working - Full Reset

```bash
# Stop everything
docker compose down -v

# Remove all containers and images
docker system prune -a -f

# Pull latest code
cd ~/lite-crm
git pull origin main

# Rebuild from scratch
docker compose build --no-cache

# Start services
docker compose up -d

# Wait for startup
sleep 20

# Run migrations
docker compose exec backend npx prisma migrate deploy

# Check status
docker compose ps
docker compose logs --tail=50
```

## Quick Diagnostic Commands

```bash
# Check if backend is responding
docker compose exec backend curl http://localhost:3000/workflows

# Check if frontend can reach backend
docker compose exec frontend curl http://backend:3000/workflows

# Check nginx config
docker compose exec frontend cat /etc/nginx/conf.d/default.conf

# Check backend routes
docker compose logs backend | grep "Mapped"
```

## Expected Output

After running, you should see:
- All containers with "Up" status
- Backend logs showing "Nest application successfully started"
- Frontend logs showing nginx started
- No error messages in logs
