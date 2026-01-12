# Fix X-Frame-Options Error

## Error
```
Refused to display 'http://localhost:5678/' in a frame because it set 'X-Frame-Options' to 'sameorigin'.
```

## Problem
n8n is blocking iframe embedding with the `X-Frame-Options: sameorigin` header. This prevents the page from being embedded in an iframe from a different origin.

## Solutions

### Solution 1: Use Proxy (Recommended)

Instead of embedding n8n directly, use the backend proxy we created. This bypasses X-Frame-Options.

Update `WorkflowEditor.tsx` to use the proxy endpoint.

### Solution 2: Configure n8n to Allow Embedding

n8n doesn't have a direct environment variable to disable X-Frame-Options, but we can:
1. Use a reverse proxy (nginx) to remove the header
2. Use the backend proxy we already created
3. Access n8n directly (not embedded)

### Solution 3: Use PostMessage API (Advanced)

Create a custom integration using postMessage to communicate between iframe and parent.

## Recommended: Use Backend Proxy

The easiest solution is to use the `/api/n8n-proxy/` endpoint we created, which:
- ✅ Handles authentication
- ✅ Can modify headers (remove X-Frame-Options)
- ✅ Works from same origin (no CORS issues)

Let me update the WorkflowEditor to use the proxy.
