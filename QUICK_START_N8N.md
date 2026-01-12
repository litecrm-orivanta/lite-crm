# Quick Start: Connect n8n to Lite CRM (5 Minutes)

## The Connection Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Lite CRM   │         │   Backend    │         │     n8n     │
│  (Frontend) │         │   (NestJS)   │         │  (Workflow) │
└──────┬──────┘         └──────┬───────┘         └──────┬───────┘
       │                       │                        │
       │ 1. User creates lead  │                        │
       ├──────────────────────>│                        │
       │                       │                        │
       │                       │ 2. Lead saved to DB    │
       │                       │                        │
       │                       │ 3. Trigger workflow   │
       │                       ├───────────────────────>│
       │                       │                        │
       │                       │                        │ 4. Webhook receives
       │                       │                        │    data & executes
       │                       │                        │
       │                       │ 5. (Optional) n8n     │
       │                       │<───────────────────────┤
       │                       │    calls back to CRM  │
       │                       │                        │
```

## Step-by-Step Integration

### Step 1: Create Webhook in n8n (2 minutes)

1. **Open n8n**: http://localhost:5678
2. **Click "Add workflow"** (or use existing)
3. **Add Webhook node**:
   - Click the **"+"** button
   - Search for **"Webhook"**
   - Select it
4. **Configure Webhook**:
   ```
   HTTP Method: POST
   Path: lead-created
   Response Mode: Respond to Webhook
   ```
5. **Click "Execute Node"** button (play icon)
6. **Copy the Webhook URL** that appears:
   ```
   http://localhost:5678/webhook/abc123def456
                              ^^^^^^^^^^^^
                              This is your WORKFLOW ID
   ```
   **Save this ID!** (e.g., `abc123def456`)

### Step 2: Configure Backend (1 minute)

1. **Open** `backend/.env` file
2. **Add these lines**:
   ```env
   N8N_URL=http://localhost:5678
   N8N_WORKFLOW_LEAD_CREATED=abc123def456
   ```
   *(Replace `abc123def456` with your actual workflow ID)*

3. **Restart backend**:
   ```bash
   # If using Docker
   docker-compose restart backend
   
   # If running locally
   # Stop and restart: npm run start:dev
   ```

### Step 3: Test It! (2 minutes)

1. **Go to Lite CRM** dashboard
2. **Create a new lead** (any test data)
3. **Go back to n8n**
4. **Check "Executions" tab** in your workflow
5. **You should see a new execution!** ✅

## What Data Gets Sent?

When you create a lead, n8n receives this JSON:

```json
{
  "event": "lead.created",
  "workspaceId": "workspace-123",
  "data": {
    "lead": {
      "id": "lead-456",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Acme Corp",
      "source": "Website",
      "region": "US",
      "stage": "NEW",
      "owner": {
        "id": "user-789",
        "name": "Sales Rep",
        "email": "rep@example.com"
      }
    }
  }
}
```

## Your First Workflow: Send Email

After the webhook, add an **Email** node:

1. **Add Email node** after Webhook
2. **Connect them** (drag from webhook to email)
3. **Configure Email**:
   - **To**: your-email@example.com
   - **Subject**: `New Lead: {{ $json.data.lead.name }}`
   - **Body**: 
     ```
     A new lead was created:
     
     Name: {{ $json.data.lead.name }}
     Email: {{ $json.data.lead.email }}
     Company: {{ $json.data.lead.company }}
     ```
4. **Activate workflow** (toggle switch top-right)
5. **Test**: Create a lead in CRM → Check your email!

## Common Issues & Fixes

### ❌ "Workflow not triggering"

**Check:**
1. Workflow is **Active** (toggle switch in n8n)
2. Workflow ID in `.env` matches webhook path
3. Backend restarted after `.env` change
4. Check backend logs: `docker-compose logs backend`

### ❌ "Can't connect to n8n"

**If running locally (not Docker):**
- Use `http://localhost:5678` in `.env`
- Make sure n8n is running

**If using Docker:**
- Use `http://n8n:5678` in `.env` (service name)
- Both services must be in same Docker network

### ❌ "No data in webhook"

**Check:**
1. Webhook node executed (green checkmark)
2. Click webhook node → See output data
3. Verify JSON structure matches expected format

## Next Steps

1. ✅ Test basic webhook connection
2. ✅ Add email notification
3. ✅ Try other events (stage changes, tasks)
4. ✅ Build complex workflows
5. ✅ Set up callbacks (n8n → CRM)

## Quick Reference

| Event Name | When It Triggers | Env Variable |
|------------|------------------|--------------|
| `lead.created` | New lead added | `N8N_WORKFLOW_LEAD_CREATED` |
| `lead.stage.changed` | Lead stage updated | `N8N_WORKFLOW_LEAD_STAGE_CHANGED` |
| `lead.assigned` | Lead reassigned | `N8N_WORKFLOW_LEAD_ASSIGNED` |
| `task.created` | Task created | `N8N_WORKFLOW_TASK_CREATED` |
| `task.completed` | Task completed | `N8N_WORKFLOW_TASK_COMPLETED` |

## Need More Help?

- **Detailed Guide**: See `N8N_SETUP_GUIDE.md`
- **Integration Docs**: See `N8N_INTEGRATION.md`
- **Test Connection**: Run the test script (see below)
