# Fix CORS/API Connection Issue

The frontend is trying to connect to `localhost:3000` but it should use the nginx proxy at `/api/`.

## The Issue

The nginx.conf was using the container name `lite-crm-backend-1` which changes. It should use the Docker service name `backend`.

## Fix Applied

Updated `frontend/nginx.conf` to use `backend:3000` (Docker service name) instead of container name.

## On VM - Pull and Rebuild Frontend

```bash
cd ~/lite-crm
git pull
docker compose build frontend
docker compose restart frontend
```

Or rebuild everything:

```bash
docker compose down
docker compose up -d --build frontend
```

## Verify

After restart, the frontend should proxy API calls through nginx to the backend correctly.

Frontend calls `/api/*` → Nginx proxies to `backend:3000/*` → Backend responds
