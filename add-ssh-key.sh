#!/bin/bash

# Script to add SSH key to VM manually
# Run this and follow the instructions

VM_USER="litecrm"
VM_HOST="104.198.62.5"
PUB_KEY=$(cat ~/.ssh/id_ed25519.pub 2>/dev/null || cat ~/.ssh/id_rsa.pub 2>/dev/null)

if [ -z "$PUB_KEY" ]; then
  echo "❌ No SSH public key found!"
  echo "Run: ./setup-deployment.sh"
  exit 1
fi

echo "🔑 SSH Key Setup"
echo "================"
echo ""
echo "Your public SSH key:"
echo "$PUB_KEY"
echo ""
echo "📝 To add this key to your VM, run this command on the VM:"
echo ""
echo "mkdir -p ~/.ssh && echo '$PUB_KEY' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
echo ""
echo "Or copy-paste this one-liner:"
echo "---"
echo "mkdir -p ~/.ssh && echo '$PUB_KEY' >> ~/.ssh/authorized_keys && chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys"
echo "---"
echo ""
echo "After adding the key, test connection:"
echo "  ssh ${VM_USER}@${VM_HOST} 'echo \"SSH key works!\"'"
echo ""
