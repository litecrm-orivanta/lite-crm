# Custom Workflow Builder Implementation

## Overview

This document describes the replacement of n8n with a custom native workflow builder for Lite CRM. The new system provides a visual workflow editor and execution engine built directly into the application.

## Changes Made

### 1. Database Schema Updates

**New Models:**
- `Workflow` - Stores workflow definitions
- `WorkflowNode` - Stores individual nodes in workflows
- `WorkflowEdge` - Stores connections between nodes
- `WorkflowExecution` - Stores execution history

**New Enums:**
- `WorkflowNodeType`: TRIGGER, HTTP_REQUEST, EMAIL, DELAY, CONDITION, SET_VARIABLE, WEBHOOK
- `WorkflowTriggerEvent`: LEAD_CREATED, LEAD_UPDATED, LEAD_STAGE_CHANGED, LEAD_ASSIGNED, TASK_CREATED, TASK_COMPLETED, USER_INVITED
- `WorkflowExecutionStatus`: PENDING, RUNNING, SUCCESS, FAILED, CANCELLED

**Removed:**
- `WorkflowConfiguration` table (replaced by Workflow model)
- n8n-related fields from `Workspace` model

### 2. Backend Changes

**New Services:**
- `WorkflowExecutionService` - Executes workflows and processes nodes
- Updated `WorkflowsService` - Manages workflow CRUD operations

**New Controller:**
- Updated `WorkflowsController` - REST API for workflow management

**Removed Files:**
- `n8n-proxy.controller.ts`
- `n8n-user.service.ts`
- `workflow-configuration.service.ts`

**Updated Files:**
- `auth.service.ts` - Removed n8n setup logic
- `auth.module.ts` - Removed WorkflowsModule dependency
- `leads.service.ts` - Uses new WorkflowsService (no changes needed)

### 3. Frontend Changes

**New Components:**
- `WorkflowEditor.tsx` - Visual workflow editor using ReactFlow
- Updated `Workflows.tsx` - Workflow list page

**Node Types Supported:**
1. **Trigger** - Starts workflow on CRM events
2. **HTTP Request** - Makes HTTP calls to external APIs
3. **Email** - Sends emails via notification service
4. **Delay** - Adds delays between steps
5. **Condition** - Conditional branching (if/else)
6. **Set Variable** - Sets workflow variables
7. **Webhook** - Sends data to external webhooks

**Features:**
- Drag-and-drop node editor
- Visual connection between nodes
- Node configuration panels
- Save/load workflows
- Active/inactive toggle

### 4. Infrastructure Changes

**Docker Compose:**
- Removed n8n service
- Removed n8n_data volume

**Dependencies:**
- Added `reactflow` to frontend
- No backend dependency changes needed

## Migration Steps

### 1. Database Migration

Run the migration to update the database schema:

```bash
cd backend
npx prisma migrate dev
```

Or if using Docker:

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 2. Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# Check logs
docker-compose logs -f backend frontend
```

### 3. Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Database: localhost:5433

## Usage

### Creating a Workflow

1. Navigate to **Workflows** page
2. Click **"Create Workflow"**
3. Enter workflow name and description
4. Add nodes from the palette:
   - Start with a **Trigger** node and select an event
   - Add action nodes (HTTP Request, Email, etc.)
   - Connect nodes by dragging from output to input
5. Configure each node by clicking on it
6. Click **"Save Workflow"**

### Workflow Execution

Workflows automatically execute when their trigger events occur:
- `lead.created` - When a new lead is created
- `lead.updated` - When lead details are updated
- `lead.stage.changed` - When lead stage changes
- `lead.assigned` - When a lead is assigned
- `task.created` - When a task is created
- `task.completed` - When a task is completed
- `user.invited` - When a user is invited

### Variable Interpolation

Use `{{variable}}` syntax to interpolate values:
- `{{data.lead.name}}` - Lead name
- `{{data.lead.email}}` - Lead email
- `{{data.lead.stage}}` - Lead stage
- `{{variables.myVar}}` - Custom variable set by Set Variable node

### Example Workflow

**"Send Welcome Email on Lead Creation"**
1. Trigger: `LEAD_CREATED`
2. Email Node:
   - To: `{{data.lead.email}}`
   - Subject: `Welcome {{data.lead.name}}!`
   - Body: `Thank you for your interest...`

## API Endpoints

### Workflows
- `GET /workflows` - List all workflows
- `GET /workflows/:id` - Get workflow details
- `POST /workflows` - Create workflow
- `PUT /workflows/:id` - Update workflow
- `DELETE /workflows/:id` - Delete workflow
- `GET /workflows/:id/executions` - Get execution history
- `POST /workflows/:id/trigger` - Manually trigger workflow

## Testing

### Local Testing

1. **Start services:**
   ```bash
   docker-compose up -d
   ```

2. **Create a test workflow:**
   - Go to http://localhost:8080/workflows
   - Create a new workflow
   - Add a Trigger node with event "LEAD_CREATED"
   - Add an Email node
   - Connect them
   - Save

3. **Test execution:**
   - Create a new lead in the dashboard
   - Check workflow executions in the workflow detail page
   - Verify email was sent (check backend logs)

### Validation Checklist

- [ ] Database migration runs successfully
- [ ] Services start without errors
- [ ] Can create workflows via UI
- [ ] Can edit workflows
- [ ] Can delete workflows
- [ ] Workflows execute on trigger events
- [ ] Execution history is recorded
- [ ] Email nodes send emails
- [ ] HTTP Request nodes make calls
- [ ] Condition nodes branch correctly
- [ ] Variables are set and used correctly

## Troubleshooting

### Workflows Not Executing

1. Check workflow is active
2. Verify trigger event matches
3. Check backend logs for errors
4. Verify execution history in database

### Node Execution Errors

1. Check node configuration
2. Verify variable names are correct
3. Check backend logs for detailed errors
4. Review execution output in UI

### Database Issues

1. Ensure migration ran successfully
2. Check database connection
3. Verify schema matches Prisma schema

## Future Enhancements

Potential improvements:
- More node types (SMS, Slack, etc.)
- Workflow templates
- Workflow versioning
- Scheduled workflows (cron)
- Workflow testing/debugging mode
- Workflow import/export
- Advanced condition logic
- Loops and iterations
- Error handling nodes

## Notes

- Workflows are workspace-scoped (multi-tenant)
- Execution is asynchronous and non-blocking
- Failed workflows don't break main CRM operations
- All executions are logged for debugging
- Variables are scoped per execution
