# Embedded n8n Setup Guide

This guide explains how n8n is embedded into Lite CRM with unified branding.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Lite CRM Frontend                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Lite CRM Header (Branding)                       │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Embedded n8n Editor (iframe)                     │  │
│  │  ┌─────────────────────────────────────────────┐ │  │
│  │  │  n8n Workflow Canvas                        │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │
         │ API calls proxied through backend
         │ (handles authentication)
         ▼
┌─────────────────────────────────────────────────────────┐
│              Backend Proxy (/api/n8n-proxy)              │
│  - Validates JWT token                                  │
│  - Adds n8n basic auth                                  │
│  - Forwards requests to n8n                            │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│                    n8n Service                           │
└─────────────────────────────────────────────────────────┘
```

## Features

✅ **Unified UI** - n8n embedded within Lite CRM interface  
✅ **Single Sign-On** - Uses Lite CRM authentication  
✅ **Consistent Branding** - Lite CRM header/navigation visible  
✅ **No Separate Login** - Users don't need n8n credentials  
✅ **Seamless Experience** - All workflow management in one place  

## Setup

### 1. Configuration

The setup is already configured in:
- `docker-compose.yml` - n8n service configuration
- `backend/src/workflows/n8n-proxy.controller.ts` - Authentication proxy
- `frontend/src/pages/WorkflowEditor.tsx` - Embedded editor page

### 2. Access the Editor

1. **Navigate to Workflows** page in Lite CRM
2. **Click "Open Editor"** button
3. **n8n editor loads** embedded in the page

### 3. Authentication Flow

```
User logs into Lite CRM
    ↓
JWT token stored
    ↓
User opens Workflow Editor
    ↓
Backend proxy validates JWT
    ↓
Proxy adds n8n basic auth
    ↓
n8n receives authenticated request
    ↓
User can edit workflows
```

## Customization Options

### Option 1: Disable n8n Basic Auth (Recommended for Embedded)

If you want to rely entirely on Lite CRM authentication:

1. **Update `docker-compose.yml`**:
```yaml
environment:
  - N8N_BASIC_AUTH_ACTIVE=false  # Disable basic auth
```

2. **Update proxy controller** to skip basic auth:
```typescript
// Remove basic auth addition in n8n-proxy.controller.ts
```

### Option 2: Custom n8n Styling

You can inject custom CSS to match Lite CRM branding:

1. **Create custom CSS file** in frontend
2. **Inject via iframe** (requires same-origin or postMessage)

### Option 3: Full White-Label (Advanced)

For complete white-labeling, you would need to:
1. Fork n8n repository
2. Customize UI components
3. Replace branding assets
4. Build custom Docker image

## Current Implementation

### Frontend (`WorkflowEditor.tsx`)

- Embeds n8n in iframe
- Shows Lite CRM header/navigation
- Handles loading/error states
- Provides refresh/new tab options

### Backend (`n8n-proxy.controller.ts`)

- Proxies all n8n API requests
- Validates JWT from Lite CRM
- Adds n8n basic auth credentials
- Forwards requests to n8n service

### Docker Configuration

- n8n configured for embedding
- Basic auth enabled (can be disabled)
- CORS and security settings configured

## Usage

### Creating Workflows

1. Open Workflow Editor from Lite CRM
2. Create new workflow in n8n
3. Add webhook node
4. Configure webhook path
5. Copy workflow ID to `.env`

### Managing Workflows

- **View**: See all workflows in Workflows page
- **Edit**: Click "Open Editor" to edit
- **Execute**: Workflows auto-trigger on CRM events
- **Monitor**: View executions in Workflows page

## Troubleshooting

### Iframe Not Loading

**Issue**: n8n editor doesn't load in iframe

**Solutions**:
1. Check n8n is running: `docker-compose ps n8n`
2. Verify URL is correct
3. Check browser console for CORS errors
4. Try opening n8n directly: http://localhost:5678

### Authentication Errors

**Issue**: "Unauthorized" errors in n8n

**Solutions**:
1. Check JWT token is valid
2. Verify proxy controller is working
3. Check n8n basic auth credentials in `.env`
4. Review backend logs

### CORS Issues

**Issue**: Cross-origin errors

**Solutions**:
1. Ensure n8n CORS settings allow embedding
2. Check proxy headers are set correctly
3. Verify `N8N_EDITOR_BASE_URL` is set

## Security Considerations

1. **JWT Validation**: All requests through proxy validate JWT
2. **Basic Auth**: n8n still requires basic auth (or disable it)
3. **CORS**: Configured to allow embedding
4. **HTTPS**: Use HTTPS in production

## Production Deployment

For production:

1. **Use HTTPS** for all services
2. **Disable basic auth** if using only JWT
3. **Set secure cookies** in n8n
4. **Configure proper CORS** origins
5. **Use environment variables** for all secrets

## Next Steps

- [ ] Test embedded editor
- [ ] Customize n8n styling to match Lite CRM
- [ ] Add workflow templates
- [ ] Create workflow marketplace
- [ ] Add workflow sharing features

## Benefits of Embedded Approach

✅ **Better UX** - Users stay in one interface  
✅ **Unified Branding** - Consistent look and feel  
✅ **Simplified Auth** - Single sign-on  
✅ **Easier Onboarding** - No separate tool to learn  
✅ **Better Integration** - Seamless workflow between CRM and automation  
