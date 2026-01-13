#!/bin/bash
# Urgent VM Fix Script - Run this on the VM

set -e

echo "🚨 Starting urgent VM fix..."
echo ""

# Navigate to project
cd ~/lite-crm || { echo "❌ Cannot find ~/lite-crm directory"; exit 1; }

echo "📥 Pulling latest code..."
git pull origin main || echo "⚠️  Git pull failed, continuing..."

echo ""
echo "🛑 Stopping all services..."
docker compose down || true

echo ""
echo "🔨 Rebuilding all containers..."
docker compose build --no-cache

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start (20 seconds)..."
sleep 20

echo ""
echo "📊 Checking service status..."
docker compose ps

echo ""
echo "🔍 Checking backend logs..."
docker compose logs backend --tail=30 | grep -E "(started|listening|error|Error|ERROR)" || echo "No critical errors found"

echo ""
echo "🔍 Checking frontend logs..."
docker compose logs frontend --tail=20 | grep -E "(started|listening|error|Error|ERROR)" || echo "No critical errors found"

echo ""
echo "🧪 Testing backend connectivity..."
if docker compose exec -T backend curl -s http://localhost:3000/workflows > /dev/null 2>&1; then
    echo "✅ Backend is responding"
else
    echo "❌ Backend is NOT responding"
fi

echo ""
echo "🧪 Testing frontend to backend connectivity..."
if docker compose exec -T frontend curl -s http://backend:3000/workflows > /dev/null 2>&1; then
    echo "✅ Frontend can reach backend"
else
    echo "❌ Frontend CANNOT reach backend"
fi

echo ""
echo "📋 Final status check..."
docker compose ps

echo ""
echo "✅ Fix script completed!"
echo ""
echo "If services are still not working, check logs with:"
echo "  docker compose logs backend --tail=50"
echo "  docker compose logs frontend --tail=50"
