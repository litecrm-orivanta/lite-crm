# n8n Embedding Limitation - Session Authentication Required

## Current Status

The n8n workflow editor cannot be fully embedded in an iframe due to n8n's authentication requirements.

## Root Cause

n8n's web UI requires **session-based authentication** (user login cookie), not just HTTP Basic Auth:

1. **Basic Auth** works for API calls (e.g., `/api/v1/workflows`)
2. **Session cookies** are required for the web UI (HTML, JavaScript, CSS assets)

When JavaScript files are requested without a valid session:
- n8n redirects to login page (HTML) instead of serving JavaScript
- Browser throws MIME type errors
- UI fails to load

## Why Cookie Forwarding Doesn't Solve It

We've implemented cookie forwarding, but there's no session cookie to forward because:
- No user has logged into n8n through the proxy
- Basic Auth doesn't establish a session cookie
- n8n requires explicit login to create a session

## Solutions

### Option 1: Use n8n Directly (Current Workaround)

Users should access n8n directly at http://localhost:5678 instead of embedded:
- ✅ Works immediately
- ✅ Full functionality
- ✅ No authentication issues
- ❌ Not embedded in Lite CRM

### Option 2: Programmatic Session Establishment (Complex)

Implement automatic login to establish session:

1. Store owner account credentials (encrypted)
2. On first request, POST to `/rest/login` with owner credentials
3. Get session cookie from response
4. Forward cookie to browser
5. Use cookie for all subsequent requests

**Challenges:**
- Need to store owner credentials securely
- Session management complexity
- All users share same session (security concern)

### Option 3: Per-Workspace Sessions (Best Long-term)

Use workspace-specific n8n user accounts:

1. When workspace created, create n8n user (already implemented)
2. Store n8n user password (encrypted) in database
3. On workflow editor access, look up workspace n8n user
4. Establish session using workspace user credentials
5. Forward session cookie to browser

**Pros:**
- Per-workspace isolation
- Better security
- Already partially implemented

**Cons:**
- Complex implementation
- Need password storage/encryption
- Session management overhead

### Option 4: Use n8n API Instead (Alternative)

Build custom workflow UI using n8n's REST API:

1. Use n8n API for all operations (no UI embedding)
2. Build custom workflow editor in Lite CRM
3. Workflows managed via API calls

**Pros:**
- Full control
- No authentication issues
- Better integration

**Cons:**
- Need to build custom UI
- More development time
- Less functionality than n8n's UI

## Recommendation

**Short-term:** Use Option 1 (direct access)
**Long-term:** Implement Option 3 (per-workspace sessions)

## Current Implementation

- ✅ Proxy infrastructure works
- ✅ Path rewriting works
- ✅ BASE_PATH rewrite works
- ✅ Cookie forwarding implemented
- ❌ Session establishment not implemented
- ❌ Embedded UI doesn't work without session

## Next Steps

To enable embedded editor:
1. Implement session establishment (Option 2 or 3)
2. Store and encrypt n8n user credentials
3. Establish session on workflow editor access
4. Forward session cookies to browser

This is a significant feature that requires careful implementation.
