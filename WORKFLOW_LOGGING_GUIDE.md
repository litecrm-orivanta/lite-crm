# Workflow Logging and Execution Monitoring Guide

## How to View Workflow Logs

### 1. Backend Logs (Real-time)

View all backend logs in real-time:
```bash
docker-compose logs -f backend
```

Filter for workflow-related logs:
```bash
docker-compose logs backend | grep -i "workflow\|execution\|trigger"
```

View only workflow trigger logs:
```bash
docker-compose logs backend | grep "WORKFLOW TRIGGER"
```

View only execution logs:
```bash
docker-compose logs backend | grep "EXECUTION"
```

### 2. Log Format

The logs use emoji prefixes for easy identification:

- 🔔 `[WORKFLOW TRIGGER]` - When a workflow is triggered by an event
- ✅ `[WORKFLOW SUCCESS]` - When a workflow executes successfully
- ❌ `[WORKFLOW FAILED]` - When a workflow execution fails
- 📝 `[EXECUTION]` - Execution record creation and status
- 🔹 `[NODE]` - Individual node execution
- 🔗 `[NODE]` - Edge connections between nodes
- ⚠️  `[WORKFLOW TRIGGER]` - Warnings (no workflows found, etc.)

### 3. Example Log Output

When a lead is created, you'll see logs like:

```
🔔 [WORKFLOW TRIGGER] Event: lead.created | Workspace: workspace-123
✅ [WORKFLOW TRIGGER] Found 1 workflow(s) to execute for event: lead.created
   → Workflow: "Send Welcome Email" (ID: workflow-456)
📝 [EXECUTION] Created execution record: exec-789 for workflow: workflow-456
🎯 [EXECUTION] Found trigger node: trigger-1 with event: LEAD_CREATED
🚀 [EXECUTION] Starting workflow execution from trigger node...
  🔹 [NODE] Executing node: trigger-1 (TRIGGER)
  ✅ [NODE] Node trigger-1 completed
  🔗 [NODE] Node trigger-1 has 1 outgoing edge(s)
  🔹 [NODE] Executing node: email-1 (EMAIL)
  ✅ [NODE] Node email-1 completed
✅ [EXECUTION] Workflow execution completed successfully. Execution ID: exec-789
✅ [WORKFLOW SUCCESS] Workflow "Send Welcome Email" (workflow-456) executed successfully. Execution ID: exec-789
```

## How to Check if Workflows Are Triggered

### Method 1: View Execution History in UI

1. Navigate to **Workflows** page (`/workflows`)
2. Click **"View Executions"** on any workflow
3. You'll see:
   - Execution status (SUCCESS, FAILED, RUNNING, PENDING)
   - Execution timestamp
   - Input data (what triggered the workflow)
   - Output data (workflow results)
   - Error messages (if failed)

### Method 2: Check Backend Logs

1. Open terminal and run:
   ```bash
   docker-compose logs -f backend
   ```

2. Create a lead in the dashboard
3. Watch for logs like:
   ```
   🔔 [WORKFLOW TRIGGER] Event: lead.created | Workspace: ...
   ✅ [WORKFLOW TRIGGER] Found X workflow(s) to execute...
   ```

### Method 3: Check Database

Query execution records directly:
```bash
docker-compose exec db psql -U litecrm -d litecrm -c "SELECT id, status, started_at, completed_at, error FROM \"WorkflowExecution\" ORDER BY created_at DESC LIMIT 10;"
```

## Testing Workflow Execution

### Step 1: Create a Test Workflow

1. Go to `/workflows/editor`
2. Create a workflow with:
   - **Trigger**: "Lead Created"
   - **Action**: Email node (or any other node)
3. Save the workflow

### Step 2: Trigger the Workflow

1. Go to Dashboard
2. Create a new lead
3. The workflow should automatically trigger

### Step 3: Verify Execution

**Option A: Check UI**
- Go to `/workflows`
- Click "View Executions" on your workflow
- You should see a new execution with status "SUCCESS"

**Option B: Check Logs**
```bash
docker-compose logs backend | tail -50
```
Look for the execution logs

**Option C: Check Database**
```bash
docker-compose exec db psql -U litecrm -d litecrm -c "SELECT w.name, e.status, e.started_at FROM \"WorkflowExecution\" e JOIN \"Workflow\" w ON e.\"workflowId\" = w.id ORDER BY e.created_at DESC LIMIT 5;"
```

## Troubleshooting

### Workflow Not Triggering

1. **Check if workflow is active:**
   - Go to `/workflows`
   - Verify workflow shows "Active" status

2. **Check trigger event:**
   - Edit workflow
   - Verify trigger node has the correct event selected

3. **Check logs:**
   ```bash
   docker-compose logs backend | grep "WORKFLOW TRIGGER"
   ```
   - If you see "No workflows found", check trigger event matches
   - If you see errors, check the error message

### Workflow Execution Failing

1. **Check execution history:**
   - View executions in UI
   - Check error message

2. **Check logs:**
   ```bash
   docker-compose logs backend | grep "EXECUTION\|FAILED"
   ```

3. **Common issues:**
   - Node configuration missing required fields
   - Invalid variable references
   - Network errors (for HTTP/Webhook nodes)
   - Email configuration issues

### No Logs Appearing

1. **Verify backend is running:**
   ```bash
   docker-compose ps backend
   ```

2. **Check log level:**
   - All workflow logs use `logger.log()` which should appear
   - If not, check Docker logs directly:
     ```bash
     docker-compose logs backend --tail=100
     ```

## Log Levels

- **LOG**: Normal operations (triggers, executions, successes)
- **WARN**: Non-critical issues (no workflows found, skipped edges)
- **ERROR**: Failures (execution errors, missing nodes)
- **DEBUG**: Detailed information (node execution details)

## Real-time Monitoring

To monitor workflows in real-time:

```bash
# Watch all backend logs
docker-compose logs -f backend

# Watch only workflow-related logs
docker-compose logs -f backend | grep --line-buffered -i "workflow\|execution\|trigger"
```

## Execution History Features

In the UI, you can:
- ✅ View all executions for a workflow
- ✅ See execution status (SUCCESS, FAILED, RUNNING, PENDING)
- ✅ View input data (what triggered the workflow)
- ✅ View output data (workflow results)
- ✅ See error messages for failed executions
- ✅ Check execution timestamps

## Best Practices

1. **Monitor logs during development** to catch issues early
2. **Check execution history** after creating workflows
3. **Test workflows** with sample data before production use
4. **Review failed executions** to fix configuration issues
5. **Keep workflows active** only when needed (toggle active/inactive)
