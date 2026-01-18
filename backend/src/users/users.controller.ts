import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private users: UsersService,
    private audit: AuditService,
    private prisma: PrismaService,
  ) {}

  private getRequestMeta(req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    return {
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  @Get()
  list(@CurrentUser() user: { workspaceId: string }) {
    return this.users.listByWorkspace(user.workspaceId);
  }

  @Patch(':id/role')
  async changeRole(
    @Req() req: Request,
    @CurrentUser()
    current: { userId: string; workspaceId: string; role: string },
    @Param('id') targetUserId: string,
    @Body() body: { role: UserRole },
  ) {
    const before = await this.prisma.user.findFirst({
      where: { id: targetUserId, workspaceId: current.workspaceId },
    });
    const result = await this.users.changeRole(
      current.userId,
      current.workspaceId,
      targetUserId,
      body.role,
    );
    await this.audit.log({
      actorId: current.userId,
      action: 'user.role_change',
      resource: 'user',
      resourceId: targetUserId,
      workspaceId: current.workspaceId,
      metadata: { before, after: result, role: current.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }

  @Delete(':id')
  async remove(
    @Req() req: Request,
    @CurrentUser()
    current: { userId: string; workspaceId: string; role: string },
    @Param('id') targetUserId: string,
  ) {
    const before = await this.prisma.user.findFirst({
      where: { id: targetUserId, workspaceId: current.workspaceId },
    });
    const result = await this.users.removeUser(
      current.userId,
      current.workspaceId,
      targetUserId,
    );
    await this.audit.log({
      actorId: current.userId,
      action: 'user.delete',
      resource: 'user',
      resourceId: targetUserId,
      workspaceId: current.workspaceId,
      metadata: { before, role: current.role },
      ...this.getRequestMeta(req),
    });
    return result;
  }
}
