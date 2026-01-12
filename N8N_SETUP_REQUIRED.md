# n8n Setup Required - First Time Configuration

## Current Status

n8n has been reset and is running fresh. However, n8n requires an **owner account** to be created before it can be used.

## The Issue

When n8n is fresh (no owner account), it:
- Shows setup/login pages for all requests
- Returns HTML instead of JavaScript files in some cases
- Requires the first user (owner) to be created

This is why you're seeing:
- JavaScript files loading as HTML (MIME type errors)
- n8n errors in the browser console (`Cannot read properties of undefined`)
- Blank/error pages in the embedded editor

## Solution: Create n8n Owner Account

### Step 1: Access n8n Directly

1. Open **http://localhost:5678** in your browser
2. Browser will prompt for Basic Auth:
   - Username: `admin`
   - Password: `n8n_admin_pass`
3. You'll see n8n's setup page
4. Create the owner account (first user):
   - Enter email (e.g., `admin@example.com`)
   - Enter password
   - Complete setup

### Step 2: Verify Setup

After creating the owner account:
- n8n should load normally (workflow list page)
- JavaScript files should load correctly
- The `showSetupOnFirstLoad` setting will change to `false`
- Embedded editor should work (though authentication still needs to be completed)

### Step 3: Test Embedded Editor

1. Go back to Lite CRM
2. Navigate to Workflows → Open Editor
3. The JavaScript errors should be gone
4. The editor should load (though may still show a login screen until we complete session authentication)

## After Owner Account is Created

Once the owner account exists:
1. The embedded editor should load better (though may still show login)
2. JavaScript files will be served correctly (no more MIME type errors)
3. n8n will be in "operational" mode instead of "setup" mode
4. The n8n API will be fully accessible

## Quick Verification

Check if setup is complete:
```bash
curl -s http://localhost:5678/rest/settings -u admin:n8n_admin_pass | grep -o '"showSetupOnFirstLoad":false'
```

If you see `"showSetupOnFirstLoad":false`, setup is complete!

## Future Improvement

Once we complete the n8n user management integration:
- Workspaces will automatically get n8n user accounts
- No manual setup needed
- Everything works automatically
