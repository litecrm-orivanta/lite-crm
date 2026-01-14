# Admin Features Validation Guide

## ✅ Setup Complete!

All migrations have been applied and test data has been seeded. You're ready to validate!

---

## 🔑 Test Credentials

### Admin Account (for Admin Dashboard)
- **Email:** `admin@test.com`
- **Password:** `admin123`
- **Role:** ADMIN
- **Access:** Can view `/admin` dashboard

### Test Workspace Accounts
- **Free Plan:** `free@test.com` / `test123` (4 leads - 80% usage for testing warnings)
- **Starter Plan:** `starter@test.com` / `test123`
- **Professional Plan:** `professional@test.com` / `test123`
- **Business Plan:** `business@test.com` / `test123`

---

## 📋 Step-by-Step Validation

### Step 1: Access Admin Dashboard

1. **Open your browser:** Go to `http://localhost:8080`
2. **Login as Admin:**
   - Click "Login" or go to `/login`
   - Email: `admin@test.com`
   - Password: `admin123`
   - Click "Login"

3. **Verify Admin Access:**
   - ✅ You should see "Admin" link in the top navigation
   - ✅ Click on "Admin" or go to `/admin`
   - ✅ Admin Dashboard should load (not redirect)

---

### Step 2: Validate Admin Dashboard - Overview Tab

**What to Check:**
- [ ] **Total Users:** Should show `5` (1 admin + 4 test users)
- [ ] **Total Workspaces:** Should show `5` (1 admin workspace + 4 test workspaces)
- [ ] **Active Subscriptions:** Should show `4` (FREE, STARTER, PROFESSIONAL, BUSINESS)
- [ ] **Total Revenue:** Should show a positive amount (sum of completed payments)
- [ ] **Plans Breakdown:** Should show distribution of plans
- [ ] **Recent Payments:** Should show last 10 payments with details

**Expected Data:**
- At least 3 completed payments
- At least 1 pending payment
- At least 1 failed payment

---

### Step 3: Validate Admin Dashboard - Workspaces Tab

1. **Click "Workspaces" tab**

2. **Verify Workspace List:**
   - [ ] Should see 5 workspaces listed
   - [ ] Each workspace shows: Name, Plan, Amount, Users, Leads, Status
   - [ ] FREE workspace shows `$0.00`
   - [ ] STARTER workspace shows `$14.99`
   - [ ] PROFESSIONAL workspace shows `$29.99`
   - [ ] BUSINESS workspace shows `$79.99`

3. **Test Plan Editing:**
   - [ ] Click "Edit Plan" button on any workspace
   - [ ] Dropdown appears with plan options
   - [ ] Can change plan type (FREE, STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE)
   - [ ] Can edit amount field
   - [ ] Can check "Manual (no payment)" checkbox
   - [ ] Can add admin notes
   - [ ] Click "Save" - should update successfully
   - [ ] Click "Cancel" - should close edit mode

4. **Verify Status Badges:**
   - [ ] FREE workspace shows "TRIAL" status (blue badge)
   - [ ] Other workspaces show "ACTIVE" status (green badge)

---

### Step 4: Validate Admin Dashboard - Users Tab

1. **Click "Users" tab**

2. **Verify User List:**
   - [ ] Should see 5 users listed
   - [ ] Each user shows: Name, Email, Workspace, Role, Leads count, Created date
   - [ ] All users show "ADMIN" role (purple badge)
   - [ ] FREE workspace user shows `4` leads (80% of limit)

3. **Verify Data:**
   - [ ] Users are sorted by creation date (newest first)
   - [ ] Each user is linked to correct workspace

---

### Step 5: Validate Admin Dashboard - Payments Tab

1. **Click "Payments" tab**

2. **Verify Payment List:**
   - [ ] Should see at least 5 payments
   - [ ] Each payment shows: Workspace, Amount, Method, Status, Transaction ID, Date
   - [ ] Completed payments show green badge
   - [ ] Pending payments show yellow badge
   - [ ] Failed payments show red badge

3. **Verify Payment Details:**
   - [ ] Transaction IDs are displayed (format: `txn_...`)
   - [ ] Amounts match subscription amounts
   - [ ] Dates are formatted correctly

---

### Step 6: Validate Customer Billing Page

1. **Login as Test User:**
   - Logout from admin account
   - Login as `free@test.com` / `test123`
   - Go to `/billing` or click "Billing" in navigation

