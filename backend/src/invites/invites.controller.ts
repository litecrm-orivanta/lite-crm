import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InvitesService } from './invites.service';
import { UserRole } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { Request } from 'express';

@Controller('invites')
export class InvitesController {
  constructor(
    private invites: InvitesService,
    private audit: AuditService,
  ) {}

  private getRequestMeta(req: Request) {
    const forwarded = (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
    return {
      ipAddress: forwarded || req.ip,
      userAgent: req.headers['user-agent'],
    };
  }

  // 🔒 ADMIN — create invite
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: Request,
    @CurrentUser()
    user: { userId: string; workspaceId: string; role: string },
    @Body()
    body: { email: string; role: UserRole },
  ) {
    const result = this.invites.createInvite(
      user.userId,
      user.workspaceId,
      body.email,
      body.role,
    );
    this.audit.log({
      actorId: user.userId,
      action: 'user.invite_created',
      resource: 'invite',
      workspaceId: user.workspaceId,
      metadata: { email: body.email, role: body.role, actorRole: user.role },
      ...this.getRequestMeta(req),
    }).catch(() => {});
    return result;
  }

  // 🔒 ADMIN — list invites
  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: { userId: string; workspaceId: string }) {
    return this.invites.listInvites(user.userId, user.workspaceId);
  }

  // 🔒 ADMIN — revoke invite
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  revoke(
    @Req() req: Request,
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Param('id') inviteId: string,
  ) {
    const result = this.invites.revokeInvite(
      user.userId,
      user.workspaceId,
      inviteId,
    );
    this.audit.log({
      actorId: user.userId,
      action: 'user.invite_revoked',
      resource: 'invite',
      resourceId: inviteId,
      workspaceId: user.workspaceId,
      metadata: {},
      ...this.getRequestMeta(req),
    }).catch(() => {});
    return result;
  }

  // 🌍 PUBLIC — fetch invite (NO AUTH)
  @Get(':id/public')
  getPublic(@Param('id') inviteId: string) {
    return this.invites.getPublicInvite(inviteId);
  }
}
