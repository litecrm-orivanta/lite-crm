import {
  ForbiddenException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service';
import { WorkflowsService } from '../workflows/workflows.service';
import { EmailTemplates } from '../notifications/email-templates';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

@Injectable()
export class InvitesService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
    private workflows: WorkflowsService,
  ) {}

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins allowed');
    }
    return user;
  }

  async createInvite(
    userId: string,
    workspaceId: string,
    email: string,
    role: UserRole,
  ) {
    await this.assertAdmin(userId);

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing && existing.workspaceId === workspaceId) {
      throw new BadRequestException('User already in workspace');
    }

    // Check user limit based on plan
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true, name: true },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const currentUserCount = await this.prisma.user.count({
      where: { workspaceId },
    });

    // Enforce user limits based on plan
    let maxUsers: number;
    switch (workspace.plan) {
      case 'STARTER':
        maxUsers = 1;
        break;
      case 'PROFESSIONAL':
        maxUsers = 5;
        break;
      case 'BUSINESS':
        maxUsers = Infinity; // Unlimited
        break;
      default:
        // FREE or unknown plan - default to 1 user
        maxUsers = 1;
    }

    if (currentUserCount >= maxUsers) {
      throw new BadRequestException(
        `Your ${workspace.plan} plan allows up to ${maxUsers === Infinity ? 'unlimited' : maxUsers} user${maxUsers === 1 ? '' : 's'}. Please upgrade to invite more users.`
      );
    }

    const invite = await this.prisma.invite.create({
      data: {
        email,
        role,
        workspaceId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // const acceptLink = `${FRONTEND_URL}/accept-invite?inviteId=${invite.id}`;
    const acceptLink = `${FRONTEND_URL}/accept-invite/${invite.id}`;

    // Get inviter info for email
    const inviter = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
    const inviterName = inviter?.name || 'Team Admin';
    const workspaceName = workspace.name || 'Workspace';

    await this.notifications.sendEmail(
      email,
      `You're Invited to Join ${workspaceName} - Lite CRM`,
      EmailTemplates.getInvite(acceptLink, inviterName, workspaceName, role, '7 days'),
    );

    // Trigger workflow for user invite
    await this.workflows.triggerByEvent('user.invited', workspaceId, {
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });

    return invite;
  }

  async listInvites(userId: string, workspaceId: string) {
    await this.assertAdmin(userId);

    return this.prisma.invite.findMany({
      where: {
        workspaceId,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async revokeInvite(
    userId: string,
    workspaceId: string,
    inviteId: string,
  ) {
    await this.assertAdmin(userId);

    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite || invite.workspaceId !== workspaceId) {
      throw new NotFoundException();
    }

    return this.prisma.invite.delete({
      where: { id: inviteId },
    });
  }

  // 🌍 PUBLIC INVITE READ
  async getPublicInvite(inviteId: string) {
    const invite = await this.prisma.invite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        email: true,
        role: true,
        expiresAt: true,
        acceptedAt: true,
      },
    });

    if (!invite || invite.acceptedAt || invite.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invite');
    }

    return invite;
  }
}
