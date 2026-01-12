#!/bin/bash

# n8n Integration Validation Script
# This script validates that n8n is properly integrated with Lite CRM

set -e

echo "🔍 Validating n8n Integration with Lite CRM"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found${NC}"
    exit 1
fi

# Function to check service
check_service() {
    local service=$1
    local url=$2
    
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $service is accessible${NC}"
        return 0
    else
        echo -e "${RED}❌ $service is not accessible${NC}"
        return 1
    fi
}

# Function to check container
check_container() {
    local service=$1
    if docker-compose ps | grep -q "$service.*Up"; then
        echo -e "${GREEN}✅ $service container is running${NC}"
        return 0
    else
        echo -e "${RED}❌ $service container is not running${NC}"
        return 1
    fi
}

# 1. Check Docker containers
echo "1. Checking Docker containers..."
echo "--------------------------------"
check_container "backend" || BACKEND_DOWN=1
check_container "frontend" || FRONTEND_DOWN=1
check_container "n8n" || N8N_DOWN=1
check_container "db" || DB_DOWN=1
echo ""

# 2. Check service accessibility
echo "2. Checking service accessibility..."
echo "-----------------------------------"
check_service "Backend API" "http://localhost:3000/api/workflows" || BACKEND_ERR=1
check_service "Frontend" "http://localhost:8080" || FRONTEND_ERR=1
check_service "n8n" "http://localhost:5678/healthz" || N8N_ERR=1
echo ""

# 3. Check n8n health
echo "3. Checking n8n health..."
echo "------------------------"
N8N_HEALTH=$(curl -s http://localhost:5678/healthz 2>/dev/null || echo "ERROR")
if [ "$N8N_HEALTH" != "ERROR" ]; then
    echo -e "${GREEN}✅ n8n health check passed${NC}"
else
    echo -e "${RED}❌ n8n health check failed${NC}"
    N8N_HEALTH_ERR=1
fi
echo ""

# 4. Check environment configuration
echo "4. Checking environment configuration..."
echo "----------------------------------------"
if [ -f "backend/.env" ]; then
    if grep -q "N8N_URL" backend/.env; then
        echo -e "${GREEN}✅ N8N_URL configured${NC}"
        N8N_URL=$(grep "N8N_URL" backend/.env | cut -d '=' -f2)
        echo "   N8N_URL: $N8N_URL"
    else
        echo -e "${YELLOW}⚠️  N8N_URL not found in backend/.env${NC}"
    fi
    
    if grep -q "N8N_WORKFLOW_LEAD_CREATED" backend/.env; then
        echo -e "${GREEN}✅ Workflow configuration found${NC}"
        WORKFLOW_ID=$(grep "N8N_WORKFLOW_LEAD_CREATED" backend/.env | cut -d '=' -f2)
        echo "   Workflow ID: $WORKFLOW_ID"
    else
        echo -e "${YELLOW}⚠️  No workflow IDs configured${NC}"
        echo "   Add N8N_WORKFLOW_LEAD_CREATED=your-workflow-id to backend/.env"
    fi
else
    echo -e "${RED}❌ backend/.env file not found${NC}"
fi
echo ""

# 5. Check backend logs for errors
echo "5. Checking backend logs (last 10 lines)..."
echo "-------------------------------------------"
BACKEND_LOGS=$(docker-compose logs --tail=10 backend 2>/dev/null || echo "ERROR")
if [ "$BACKEND_LOGS" != "ERROR" ]; then
    if echo "$BACKEND_LOGS" | grep -qi "error"; then
        echo -e "${YELLOW}⚠️  Errors found in backend logs:${NC}"
        echo "$BACKEND_LOGS" | grep -i "error" | head -3
    else
        echo -e "${GREEN}✅ No recent errors in backend logs${NC}"
    fi
else
    echo -e "${RED}❌ Could not read backend logs${NC}"
fi
echo ""

# 6. Check n8n logs for errors
echo "6. Checking n8n logs (last 10 lines)..."
echo "----------------------------------------"
N8N_LOGS=$(docker-compose logs --tail=10 n8n 2>/dev/null || echo "ERROR")
if [ "$N8N_LOGS" != "ERROR" ]; then
    if echo "$N8N_LOGS" | grep -qi "error"; then
        echo -e "${YELLOW}⚠️  Errors found in n8n logs:${NC}"
        echo "$N8N_LOGS" | grep -i "error" | head -3
    else
        echo -e "${GREEN}✅ No recent errors in n8n logs${NC}"
    fi
else
    echo -e "${RED}❌ Could not read n8n logs${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "📊 Validation Summary"
echo "=========================================="
echo ""

ERRORS=0

if [ -n "$BACKEND_DOWN" ] || [ -n "$BACKEND_ERR" ]; then
    echo -e "${RED}❌ Backend issues detected${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -n "$FRONTEND_DOWN" ] || [ -n "$FRONTEND_ERR" ]; then
    echo -e "${RED}❌ Frontend issues detected${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -n "$N8N_DOWN" ] || [ -n "$N8N_ERR" ] || [ -n "$N8N_HEALTH_ERR" ]; then
    echo -e "${RED}❌ n8n issues detected${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -n "$DB_DOWN" ]; then
    echo -e "${RED}❌ Database issues detected${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All basic checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Login to Lite CRM: http://localhost:8080"
    echo "2. Go to Workflows page"
    echo "3. Click 'Open Editor' to test embedded editor"
    echo "4. Create a test workflow in n8n"
    echo "5. Create a lead in CRM to test workflow trigger"
    echo ""
    echo "For detailed validation, see VALIDATION_GUIDE.md"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS issue(s)${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check all services are running: docker-compose ps"
    echo "2. Restart services: docker-compose restart"
    echo "3. Check logs: docker-compose logs [service-name]"
    echo "4. See VALIDATION_GUIDE.md for detailed troubleshooting"
    exit 1
fi
