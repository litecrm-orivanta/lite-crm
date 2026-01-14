#!/bin/bash

# Quick deployment script that handles SSH key setup

VM_USER="litecrm"
VM_HOST="104.198.62.5"
PUB_KEY=$(cat ~/.ssh/id_ed25519.pub 2>/dev/null)

echo "🚀 Lite CRM Quick Deployment"
echo "=========================="
echo ""

# Check if SSH works
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${VM_USER}@${VM_HOST} "echo 'test'" 2>/dev/null; then
  echo "✅ SSH connection works!"
  echo ""
  echo "Starting deployment..."
  echo ""
  
  # Deploy frontend
  echo "📦 Syncing frontend files..."
  rsync -avz --progress --delete \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'build' \
    --exclude '.env' \
    "./frontend/" \
    ${VM_USER}@${VM_HOST}:~/lite-crm/frontend/
  
  echo ""
  echo "🔨 Rebuilding frontend on VM..."
  ssh ${VM_USER}@${VM_HOST} << 'ENDSSH'
cd ~/lite-crm
echo "Building frontend..."
docker compose build --no-cache frontend
echo "Starting frontend..."
docker compose up -d frontend
echo "✅ Frontend deployed!"
ENDSSH
  
  echo ""
  echo "✅ Deployment complete!"
  
else
  echo "❌ SSH key not set up yet!"
  echo ""
  echo "📝 Please run this command ON YOUR VM to add the SSH key:"
  echo ""
  echo "mkdir -p ~/.ssh && echo '$PUB_KEY' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
  echo ""
  echo "After running that on the VM, run this script again:"
  echo "  ./deploy-now.sh"
  echo ""
fi
