#!/bin/bash

# Quick rebuild script for Lite CRM Docker images
# This rebuilds the images to include latest changes

set -e

echo "🔨 Rebuilding Docker Images for Lite CRM"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ask what to rebuild
echo "What would you like to rebuild?"
echo "1) Everything (frontend + backend)"
echo "2) Frontend only (faster)"
echo "3) Backend only"
echo "4) Just restart (no rebuild)"
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo -e "${YELLOW}Rebuilding everything...${NC}"
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    ;;
  2)
    echo -e "${YELLOW}Rebuilding frontend only...${NC}"
    docker-compose stop frontend
    docker-compose build --no-cache frontend
    docker-compose up -d frontend
    ;;
  3)
    echo -e "${YELLOW}Rebuilding backend only...${NC}"
    docker-compose stop backend
    docker-compose build --no-cache backend
    docker-compose up -d backend
    ;;
  4)
    echo -e "${YELLOW}Restarting services...${NC}"
    docker-compose restart
    ;;
  *)
    echo "Invalid choice. Rebuilding everything..."
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    ;;
esac

echo ""
echo -e "${GREEN}✅ Rebuild complete!${NC}"
echo ""
echo "Checking service status..."
docker-compose ps

echo ""
echo "Next steps:"
echo "1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Login to Lite CRM: http://localhost:8080"
echo "3. Check navigation bar for 'Workflows' link"
echo "4. Click 'Workflows' to see the workflows page"
echo ""
