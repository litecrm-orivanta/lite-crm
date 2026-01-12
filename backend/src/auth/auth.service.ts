import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  AuthProvider,
  WorkspaceType,
  UserRole,
  N8nInstanceType,
} from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { WorkflowsService } from '../workflows/workflows.service';
import { N8nUserService } from '../workflows/n8n-user.service';

type SignupPayload = {
  email: string;
  password: string;

  name?: string;
  mode?: 'SOLO' | 'ORG' | 'INVITE';

  workspaceName?: string;
  teamSize?: string;
  inviteId?: string;
  n8nInstanceType?: 'SHARED' | 'DEDICATED';
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private workflowsService: WorkflowsService,
    private n8nUserService: N8nUserService,
  ) {}

  // 🔑 FIXED: JWT now carries role + workspaceId
  private sign(user: {
    id: string;
    email: string;
    role: UserRole;
    workspaceId: string;
  }) {
    return {
      accessToken: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
      }),
    };
  }

  async signup(payloadOrEmail: any, maybePassword?: string) {
    let payload: SignupPayload;

    if (typeof payloadOrEmail === 'string') {
      payload = {
        email: payloadOrEmail,
        password: maybePassword!,
      };
    } else {
      payload = payloadOrEmail;
    }

    const {
      email,
      password,
      name = 'User',
      mode = 'SOLO',
      workspaceName,
      teamSize,
      inviteId,
      n8nInstanceType = 'SHARED', // Default to SHARED
    } = payload;

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      // 🔹 INVITE MODE
      if (mode === 'INVITE') {
        if (!inviteId) {
          throw new BadRequestException('Invite ID is required');
        }

        const invite = await this.prisma.invite.findUnique({
          where: { id: inviteId },
        });

        if (
          !invite ||
          invite.acceptedAt ||
          invite.expiresAt < new Date() ||
          invite.email !== email
        ) {
          throw new BadRequestException('Invalid or expired invite');
        }

        const user = await this.prisma.user.create({
          data: {
            email,
            name,
            passwordHash,
            role: invite.role,
            authProvider: AuthProvider.LOCAL,
            workspaceId: invite.workspaceId,
          },
        });

        await this.prisma.invite.update({
          where: { id: inviteId },
          data: { acceptedAt: new Date() },
        });

        return this.sign({
          id: user.id,
          email: user.email,
          role: user.role,
          workspaceId: user.workspaceId,
        });
      }

      // 🔹 SOLO / ORG MODE
      // Set up 3-day free trial
      const trialStartDate = new Date();
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 3); // 3 days from now
      
      const workspaceData =
        mode === 'ORG'
          ? {
              name: workspaceName || 'My Organisation',
              type: WorkspaceType.ORG,
              teamSize,
              plan: 'FREE',
              trialStartDate,
              trialEndDate,
              isTrialActive: true,
              n8nInstanceType:
                (n8nInstanceType as N8nInstanceType) || N8nInstanceType.SHARED,
            }
          : {
              name: `${name}'s Workspace`,
              type: WorkspaceType.SOLO,
              plan: 'FREE',
              trialStartDate,
              trialEndDate,
              isTrialActive: true,
              n8nInstanceType:
                (n8nInstanceType as N8nInstanceType) || N8nInstanceType.SHARED,
            };

      const user = await this.prisma.user.create({
        data: {
          email,
          name,
          passwordHash,
          role: UserRole.ADMIN,
          authProvider: AuthProvider.LOCAL,
          workspace: {
            create: workspaceData,
          },
        },
      });

      // Auto-setup n8n for admin users
      if (user.role === UserRole.ADMIN) {
        await this.setupN8nForWorkspace(user.workspaceId).catch((error) => {
          // Don't fail signup if n8n setup fails - it's optional
          console.warn(`Failed to setup n8n for workspace ${user.workspaceId}:`, error);
        });
      }

      return this.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
      });
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
    });
  }

  async loginWithGoogle(data: { email: string; providerId: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: 'Google User',
          role: UserRole.ADMIN,
          authProvider: AuthProvider.GOOGLE,
          providerId: data.providerId,
          workspace: {
            create: {
              name: 'My Workspace',
              type: WorkspaceType.SOLO,
              plan: 'FREE',
              trialStartDate: new Date(),
              trialEndDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
              isTrialActive: true,
            },
          },
        },
      });
    }

    return this.sign({
      id: user.id,
      email: user.email,
      role: user.role,
      workspaceId: user.workspaceId,
    });
  }

  /**
   * Setup n8n for a workspace based on instance type
   * - SHARED: Creates n8n user account in shared instance
   * - DEDICATED: Reserves instance (implementation pending)
   */
  private async setupN8nForWorkspace(workspaceId: string): Promise<void> {
    try {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { n8nInstanceType: true, name: true },
      });

      if (!workspace) {
        throw new Error('Workspace not found');
      }

      if (workspace.n8nInstanceType === 'SHARED') {
        // Create n8n user account in shared instance
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
              // TODO: Store password encrypted
              // n8nUserPassword: await encrypt(n8nUser.password),
            },
          });
        }
      } else if (workspace.n8nInstanceType === 'DEDICATED') {
        // TODO: Implement dedicated instance provisioning
        // For now, just mark as setup (dedicated instances will be implemented separately)
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { n8nSetupAt: new Date() },
        });
        console.warn(
          `DEDICATED n8n instance requested for workspace ${workspaceId} - provisioning not yet implemented`,
        );
      }
    } catch (error) {
      // n8n setup is optional - don't fail signup if it fails
      console.warn(
        `Failed to setup n8n for workspace ${workspaceId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get workspace information including trial status
   */
  async getWorkspaceInfo(workspaceId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        plan: true,
        trialStartDate: true,
        trialEndDate: true,
        isTrialActive: true,
      },
    });

    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    const now = new Date();
    let daysLeft: number | null = null;
    let isTrialValid = false;

    if (workspace.isTrialActive && workspace.trialEndDate) {
      const endDate = new Date(workspace.trialEndDate);
      if (now <= endDate) {
        isTrialValid = true;
        const diffTime = endDate.getTime() - now.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) daysLeft = 0;
      }
    }

    return {
      ...workspace,
      daysLeft,
      isTrialValid,
    };
  }

  /**
   * Check if n8n is ready/accessible
   * Simplified: Just check if n8n service is accessible
   */
  async isN8nReady(workspaceId: string): Promise<boolean> {
    try {
      // Simple check: try to access n8n
      const n8nUrl = process.env.N8N_URL || 'http://n8n:5678';
      
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${n8nUrl}/`, {
        method: 'GET',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // If we get any response (even 401/403), n8n is accessible
      return response.ok || response.status === 401 || response.status === 403;
    } catch (error) {
      // n8n is not accessible (timeout or connection error)
      return false;
    }
  }
}
