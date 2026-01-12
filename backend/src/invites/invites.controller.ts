import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InvitesService } from './invites.service';
import { UserRole } from '@prisma/client';

@Controller('invites')
export class InvitesController {
  constructor(private invites: InvitesService) {}

  // 🔒 ADMIN — create invite
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser()
    user: { userId: string; workspaceId: string },
    @Body()
    body: { email: string; role: UserRole },
  ) {
    return this.invites.createInvite(
      user.userId,
      user.workspaceId,
      body.email,
      body.role,
    );
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
    @CurrentUser() user: { userId: string; workspaceId: string },
    @Param('id') inviteId: string,
  ) {
    return this.invites.revokeInvite(
      user.userId,
      user.workspaceId,
      inviteId,
    );
  }

  // 🌍 PUBLIC — fetch invite (NO AUTH)
  @Get(':id/public')
  getPublic(@Param('id') inviteId: string) {
    return this.invites.getPublicInvite(inviteId);
  }
}