2. **Verify Subscription Tab:**
   - [ ] Current plan displays correctly (FREE)
   - [ ] Plan status shows "TRIAL" (blue badge)
   - [ ] Available plans section shows all 5 plans
   - [ ] FREE plan shows "Current Plan" (disabled button)
   - [ ] Other plans show "Upgrade" button
   - [ ] Plan features are listed correctly

3. **Test Plan Upgrade:**
   - [ ] Click "Upgrade" on STARTER plan
   - [ ] Confirmation dialog appears
   - [ ] After confirmation, subscription updates
   - [ ] Page refreshes with new plan

4. **Verify Payments Tab:**
   - [ ] Click "Payments" tab
   - [ ] Payment history displays (if any)
   - [ ] Shows: Amount, Method, Status, Transaction ID, Date

5. **Verify Invoices Tab:**
   - [ ] Click "Invoices" tab
   - [ ] Invoice list displays (if any)
   - [ ] Shows: Invoice #, Amount, Status, Due Date, Date
   - [ ] Status badges display correctly

---

### Step 7: Validate Usage Warnings

1. **Login as FREE Plan User:**
   - Login as `free@test.com` / `test123`
   - Go to Dashboard (`/`)

2. **Verify Warning Banner:**
   - [ ] Yellow warning banner appears at top
   - [ ] Shows: "You've used 4/5 leads (80%)"
   - [ ] "Upgrade Plan" button is visible

3. **Test Lead Creation Limit:**
   - [ ] Try to create a 5th lead - should succeed
   - [ ] Try to create a 6th lead - should show error:
     - Error message: "Lead limit reached. Please upgrade your plan to add more leads."

---

### Step 8: Validate API Endpoints

**Get Admin Stats:**
```bash
# Login first to get token, then:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/admin/stats
```
- [ ] Returns JSON with stats object
- [ ] Contains: totalUsers, totalWorkspaces, activeSubscriptions, totalRevenue

**Get Usage Stats:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/plan/usage
```
- [ ] Returns usage statistics
- [ ] Shows current usage vs limits
- [ ] Includes warnings array

**Get Subscription:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/subscriptions/me
```
- [ ] Returns subscription details
- [ ] Includes plan type, status, amount, dates

---

## 🐛 Troubleshooting

### Issue: "403 Forbidden" on `/admin`
**Solution:** Make sure you're logged in as a user with ADMIN role. Use `admin@test.com` / `admin123`

### Issue: Admin dashboard shows empty data
**Solution:** 
- Check if seed script ran successfully
- Verify database has data: `docker compose exec db psql -U litecrm -d litecrm -c "SELECT COUNT(*) FROM \"Workspace\";"`

### Issue: Usage warnings not showing
**Solution:** 
- Login as `free@test.com` (has 4/5 leads = 80%)
- Warning should appear automatically

### Issue: "Table does not exist" errors
**Solution:** 
- Run: `docker compose exec backend npx prisma db push`
- Restart backend: `docker compose restart backend`

---

## ✅ Validation Checklist Summary

- [ ] Can login as admin (`admin@test.com`)
- [ ] Admin dashboard loads (`/admin`)
- [ ] Overview tab shows correct stats
- [ ] Workspaces tab lists all workspaces
- [ ] Can edit workspace plans
- [ ] Users tab shows all users
- [ ] Payments tab shows payment history
- [ ] Customer billing page works (`/billing`)
- [ ] Can view subscription details
- [ ] Can upgrade plan
- [ ] Usage warnings appear at 80%
- [ ] Lead limits are enforced
- [ ] API endpoints return correct data

---

## 🎯 Quick Test Commands

```bash
# Check if services are running
docker compose ps

# Check database tables
docker compose exec db psql -U litecrm -d litecrm -c "\dt"

# View backend logs
docker compose logs backend --tail=50

# Restart backend
docker compose restart backend

# Re-seed test data (if needed)
docker compose exec backend npx ts-node src/scripts/seed-admin-test-data.ts
```

---

## 📝 Notes

- All test data is safe to delete - it's only for validation
- Admin credentials are for testing only - change in production!
- The seed script can be run multiple times (uses upsert)
- FREE workspace has 4 leads intentionally to test 80% warnings

---

**Happy Testing! 🚀**
