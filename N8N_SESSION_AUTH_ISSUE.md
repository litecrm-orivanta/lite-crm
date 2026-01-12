# n8n Session Authentication Issue

## Current Problem

The n8n workflow editor is embedded in an iframe, but JavaScript files are failing to load with MIME type errors. The files are being served as HTML instead of JavaScript.

## Root Cause

n8n's UI requires **session-based authentication** (user login), not just HTTP Basic Auth. While the proxy correctly forwards Basic Auth headers, n8n's web UI also requires:

1. **User session cookie** - Created when a user logs in to n8n
2. **Session validation** - n8n checks if the user is authenticated before serving UI assets

When accessed without a valid session:
- n8n redirects requests to login/setup pages (HTML)
- JavaScript files return HTML instead of JavaScript
- Browser throws MIME type errors

## The Issue

The proxy currently:
- ✅ Forwards Basic Auth headers (for API access)
- ❌ Does NOT establish or forward user sessions
- ❌ Does NOT handle session cookies

## Solution Options

### Option 1: Establish Session via Proxy (Recommended)

Modify the proxy to:
1. Check if user has n8n user credentials stored (from workspace setup)
2. Use n8n's login API to establish a session
3. Forward session cookies to the browser
4. Maintain session state for the user

**Pros:**
- Full n8n UI functionality
- User-specific workflows
- Proper isolation

**Cons:**
- More complex implementation
- Need to manage session lifecycle
- Need to store/encrypt n8n user credentials

### Option 2: Use n8n API Only (Alternative)

Instead of embedding the UI:
- Use n8n's REST API to create/manage workflows
- Build a custom workflow editor UI in Lite CRM
- Workflows are created via API calls

**Pros:**
- Simpler implementation
- Full control over UI
- No session management needed

**Cons:**
- Need to build custom workflow editor
- Less functionality than n8n's UI
- More development time

### Option 3: Allow Unauthenticated Access (Not Recommended)

Configure n8n to allow unauthenticated access (security risk).

**Pros:**
- Simplest solution

**Cons:**
- Major security risk
- Not recommended for production

## Recommended Next Steps

1. **Short-term**: Document that users need to log in to n8n directly first to establish a session
2. **Long-term**: Implement Option 1 (session management in proxy)

## Current Workaround

Users need to:
1. Open http://localhost:5678 directly in browser
2. Log in with owner account credentials
3. This establishes a session cookie
4. Then the embedded editor might work (if cookies are shared)

**Note**: This is not a proper solution, just a temporary workaround.
