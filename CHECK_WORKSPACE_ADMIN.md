# Check Workspace Admin Dashboard Error - Commands for VM

## 🔍 Step 1: Check Backend Logs for Workspace Admin Error

```bash
docker compose logs backend --tail 200 | grep -i "workspace-admin\|error\|exception" -A 10
```

## 🔍 Step 2: Test Workspace Admin Endpoints Directly

```bash
# Get your auth token from browser DevTools -> Application -> Local Storage -> token
# Then test each endpoint:

# Test stats endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/workspace-admin/stats

# Test users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/workspace-admin/users

# Test payments endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/workspace-admin/payments

# Test invoices endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/workspace-admin/invoices
```

## 🔍 Step 3: Check if Controller is Registered

```bash
docker compose exec backend sh -c "grep -r 'workspace-admin' src/admin/"
```

## 🔍 Step 4: Check Database Tables Exist

```bash
docker compose exec db psql -U litecrm -d litecrm -c "\dt" | grep -i "subscription\|payment\|invoice"
```

## 🔍 Step 5: Check if Missing Columns in Database

```bash
# Check Subscription table
docker compose exec db psql -U litecrm -d litecrm -c "\d \"Subscription\""

# Check Payment table
docker compose exec db psql -U litecrm -d litecrm -c "\d \"Payment\""

# Check Invoice table
docker compose exec db psql -U litecrm -d litecrm -c "\d \"Invoice\""
```
