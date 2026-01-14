#!/bin/bash

# Lite CRM Deployment Script
# Syncs files from local to VM and rebuilds Docker containers

# Configuration
VM_USER="litecrm"
VM_HOST="104.198.62.5"
VM_PATH="~/lite-crm"
LOCAL_PATH="/Users/Akash-Kumar/lite-crm"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Lite CRM Deployment${NC}"
echo "===================="
echo ""

# Test SSH connection
echo -e "${YELLOW}🔌 Testing SSH connection...${NC}"
if ! ssh -o ConnectTimeout=5 -o BatchMode=yes ${VM_USER}@${VM_HOST} "echo 'Connected'" 2>/dev/null; then
  echo -e "${RED}❌ Cannot connect to VM. Please set up SSH key:${NC}"
  echo ""
  echo "Run this command to copy your SSH key:"
  echo "  ssh-copy-id ${VM_USER}@${VM_HOST}"
  echo ""
  echo "Or enter password when prompted during deployment."
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Ask what to deploy
echo ""
echo "What would you like to deploy?"
echo "1) Frontend only (fast, ~30 seconds)"
echo "2) Backend only"
echo "3) Both frontend + backend"
echo "4) Everything (including docker-compose.yml, etc.)"
read -p "Enter choice [1-4]: " choice

case $choice in
  1)
    echo -e "${YELLOW}📦 Step 1: Syncing frontend files...${NC}"
    rsync -avz --progress --delete \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'dist' \
      --exclude 'build' \
      --exclude '.env' \
      "${LOCAL_PATH}/frontend/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/frontend/ || {
      echo -e "${RED}❌ Sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}🔨 Step 2: Rebuilding frontend on VM...${NC}"
    ssh ${VM_USER}@${VM_HOST} << 'ENDSSH'
cd ~/lite-crm
echo "Building frontend..."
docker compose build --no-cache frontend
echo "Starting frontend..."
docker compose up -d frontend
echo "✅ Frontend deployed!"
ENDSSH
    ;;
    
  2)
    echo -e "${YELLOW}📦 Step 1: Syncing backend files...${NC}"
    rsync -avz --progress --delete \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'dist' \
      --exclude 'build' \
      "${LOCAL_PATH}/backend/src/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/backend/src/ || {
      echo -e "${RED}❌ Backend src sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}📦 Step 2: Syncing Prisma schema...${NC}"
    rsync -avz --progress \
      "${LOCAL_PATH}/backend/prisma/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/backend/prisma/ || {
      echo -e "${RED}❌ Prisma sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}🔨 Step 3: Rebuilding backend on VM...${NC}"
    ssh ${VM_USER}@${VM_HOST} << 'ENDSSH'
cd ~/lite-crm
echo "Building backend..."
docker compose build --no-cache backend
echo "Starting backend..."
docker compose up -d backend
echo "✅ Backend deployed!"
ENDSSH
    ;;
    
  3)
    echo -e "${YELLOW}📦 Step 1: Syncing frontend...${NC}"
    rsync -avz --progress --delete \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'dist' \
      --exclude 'build' \
      --exclude '.env' \
      "${LOCAL_PATH}/frontend/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/frontend/ || {
      echo -e "${RED}❌ Frontend sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}📦 Step 2: Syncing backend...${NC}"
    rsync -avz --progress --delete \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'dist' \
      "${LOCAL_PATH}/backend/src/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/backend/src/ || {
      echo -e "${RED}❌ Backend src sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}📦 Step 3: Syncing Prisma schema...${NC}"
    rsync -avz --progress \
      "${LOCAL_PATH}/backend/prisma/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/backend/prisma/ || {
      echo -e "${RED}❌ Prisma sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}🔨 Step 4: Rebuilding on VM...${NC}"
    ssh ${VM_USER}@${VM_HOST} << 'ENDSSH'
cd ~/lite-crm
echo "Building frontend and backend..."
docker compose build --no-cache frontend backend
echo "Starting services..."
docker compose up -d frontend backend
echo "✅ Deployment complete!"
ENDSSH
    ;;
    
  4)
    echo -e "${YELLOW}📦 Syncing everything...${NC}"
    rsync -avz --progress \
      --exclude 'node_modules' \
      --exclude '.git' \
      --exclude 'dist' \
      --exclude 'build' \
      --exclude '*.log' \
      "${LOCAL_PATH}/" \
      ${VM_USER}@${VM_HOST}:${VM_PATH}/ || {
      echo -e "${RED}❌ Sync failed!${NC}"
      exit 1
    }
    
    echo ""
    echo -e "${YELLOW}🔨 Rebuilding on VM...${NC}"
    ssh ${VM_USER}@${VM_HOST} << 'ENDSSH'
cd ~/lite-crm
echo "Building all services..."
docker compose build --no-cache
echo "Starting all services..."
docker compose up -d
echo "✅ Full deployment complete!"
ENDSSH
    ;;
    
  *)
    echo -e "${RED}Invalid choice!${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Check services: ssh ${VM_USER}@${VM_HOST} 'cd ~/lite-crm && docker compose ps'"
echo "3. View logs: ssh ${VM_USER}@${VM_HOST} 'cd ~/lite-crm && docker compose logs --tail 50'"
