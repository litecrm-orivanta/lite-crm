# n8n Integration Validation Guide

This guide helps you validate that n8n is properly integrated with Lite CRM.

## Prerequisites Checklist

Before starting validation, ensure:

- [ ] All services are running (`docker-compose up -d`)
- [ ] Backend is accessible at http://localhost:3000
- [ ] Frontend is accessible at http://localhost:8080 (or 5173)
- [ ] n8n is accessible at http://localhost:5678
- [ ] You have a Lite CRM account (admin role preferred)

## Validation Steps

### Step 1: Verify Services Are Running

```bash
# Check all containers are up
docker-compose ps

# Expected output should show:
# - db (running)
# - backend (running)
# - frontend (running)
# - n8n (running)

# Check n8n logs
docker-compose logs n8n | tail -20

# Check backend logs
docker-compose logs backend | tail -20
```

**✅ Success Criteria:**
- All containers show "Up" status
- No error messages in logs
- n8n shows "n8n ready on 0.0.0.0, port 5678"

---

### Step 2: Test n8n Accessibility

**2.1 Direct Access Test**

Open browser: http://localhost:5678

**Expected:**
- n8n login page appears
- Can login with: `admin` / `n8n_admin_pass`

**✅ Success:** n8n is accessible directly

**2.2 Health Check**

```bash
curl http://localhost:5678/healthz
```

**Expected:** Returns `200 OK`

**✅ Success:** n8n health endpoint responds

---

### Step 3: Test Backend Workflow Service

**3.1 Check Backend API**

```bash
# Test if backend is running
curl http://localhost:3000/api/workflows

# Should return 401 (unauthorized) or workflows list
```

**Expected:** 
- If no auth: `401 Unauthorized`
- If with auth: `200 OK` with workflows array

**✅ Success:** Backend responds

**3.2 Test Workflow Trigger (Manual)**

First, get your JWT token from browser (after logging into Lite CRM):
1. Open browser DevTools → Application → Local Storage
2. Copy the `token` value

```bash
# Replace YOUR_TOKEN with actual JWT token
curl -X POST http://localhost:3000/api/workflows/trigger/test-workflow-id \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "lead.created",
    "data": {
      "lead": {
        "id": "test-123",
        "name": "Test Lead"
      }
    }
  }'
```

**Expected:** 
- `200 OK` if workflow ID exists
- `404` or error if workflow doesn't exist (this is OK for testing)

**✅ Success:** Backend can trigger workflows

---

### Step 4: Test Embedded Editor

**4.1 Access Embedded Editor**

1. **Login to Lite CRM**: http://localhost:8080 (or 5173)
2. **Navigate to Workflows** page
3. **Click "Open Editor"** button
4. **Check if n8n loads** in the iframe

**Expected:**
- n8n editor loads in iframe
- Lite CRM header/navigation visible
- Can see n8n workflow canvas

**✅ Success:** Embedded editor loads

**4.2 Test Editor Functionality**

In the embedded editor:
1. **Click "Add workflow"** or create new
2. **Add a node** (e.g., Webhook node)
3. **Configure the node**
4. **Save the workflow**

**Expected:**
- Can create workflows
- Can add nodes
- Can save changes

**✅ Success:** Editor is functional

---

### Step 5: Create and Test a Real Workflow

**5.1 Create Webhook Workflow in n8n**

1. **Open n8n** (embedded or direct): http://localhost:5678
2. **Create new workflow**
3. **Add Webhook node**:
   - Method: `POST`
   - Path: `test-lead-created`
   - Response Mode: `Respond to Webhook`
4. **Add Email node** (or any other node) after webhook
5. **Connect nodes**
6. **Activate workflow** (toggle switch)
7. **Copy the webhook URL** - note the workflow ID (part after `/webhook/`)

**Example webhook URL:**
```
http://localhost:5678/webhook/abc123def456
                              ^^^^^^^^^^^^
                              This is your WORKFLOW ID
```

**✅ Success:** Workflow created and active

**5.2 Configure Backend**

Edit `backend/.env`:

```env
N8N_URL=http://n8n:5678
N8N_WORKFLOW_LEAD_CREATED=abc123def456
```

(Replace `abc123def456` with your actual workflow ID)

**Restart backend:**
```bash
docker-compose restart backend
```

**✅ Success:** Environment configured

**5.3 Test Workflow Trigger**

1. **Go to Lite CRM dashboard**
2. **Create a new lead** (any test data)
3. **Go back to n8n**
4. **Check workflow executions**:
   - Click on your workflow
   - Go to "Executions" tab
   - You should see a new execution!

**Expected:**
- New execution appears in n8n
- Execution shows received data
- Webhook node shows the lead data

**✅ Success:** Workflow triggered automatically!

---

### Step 6: Test Authentication Proxy

**6.1 Test Proxy Endpoint**

```bash
# Get JWT token from browser (as in step 3.2)
curl http://localhost:3000/api/n8n-proxy/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- `200 OK` with n8n HTML/content
- Or redirect to n8n login

**✅ Success:** Proxy forwards requests

**6.2 Test Proxy with n8n API**

```bash
curl http://localhost:3000/api/n8n-proxy/api/v1/workflows \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected:**
- `200 OK` with workflows JSON
- Or `401` if n8n auth fails (check credentials)

