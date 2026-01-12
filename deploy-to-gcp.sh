#!/bin/bash

# Deployment script for Lite CRM to Google Cloud Platform
# Usage: ./deploy-to-gcp.sh YOUR_EXTERNAL_IP YOUR_ZONE

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if arguments provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}Usage: ./deploy-to-gcp.sh <EXTERNAL_IP> <ZONE>${NC}"
    echo -e "${YELLOW}Example: ./deploy-to-gcp.sh 34.123.45.67 us-central1-a${NC}"
    echo ""
    echo "Find your External IP and Zone from Google Cloud Console → Compute Engine → VM instances"
    exit 1
fi

EXTERNAL_IP=$1
ZONE=$2
VM_USER="litecrm"
VM_NAME="lite-crm-vm"
PROJECT_DIR="/Users/Akash-Kumar/lite-crm"

echo -e "${GREEN}=== Lite CRM GCP Deployment Script ===${NC}"
echo ""
echo "External IP: $EXTERNAL_IP"
echo "Zone: $ZONE"
echo "VM: $VM_NAME"
echo ""

# Check if gcloud CLI is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${YELLOW}Warning: gcloud CLI not found. Using SCP instead.${NC}"
    echo -e "${YELLOW}To use gcloud, install it from: https://cloud.google.com/sdk/docs/install${NC}"
    USE_GCLOUD=false
else
    echo -e "${GREEN}✓ gcloud CLI found${NC}"
    USE_GCLOUD=true
fi

# Step 1: Create .env file for backend if it doesn't exist
echo ""
echo -e "${GREEN}[1/5] Preparing environment configuration...${NC}"
if [ ! -f "$PROJECT_DIR/backend/.env" ]; then
    echo -e "${YELLOW}Creating backend/.env file...${NC}"
    cat > "$PROJECT_DIR/backend/.env" << EOF
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm
JWT_SECRET=$(openssl rand -hex 32)
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$(openssl rand -hex 16)
FRONTEND_URL=http://${EXTERNAL_IP}:80
BACKEND_URL=http://${EXTERNAL_IP}:3000
EOF
    echo -e "${GREEN}✓ Created backend/.env file${NC}"
else
    echo -e "${YELLOW}backend/.env already exists. Updating URLs...${NC}"
    # Update URLs in existing .env
    sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=http://${EXTERNAL_IP}:80|g" "$PROJECT_DIR/backend/.env"
    sed -i.bak "s|BACKEND_URL=.*|BACKEND_URL=http://${EXTERNAL_IP}:3000|g" "$PROJECT_DIR/backend/.env"
    rm -f "$PROJECT_DIR/backend/.env.bak"
    echo -e "${GREEN}✓ Updated URLs in backend/.env${NC}"
fi

# Step 2: Create deployment package (exclude unnecessary files)
echo ""
echo -e "${GREEN}[2/5] Creating deployment package...${NC}"
TEMP_DIR=$(mktemp -d)
DEPLOY_DIR="$TEMP_DIR/lite-crm"

mkdir -p "$DEPLOY_DIR"
echo "Copying files..."

# Copy essential files
rsync -av --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude '.env.local' \
    --exclude '.DS_Store' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude 'coverage' \
    --exclude '.next' \
    "$PROJECT_DIR/" "$DEPLOY_DIR/"

echo -e "${GREEN}✓ Package created${NC}"

# Step 3: Upload to VM
echo ""
echo -e "${GREEN}[3/5] Uploading code to VM...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    echo "Using gcloud compute scp..."
    gcloud compute scp --recurse "$DEPLOY_DIR" ${VM_USER}@${VM_NAME}:~/ --zone=$ZONE
else
    echo -e "${YELLOW}Using SCP (requires SSH key setup)${NC}"
    echo -e "${YELLOW}Make sure you have SSH key configured for: ${VM_USER}@${EXTERNAL_IP}${NC}"
    scp -r "$DEPLOY_DIR" ${VM_USER}@${EXTERNAL_IP}:~/lite-crm
fi

echo -e "${GREEN}✓ Code uploaded${NC}"

# Step 4: Setup commands to run on VM
echo ""
echo -e "${GREEN}[4/5] Preparing setup commands...${NC}"

# Create setup script
cat > "$TEMP_DIR/setup-vm.sh" << 'SETUP_SCRIPT'
#!/bin/bash
set -e

cd ~/lite-crm

echo "=== Installing Docker (if not installed) ==="
if ! command -v docker &> /dev/null; then
    echo "Docker not found. Please install Docker first."
    echo "Follow the deployment guide to install Docker."
    exit 1
fi

echo "✓ Docker is installed"

echo ""
echo "=== Starting Docker services ==="
docker compose down 2>/dev/null || true
docker compose up -d

echo "Waiting for services to start..."
sleep 30

echo ""
echo "=== Running database migrations ==="
docker compose exec -T backend npx prisma migrate deploy || echo "Migration failed or already applied"

echo ""
echo "=== Checking service status ==="
docker compose ps

echo ""
echo "=== Deployment complete! ==="
echo "Frontend: http://$(curl -s ifconfig.me):80"
echo "Backend: http://$(curl -s ifconfig.me):3000"
echo "n8n: http://$(curl -s ifconfig.me):5678"
SETUP_SCRIPT

chmod +x "$TEMP_DIR/setup-vm.sh"

# Upload setup script
if [ "$USE_GCLOUD" = true ]; then
    gcloud compute scp "$TEMP_DIR/setup-vm.sh" ${VM_USER}@${VM_NAME}:~/ --zone=$ZONE
else
    scp "$TEMP_DIR/setup-vm.sh" ${VM_USER}@${EXTERNAL_IP}:~/
fi

echo -e "${GREEN}✓ Setup script uploaded${NC}"

# Step 5: Execute setup on VM
echo ""
echo -e "${GREEN}[5/5] Running setup on VM...${NC}"
echo -e "${YELLOW}This will take a few minutes. Please wait...${NC}"

if [ "$USE_GCLOUD" = true ]; then
    gcloud compute ssh ${VM_USER}@${VM_NAME} --zone=$ZONE --command="bash ~/setup-vm.sh"
else
    ssh ${VM_USER}@${EXTERNAL_IP} "bash ~/setup-vm.sh"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo "Your application should now be running at:"
echo -e "${GREEN}Frontend:${NC} http://${EXTERNAL_IP}"
echo -e "${GREEN}Backend:${NC} http://${EXTERNAL_IP}:3000"
echo -e "${GREEN}n8n:${NC} http://${EXTERNAL_IP}:5678"
echo ""
echo "To check logs, SSH into the VM and run:"
echo "  docker compose logs -f"
echo ""
