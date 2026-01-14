# Apply Migrations on VM - Commands

## ✅ Migrations Pushed to Git

All Prisma migrations including Subscription, Payment, Invoice tables have been committed and pushed to Git.

## 📥 On Your VM, Run These Commands:

```bash
cd ~/lite-crm && \
echo "📥 Step 1: Pulling latest migrations from Git..." && \
git pull origin main && \
echo "" && \
echo "🔄 Step 2: Applying Prisma migrations..." && \
docker compose exec backend sh -c "cd /app && npx prisma migrate deploy" && \
echo "" && \
echo "✅ Migrations applied!" && \
echo "" && \
echo "🔄 Step 3: Verifying tables were created..." && \
docker compose exec db psql -U litecrm -d litecrm -c "\dt" | grep -E "Subscription|Payment|Invoice" && \
echo "" && \
echo "🔄 Step 4: Restarting backend..." && \
docker compose restart backend && \
sleep 5 && \
echo "" && \
echo "📊 Step 5: Backend status:" && \
docker compose ps backend && \
echo "" && \
echo "📋 Step 6: Recent logs (checking for errors)..." && \
docker compose logs backend --tail 30 | grep -i "error\|exception" || echo "✅ No errors found!"
```

## 🚀 One-Liner:

```bash
cd ~/lite-crm && git pull origin main && docker compose exec backend sh -c "npx prisma migrate deploy" && docker compose restart backend && sleep 5 && docker compose logs backend --tail 20
```

## ✅ After Migrations:

1. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`
2. Try creating a lead - should work now
3. Try billing page - should work now
4. Try workspace admin - should work now

## 🔍 Verify Tables Were Created:

```bash
docker compose exec db psql -U litecrm -d litecrm -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('Subscription', 'Payment', 'Invoice') ORDER BY table_name;"
```
