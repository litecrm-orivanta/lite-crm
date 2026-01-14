#!/bin/bash

# Setup script for Lite CRM deployment
# This sets up SSH keys and tests the connection

VM_USER="litecrm"
VM_HOST="104.198.62.5"
EMAIL="litecrm@orivanta.ai"

echo "🔧 Setting up Lite CRM Deployment"
echo "=================================="
echo ""

# Check if SSH key exists
if [ ! -f ~/.ssh/id_rsa ] && [ ! -f ~/.ssh/id_ed25519 ]; then
  echo "📝 No SSH key found. Generating one..."
  ssh-keygen -t ed25519 -C "$EMAIL" -f ~/.ssh/id_ed25519 -N ""
  echo "✅ SSH key generated!"
else
  echo "✅ SSH key already exists"
fi

# Get the public key
if [ -f ~/.ssh/id_ed25519.pub ]; then
  PUB_KEY=$(cat ~/.ssh/id_ed25519.pub)
elif [ -f ~/.ssh/id_rsa.pub ]; then
  PUB_KEY=$(cat ~/.ssh/id_rsa.pub)
else
  echo "❌ Could not find public key"
  exit 1
fi

echo ""
echo "📋 Your public SSH key:"
echo "$PUB_KEY"
echo ""
echo "📝 Next steps:"
echo "1. Copy the public key above"
echo "2. On your VM, run this command:"
echo "   mkdir -p ~/.ssh && echo '$PUB_KEY' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "Or run this command to copy it automatically (you'll need to enter password once):"
echo "   ssh-copy-id ${VM_USER}@${VM_HOST}"
echo ""

read -p "Do you want to copy the key now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "Copying SSH key to VM (enter password when prompted)..."
  ssh-copy-id ${VM_USER}@${VM_HOST} 2>/dev/null || {
    echo ""
    echo "⚠️  Could not copy automatically. Please run manually:"
    echo "   ssh-copy-id ${VM_USER}@${VM_HOST}"
    echo ""
    echo "Or manually add the key shown above to ~/.ssh/authorized_keys on the VM"
  }
fi

echo ""
echo "🧪 Testing SSH connection..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${VM_USER}@${VM_HOST} "echo 'SSH connection works!'" 2>/dev/null; then
  echo "✅ SSH connection successful! You can now use ./deploy.sh"
else
  echo "⚠️  SSH connection test failed. You may need to enter password during deployment."
  echo "   Make sure to set up SSH key as shown above."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Usage:"
echo "  ./deploy.sh    # Deploy to VM"
