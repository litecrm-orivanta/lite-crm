# n8n Integration Setup Guide - Step by Step

This guide walks you through connecting n8n workflows to Lite CRM events.

## Prerequisites

✅ n8n is running (http://localhost:5678)  
✅ Lite CRM backend is running  
✅ You have admin access to both

## Integration Flow Overview

```
CRM Event (e.g., Lead Created)
    ↓
Backend WorkflowsService
    ↓
HTTP POST to n8n Webhook
    ↓
n8n Workflow Executes
    ↓
(Optional) n8n calls back to CRM
```

## Step 1: Create Your First Workflow in n8n

### 1.1 Open n8n Editor

1. Go to http://localhost:5678
2. Click **"Add workflow"** or use an existing one
3. You'll see the workflow canvas

### 1.2 Add Webhook Node

1. Click **"+"** to add a node
2. Search for **"Webhook"**
3. Select **"Webhook"** node
4. Configure:
   - **HTTP Method**: `POST`
   - **Path**: `lead-created` (or any name you want)
   - **Response Mode**: `Respond to Webhook`
   - **Response Code**: `200`
5. Click **"Execute Node"** to activate the webhook
6. **Copy the webhook URL** - it will look like:
   ```
   http://localhost:5678/webhook/abc123def456
   ```
   The part after `/webhook/` is your **Workflow ID**: `abc123def456`

### 1.3 Add Processing Nodes

After the webhook, add nodes to process the data:

**Example: Simple Email Notification**

1. **Webhook** node (already added)
2. **Function** node (to format data):
   ```javascript
   const lead = $input.item.json.data.lead;
   return {
     subject: `New Lead: ${lead.name}`,
     body: `
       Lead Name: ${lead.name}
       Email: ${lead.email || 'N/A'}
       Phone: ${lead.phone || 'N/A'}
       Company: ${lead.company || 'N/A'}
       Source: ${lead.source || 'N/A'}
     `
   };
   ```
3. **Email** node (Send Email):
   - Configure your SMTP settings
   - To: Your email
   - Subject: `{{ $json.subject }}`
   - Body: `{{ $json.body }}`

### 1.4 Activate the Workflow

1. Toggle the **"Active"** switch at the top right
2. The workflow is now listening for webhooks

## Step 2: Configure Lite CRM Backend

### 2.1 Get Your Workflow ID

From step 1.2, you have the workflow ID (e.g., `abc123def456`)

### 2.2 Update Environment Variables

Edit `backend/.env` file:

```env
# n8n Configuration
N8N_URL=http://n8n:5678

# Workflow IDs (use the ID from your webhook URL)
N8N_WORKFLOW_LEAD_CREATED=abc123def456
N8N_WORKFLOW_LEAD_STAGE_CHANGED=your-other-workflow-id
N8N_WORKFLOW_LEAD_ASSIGNED=another-workflow-id
```

**Important**: 
- If running locally (not Docker), use `http://localhost:5678` instead of `http://n8n:5678`
- The workflow ID is the part after `/webhook/` in the URL

### 2.3 Restart Backend

```bash
# If using Docker
docker-compose restart backend

# If running locally
npm run start:dev
```

## Step 3: Test the Integration

### 3.1 Create a Test Lead

1. Go to Lite CRM dashboard
2. Create a new lead
3. Check n8n workflow executions:
   - Go to n8n → Your workflow
   - Click "Executions" tab
   - You should see a new execution

### 3.2 Verify Data Flow

In n8n, check the webhook node output. You should see:

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

## Step 4: Common Workflow Examples

### Example 1: Send Email on Lead Creation

**Workflow Structure:**
```
Webhook → Function → Email
```

**Function Node Code:**
```javascript
const lead = $input.item.json.data.lead;
return {
  to: 'sales@yourcompany.com',
  subject: `New Lead: ${lead.name}`,
  html: `
    <h2>New Lead Created</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
    <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
    <p><strong>Company:</strong> ${lead.company || 'N/A'}</p>
    <p><strong>Source:</strong> ${lead.source || 'N/A'}</p>
  `
};
```

### Example 2: Send Slack Notification on Stage Change to WON

**Workflow Structure:**
```
Webhook → IF (stage = WON) → Slack
```

**IF Node:**
- Condition: `{{ $json.data.newStage }}` equals `WON`

**Slack Node:**
- Channel: `#sales`
- Message: `🎉 Lead won: {{ $json.data.lead.name }}`

### Example 3: Enrich Lead Data from External API

**Workflow Structure:**
```
Webhook → HTTP Request (Enrich API) → Function → HTTP Request (Update CRM)
```

1. **HTTP Request** (to enrichment service):
   - Method: POST
   - URL: `https://api.enrichment-service.com/enrich`
   - Body: `{ "email": "{{ $json.data.lead.email }}" }`

2. **Function** (format data):
   ```javascript
   const lead = $input.item.json.data.lead;
   const enriched = $input.item.json; // from enrichment API
   
   return {
     leadId: lead.id,
     enrichedData: {
       companySize: enriched.companySize,
       industry: enriched.industry,
       linkedin: enriched.linkedin
     }
   };
   ```

3. **HTTP Request** (back to CRM):
   - Method: POST
   - URL: `http://backend:3000/api/workflows/webhook/your-secret-token`
   - Body: `{{ $json }}`

### Example 4: Create Task in External System

**Workflow Structure:**
```
Webhook → Function → HTTP Request (External Task API)
```

**Function Node:**
```javascript
const task = $input.item.json.data.task;
return {
  title: task.title,
  description: task.note || '',
  dueDate: task.dueAt,
  assignee: task.owner.email,
  source: 'lite-crm'
};
```

## Step 5: View Workflow Executions in CRM

1. Go to Lite CRM
2. Navigate to **Workflows** page (Admin only)
3. Click on a workflow to see execution history
4. Check execution status and timing

## Troubleshooting

### Workflow Not Triggering?

1. **Check workflow is active** in n8n (toggle switch)
2. **Verify workflow ID** in `.env` matches webhook path
3. **Check backend logs**:
   ```bash
   docker-compose logs backend | grep workflow
   ```
4. **Test webhook manually**:
   ```bash
   curl -X POST http://localhost:5678/webhook/your-workflow-id \
     -H "Content-Type: application/json" \
     -d '{"test": "data"}'
   ```

### Wrong URL in Docker?

If backend can't reach n8n:
- **In Docker**: Use `http://n8n:5678` (service name)
- **Locally**: Use `http://localhost:5678`
- **Check network**: Ensure both services are in same Docker network

### Data Not Appearing?

1. Check webhook node output in n8n
2. Verify JSON structure matches expected format
3. Use n8n's debug mode to see data at each node

## Advanced: Multiple Workflows for Same Event

You can trigger multiple workflows for the same event by creating multiple webhook nodes with different paths, then adding all workflow IDs to `.env`:

```env
N8N_WORKFLOW_LEAD_CREATED=workflow-id-1,workflow-id-2,workflow-id-3
```

(Note: This requires updating the service to handle comma-separated IDs)

## Next Steps

1. ✅ Create your first workflow
2. ✅ Test with a lead creation
3. ✅ Build more complex workflows
4. ✅ Set up callbacks from n8n to CRM
5. ✅ Monitor workflow executions

## Quick Reference

| Event | Triggered When | Payload Location |
|-------|---------------|------------------|
| `lead.created` | New lead added | `data.lead` |
| `lead.updated` | Lead details changed | `data.lead`, `data.changes` |
| `lead.stage.changed` | Stage updated | `data.lead`, `data.oldStage`, `data.newStage` |
| `lead.assigned` | Lead reassigned | `data.lead`, `data.newOwner` |
| `task.created` | Task created | `data.task` |
| `task.completed` | Task marked done | `data.task` |
| `user.invited` | Team invite sent | `data.invite` |

---

**Need Help?** Check the main `N8N_INTEGRATION.md` file for more details.
