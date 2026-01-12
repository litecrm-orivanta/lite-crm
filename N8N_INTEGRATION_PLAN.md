# n8n Integration Plan: Per-Workspace Isolation

## Executive Summary

**Goal**: Use n8n (open source) as Lite CRM's workflow engine with proper per-workspace isolation when creating user accounts.

**Recommended Approach**: Shared n8n instance with n8n user management (one n8n user per Lite CRM workspace)

## Why n8n as Lite CRM's Workflow Engine?

✅ **Open Source**: Free to use and customize  
✅ **Powerful**: Feature-rich workflow automation  
✅ **Well-Documented**: Extensive API and documentation  
✅ **Embeddable**: Can be embedded in iframes  
✅ **User Management**: Built-in user/role management  
✅ **API-First**: REST API for programmatic control  

## Architecture Decision: Shared Instance vs Dedicated Instances

### Option 1: Shared Instance with n8n Users (RECOMMENDED)

**How it works:**
- One n8n instance serves all Lite CRM workspaces
- Each Lite CRM workspace gets its own n8n user account
- n8n handles user isolation natively
- Proxy authenticates with workspace-specific n8n user

**Pros:**
- ✅ Resource efficient
- ✅ Easier to manage
- ✅ Lower costs
- ✅ n8n handles isolation

**Cons:**
- ⚠️ All workspaces share same n8n instance (but isolated by user)

### Option 2: Dedicated Instances per Workspace

**How it works:**
- Each workspace gets its own n8n instance
- Complete isolation (separate processes, databases)
- Dynamic instance provisioning required

**Pros:**
- ✅ Maximum isolation
- ✅ Better for enterprise/security-sensitive cases

**Cons:**
- ❌ Higher resource usage
- ❌ Complex deployment
- ❌ More expensive
- ❌ Requires instance lifecycle management

**Recommendation: Start with Option 1 (Shared Instance)**

---

## Implementation Plan: Shared Instance with User Management

### Phase 1: Configure n8n for User Management

#### Step 1.1: Update docker-compose.yml

```yaml
n8n:
  image: n8nio/n8n:latest
  ports:
    - "5678:5678"
  environment:
    # DISABLE Basic Auth - use n8n user management instead
    - N8N_BASIC_AUTH_ACTIVE=false
    
    # Enable user management (default is enabled, but explicit is better)
    - N8N_USER_MANAGEMENT_DISABLED=false
    
    # Use PostgreSQL for n8n (can share with Lite CRM DB)
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
    - N8N_METRICS=false
    - N8N_DIAGNOSTICS_ENABLED=false
  volumes:
    - n8n_data:/home/node/.n8n
  depends_on:
    - db
  restart: always
```

**Note**: For shared database, create separate database `n8n` in PostgreSQL, or use schema separation.

#### Step 1.2: First-Time n8n Setup

1. Start n8n: `docker-compose up -d n8n`
2. Access: `http://localhost:5678`
3. Create owner account (first user): `owner@litecrm.local` / `secure-password`
4. Save owner credentials in backend `.env`:
   ```env
   N8N_OWNER_EMAIL=owner@litecrm.local
   N8N_OWNER_PASSWORD=secure-password
   ```

### Phase 2: Database Schema Updates

#### Step 2.1: Update Prisma Schema

Add n8n user mapping to Workspace:

```prisma
model Workspace {
  id        String        @id @default(cuid())
  name      String
  type      WorkspaceType @default(SOLO)
  teamSize  String?
  createdAt DateTime      @default(now())

  plan      String @default("FREE")
  leadCount Int    @default(0)

  // n8n integration
  n8nSetupAt   DateTime?
  n8nUserId    String?    // n8n user ID for this workspace
  n8nUserEmail String?    // n8n user email (workspace-{id}@litecrm.local)

  users   User[]
  leads   Lead[]
  invites Invite[]
}
```

#### Step 2.2: Create Migration

```bash
cd backend
npx prisma migrate dev --name add_n8n_user_mapping
```

### Phase 3: Create n8n User Management Service

#### Step 3.1: Create Service File

