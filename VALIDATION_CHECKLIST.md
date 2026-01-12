# Validation Checklist

## ✅ Docker Containers Rebuilt and Restarted

All containers are up and running:
- ✅ Backend: http://localhost:3000
- ✅ Frontend: http://localhost:8080  
- ✅ Database: localhost:5433
- ✅ n8n: http://localhost:5678

## 🧪 Things to Validate

### 1. Signup Flow with n8n Instance Type Selection

1. **Go to signup page**: http://localhost:8080/signup
2. **Complete Steps 1-3**:
   - Step 1: Enter name, email, password
   - Step 2: Select SOLO or ORG
   - Step 3: If ORG, enter organization details
3. **Step 4: n8n Instance Type Selection** (NEW)
   - ✅ Should see two options: "Shared Instance (Recommended)" and "Dedicated Instance"
   - ✅ **SHARED should be pre-selected** (default)
   - ✅ When selecting **DEDICATED**, should see pricing warning
   - ✅ Warning should mention "Increased Pricing Notice" and "Enterprise/Business accounts only"
4. **Complete signup** and verify account is created

### 2. Database Verification

Check that new workspace has n8n fields:

```bash
docker-compose exec db psql -U litecrm -d litecrm -c "SELECT id, name, \"n8nInstanceType\", \"n8nUserId\", \"n8nUserEmail\" FROM \"Workspace\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

Expected:
- `n8nInstanceType` should be 'SHARED' (or 'DEDICATED' if selected)
- `n8nUserId` and `n8nUserEmail` will be NULL initially (n8n user creation happens in background)

### 3. n8n User Creation (SHARED instances)

**Note**: This requires n8n to be configured with user management. Currently n8n user creation may fail silently if:
- n8n owner credentials not configured
- n8n user management not enabled
- n8n API not accessible

To check if n8n user creation worked:
```bash
docker-compose logs backend | grep -i "n8n user"
```

### 4. Frontend Validation

1. ✅ Signup page loads correctly
2. ✅ All 4 steps work (3 for SOLO, 4 for ORG)
3. ✅ Step 4 shows n8n instance type selection
4. ✅ SHARED is default/selected
5. ✅ DEDICATED shows warning when selected
6. ✅ Can complete signup successfully

### 5. Backend Validation

Check backend logs for:
- No errors during startup
- Signup endpoint accepts `n8nInstanceType` parameter
- Workspace creation includes n8n fields

```bash
docker-compose logs backend | tail -50
```

## 📋 Expected Behavior

### Signup with SHARED (Default)
1. User signs up
2. `n8nInstanceType` = 'SHARED' in database
3. Backend attempts to create n8n user (may fail silently if n8n not configured)
4. Account created successfully

### Signup with DEDICATED
1. User signs up and selects DEDICATED
2. Warning shown about increased pricing
3. User proceeds with signup
4. `n8nInstanceType` = 'DEDICATED' in database
5. n8n user creation skipped (dedicated provisioning not yet implemented)
6. Account created successfully

## 🔍 Common Issues

1. **Step 4 not showing**: Check browser console for errors, verify frontend build included changes
2. **n8n user creation failing**: Check backend logs, verify n8n owner credentials configured
3. **Database errors**: Verify migration was applied, check Prisma Client generated correctly

## ✨ Success Criteria

- ✅ Signup flow works end-to-end
- ✅ Step 4 shows n8n instance type selection
- ✅ SHARED is default
- ✅ DEDICATED shows warning
- ✅ Workspace created with correct `n8nInstanceType`
- ✅ No console errors in browser
- ✅ No errors in backend logs
