#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "Building and starting all services (db, backend, frontend)..."
docker compose up --build -d
echo ""
echo "Done. Frontend: http://localhost:8080  |  Backend API: http://localhost:3000"
