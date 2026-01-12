import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private users: UsersService) {}

  @Get()
  list(@CurrentUser() user: { workspaceId: string }) {
    return this.users.listByWorkspace(user.workspaceId);
  }

  @Patch(':id/role')
  changeRole(
    @CurrentUser()
    current: { userId: string; workspaceId: string },
    @Param('id') targetUserId: string,
    @Body() body: { role: UserRole },
  ) {
    return this.users.changeRole(
      current.userId,
      current.workspaceId,
      targetUserId,
      body.role,
    );
  }

  @Delete(':id')
  remove(
    @CurrentUser()
    current: { userId: string; workspaceId: string },
    @Param('id') targetUserId: string,
  ) {
    return this.users.removeUser(
      current.userId,
      current.workspaceId,
      targetUserId,
    );
  }
}
