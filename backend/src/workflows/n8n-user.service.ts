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
    this.n8nUrl =
      this.configService.get<string>('N8N_URL') || 'http://n8n:5678';
    this.ownerEmail =
      this.configService.get<string>('N8N_OWNER_EMAIL') || '';
    this.ownerPassword =
      this.configService.get<string>('N8N_OWNER_PASSWORD') || '';
  }

  /**
   * Get or refresh n8n authentication token
   * Uses cookie-based authentication for n8n REST API
   */
  private async getAuthToken(): Promise<string | null> {
    // Check if token is still valid (refresh every 30 minutes)
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken;
    }

    if (!this.ownerEmail || !this.ownerPassword) {
      this.logger.warn(
        'N8N_OWNER_EMAIL and N8N_OWNER_PASSWORD not configured. Cannot create n8n users.',
      );
      return null;
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

      // n8n returns session cookie, extract it
      const cookies = response.headers.get('set-cookie');
      const tokenMatch = cookies?.match(/n8n-auth=([^;]+)/);
      const token = tokenMatch ? tokenMatch[1] : null;

      if (token) {
        this.authToken = token;
        // Set expiry to 30 minutes from now
        this.tokenExpiry = new Date(Date.now() + 30 * 60 * 1000);
        this.logger.debug('Successfully authenticated with n8n');
      }

      return this.authToken;
    } catch (error) {
      this.logger.error('Error getting n8n auth token:', error);
      return null;
    }
  }

  /**
   * Create n8n user account for a workspace (SHARED instance approach)
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
          Cookie: `n8n-auth=${token}`,
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
        this.logger.error(
          `Failed to create n8n user: ${response.status} - ${errorText}`,
        );
        return null;
      }

      const data = await response.json();
      const user = data.data as N8nUserResponse;

      this.logger.log(
        `Created n8n user for workspace ${workspaceId}: ${email}`,
      );

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
          Cookie: `n8n-auth=${token}`,
        },
      });

      if (response.ok) {
        this.logger.log(`Deleted n8n user: ${userId}`);
      }

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
