# n8n Per-Workspace Isolation Implementation Guide

## Overview

Since n8n is open source, we can integrate it more directly as Lite CRM's workflow engine with proper per-workspace isolation. This document outlines two approaches:

1. **Shared Instance with n8n User Management** (Recommended for most cases)
2. **Dedicated n8n Instances per Workspace** (Maximum isolation)

## Approach 1: Shared Instance with n8n User Management (Recommended)

### Architecture

```
Lite CRM Workspace 1 → n8n User Account 1 (workspace-1@litecrm)
Lite CRM Workspace 2 → n8n User Account 2 (workspace-2@litecrm)
Lite CRM Workspace 3 → n8n User Account 3 (workspace-3@litecrm)
                      ↓
              Single n8n Instance
              (User-based isolation)
```

### Benefits
- ✅ Resource efficient (one instance)
- ✅ Easier to manage and maintain
- ✅ n8n handles user isolation natively
- ✅ Lower infrastructure costs
- ✅ Simpler deployment

### Implementation

#### Step 1: Configure n8n for User Management

Update `docker-compose.yml`:

```yaml
n8n:
  image: n8nio/n8n:latest
  ports:
    - "5678:5678"
  environment:
    # Disable Basic Auth (use n8n user management instead)
    - N8N_BASIC_AUTH_ACTIVE=false
    # Enable user management
    - N8N_USER_MANAGEMENT_DISABLED=false
    # Database for n8n (can share with Lite CRM or separate)
    - DB_TYPE=postgresdb
    - DB_POSTGRESDB_HOST=db
    - DB_POSTGRESDB_DATABASE=n8n
    - DB_POSTGRESDB_USER=postgres
    - DB_POSTGRESDB_PASSWORD=postgres
    # Other settings
    - N8N_HOST=0.0.0.0
    - N8N_PORT=5678
    - N8N_PROTOCOL=http
    - N8N_SECURE_COOKIE=false
  volumes:
    - n8n_data:/home/node/.n8n
  depends_on:
    - db
```

#### Step 2: Create n8n User Management Service

