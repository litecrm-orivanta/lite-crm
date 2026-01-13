# 🚀 Deploy to Production - Custom Workflow Builder Update

## ✅ What's Been Deployed

This update includes:
- ✅ Custom workflow builder (replaced n8n)
- ✅ Meta WhatsApp Business API integration
- ✅ Enhanced Settings page with help text and examples
- ✅ New workflow node types (ChatGPT, WhatsApp, Telegram, Slack, SMS, etc.)
- ✅ Comprehensive logging for API requests/responses
- ✅ Secure credential storage with encryption

## 📋 Deployment Steps

### Step 1: SSH into Your VM

```bash
gcloud compute ssh litecrm@lite-crm-vm --zone=us-central1-c
```

### Step 2: Navigate to Project Directory

```bash
cd ~/lite-crm
```

### Step 3: Pull Latest Changes

```bash
git pull origin main
```

### Step 4: Stop Running Services

```bash
docker compose down
```

### Step 5: Rebuild and Start Services

```bash
# Rebuild containers with new code
docker compose build --no-cache

# Start services
docker compose up -d
```

### Step 6: Run Database Migrations

```bash
# Wait for backend to be ready (about 10 seconds)
sleep 10

# Run migrations
docker compose exec backend npx prisma migrate deploy
```

### Step 7: Verify Services Are Running

```bash
# Check service status
docker compose ps

# Check logs
docker compose logs --tail=50
```

All services should show "Up" status:
- ✅ `lite-crm-db-1` - PostgreSQL database
- ✅ `lite-crm-backend-1` - NestJS backend API
- ✅ `lite-crm-frontend-1` - React frontend

### Step 8: Test the Application

Open in your browser:
- **Frontend**: http://104.198.62.5 (or your VM's external IP)
- **Backend API**: http://104.198.62.5:3000

## 🔍 Verify Deployment

### Check Backend Logs

```bash
docker compose logs backend --tail=50
```

You should see:
```
[NestApplication] Nest application successfully started
API running on http://localhost:3000
```

### Check Frontend

```bash
docker compose logs frontend --tail=20
```

### Test Workflow System

1. Log into the application
2. Go to **Workflows** → Create a new workflow
3. Go to **Settings** → **Integrations** → Configure WhatsApp with Meta API credentials
4. Create a test lead to trigger the workflow

## 🆘 Troubleshooting

### If Backend Fails to Start

```bash
# Check backend logs
docker compose logs backend

# Common issues:
# 1. Database connection - check .env file
# 2. Missing migrations - run: docker compose exec backend npx prisma migrate deploy
# 3. Build errors - rebuild: docker compose build --no-cache backend
```

### If Frontend Shows 502 Error

```bash
# Check if backend is running
docker compose ps backend

# Restart backend
docker compose restart backend

# Check backend logs
docker compose logs backend --tail=50
```

### If Database Migration Fails

```bash
# Check migration status
docker compose exec backend npx prisma migrate status

# If migrations are out of sync, reset (WARNING: This will lose data)
# docker compose exec backend npx prisma migrate reset

# Or manually apply missing migrations
docker compose exec backend npx prisma migrate deploy
```

### Rebuild Everything from Scratch

```bash
# Stop and remove all containers
docker compose down -v

# Rebuild everything
docker compose build --no-cache

# Start services
docker compose up -d

# Run migrations
sleep 10
docker compose exec backend npx prisma migrate deploy
```

## 📝 Important Notes

1. **Database Migrations**: The new schema includes `WorkspaceIntegration` table and updated `WorkflowNodeType` enum. Make sure migrations run successfully.

2. **Environment Variables**: Ensure your `.env` file has all required variables:
   - Database connection string
   - JWT secret
   - Email configuration (if using email nodes)
   - Encryption key for integrations

3. **WhatsApp Integration**: After deployment, users need to configure WhatsApp integration in Settings with:
   - Access Token (from Meta Developers)
   - Phone Number ID (from Meta Business Suite)
   - API Version (default: v22.0)

4. **Old n8n Data**: If you had n8n workflows, they won't be migrated. Users need to recreate workflows using the new custom workflow builder.

## ✨ Post-Deployment Checklist

- [ ] All services are running (`docker compose ps`)
- [ ] Backend API is accessible (http://YOUR_IP:3000)
- [ ] Frontend is accessible (http://YOUR_IP)
- [ ] Can log in to the application
- [ ] Can create workflows
- [ ] Can configure integrations in Settings
- [ ] Can create leads and trigger workflows
- [ ] Check backend logs for any errors

## 🔄 Quick Update Command (For Future Updates)

If you need to update again in the future:

```bash
cd ~/lite-crm
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
sleep 10
docker compose exec backend npx prisma migrate deploy
docker compose ps
```

---

**Deployment Complete!** 🎉

Your custom workflow builder is now live in production.
