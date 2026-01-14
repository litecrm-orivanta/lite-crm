#!/bin/bash

# Production Deployment Script for Lite CRM
# This script deploys the latest changes to the production VM

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Lite CRM Production Deployment ===${NC}"
echo ""

# Check if VM details are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${YELLOW}Usage: ./deploy-production.sh <VM_IP_OR_NAME> <ZONE>${NC}"
    echo -e "${YELLOW}Example: ./deploy-production.sh lite-crm-vm us-central1-c${NC}"
    echo ""
    echo "Or if using direct IP:"
    echo -e "${YELLOW}Example: ./deploy-production.sh 104.198.62.5 us-central1-c${NC}"
    exit 1
fi

VM_TARGET=$1
ZONE=$2
VM_USER="litecrm"

echo -e "${GREEN}Deploying to: ${VM_TARGET}${NC}"
echo -e "${GREEN}Zone: ${ZONE}${NC}"
echo ""

# Check if using gcloud or direct SSH
if command -v gcloud &> /dev/null; then
    USE_GCLOUD=true
    echo -e "${GREEN}✓ Using gcloud CLI${NC}"
else
    USE_GCLOUD=false
    echo -e "${YELLOW}⚠ gcloud CLI not found, using direct SSH${NC}"
fi

echo ""
echo -e "${BLUE}[Step 1/5] Connecting to VM and pulling latest changes...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_TARGET} --zone=${ZONE} --command="
        cd ~/lite-crm && 
        echo 'Pulling latest changes from git...' &&
        git pull origin main &&
        echo '✓ Code updated'
    "
else
    ssh ${VM_USER}@${VM_TARGET} "
        cd ~/lite-crm && 
        echo 'Pulling latest changes from git...' &&
        git pull origin main &&
        echo '✓ Code updated'
    "
fi

echo ""
echo -e "${BLUE}[Step 2/5] Stopping existing services...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_TARGET} --zone=${ZONE} --command="
        cd ~/lite-crm &&
        docker compose down
    "
else
    ssh ${VM_USER}@${VM_TARGET} "
        cd ~/lite-crm &&
        docker compose down
    "
fi

echo ""
echo -e "${BLUE}[Step 3/5] Rebuilding containers...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_TARGET} --zone=${ZONE} --command="
        cd ~/lite-crm &&
        docker compose build --no-cache
    "
else
    ssh ${VM_USER}@${VM_TARGET} "
        cd ~/lite-crm &&
        docker compose build --no-cache
    "
fi

echo ""
echo -e "${BLUE}[Step 4/5] Starting services...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_TARGET} --zone=${ZONE} --command="
        cd ~/lite-crm &&
        docker compose up -d &&
        echo 'Waiting for services to start...' &&
        sleep 15
    "
else
    ssh ${VM_USER}@${VM_TARGET} "
        cd ~/lite-crm &&
        docker compose up -d &&
        echo 'Waiting for services to start...' &&
        sleep 15
    "
fi

echo ""
echo -e "${BLUE}[Step 5/5] Running database migrations...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_TARGET} --zone=${ZONE} --command="
        cd ~/lite-crm &&
        docker compose exec -T backend npx prisma migrate deploy || echo 'Migrations already applied or failed'
    "
else
    ssh ${VM_USER}@${VM_TARGET} "
        cd ~/lite-crm &&
        docker compose exec -T backend npx prisma migrate deploy || echo 'Migrations already applied or failed'
    "
fi

echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo -e "${BLUE}Verifying services...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_TARGET} --zone=${ZONE} --command="
        cd ~/lite-crm &&
        docker compose ps
    "
else
    ssh ${VM_USER}@${VM_TARGET} "
        cd ~/lite-crm &&
        docker compose ps
    "
fi

echo ""
echo -e "${GREEN}✓ Deployment successful!${NC}"
echo ""
echo "Your application should now be live with the latest changes:"
echo -e "${GREEN}Frontend:${NC} http://${VM_TARGET}"
echo -e "${GREEN}Backend API:${NC} http://${VM_TARGET}:3000"
echo ""
echo "To check logs, run:"
echo "  ssh ${VM_USER}@${VM_TARGET} 'cd ~/lite-crm && docker compose logs -f'"
echo ""