**✅ Success:** Proxy handles API requests

---

### Step 7: End-to-End Test

**7.1 Complete Flow Test**

1. **Create workflow** in n8n with webhook
2. **Add workflow ID** to `backend/.env`
3. **Restart backend**
4. **Create lead** in Lite CRM
5. **Verify workflow executes** in n8n
6. **Check execution data** matches lead data

**Expected Flow:**
```
Lead Created in CRM
    ↓
Backend triggers workflow
    ↓
n8n receives webhook
    ↓
Workflow executes
    ↓
Execution visible in n8n
```

**✅ Success:** Complete integration works!

---

### Step 8: Test Multiple Events

**8.1 Test Lead Stage Change**

1. **Create workflow** for `lead.stage.changed`
2. **Add to `.env`**: `N8N_WORKFLOW_LEAD_STAGE_CHANGED=workflow-id-2`
3. **Restart backend**
4. **Change lead stage** in CRM
5. **Check n8n executions**

**✅ Success:** Stage change triggers workflow

**8.2 Test Task Creation**

1. **Create workflow** for `task.created`
2. **Add to `.env`**: `N8N_WORKFLOW_TASK_CREATED=workflow-id-3`
3. **Restart backend**
4. **Create task** in CRM
5. **Check n8n executions**

**✅ Success:** Task creation triggers workflow

---

## Validation Checklist

Use this checklist to track your validation:

### Basic Setup
- [ ] All Docker containers running
- [ ] n8n accessible at http://localhost:5678
- [ ] Backend accessible at http://localhost:3000
- [ ] Frontend accessible at http://localhost:8080

### n8n Integration
- [ ] Can create workflows in n8n
- [ ] Can activate workflows
- [ ] Webhook nodes work
- [ ] Workflow executions visible

### Backend Integration
- [ ] Workflow service responds
- [ ] Environment variables configured
- [ ] Workflow triggers work
- [ ] Proxy endpoint works

### Frontend Integration
- [ ] Workflows page loads
- [ ] Embedded editor loads
- [ ] Can navigate to editor
- [ ] Editor is functional

### End-to-End
- [ ] Lead creation triggers workflow
- [ ] Stage change triggers workflow
- [ ] Task creation triggers workflow
- [ ] Data flows correctly

---

## Common Issues & Solutions

### Issue: n8n Not Accessible

**Symptoms:**
- Can't open http://localhost:5678
- Connection refused

**Solutions:**
```bash
# Check if n8n is running
docker-compose ps n8n

# Restart n8n
docker-compose restart n8n

# Check logs
docker-compose logs n8n
```

### Issue: Workflow Not Triggering

**Symptoms:**
- Created lead but no execution in n8n

**Solutions:**
1. Check workflow is **active** (toggle switch)
2. Verify workflow ID in `.env` matches webhook path
3. Check backend logs: `docker-compose logs backend | grep workflow`
4. Verify `N8N_URL` is correct in `.env`

### Issue: Embedded Editor Not Loading

**Symptoms:**
- Iframe shows blank or error

**Solutions:**
1. Check browser console for errors
2. Verify n8n is accessible directly
3. Check CORS settings in n8n
4. Try opening n8n in new tab first

### Issue: Authentication Errors

**Symptoms:**
- 401 Unauthorized errors
- Can't access n8n through proxy

**Solutions:**
1. Verify JWT token is valid
2. Check n8n basic auth credentials
3. Review proxy controller logs
4. Test direct n8n access

---

## Quick Validation Script

Save this as `validate-integration.sh`:

```bash
#!/bin/bash

echo "🔍 Validating n8n Integration with Lite CRM"
echo ""

# Check services
echo "1. Checking services..."
docker-compose ps | grep -E "(backend|frontend|n8n)" | grep -q "Up" && echo "✅ Services running" || echo "❌ Services not running"

# Check n8n
echo "2. Checking n8n..."
curl -s http://localhost:5678/healthz > /dev/null && echo "✅ n8n accessible" || echo "❌ n8n not accessible"

# Check backend
echo "3. Checking backend..."
curl -s http://localhost:3000/api/workflows > /dev/null && echo "✅ Backend accessible" || echo "❌ Backend not accessible"

# Check frontend
echo "4. Checking frontend..."
curl -s http://localhost:8080 > /dev/null && echo "✅ Frontend accessible" || echo "❌ Frontend not accessible"

echo ""
echo "✅ Validation complete!"
echo ""
echo "Next steps:"
echo "1. Login to Lite CRM"
echo "2. Go to Workflows page"
echo "3. Click 'Open Editor'"
echo "4. Create a test workflow"
echo "5. Create a lead to test trigger"
```

Make it executable:
```bash
chmod +x validate-integration.sh
./validate-integration.sh
```

---

## Success Criteria Summary

✅ **All services running**  
✅ **n8n accessible and functional**  
✅ **Backend can trigger workflows**  
✅ **Embedded editor loads**  
✅ **Workflows trigger on CRM events**  
✅ **Data flows correctly**  
✅ **Authentication works**  

If all checks pass, your integration is **validated and working**! 🎉

---

## Next Steps After Validation

1. **Create production workflows**
2. **Set up monitoring**
3. **Configure error handling**
4. **Add workflow templates**
5. **Document workflow patterns**
