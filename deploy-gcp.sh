#!/bin/bash

# Lite CRM GCP Deployment Script
# This script automates deployment to GCP VM

set -e

echo "🚀 Lite CRM GCP Deployment Script"
echo "=================================="

# Configuration
PROJECT_DIR="/opt/lite-crm"
COMPOSE_FILE="docker-compose.prod.yml"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running on GCP VM
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}Error: Project directory $PROJECT_DIR not found${NC}"
    echo "Please ensure you're running this script on your GCP VM"
    exit 1
fi

cd "$PROJECT_DIR"

echo -e "${YELLOW}📦 Pulling latest code from Git...${NC}"
git pull origin main || echo "Warning: Could not pull from git"

echo -e "${YELLOW}🐳 Building and starting Docker containers...${NC}"
docker compose -f $COMPOSE_FILE down
docker compose -f $COMPOSE_FILE up -d --build

echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

echo -e "${YELLOW}📊 Checking service status...${NC}"
docker compose -f $COMPOSE_FILE ps

echo -e "${YELLOW}📋 Viewing recent logs...${NC}"
docker compose -f $COMPOSE_FILE logs --tail 20

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Services are running at:"
echo "  - Frontend: http://localhost:8080"
echo "  - Backend: http://localhost:3000"
echo ""
echo "View logs with: docker compose -f $COMPOSE_FILE logs -f"
echo "Check status with: docker compose -f $COMPOSE_FILE ps"
