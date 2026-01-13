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

}
