# Quick Deployment Guide

After cloning this repository on your VM, run:

```bash
cd lite-crm
bash vm-setup.sh
```

The script will:
- Create .env file with secure secrets
- Start Docker services
- Run database migrations
- Show you the access URLs

## Manual Setup (if script doesn't work)

```bash
cd backend
cp .env.example .env
nano .env  # Edit with your IP: 104.198.62.5
cd ..
docker compose up -d
docker compose exec backend npx prisma migrate deploy
```

## Access URLs

- Frontend: http://104.198.62.5
- Backend: http://104.198.62.5:3000
- n8n: http://104.198.62.5:5678
