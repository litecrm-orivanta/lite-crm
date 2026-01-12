import {
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listByWorkspace(workspaceId: string) {
    return this.prisma.user.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  private async assertAdmin(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins allowed');
    }
    return user;
  }

  async changeRole(
    actorId: string,
    workspaceId: string,
    targetUserId: string,
    role: UserRole,
  ) {
    const actor = await this.assertAdmin(actorId);

    if (actor.id === targetUserId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target || target.workspaceId !== workspaceId) {
      throw new NotFoundException();
    }

    if (target.role === UserRole.ADMIN && role === UserRole.MEMBER) {
      const adminCount = await this.prisma.user.count({
        where: {
          workspaceId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('At least one admin required');
      }
    }

    return this.prisma.user.update({
      where: { id: targetUserId },
      data: { role },
    });
  }

  async removeUser(
    actorId: string,
    workspaceId: string,
    targetUserId: string,
  ) {
    const actor = await this.assertAdmin(actorId);

    if (actor.id === targetUserId) {
      throw new BadRequestException('Cannot remove yourself');
    }

    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!target || target.workspaceId !== workspaceId) {
      throw new NotFoundException();
    }

    if (target.role === UserRole.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: {
          workspaceId,
          role: UserRole.ADMIN,
        },
      });

      if (adminCount <= 1) {
        throw new BadRequestException('Cannot remove last admin');
      }
    }

    return this.prisma.user.delete({
      where: { id: targetUserId },
    });
  }
}