**File**: `backend/src/workflows/n8n-user.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

interface N8nUserResponse {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

@Injectable()
export class N8nUserService {
  private readonly logger = new Logger(N8nUserService.name);
  private readonly n8nUrl: string;
  private readonly ownerEmail: string;
  private readonly ownerPassword: string;
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private configService: ConfigService) {
    this.n8nUrl = this.configService.get<string>('N8N_URL') || 'http://n8n:5678';
    this.ownerEmail = this.configService.get<string>('N8N_OWNER_EMAIL') || '';
    this.ownerPassword = this.configService.get<string>('N8N_OWNER_PASSWORD') || '';
  }

  /**
   * Get or refresh n8n authentication token
   */
  private async getAuthToken(): Promise<string | null> {
    // Check if token is still valid (refresh every 30 minutes)
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken;
    }

    try {
      const response = await fetch(`${this.n8nUrl}/rest/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.ownerEmail,
          password: this.ownerPassword,
        }),
      });

      if (!response.ok) {
        this.logger.error(`Failed to login to n8n: ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      this.authToken = data.data?.token || null;
      
      if (this.authToken) {
        // Set expiry to 30 minutes from now
        this.tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
      }

      return this.authToken;
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
    workspaceName: string,
  ): Promise<{ userId: string; email: string; password: string } | null> {
    try {
      const token = await this.getAuthToken();
      if (!token) {
        this.logger.error('Cannot create n8n user: authentication failed');
        return null;
      }

      const email = `workspace-${workspaceId}@litecrm.local`;
      const password = this.generateSecurePassword();

      const response = await fetch(`${this.n8nUrl}/rest/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `n8n-auth=${token}`, // n8n uses cookie-based auth
        },
        body: JSON.stringify({
          email: email,
          password: password,
          firstName: workspaceName,
          role: 'member', // Workspace users are members (not owners)
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Failed to create n8n user: ${response.status} - ${errorText}`);
        return null;
      }

      const data = await response.json();
      const user = data.data as N8nUserResponse;

      this.logger.log(`Created n8n user for workspace ${workspaceId}: ${email}`);

      return {
        userId: user.id,
        email: user.email,
        password: password, // Return password to store encrypted
      };
    } catch (error) {
      this.logger.error('Error creating n8n user:', error);
      return null;
    }
  }

  /**
   * Delete n8n user when workspace is deleted
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const token = await this.getAuthToken();
      if (!token) return false;

      const response = await fetch(`${this.n8nUrl}/rest/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Cookie': `n8n-auth=${token}`,
        },
      });

      return response.ok;
    } catch (error) {
      this.logger.error('Error deleting n8n user:', error);
      return false;
    }
  }

  /**
   * Generate secure random password
   */
  private generateSecurePassword(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64').slice(0, length);
  }
}
```

**Note**: n8n's API may use cookies or API keys. Check n8n documentation for exact authentication method.

#### Step 3.2: Add Service to Module

Update `backend/src/workflows/workflows.module.ts`:

```typescript
import { N8nUserService } from './n8n-user.service';

@Module({
  // ... existing imports
  providers: [
    WorkflowsService,
    N8nUserService, // Add this
  ],
  exports: [WorkflowsService, N8nUserService], // Export if needed
})
export class WorkflowsModule {}
```

### Phase 4: Update Auth Service

#### Step 4.1: Update setupN8nForWorkspace Method

**File**: `backend/src/auth/auth.service.ts`

```typescript
import { N8nUserService } from '../workflows/n8n-user.service';

// In constructor, inject N8nUserService
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
    const n8nUser = await this.n8nUserService.createUserForWorkspace(
      workspaceId,
      workspace.name,
    );

    if (n8nUser) {
      // Store n8n user mapping (password should be encrypted in production)
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: {
          n8nSetupAt: new Date(),
          n8nUserId: n8nUser.userId,
          n8nUserEmail: n8nUser.email,
          // TODO: Store password encrypted (use encryption service)
          // n8nUserPassword: encrypt(n8nUser.password),
        },
      });
    }
  } catch (error) {
    this.logger.warn(`Failed to setup n8n for workspace ${workspaceId}:`, error);
    // Don't throw - n8n setup is optional
  }
}
```

#### Step 4.2: Update Auth Module

Update `backend/src/auth/auth.module.ts` to import WorkflowsModule:

```typescript
import { WorkflowsModule } from '../workflows/workflows.module';

@Module({
  imports: [
    // ... existing imports
    WorkflowsModule, // Add this to access N8nUserService
  ],
  // ...
})
export class AuthModule {}
```

### Phase 5: Update Proxy for Workspace-Specific Auth

#### Step 5.1: Store n8n User Credentials Securely

**Option A**: Store in database (encrypted)
**Option B**: Generate password on-demand and store hash
**Option C**: Use n8n API tokens instead of passwords

For now, we'll use a simple approach (improve later):

Update proxy to:
1. Get workspace from JWT token
2. Retrieve n8n user email from workspace
3. Authenticate with n8n using that user's credentials
4. Proxy requests with workspace user's session

### Phase 6: Testing & Validation

1. ✅ Test workspace creation creates n8n user
2. ✅ Test n8n user isolation (user A can't see user B's workflows)
3. ✅ Test proxy authentication with workspace user
4. ✅ Test workflow execution per workspace
5. ✅ Test workspace deletion cleans up n8n user

---

## Important Notes

### n8n API Authentication

n8n's API authentication method may vary by version. Common methods:
- Cookie-based (session cookies)
- API keys (X-N8N-API-KEY header)
- JWT tokens

**Action**: Check n8n API documentation for your version to confirm authentication method.

### Password Storage

**Security**: Store n8n user passwords encrypted in database or use API tokens.

**Recommended**: Use n8n API tokens instead of passwords for service-to-service authentication.

### First-Time Setup

1. Create n8n owner account manually (first time only)
2. Store owner credentials in backend `.env`
3. Use owner credentials to create workspace users via API

---

## Next Steps

1. ✅ Review n8n API documentation for user management endpoints
2. ✅ Test n8n user creation manually via API
3. ✅ Implement N8nUserService with correct authentication
4. ✅ Update database schema
5. ✅ Update auth service
6. ✅ Update proxy for workspace auth
7. ✅ Add encryption for password storage
8. ✅ Test end-to-end workflow

---

## Alternative: Use n8n API Keys (Recommended for Production)

Instead of storing passwords, use n8n API keys:
- More secure
- Easier to manage
- Better for service-to-service auth

Check n8n documentation for API key generation and usage.