Create `backend/src/workflows/n8n-user.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface N8nUser {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class N8nUserService {
  private readonly logger = new Logger(N8nUserService.name);
  private readonly n8nUrl: string;
  private readonly n8nOwnerEmail: string;
  private readonly n8nOwnerPassword: string;

  constructor(private configService: ConfigService) {
    this.n8nUrl = this.configService.get<string>('N8N_URL') || 'http://n8n:5678';
    this.n8nOwnerEmail = this.configService.get<string>('N8N_OWNER_EMAIL') || 'owner@litecrm.local';
    this.n8nOwnerPassword = this.configService.get<string>('N8N_OWNER_PASSWORD') || 'change-me';
  }

  /**
   * Get n8n authentication token (login as owner)
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.n8nUrl}/rest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.n8nOwnerEmail,
          password: this.n8nOwnerPassword,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Failed to login to n8n: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      return data.data?.token || null;
    } catch (error) {
      this.logger.error('Error getting n8n auth token:', error);
      return null;
    }
  }

  /**
   * Create n8n user account for a workspace
   */
  async createUserForWorkspace(
    workspaceId: string,
    workspaceEmail: string,
    workspaceName: string,
  ): Promise<{ userId: string; email: string } | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        this.logger.error('Cannot create n8n user: authentication failed');
        return null;
      }

      // Generate a secure password for the workspace
      const password = this.generateSecurePassword();

      // Create user in n8n
      const response = await fetch(`${this.n8nUrl}/rest/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': token, // Or use cookie-based auth
        },
        body: JSON.stringify({
          email: workspaceEmail,
          password: password,
          firstName: workspaceName,
          role: 'member', // or 'admin' if workspace admin should have full access
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to create n8n user: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      
      // Store the password securely (you might want to encrypt it)
      // For now, we'll generate a new password each time and store it
      
      this.logger.log(`Created n8n user for workspace ${workspaceId}: ${workspaceEmail}`);
      
      return {
        userId: data.data?.id,
        email: workspaceEmail,
      };
    } catch (error) {
      this.logger.error('Error creating n8n user:', error);
      return null;
    }
  }

  /**
   * Get user credentials for workspace (for proxy authentication)
   */
  async getUserCredentials(workspaceId: string): Promise<{ email: string; password: string } | null> {
    // In production, retrieve from encrypted storage
    // For now, we'll need to store credentials when creating users
    // This should be stored in database with encryption
    return null;
  }

  /**
   * Generate secure password for workspace
   */
  private generateSecurePassword(): string {
    // Generate a secure random password
    // In production, use a proper password generator
    return `n8n_${Math.random().toString(36).slice(-16)}`;
  }

  /**
   * Delete n8n user when workspace is deleted
   */
  async deleteUserForWorkspace(userId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) return false;

      const response = await fetch(`${this.n8nUrl}/rest/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': token,
        },
      });

      return response.ok;
    } catch (error) {
      this.logger.error('Error deleting n8n user:', error);
      return false;
    }
  }
}
```

#### Step 3: Update Database Schema

Add fields to store n8n user mapping:

```prisma
model Workspace {
  // ... existing fields
  
  // n8n integration
  n8nSetupAt DateTime?
  n8nUserId  String?    // n8n user ID for this workspace
  n8nUserEmail String?  // n8n user email
}
```

#### Step 4: Update Auth Service to Create n8n Users

Update `backend/src/auth/auth.service.ts`:

```typescript
import { N8nUserService } from '../workflows/n8n-user.service';

// In AuthService constructor, inject N8nUserService
constructor(
  private prisma: PrismaService,
  private jwt: JwtService,
  private workflowsService: WorkflowsService,
  private n8nUserService: N8nUserService, // Add this
) {}

// Update setupN8nForWorkspace method
private async setupN8nForWorkspace(workspaceId: string): Promise<void> {
  try {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Create n8n user account for this workspace
    const n8nUserEmail = `workspace-${workspaceId}@litecrm.local`;
    const n8nUser = await this.n8nUserService.createUserForWorkspace(
      workspaceId,
      n8nUserEmail,
      workspace.name,
    );

    if (n8nUser) {
      // Store n8n user mapping
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          n8nSetupAt: new Date(),
          n8nUserId: n8nUser.userId,
          n8nUserEmail: n8nUser.email,
        },
      });
    }
  } catch (error) {
    this.logger.warn(`Failed to setup n8n for workspace ${workspaceId}:`, error);
    throw error;
  }
}
```

#### Step 5: Update Proxy to Use Workspace-Specific Authentication

Update `backend/src/workflows/n8n-proxy.controller.ts` to authenticate with workspace-specific n8n user:

```typescript
// Get workspace from JWT token
// Retrieve n8n user credentials for that workspace
// Authenticate with n8n using those credentials
// Proxy requests with workspace user's session
```

---

## Approach 2: Dedicated n8n Instances per Workspace

### Architecture

```
Lite CRM Workspace 1 → n8n Instance 1 (port 5678)
Lite CRM Workspace 2 → n8n Instance 2 (port 5679)
Lite CRM Workspace 3 → n8n Instance 3 (port 5680)
                      ↓
              Complete Isolation
```

### Benefits
- ✅ Maximum isolation (separate databases, processes)
- ✅ Better security (no shared resources)
- ✅ Independent scaling
- ✅ No cross-workspace data leakage possible

### Drawbacks
- ❌ Higher resource usage
- ❌ More complex deployment
- ❌ Requires dynamic instance management
- ❌ Higher infrastructure costs

### Implementation (Simplified)

This approach requires:
1. Dynamic n8n instance provisioning
2. Port management
3. Instance lifecycle management
4. Database per instance or schema separation

**This is more complex and typically only needed for enterprise setups.**

---

## Recommended: Approach 1 (Shared Instance with User Management)

### Why This Is Better for Most Cases

1. **n8n's Native User Management**: n8n already has user management built-in
2. **Resource Efficiency**: One instance serves all workspaces
3. **Easier Maintenance**: Updates, backups, monitoring are simpler
4. **Good Enough Isolation**: n8n users are isolated (can't see each other's workflows by default)
5. **Scalable**: Can still scale horizontally if needed

### Implementation Steps Summary

1. ✅ Disable Basic Auth in n8n
2. ✅ Enable n8n user management
3. ✅ Create n8n user service to manage users via API
4. ✅ Update database schema to store n8n user mappings
5. ✅ Update auth service to create n8n users on workspace creation
6. ✅ Update proxy to authenticate with workspace-specific n8n user
7. ✅ Store n8n user credentials securely (encrypted)

### Security Considerations

1. **Credential Storage**: Store n8n user passwords encrypted in database
2. **Token Management**: Use n8n API tokens for service-to-service auth
3. **User Permissions**: Set appropriate roles (member vs admin) per workspace
4. **Audit Logging**: Log all n8n user creation/deletion

### Next Steps

1. Research n8n's user management API endpoints
2. Test user creation via API
3. Implement credential storage with encryption
4. Update proxy to use workspace-specific auth
5. Add cleanup when workspaces are deleted
