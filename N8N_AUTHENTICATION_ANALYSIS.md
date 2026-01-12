# n8n Authentication & Integration Analysis

## How Authentication Currently Works

### 1. Account Creation Flow

**Important:** Creating a Lite CRM account does NOT create n8n accounts.

- **Lite CRM**: Each user/workspace has its own account in Lite CRM database
- **n8n**: There is ONE shared n8n instance for ALL Lite CRM users
- **n8n Authentication**: Uses Basic Auth with shared credentials:
  - Username: `admin` (configured in docker-compose.yml)
  - Password: `n8n_admin_pass` (configured in docker-compose.yml)

**Architecture:**
```
Lite CRM Users (Multiple) → Shared n8n Instance (Single)
                           ↓
                    Basic Auth: admin/n8n_admin_pass
```

### 2. Embedded Workflow Editor Flow

When you open the embedded workflow editor:

```
User (Lite CRM) 
    ↓
Opens WorkflowEditor.tsx
    ↓
Iframe loads: /api/n8n-proxy/
    ↓
Backend Proxy (n8n-proxy.controller.ts)
    - Adds Basic Auth header: Authorization: Basic <base64(admin:n8n_admin_pass)>
    - Proxies request to n8n: http://n8n:5678/
    ↓
n8n receives request with Basic Auth header
    ↓
❌ PROBLEM: n8n web UI requires SESSION COOKIES, not just Basic Auth headers
    ↓
n8n redirects to login page OR shows blank page
```

### 3. Direct Access ("Open in New Tab") Flow

When you click "Open in New Tab":

```
User clicks "Open in New Tab"
    ↓
Browser navigates to: http://localhost:5678 (direct n8n URL)
    ↓
n8n shows login page (Basic Auth prompt)
    ↓
User must manually enter:
    - Username: admin
    - Password: n8n_admin_pass
    ↓
n8n creates session cookie
    ↓
User can now use n8n
```

## The Core Problem

### Issue 1: n8n Uses Session-Based Authentication for Web UI

n8n has TWO authentication mechanisms:

1. **Basic Auth for API calls** - Works with headers
2. **Session/Cookie-based auth for Web UI** - Requires browser cookies

The proxy controller adds Basic Auth **headers**, which works for API calls, but the n8n **web interface** requires:
- An initial authentication to establish a session cookie
- That session cookie to be sent with subsequent requests
- The cookie to be accessible in the iframe context

### Issue 2: Iframe Cookie/Session Limitations

When n8n loads in an iframe:
- It tries to establish a session by making API calls
- These API calls need to include authentication
- But iframe requests from the browser don't automatically include the parent's authentication
- The proxy adds Basic Auth headers server-side, but n8n's JavaScript might make direct requests that bypass the proxy

### Issue 3: n8n Redirects to Login Page

When n8n detects it's not authenticated (no session cookie):
- It redirects to `/login` page
- The login page requires user interaction (can't be automated easily)
- In an iframe, this redirect might result in a blank page or login page embedded

## Why "Open in New Tab" Shows Login Page

The "Open in New Tab" button uses the **direct n8n URL** (`http://localhost:5678`), not the proxy:
- No authentication headers are sent
- Browser shows Basic Auth prompt
- User must manually log in
- After login, session cookie is set and n8n works

This is **expected behavior** - it's a direct link to n8n that requires manual authentication.

## Why Embedded Editor is Blank

The embedded editor is blank because:

1. **n8n requires session cookies** for its web UI
2. **Proxy adds Basic Auth headers**, but n8n's frontend JavaScript expects cookies
3. **No session cookie exists** when iframe loads
4. **n8n redirects to login** or fails to load properly
5. **Iframe shows blank** because n8n's JavaScript can't authenticate

## Current Implementation Details

### Proxy Controller (`n8n-proxy.controller.ts`)

```typescript
// Adds Basic Auth header to requests
const auth = Buffer.from(`${this.n8nAuth.user}:${this.n8nAuth.pass}`).toString('base64');
headers['Authorization'] = `Basic ${auth}`;
```

**What it does:**
- ✅ Adds `Authorization: Basic <credentials>` header
- ✅ Works for API calls (REST endpoints)
- ❌ Doesn't work for web UI (needs session cookies)

**What it doesn't do:**
- ❌ Establish n8n session cookies
- ❌ Handle n8n's login flow
- ❌ Persist authentication state for iframe

### n8n Configuration (`docker-compose.yml`)

```yaml
environment:
  - N8N_BASIC_AUTH_ACTIVE=true
  - N8N_BASIC_AUTH_USER=admin
  - N8N_BASIC_AUTH_PASSWORD=n8n_admin_pass
```

**This means:**
- n8n requires Basic Auth for ALL requests
- Web UI AND API both require authentication
- Web UI converts Basic Auth to session cookies after first authentication

## Solutions

### Option 1: Pre-authenticate and Pass Cookies (Recommended)

Make the proxy establish a session with n8n and pass cookies to the iframe:

1. Proxy makes initial request to n8n with Basic Auth
2. n8n responds with Set-Cookie header (session cookie)
3. Proxy stores the cookie
4. Proxy passes the cookie to subsequent requests
5. n8n web UI receives session cookie and works

**Challenges:**
- Cookie management in proxy
- Cookie expiration handling
- Multiple users sharing same session (security concern)

### Option 2: Disable n8n Basic Auth (Not Recommended)

Disable Basic Auth in n8n and rely only on proxy authentication:

**Problems:**
- n8n becomes publicly accessible if proxy fails
- No protection if someone accesses n8n directly
- Security risk

### Option 3: Use n8n API Key Instead

Use n8n API key authentication instead of Basic Auth:

**Benefits:**
- More secure
- Better for programmatic access
- Still requires session for web UI

### Option 4: Accept Manual Login for Direct Access

Keep current implementation but improve UX:
- Make "Open in New Tab" the primary method
- Show clear instructions about credentials
- Document that embedded editor has limitations

### Option 5: Custom n8n Authentication Integration

Implement custom authentication that syncs Lite CRM users with n8n:
- More complex
- Requires n8n customization or API integration
- Better long-term solution

## Recommended Approach

**For immediate fix:** Option 1 (Cookie-based session passing)

**For long-term:** Option 5 (Custom authentication integration)

The embedded editor should:
1. Make initial request through proxy
2. Proxy establishes n8n session (gets cookie)
3. Proxy forwards cookie to iframe requests
4. n8n web UI receives cookie and works

This requires modifying the proxy controller to:
- Handle Set-Cookie headers from n8n
- Store and forward cookies
- Manage cookie lifecycle

## Current State Summary

✅ **What Works:**
- Backend can trigger n8n workflows (API calls with Basic Auth)
- "Open in New Tab" works (manual login required)
- Proxy infrastructure exists

❌ **What Doesn't Work:**
- Embedded iframe editor (blank page)
- Automatic authentication in iframe
- Session management for web UI

🔧 **Root Cause:**
- n8n web UI requires session cookies
- Proxy only adds Basic Auth headers
- No cookie/session handling in proxy

📝 **Next Steps:**
- Implement cookie-based session handling in proxy
- Or accept manual login for direct access
- Or implement custom authentication integration
