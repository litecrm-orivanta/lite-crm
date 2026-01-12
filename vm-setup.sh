#!/bin/bash
# Setup script to run on GCP VM after code is uploaded

set -e

echo "=== Lite CRM VM Setup Script ==="
echo ""

# Navigate to project directory
cd ~/lite-crm

# Generate JWT secret if .env doesn't exist
if [ ! -f backend/.env ]; then
    echo "Creating .env file..."
    JWT_SECRET=$(openssl rand -hex 32)
    N8N_PASS=$(openssl rand -hex 16)
    
    cat > backend/.env << EOF
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm
JWT_SECRET=${JWT_SECRET}
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=${N8N_PASS}
FRONTEND_URL=http://104.198.62.5:80
BACKEND_URL=http://104.198.62.5:3000
EOF
    echo "✓ .env file created with secure secrets"
else
    echo "✓ .env file already exists"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed!"
    echo "Please install Docker first."
    exit 1
fi

echo ""
echo "=== Starting Docker Services ==="
docker compose down 2>/dev/null || true
docker compose up -d

echo ""
echo "Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "=== Checking Service Status ==="
docker compose ps

echo ""
echo "=== Running Database Migrations ==="
docker compose exec -T backend npx prisma migrate deploy || echo "Migrations may have already been applied"

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Your application should be accessible at:"
echo "  Frontend: http://104.198.62.5"
echo "  Backend:  http://104.198.62.5:3000"
echo "  n8n:      http://104.198.62.5:5678"
echo ""
echo "To view logs, run:"
echo "  docker compose logs -f"
echo ""
echo "To check service status:"
echo "  docker compose ps"
echo ""
