#!/bin/bash
# Fix Database Connection Issue on VM

set -e

echo "🔧 Fixing database connection issue..."
echo ""

cd ~/lite-crm || { echo "❌ Cannot find ~/lite-crm directory"; exit 1; }

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env file..."
    JWT_SECRET=$(openssl rand -hex 32)
    
    cat > backend/.env << EOF
DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm
JWT_SECRET=${JWT_SECRET}
FRONTEND_URL=https://litecrm.orivanta.ai
BACKEND_URL=http://backend:3000
EOF
    echo "✅ Created backend/.env file"
else
    echo "📝 Updating backend/.env file..."
    # Update DATABASE_URL if it exists, or add it
    if grep -q "DATABASE_URL" backend/.env; then
        # Update existing DATABASE_URL
        sed -i 's|DATABASE_URL=.*|DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm|' backend/.env
    else
        # Add DATABASE_URL
        echo "DATABASE_URL=postgresql://litecrm:litecrm_password@db:5432/litecrm" >> backend/.env
    fi
    
    # Ensure JWT_SECRET exists
    if ! grep -q "JWT_SECRET" backend/.env; then
        JWT_SECRET=$(openssl rand -hex 32)
        echo "JWT_SECRET=${JWT_SECRET}" >> backend/.env
    fi
    
    echo "✅ Updated backend/.env file"
fi

echo ""
echo "🔍 Current DATABASE_URL in .env:"
grep "DATABASE_URL" backend/.env || echo "⚠️  DATABASE_URL not found"

echo ""
echo "🛑 Stopping services..."
docker compose down

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to start (15 seconds)..."
sleep 15

echo ""
echo "📊 Checking service status..."
docker compose ps

echo ""
echo "🔍 Checking backend logs..."
docker compose logs backend --tail=30 | grep -E "(started|listening|error|Error|ERROR|database|Database|Prisma)" || echo "No errors found"

echo ""
echo "🧪 Testing database connection..."
if docker compose exec -T backend npx prisma db pull > /dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo ""
    echo "Checking database container..."
    docker compose ps db
    echo ""
    echo "Checking database logs..."
    docker compose logs db --tail=20
fi

echo ""
echo "✅ Database fix script completed!"
