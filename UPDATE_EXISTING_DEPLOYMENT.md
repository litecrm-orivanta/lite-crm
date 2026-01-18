# Update Existing Deployment - Step-by-Step Guide

Since you already have an older version deployed, follow these steps to update it.

## Commands to Run on GCP VM (SSH: litecrm@lite-crm-vm:~$)

### Step 1: Navigate to Project Directory

```bash
cd /opt/lite-crm
```

---

### Step 2: Check Current Status

```bash
docker compose -f docker-compose.prod.yml ps
```

This shows what's currently running.

---

### Step 3: Pull Latest Code from Git

```bash
git pull origin main
```

Wait for it to complete. You should see files being updated.

---

### Step 4: Check for New Environment Variables

**Check if backend/.env.example has new variables:**

```bash
cat backend/.env.example
```

**Compare with your current backend/.env:**

```bash
cat backend/.env
```

**If there are new variables in .env.example, add them to your .env file:**

```bash
nano backend/.env
```

Add any missing variables (like new API keys, settings, etc.). Save: `Ctrl + X`, then `Y`, then `Enter`

---

### Step 5: Backup Current Deployment (Optional but Recommended)

**Check if database has important data:**

```bash
docker compose -f docker-compose.prod.yml exec -T db psql -U litecrm -d litecrm -c "\dt" | head -20
```

**If you have data, create a backup:**

```bash
mkdir -p /opt/lite-crm/backups
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U litecrm litecrm | gzip > /opt/lite-crm/backups/backup_before_update_$(date +%Y%m%d_%H%M%S).sql.gz
```

---

### Step 6: Stop Current Services

```bash
docker compose -f docker-compose.prod.yml down
```

This stops all containers but keeps data in the database volume.

---

### Step 7: Rebuild and Start Services

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This will:
- Pull any updated base images
- Rebuild your containers with new code
- Start all services

**Wait 5-10 minutes for build to complete.**

Watch the progress:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

Press `Ctrl + C` to stop watching logs.

---

### Step 8: Run Database Migrations (if any new migrations exist)

**Check for new migrations:**

```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate status
```

**If there are pending migrations, run them:**

```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

**OR if migrations are complex, sync schema:**

```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push
```

---

### Step 9: Verify Services Are Running

```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show as "Up":
- `lite-crm-db` - Up
- `lite-crm-backend` - Up
- `lite-crm-frontend` - Up

---

### Step 10: Check Service Logs

**Check backend logs:**

```bash
docker compose -f docker-compose.prod.yml logs backend --tail 30
```

**Look for:**
- ✅ "Nest application successfully started" - Backend is working
- ❌ Any error messages - Need to fix

**Check frontend logs:**

```bash
docker compose -f docker-compose.prod.yml logs frontend --tail 20
```

---

### Step 11: Test the Application

**Test backend:**

```bash
curl http://localhost:3000
```

Should return some response (even 404 is OK - means it's running).

**Test frontend:**

```bash
curl http://localhost:8080 | head -20
```

Should return HTML.

**Access from browser:**
- Frontend: `http://YOUR_VM_IP:8080`
- Backend: `http://YOUR_VM_IP:3000`

---

### Step 12: Update Super Admin (if seed script changed)

**If you want to update super admin credentials:**

```bash
docker compose -f docker-compose.prod.yml run --rm backend npm run seed:admin
```

This will create/update super admin based on values in `backend/.env`.

---

## ✅ Update Complete!

Your deployment has been updated to the latest version.

---

## 🔄 Quick Update Command (For Future)

For future updates, you can use this quick command:

```bash
cd /opt/lite-crm && git pull origin main && docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up -d --build && docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

---

## 🆘 Troubleshooting

### If services don't start:

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check status
docker compose -f docker-compose.prod.yml ps
```

### If database connection fails:

```bash
# Verify DATABASE_URL in backend/.env
cat backend/.env | grep DATABASE_URL

# Test database connection
docker compose -f docker-compose.prod.yml exec db psql -U litecrm -d litecrm -c "SELECT 1;"
```

### If you need to rollback:

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore from git (go back to previous commit)
git log --oneline -10  # Find previous commit
git reset --hard PREVIOUS_COMMIT_HASH

# Restart services
docker compose -f docker-compose.prod.yml up -d --build
```

### If database needs reset (⚠️ DESTROYS DATA):

```bash
# Backup first!
docker compose -f docker-compose.prod.yml exec -T db pg_dump -U litecrm litecrm | gzip > backup.sql.gz

# Reset schema
docker compose -f docker-compose.prod.yml run --rm backend npx prisma db push --force-reset

# Seed admin again
docker compose -f docker-compose.prod.yml run --rm backend npm run seed:admin
```
