# n8n API Access Fix

## Issue
"Failed to load workflows. Make sure n8n is running."

## Root Cause
The n8n API requires authentication (Basic Auth), but the service wasn't sending credentials.

## Fix Applied

### 1. Added Basic Auth to API Calls
- Updated `listWorkflows()` to include Basic Auth headers
- Updated `getWorkflowExecutions()` to include Basic Auth headers
- Uses credentials from environment variables

### 2. Improved Error Handling
- Removed alert popup on error
- Gracefully handles when n8n API is not accessible
- Shows helpful message instead of error

### 3. Better User Experience
- No more error alerts
- Shows "Create Workflow" button when no workflows found
- Explains that API access is optional (webhooks still work)

## Environment Variables

Make sure these are set in `backend/.env`:

```env
N8N_URL=http://n8n:5678
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass
```

## After Fix

1. **Rebuild backend** (if using Docker):
   ```bash
   docker-compose build --no-cache backend
   docker-compose restart backend
   ```

2. **Or restart backend** (if running locally):
   ```bash
   npm run start:dev
   ```

3. **Refresh browser** and check Workflows page

## Expected Behavior

### If n8n API is accessible:
- ✅ Shows list of workflows
- ✅ Can view executions
- ✅ Everything works

### If n8n API is not accessible:
- ✅ No error alert
- ✅ Shows "Create Workflow" button
- ✅ Can still use editor to create workflows
- ✅ Webhooks still work (API is optional)

## Testing

1. **Check n8n is running:**
   ```bash
   docker-compose ps n8n
   ```

2. **Test n8n API directly:**
   ```bash
   curl -u admin:n8n_admin_pass http://localhost:5678/api/v1/workflows
   ```

3. **Check backend logs:**
   ```bash
   docker-compose logs backend | grep workflow
   ```

## Troubleshooting

### Still seeing error?

1. **Verify n8n is running:**
   ```bash
   docker-compose ps
   ```

2. **Check n8n credentials:**
   - Default: `admin` / `n8n_admin_pass`
   - Verify in `docker-compose.yml`

3. **Test API manually:**
   ```bash
   curl -u admin:n8n_admin_pass http://localhost:5678/api/v1/workflows
   ```

4. **Check backend logs:**
   ```bash
   docker-compose logs backend
   ```

### API still not working?

**Option 1: Use webhooks only**
- API access is optional
- Webhooks work without API
- You can still create workflows in editor
- Workflows will trigger on events

**Option 2: Enable n8n API Key**
1. Generate API key in n8n settings
2. Add to `backend/.env`:
   ```env
   N8N_API_KEY=your-api-key-here
   ```
3. Restart backend

## Important Note

**API access is optional!** Even if the API doesn't work:
- ✅ You can still create workflows in the editor
- ✅ Workflows will still trigger on CRM events
- ✅ Webhooks work independently of API
- ✅ The editor is fully functional

The API is only needed to:
- List workflows in the UI
- View execution history

These are nice-to-have features, but not required for workflows to function.
