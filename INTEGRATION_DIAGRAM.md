# n8n ↔ Lite CRM Integration Diagram

## How They Connect

```
┌─────────────────────────────────────────────────────────────────┐
│                         LITE CRM SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Frontend   │         │   Backend    │                      │
│  │   (React)    │◄───────►│  (NestJS)    │                      │
│  │              │  HTTP   │              │                      │
│  └──────────────┘         └──────┬───────┘                      │
│                                   │                               │
│                          ┌────────▼────────┐                    │
│                          │ WorkflowsService │                    │
│                          │                  │                    │
│                          │  triggerByEvent()│                    │
│                          └────────┬─────────┘                    │
│                                   │                               │
└───────────────────────────────────┼───────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    │ JSON Payload
                                    │
┌───────────────────────────────────▼───────────────────────────────┐
│                         n8n WORKFLOW                               │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐                                                │
│  │   Webhook    │  ← Receives data from CRM                      │
│  │    Node      │                                                │
│  └──────┬───────┘                                                │
│         │                                                         │
│         │ Data flows through workflow                             │
│         │                                                         │
│  ┌──────▼───────┐  ┌──────────┐  ┌──────────┐                  │
│  │   Function   │─►│  Email   │  │   HTTP   │                  │
│  │    Node      │  │   Node    │  │ Request  │                  │
│  └──────────────┘  └──────────┘  └────┬─────┘                  │
│                                        │                          │
│                                        │ (Optional) Callback      │
│                                        │                          │
└────────────────────────────────────────┼──────────────────────────┘
                                         │
                                         │ HTTP POST
                                         │
┌────────────────────────────────────────▼──────────────────────────┐
│                         LITE CRM BACKEND                           │
│                    /api/workflows/webhook/:token                   │
│                                                                    │
│  (n8n can update CRM data via this endpoint)                      │
└────────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Lead Creation

### Step 1: User Creates Lead
```
User fills form → Frontend → POST /api/leads → Backend
```

### Step 2: Backend Processes Lead
```typescript
// In LeadsService.create()
const lead = await this.prisma.lead.create({ ... });

// Automatically triggers workflow
await this.workflows.triggerByEvent('lead.created', workspaceId, {
  lead: { ... }
});
```

### Step 3: Workflow Service Sends to n8n
```typescript
// In WorkflowsService.triggerWorkflow()
POST http://n8n:5678/webhook/abc123def456
Body: {
  "event": "lead.created",
  "workspaceId": "workspace-123",
  "data": {
    "lead": { ... }
  }
}
```

### Step 4: n8n Receives & Processes
```
Webhook Node → Receives JSON
     ↓
Function Node → Transforms data
     ↓
Email/Slack/HTTP → Sends notification
```

### Step 5: (Optional) n8n Calls Back
```
HTTP Request Node → POST http://backend:3000/api/workflows/webhook/token
Body: { "action": "update", "leadId": "...", "data": {...} }
```

## Configuration Map

```
┌─────────────────────────────────────────────────────────────┐
│                    CONFIGURATION LAYER                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  backend/.env                                                 │
│  ─────────────────────                                        │
│  N8N_URL=http://n8n:5678                                     │
│  N8N_WORKFLOW_LEAD_CREATED=abc123def456  ← Workflow ID      │
│  N8N_WORKFLOW_LEAD_STAGE_CHANGED=xyz789                     │
│                                                               │
│  n8n Workflow                                                 │
│  ─────────────────────                                        │
│  Webhook Path: /webhook/abc123def456  ← Must match above    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Event → Workflow Mapping

```
CRM Event                    →  Environment Variable          →  n8n Webhook
─────────────────────────────────────────────────────────────────────────────
lead.created                 →  N8N_WORKFLOW_LEAD_CREATED      →  /webhook/{id}
lead.updated                 →  N8N_WORKFLOW_LEAD_UPDATED      →  /webhook/{id}
lead.stage.changed           →  N8N_WORKFLOW_LEAD_STAGE_CHANGED →  /webhook/{id}
lead.assigned                 →  N8N_WORKFLOW_LEAD_ASSIGNED     →  /webhook/{id}
task.created                  →  N8N_WORKFLOW_TASK_CREATED      →  /webhook/{id}
task.completed                →  N8N_WORKFLOW_TASK_COMPLETED   →  /webhook/{id}
user.invited                  →  N8N_WORKFLOW_USER_INVITED     →  /webhook/{id}
```

## Real-World Example: Lead Enrichment

```
1. User creates lead "John Doe" in CRM
   ↓
2. CRM saves to database
   ↓
3. WorkflowsService triggers: POST /webhook/lead-enrich
   ↓
4. n8n receives webhook with lead data
   ↓
5. n8n calls external API (e.g., Clearbit):
   POST https://api.clearbit.com/enrichment
   Body: { "email": "john@example.com" }
   ↓
6. n8n receives enriched data (company, LinkedIn, etc.)
   ↓
7. n8n calls back to CRM:
   POST http://backend:3000/api/workflows/webhook/token
   Body: {
     "leadId": "lead-123",
     "enrichedData": {
       "companySize": "50-100",
       "industry": "Technology"
     }
   }
   ↓
8. CRM updates lead with enriched data
```

## Key Points

✅ **Webhooks don't need authentication** - They work out of the box  
✅ **API access is optional** - Only needed for listing workflows in UI  
✅ **Workflow ID = Webhook Path** - The part after `/webhook/`  
✅ **Non-blocking** - If workflow fails, CRM operation still succeeds  
✅ **Bidirectional** - n8n can call back to CRM via webhook endpoint  

## Quick Setup Checklist

- [ ] n8n is running (http://localhost:5678)
- [ ] Created webhook in n8n
- [ ] Copied workflow ID from webhook URL
- [ ] Added `N8N_WORKFLOW_LEAD_CREATED={id}` to backend/.env
- [ ] Restarted backend
- [ ] Created test lead in CRM
- [ ] Checked n8n executions tab
- [ ] ✅ Integration working!
