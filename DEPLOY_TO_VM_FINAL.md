# Final Deployment to VM - Complete Sync

## ✅ Everything Synced to Git

All changes have been committed and pushed to Git:
- ✅ Complete Prisma schema with all models
- ✅ All database migrations
- ✅ Frontend Phase 1 & 2 features
- ✅ Backend Phase 1 & 2 endpoints
- ✅ All configuration files

## 🚀 Deploy to VM - Complete Rebuild

Run this on your VM to deploy everything:

```bash
cd ~/lite-crm && \
echo "🔄 Complete Deployment" && \
echo "======================" && \
echo "" && \
echo "📥 Step 1: Pulling latest from Git..." && \
git pull origin main && \
echo "" && \
echo "🔄 Step 2: Applying database migrations..." && \
docker compose exec backend sh -c "cd /app && npx prisma migrate deploy" && \
echo "" && \
echo "🛑 Step 3: Stopping all services..." && \
docker compose down && \
echo "" && \
echo "🔨 Step 4: Rebuilding all services..." && \
docker compose build --no-cache && \
echo "" && \
echo "🚀 Step 5: Starting all services..." && \
docker compose up -d && \
sleep 10 && \
echo "" && \
echo "📊 Step 6: Service status:" && \
docker compose ps && \
echo "" && \
echo "📋 Step 7: Verifying database tables..." && \
docker compose exec db psql -U litecrm -d litecrm -c "\dt" | grep -E "Subscription|Payment|Invoice|User" && \
echo "" && \
echo "📋 Step 8: Recent backend logs:" && \
docker compose logs backend --tail 20 && \
echo "" && \
echo "✅ Deployment complete!"
```

## 🚀 One-Liner (Quick Deploy)

```bash
cd ~/lite-crm && git pull origin main && docker compose exec backend sh -c "npx prisma migrate deploy" && docker compose down && docker compose build --no-cache && docker compose up -d && sleep 10 && docker compose ps
```

## ✅ After Deployment

1. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. Test all features:
   - ✅ Create lead
   - ✅ Kanban board
   - ✅ Calendar view
   - ✅ Reports page
   - ✅ Export CSV
   - ✅ Bulk operations
   - ✅ Saved filters
   - ✅ Billing page
   - ✅ Workspace admin dashboard

## 🔍 Verify Everything

```bash
# Check services
docker compose ps

# Check backend health
curl -s http://localhost:3000/health || curl -s http://localhost:3000/

# Check frontend
curl -s http://localhost:8080 | head -5

# Check database tables
docker compose exec db psql -U litecrm -d litecrm -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Subscription', 'Payment', 'Invoice', 'User', 'Lead') ORDER BY table_name;"
```
