# Next Steps After Containers Created

Your containers are created! Now follow these steps:

## Step 1: Check Service Status

```bash
docker compose ps
```

All services should show "Up" status.

## Step 2: Wait for Services to Start

Wait about 30 seconds for all services to fully start, then check logs:

```bash
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

Look for:
- Backend: "Nest application successfully started"
- Frontend: Should show nginx startup
- Database: Should show PostgreSQL startup

## Step 3: Run Database Migrations

```bash
docker compose exec backend npx prisma migrate deploy
```

This sets up your database schema.

## Step 4: Verify Everything is Running

```bash
# Check all services
docker compose ps

# View all logs
docker compose logs

# Or follow logs in real-time
docker compose logs -f
```

## Step 5: Test Your Application

Open in browser:
- **Frontend**: http://104.198.62.5
- **Backend API**: http://104.198.62.5:3000
- **n8n**: http://104.198.62.5:5678

## If Services Won't Start

Check logs:
```bash
docker compose logs backend
docker compose logs frontend
```

Common issues:
- Database connection: Wait a bit longer, database takes time to start
- Port conflicts: Check if ports are in use
- Environment variables: Verify backend/.env file exists

---

**Your deployment is almost complete!** Just run migrations and test the URLs.
