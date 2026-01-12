# Quick Validation Checklist

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Services
```bash
docker-compose up -d
```

**Check:** All services running
```bash
docker-compose ps
```

---

### Step 2: Test n8n Direct Access

**Open:** http://localhost:5678

**Expected:**
- ✅ n8n login page appears
- ✅ Can login: `admin` / `n8n_admin_pass`

**If fails:**
```bash
docker-compose logs n8n
docker-compose restart n8n
```

---

### Step 3: Test Lite CRM

**Open:** http://localhost:8080 (or 5173)

**Expected:**
- ✅ Login page appears
- ✅ Can login/create account
- ✅ Dashboard loads

**If fails:**
```bash
docker-compose logs backend
docker-compose logs frontend
```

---

### Step 4: Test Embedded Editor

1. **Login to Lite CRM**
2. **Go to Workflows page** (Admin menu)
3. **Click "Open Editor"**

**Expected:**
- ✅ n8n editor loads in iframe
- ✅ Can see workflow canvas
- ✅ Can add nodes

**If fails:**
- Check browser console (F12)
- Verify n8n is accessible directly
- Check CORS settings

---

### Step 5: Create Test Workflow

1. **In n8n editor**, click "Add workflow"
2. **Add Webhook node**:
   - Method: `POST`
   - Path: `test-lead`
3. **Activate workflow** (toggle switch)
4. **Copy workflow ID** from webhook URL

**Example:**
```
http://localhost:5678/webhook/abc123def456
                              ^^^^^^^^^^^^
                              Copy this ID
```

---

### Step 6: Configure Backend

**Edit:** `backend/.env`

```env
N8N_URL=http://n8n:5678
N8N_WORKFLOW_LEAD_CREATED=abc123def456
```

(Replace with your actual workflow ID)

**Restart backend:**
```bash
docker-compose restart backend
```

---

### Step 7: Test Workflow Trigger

1. **Go to Lite CRM dashboard**
2. **Create a new lead** (any test data)
3. **Go back to n8n**
4. **Check Executions tab** in your workflow

**Expected:**
- ✅ New execution appears
- ✅ Shows lead data in webhook node

**If fails:**
- Check workflow is active
- Verify workflow ID in `.env`
- Check backend logs: `docker-compose logs backend | grep workflow`

---

## ✅ Success Checklist

- [ ] All Docker containers running
- [ ] n8n accessible at http://localhost:5678
- [ ] Lite CRM accessible at http://localhost:8080
- [ ] Can login to both
- [ ] Embedded editor loads
- [ ] Can create workflow
- [ ] Workflow triggers on lead creation
- [ ] Execution visible in n8n

---

## 🐛 Quick Troubleshooting

### Services Not Starting
```bash
docker-compose down
docker-compose up -d
docker-compose logs
```

### n8n Not Accessible
```bash
docker-compose restart n8n
docker-compose logs n8n
```

### Workflow Not Triggering
1. Check workflow is **active** (toggle in n8n)
2. Verify workflow ID in `backend/.env`
3. Restart backend: `docker-compose restart backend`
4. Check logs: `docker-compose logs backend | grep workflow`

### Embedded Editor Not Loading
1. Open n8n directly first: http://localhost:5678
2. Check browser console (F12) for errors
3. Try in incognito mode
4. Clear browser cache

---

## 📝 Automated Test

Run the validation script:

```bash
./test-integration.sh
```

This will check:
- ✅ All services running
- ✅ Services accessible
- ✅ n8n health
- ✅ Environment configuration
- ✅ Logs for errors

---

## 🎯 What to Test

### Basic Integration
- [x] Services running
- [x] n8n accessible
- [x] CRM accessible
- [x] Embedded editor works

### Workflow Functionality
- [ ] Create workflow
- [ ] Activate workflow
- [ ] Workflow triggers
- [ ] Data flows correctly

### Events
- [ ] Lead creation triggers workflow
- [ ] Stage change triggers workflow
- [ ] Task creation triggers workflow

---

## 📚 Full Documentation

For detailed validation steps, see:
- **VALIDATION_GUIDE.md** - Complete validation guide
- **N8N_SETUP_GUIDE.md** - Setup instructions
- **QUICK_START_N8N.md** - Quick start guide

---

## 🎉 Success!

If all checks pass, your integration is **working correctly**!

Next steps:
1. Create production workflows
2. Configure all events
3. Set up monitoring
4. Document your workflows
