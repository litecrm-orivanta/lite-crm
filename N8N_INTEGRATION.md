# n8n Workflow Integration Guide

This document explains how to integrate and use n8n workflows with Lite CRM.

## Overview

Lite CRM is integrated with n8n to enable workflow automation. When certain events occur in the CRM (like lead creation, stage changes, etc.), workflows can be automatically triggered in n8n.

## Architecture

- **n8n Service**: Runs as a separate Docker container (port 5678)
- **Backend Integration**: Workflows module triggers n8n webhooks on CRM events
- **Frontend UI**: Workflows page to view and manage workflows

## Setup

### 1. Start n8n Service

n8n is already configured in `docker-compose.yml`. Start it with:

```bash
docker-compose up -d n8n
```

Access n8n at: http://localhost:5678
- Username: `admin`
- Password: `n8n_admin_pass` (change in production!)

### 2. Environment Variables

Add these to your `backend/.env` file:

```env
# n8n Configuration
N8N_URL=http://n8n:5678
N8N_API_KEY=your-api-key-here  # Optional, for API authentication

# Workflow IDs (get from n8n after creating workflows)
N8N_WORKFLOW_LEAD_CREATED=your-workflow-id-1
N8N_WORKFLOW_LEAD_UPDATED=your-workflow-id-2
N8N_WORKFLOW_LEAD_STAGE_CHANGED=your-workflow-id-3
N8N_WORKFLOW_LEAD_ASSIGNED=your-workflow-id-4
N8N_WORKFLOW_TASK_CREATED=your-workflow-id-5
N8N_WORKFLOW_TASK_COMPLETED=your-workflow-id-6
N8N_WORKFLOW_USER_INVITED=your-workflow-id-7
```

## Available Events

The following events trigger workflows automatically:

### Lead Events

- **`lead.created`**: When a new lead is created
- **`lead.updated`**: When lead details are updated
- **`lead.stage.changed`**: When lead stage changes (NEW → CONTACTED → WON/LOST)
- **`lead.assigned`**: When a lead is reassigned to a different user

### Task Events

- **`task.created`**: When a new task is created
- **`task.completed`**: When a task is marked as completed

### User Events

- **`user.invited`**: When a team member is invited

## Creating Workflows in n8n

### Step 1: Create a Webhook Node

1. Open n8n at http://localhost:5678
2. Create a new workflow
3. Add a **Webhook** node
4. Configure:
   - **HTTP Method**: POST
   - **Path**: Choose a unique path (e.g., `lead-created`)
   - **Response Mode**: Respond to Webhook
5. Save the workflow and note the webhook URL

### Step 2: Get Workflow ID

The workflow ID is in the webhook URL:
```
http://localhost:5678/webhook/abc123def456
                              ^^^^^^^^^^^^
                              This is your workflow ID
```

### Step 3: Configure Environment Variable

Add the workflow ID to your `.env`:
```env
N8N_WORKFLOW_LEAD_CREATED=abc123def456
```

### Step 4: Build Your Workflow

Add nodes after the webhook to process the data:

**Example: Send Email on Lead Creation**

1. Webhook node (receives data)
2. Email node (Send Email)
   - Configure SMTP settings
   - Use data from webhook: `{{ $json.data.lead.name }}`

**Example: Update External CRM**

1. Webhook node
2. HTTP Request node
   - Method: POST
   - URL: Your external API
   - Body: Map fields from webhook data

## Webhook Payload Structure

When a workflow is triggered, n8n receives this payload:

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

### Event-Specific Payloads

**`lead.stage.changed`**:
```json
{
  "event": "lead.stage.changed",
  "workspaceId": "workspace-123",
  "data": {
    "lead": { ... },
    "oldStage": "NEW",
    "newStage": "CONTACTED"
  }
}
```

**`lead.assigned`**:
```json
{
  "event": "lead.assigned",
  "workspaceId": "workspace-123",
  "data": {
    "lead": { ... },
    "previousOwnerId": "user-789",
    "newOwner": {
      "id": "user-999",
      "name": "New Owner",
      "email": "newowner@example.com"
    }
  }
}
```

## Webhook Endpoints (n8n → CRM)

n8n workflows can call back to the CRM using webhooks:

**Endpoint**: `POST /api/workflows/webhook/:token`

**Example n8n HTTP Request Node**:
- URL: `http://backend:3000/api/workflows/webhook/your-secret-token`
- Method: POST
- Body: Any JSON data

**Note**: Implement token validation in production!

## API Endpoints

### List Workflows
```
GET /api/workflows
Authorization: Bearer <token>
```

### Trigger Workflow Manually
```
POST /api/workflows/trigger/:workflowId
Authorization: Bearer <token>
Body: {
  "event": "lead.created",
  "data": { ... }
}
```

### Get Workflow Executions
```
GET /api/workflows/:workflowId/executions?limit=10
Authorization: Bearer <token>
```

## Frontend Usage

1. Navigate to **Workflows** page (Admin only)
2. View all available workflows
3. Click a workflow to see execution history
4. Use the "Open n8n Editor" link to create/edit workflows

## Example Use Cases

### 1. Auto-Enrich Leads
- Trigger: `lead.created`
- Action: Call external API to enrich lead data
- Update: Use webhook to update lead in CRM

### 2. Slack Notifications
- Trigger: `lead.stage.changed` → `WON`
- Action: Send message to Slack channel

### 3. Email Sequences
- Trigger: `lead.created`
- Action: Add to email marketing tool (Mailchimp, SendGrid, etc.)

### 4. CRM Sync
- Trigger: `lead.updated`
- Action: Sync to external CRM (Salesforce, HubSpot, etc.)

### 5. Task Reminders
- Trigger: `task.created`
- Action: Schedule reminder in calendar app

## Troubleshooting

### Workflows Not Triggering

1. Check n8n is running: `docker-compose ps n8n`
2. Verify workflow is active in n8n
3. Check environment variables are set correctly
4. Check backend logs for workflow errors
5. Verify webhook URL is correct

### n8n API Errors

1. Check `N8N_URL` is correct (use service name in Docker: `http://n8n:5678`)
2. If using API key, verify `N8N_API_KEY` is set
3. Check n8n logs: `docker-compose logs n8n`

### Webhook Not Receiving Data

1. Verify workflow ID matches webhook path
2. Check n8n workflow is active
3. Test webhook manually using curl:
```bash
curl -X POST http://localhost:5678/webhook/your-workflow-id \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Security Considerations

1. **Change n8n default password** in production
2. **Use API keys** for n8n API access
3. **Implement webhook token validation** for n8n → CRM callbacks
4. **Restrict n8n access** to internal network only
5. **Use HTTPS** in production

## Production Deployment

1. Set strong n8n credentials
2. Use environment-specific workflow IDs
3. Enable n8n API authentication
4. Monitor workflow execution logs
5. Set up error notifications for failed workflows

## Next Steps

- Add workflow templates for common use cases
- Implement workflow versioning
- Add workflow testing/debugging tools
- Create workflow marketplace
