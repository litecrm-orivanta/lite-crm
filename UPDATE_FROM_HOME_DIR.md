# Update Deployment from ~/lite-crm Directory

You're currently in `~/lite-crm`. Here are the commands to update from this location.

## Commands to Run (One at a Time)

### Step 1: Check Current Location

```bash
pwd
```

Should show: `/home/litecrm/lite-crm`

### Step 2: Check What's Currently Running

```bash
docker compose ps
```

**OR if using production compose file:**

```bash
docker compose -f docker-compose.prod.yml ps
```

This shows what services are running and their status.

---

### Step 3: Check Git Status

```bash
git status
```

This shows if there are any uncommitted local changes.

---

### Step 4: Pull Latest Code

```bash
git pull origin main
```

Wait for completion. You'll see files being updated.

---

### Step 5: Check for New Environment Variables

**View expected environment variables:**

```bash
cat backend/.env.example
```

**Check your current .env file:**

```bash
cat backend/.env
```

If `.env.example` has new variables, add them to your `.env`:

```bash
nano backend/.env
```

Add any missing variables, save: `Ctrl + X`, then `Y`, then `Enter`

---

### Step 6: Stop Current Services

**If using docker-compose.yml (development):**
```bash
docker compose down
```

**If using docker-compose.prod.yml (production):**
```bash
docker compose -f docker-compose.prod.yml down
```

This stops containers but keeps your database data safe.

---

### Step 7: Rebuild and Start Services

**If using docker-compose.yml:**
```bash
docker compose up -d --build
```

**If using docker-compose.prod.yml:**
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Wait 5-10 minutes for build. Watch progress:

```bash
docker compose logs -f
```

**OR if using prod file:**

```bash
docker compose -f docker-compose.prod.yml logs -f
```

Press `Ctrl + C` to stop watching.

---

### Step 8: Run Database Migrations

**Check migration status:**

```bash
docker compose run --rm backend npx prisma migrate status
```

**OR if using prod:**

```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate status
```

**Run migrations if needed:**

```bash
docker compose run --rm backend npx prisma migrate deploy
```

**OR if using prod:**

```bash
docker compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
```

---

### Step 9: Check Service Status

```bash
docker compose ps
```

**OR if using prod:**

```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show "Up".

---

### Step 10: Check Logs

```bash
docker compose logs backend --tail 30
```

**OR if using prod:**

```bash
docker compose -f docker-compose.prod.yml logs backend --tail 30
```

Look for: "Nest application successfully started" ✅

---

### Step 11: Test Application

```bash
curl http://localhost:3000
curl http://localhost:8080
```

Both should return responses.

---

## Note: Which Compose File?

Check which file exists:

```bash
ls -la docker-compose*.yml
```

- If you see `docker-compose.yml` → Use `docker compose` (without `-f`)
- If you see `docker-compose.prod.yml` → Use `docker compose -f docker-compose.prod.yml`
- If you see both → Use `docker-compose.prod.yml` for production

---

## ✅ Update Complete!

Your deployment has been updated to the latest version.
