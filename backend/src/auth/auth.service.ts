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
} from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NotificationService } from '../notifications/notification.service';
import { EmailTemplates } from '../notifications/email-templates';

type SignupPayload = {
  email: string;
  password: string;

  name?: string;
  mode?: 'SOLO' | 'ORG' | 'INVITE';

  workspaceName?: string;
  teamSize?: string;
  inviteId?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private notifications: NotificationService,
  ) {}

  // 🔑 FIXED: JWT now carries role + workspaceId + isSuperAdmin
  private sign(user: {
    id: string;
    email: string;
    role: UserRole;
    workspaceId: string;
    isSuperAdmin: boolean;
  }) {
    return {
      accessToken: this.jwt.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
        isSuperAdmin: user.isSuperAdmin,
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
          isSuperAdmin: user.isSuperAdmin || false,
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
            }
          : {
              name: `${name}'s Workspace`,
              type: WorkspaceType.SOLO,
              plan: 'FREE',
              trialStartDate,
              trialEndDate,
              isTrialActive: true,
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


      return this.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        workspaceId: user.workspaceId,
        isSuperAdmin: user.isSuperAdmin || false,
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
      isSuperAdmin: user.isSuperAdmin || false,
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
      isSuperAdmin: user.isSuperAdmin || false,
    });
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
        type: true,
        trialStartDate: true,
        trialEndDate: true,
        isTrialActive: true,
        subscription: {
          select: {
            status: true,
            planType: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new BadRequestException('Workspace not found');
    }

    // If subscription is ACTIVE, don't show trial banner
    const hasActiveSubscription = workspace.subscription?.status === 'ACTIVE';

    const now = new Date();
    let daysLeft: number | null = null;
    let isTrialValid = false;

    // Only show trial info if there's NO active subscription
    if (!hasActiveSubscription && workspace.isTrialActive && workspace.trialEndDate) {
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

  async forgotPassword(email: string) {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:285',message:'forgotPassword entry',data:{email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:289',message:'user lookup result',data:{userFound:!!user,userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    if (!user) {
      // Don't reveal if user exists for security
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    }

    // Generate secure token
    const token = this.jwt.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' },
    );
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:299',message:'token generated',data:{tokenLength:token?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Store reset token in database
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:305',message:'before passwordReset.create',data:{userId:user.id,expiresAt:expiresAt.toISOString()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:312',message:'passwordReset.create success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:315',message:'passwordReset.create error',data:{errorMessage:error?.message,errorCode:error?.code,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error;
    }

    // Send email with reset link
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    const resetLink = `${frontendUrl}/reset-password/${token}`;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:320',message:'before sendEmail',data:{email,frontendUrl},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    try {
      const userName = user.name || undefined;
      await this.notifications.sendEmail(
        email,
        'Reset Your Password - Lite CRM',
        EmailTemplates.getPasswordReset(resetLink, userName, '1 hour'),
      );
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:327',message:'sendEmail success',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/f820d926-2dc0-48ad-80e3-12d0d79d1a67',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'auth.service.ts:330',message:'sendEmail error',data:{errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      throw error;
    }

    return { message: 'If an account exists with this email, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    // Verify token
    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch (error) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (payload.type !== 'password-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    // Check if token exists and is valid
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!passwordReset || passwordReset.used || passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: passwordReset.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await this.prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true },
    });

    return { message: 'Password reset successfully' };
  }

}
