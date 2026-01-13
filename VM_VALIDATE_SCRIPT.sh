#!/bin/bash
# Complete validation script for n8n UI removal changes
# Run this on your VM: bash VM_VALIDATE_SCRIPT.sh

set -e

echo "========================================="
echo "n8n UI Removal - Validation Script"
echo "========================================="
echo ""

cd ~/lite-crm

echo "=== STEP 1: Check Current Git Status ==="
echo "Current branch:"
git branch --show-current
echo ""
echo "Last 3 commits:"
git log --oneline -3
echo ""

echo "=== STEP 2: Pull Latest Code ==="
git pull origin main
echo ""

echo "=== STEP 3: Verify Source Files (Should find NO n8n references) ==="
echo ""
echo "Checking WorkflowEditor.tsx:"
if grep -q "openN8nInNewTab\|Open n8n Editor\|n8nUrl" frontend/src/pages/WorkflowEditor.tsx 2>/dev/null; then
    echo "❌ FOUND n8n references in WorkflowEditor.tsx:"
    grep -n "openN8nInNewTab\|Open n8n Editor\|n8nUrl" frontend/src/pages/WorkflowEditor.tsx
else
    echo "✅ No n8n references found in WorkflowEditor.tsx"
fi

echo ""
echo "Checking Workflows.tsx:"
if grep -q "Open Editor\|Open n8n" frontend/src/pages/Workflows.tsx 2>/dev/null; then
    echo "❌ FOUND n8n references in Workflows.tsx:"
    grep -n "Open Editor\|Open n8n" frontend/src/pages/Workflows.tsx
else
    echo "✅ No n8n references found in Workflows.tsx"
fi

echo ""
echo "Checking WorkflowConfiguration.tsx:"
if grep -q "Open in n8n\|Open n8n\|n8nUrl" frontend/src/pages/WorkflowConfiguration.tsx 2>/dev/null; then
    echo "❌ FOUND n8n references in WorkflowConfiguration.tsx:"
    grep -n "Open in n8n\|Open n8n\|n8nUrl" frontend/src/pages/WorkflowConfiguration.tsx | head -5
else
    echo "✅ No n8n references found in WorkflowConfiguration.tsx"
fi

echo ""
echo "=== STEP 4: Check Frontend Image Build Time ==="
FRONTEND_IMAGE_TIME=$(docker images lite-crm-frontend --format "{{.CreatedAt}}" 2>/dev/null | head -1)
if [ -z "$FRONTEND_IMAGE_TIME" ]; then
    echo "⚠️  Frontend image not found - will be built"
else
    echo "Frontend image created: $FRONTEND_IMAGE_TIME"
fi
echo ""

echo "=== STEP 5: Rebuild Frontend (This will take a few minutes) ==="
echo "Stopping services..."
docker compose down 2>/dev/null || true

echo "Building frontend (no cache)..."
docker compose build --no-cache frontend

echo ""
echo "=== STEP 6: Start Services ==="
docker compose up -d

echo ""
echo "Waiting for services to start (20 seconds)..."
sleep 20

echo ""
echo "=== STEP 7: Check Service Status ==="
docker compose ps

echo ""
echo "=== STEP 8: Check Frontend Logs ==="
echo "Last 15 lines of frontend logs:"
docker compose logs frontend 2>&1 | tail -15

echo ""
echo "=== STEP 9: Verify Latest Commit ==="
LATEST_COMMIT=$(git log --oneline -1)
echo "Latest commit: $LATEST_COMMIT"
if echo "$LATEST_COMMIT" | grep -q "Disable n8n UI access"; then
    echo "✅ Latest commit is the n8n UI removal commit"
else
    echo "⚠️  Latest commit doesn't match expected commit"
fi

echo ""
echo "========================================="
echo "Validation Complete!"
echo "========================================="
echo ""
echo "Next Steps:"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Or test in an incognito/private window"
echo "3. Visit: https://litecrm.orivanta.ai/workflows"
echo "4. Verify you DON'T see 'Open n8n Editor' buttons"
echo "5. Verify you DO see 'Configure Workflows' button"
echo ""
